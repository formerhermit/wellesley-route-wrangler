import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ClubFooter } from "./components/ClubFooter";
import { GameHeader } from "./components/GameHeader";
import { HelpDialog } from "./components/HelpDialog";
import { GameControls } from "./components/GameControls";
import { ObjectivePanel } from "./components/ObjectivePanel";
import { ResultPanel } from "./components/ResultPanel";
import { RouteMap } from "./components/RouteMap";
import { LevelDialog } from "./components/LevelDialog";
import { PrivacyDialog } from "./components/PrivacyDialog";
import { ClubDialog } from "./components/ClubDialog";
import { RunBookDialog } from "./components/RunBookDialog";
import { levels } from "./data/levels";
import {
  levelNumber,
  nextLevel as levelAfter,
  nextUnlockedLevel,
  resumeLevel,
} from "./game/progression";
import { canRunRoute, evaluateRoute } from "./game/routeEvaluation";
import { buildIncidentReport } from "./game/incidentReport";
import { selectResult } from "./game/resultSelection";
import {
  emptyRoute,
  nodeById,
  selectNode,
  totalDistanceKm,
} from "./game/routeGraph";
import type { GameResult, Level, Route } from "./game/types";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useMusic } from "./hooks/useMusic";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { useProgress } from "./hooks/useProgress";
import { useRecords } from "./hooks/useRecords";
import { tallyAll, tallyLevel } from "./game/records";
import { earnedBy } from "./game/achievements";
import { nextGnomeHome } from "./game/eggs";
import type { GnomeHome } from "./game/eggs";
import { routeKey, scoreRun, winningRouteCount } from "./game/scoring";
import { clubTableEnabled } from "./club/enabled";

/** The house theme, for every level that does not name one of its own. */
const MAIN_THEME = "main-theme.mp3";

function trackFor(level: Level): string {
  return `${import.meta.env.BASE_URL}audio/${level.music ?? MAIN_THEME}`;
}

/** Remembers that the player has seen the how-to-play dialog. */
const HELP_SEEN_KEY = "route-wrangler:help-seen";

function hasSeenHelp(): boolean {
  try {
    return localStorage.getItem(HELP_SEEN_KEY) === "1";
  } catch {
    // Storage blocked. Better to stay quiet than to nag on every visit.
    return true;
  }
}

function rememberHelpSeen(): void {
  try {
    localStorage.setItem(HELP_SEEN_KEY, "1");
  } catch {
    // Storage blocked; the dialog simply offers itself again next time.
  }
}

type Phase = "planning" | "running" | "result";

interface GameState {
  level: Level;
  route: Route;
  phase: Phase;
  result: GameResult | null;
  rejectedNodeId: string | null;
  /** Announced politely; the nonce lets a repeated message be read again. */
  announcement: string;
  nonce: number;
}

type Action =
  | { type: "select"; nodeId: string }
  | { type: "clear-rejection" }
  | { type: "reset" }
  | { type: "run" }
  | { type: "finish" }
  | { type: "edit" }
  | { type: "load"; route: Route }
  | { type: "select-level"; level: Level };

function initialState(level: Level): GameState {
  return {
    level,
    route: emptyRoute(level),
    phase: "planning",
    result: null,
    rejectedNodeId: null,
    announcement: "",
    nonce: 0,
  };
}

function describe(level: Level, route: Route, prefix: string): string {
  return `${prefix} Route now ${totalDistanceKm(level, route).toFixed(2)} km.`;
}

function reducer(state: GameState, action: Action): GameState {
  const { level } = state;

  switch (action.type) {
    case "select": {
      if (state.phase !== "planning") return state;
      const outcome = selectNode(level, state.route, action.nodeId);
      const label = nodeById(level, action.nodeId).label;

      if (outcome.kind === "rejected") {
        return {
          ...state,
          rejectedNodeId: action.nodeId,
          announcement: outcome.reason,
          nonce: state.nonce + 1,
        };
      }

      return {
        ...state,
        route: outcome.route,
        rejectedNodeId: null,
        announcement:
          outcome.kind === "undone"
            ? describe(level, outcome.route, `Removed the road back to ${label}.`)
            : describe(level, outcome.route, `Added the road to ${label}.`),
        nonce: state.nonce + 1,
      };
    }

    case "clear-rejection":
      return { ...state, rejectedNodeId: null };

    case "reset": {
      const start = nodeById(level, level.startNodeId).label;
      return {
        ...initialState(level),
        announcement: `Route cleared. Everyone back at ${start}.`,
        nonce: state.nonce + 1,
      };
    }

    case "select-level":
      if (action.level.id === level.id) return state;
      return {
        ...initialState(action.level),
        announcement: `${action.level.title} loaded.`,
        nonce: state.nonce + 1,
      };

    case "run":
      if (!canRunRoute(level, state.route)) return state;
      return {
        ...state,
        phase: "running",
        result: null,
        rejectedNodeId: null,
        announcement: "The group has set off.",
        nonce: state.nonce + 1,
      };

    case "finish": {
      if (state.phase !== "running") return state;
      return {
        ...state,
        phase: "result",
        result: selectResult(level, evaluateRoute(level, state.route)),
      };
    }

    case "edit":
      return { ...state, phase: "planning", result: null };

    /**
     * A route laid back on the map from the book, to run again or to edit into
     * something near it — which is how you actually hunt a variation on a loop
     * that nearly worked.
     *
     * Whatever was being planned is dropped without asking. The player has
     * gone into the book and picked a route out of it, which is a clearer
     * statement of intent than a half-laid route is, and a confirmation on
     * every load would be in the way of the one gesture this exists for. The
     * route is on screen and re-tappable if it was a mistake.
     */
    case "load":
      return {
        ...state,
        route: action.route,
        phase: "planning",
        result: null,
        rejectedNodeId: null,
        announcement: describe(level, action.route, "Route laid out from the book."),
        nonce: state.nonce + 1,
      };

    default:
      return state;
  }
}

export default function App() {
  const progress = useProgress();
  const runBook = useRecords();
  // Only read on the first render: a returning player opens on the run they
  // are up to, rather than being sent back to level one every visit.
  const [state, dispatch] = useReducer(reducer, progress.completed, (saved) =>
    initialState(resumeLevel(levels, saved)),
  );
  const level = state.level;
  const reducedMotion = useReducedMotion();
  const music = useMusic(trackFor(level));
  const sound = useSoundEffects();
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const levelsButtonRef = useRef<HTMLButtonElement>(null);
  // Opens itself on a first visit, and by the ? button after that.
  const [helpOpen, setHelpOpen] = useState(() => !hasSeenHelp());
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [clubOpen, setClubOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  // The name this device is on the club table under, once we have asked. Left
  // undefined when there is no table configured, which is the usual case.
  const [clubName, setClubName] = useState<string>();
  const showingResult = state.phase === "result";
  const modalOpen =
    showingResult || helpOpen || levelsOpen || privacyOpen || clubOpen || bookOpen;

  // Asked once, on the first render that has a table to ask.
  useEffect(() => {
    if (!clubTableEnabled) return;
    let live = true;
    // Fetched, not bundled: this is what keeps the Supabase client out of
    // the main chunk for everyone who never opens the table.
    void import("./club/clubTable")
      .then(({ currentName }) => currentName())
      .then((name) => {
        if (live) setClubName(name);
      });
    return () => {
      live = false;
    };
  }, []);

  const closeHelp = () => {
    setHelpOpen(false);
    rememberHelpSeen();
  };

  const evaluation = useMemo(
    () => evaluateRoute(level, state.route),
    [level, state.route],
  );
  const canRun = canRunRoute(level, state.route);
  const report = useMemo(
    () => buildIncidentReport(level, state.route, evaluation),
    [level, state.route, evaluation],
  );

  // Where the club stands. Both replay every stored route through the scoring,
  // so they are worked out when the book changes rather than on every render —
  // the header and the objective panel now read them all the time, not just
  // when a result panel happens to be up.
  const levelTally = useMemo(
    () => tallyLevel(runBook.records, level),
    [runBook.records, level],
  );
  const clubTally = useMemo(
    () => tallyAll(runBook.records, levels),
    [runBook.records],
  );
  const toFind = winningRouteCount(level);

  // What this run was worth, and whether the club had it in the book already.
  // Read before the effect below logs it, so a first run reads as a first run.
  const runScore = useMemo(
    () => scoreRun(level, state.route),
    [level, state.route],
  );
  // A run that met the brief opens the next level, for good. Idempotent, so
  // re-running a level already completed is harmless. Every run that finishes
  // goes in the book, winner or not.
  const recordCompletion = progress.complete;
  const logRun = runBook.log;
  const [freshRoute, setFreshRoute] = useState(false);
  useEffect(() => {
    if (state.phase !== "result") return;
    setFreshRoute(logRun(level, state.route));
    if (state.result?.success) recordCompletion(level.id);
  }, [state.phase, state.result, state.route, level, recordCompletion, logRun]);

  // The incident report's own verdict, echoed as a sound (#107): a chime for
  // a pass, a womp for a fail. A separate effect from the one above, because
  // that one is about the book and this one is about the noise.
  const playSound = sound.play;
  useEffect(() => {
    if (state.phase !== "result") return;
    playSound(state.result?.success ? "success" : "fail");
  }, [state.phase, state.result, playSound]);

  // What this run put on the wall. `earnedBy` names the badges that depend on
  // this route; a run that was not a first discovery announces none of them,
  // because the club won those the week it first went that way. Declared after
  // the effect above because it reads what that effect decided.
  const freshBadges = useMemo(
    () =>
      freshRoute
        ? earnedBy(runBook.records, levels, level, routeKey(state.route))
        : [],
    [freshRoute, runBook.records, level, state.route],
  );

  // A badge landing gets its own chime, on top of the pass/fail one above: a
  // route that is both a win and a first discovery earns both, same as the
  // result panel shows both. Guarded on "result" for the same reason as that
  // effect — freshBadges otherwise still holds last run's answer while the
  // route is being edited.
  useEffect(() => {
    if (state.phase !== "result" || freshBadges.length === 0) return;
    playSound("badge");
  }, [state.phase, freshBadges, playSound]);

  // A win unlocks the next level there and then, so the result panel does not
  // have to wait for the effect above to land before offering it.
  const upcoming =
    showingResult && state.result?.success
      ? levelAfter(levels, level.id)
      : nextUnlockedLevel(levels, progress.completed, level.id);

  /*
   * The one gnome in the game (#104). He lives up here rather than in the map
   * because he moves between levels, and a thing that moves between levels
   * cannot be owned by the one that happens to be on screen.
   *
   * He starts wherever the first roll puts him and goes somewhere else every
   * time he is pressed. Not persisted: like every other egg he is worth
   * nothing, and a gnome remembered across visits is a save file for a joke.
   */
  const [gnome, setGnome] = useState<GnomeHome | undefined>(() =>
    nextGnomeHome(levels, progress.completed, undefined, Math.random()),
  );
  const moveGnome = () => {
    setGnome((here) => {
      const next = nextGnomeHome(
        levels,
        progress.completed,
        here?.levelId,
        Math.random(),
      );
      // Nowhere to go — one map open and he is on it — so he stays put rather
      // than vanishing.
      return next ?? here;
    });
  };

  // The rejection wobble is a one-shot; clear it so it can fire again.
  useEffect(() => {
    if (!state.rejectedNodeId) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "clear-rejection" }),
      600,
    );
    return () => clearTimeout(timer);
  }, [state.rejectedNodeId, state.nonce]);

  // When a dialog closes, hand focus back to whatever it belongs to, rather
  // than dropping it on the body. Never fires on first render.
  const previousModal = useRef<"result" | "help" | "levels" | null>(null);
  useEffect(() => {
    const current = showingResult
      ? "result"
      : helpOpen
        ? "help"
        : levelsOpen
          ? "levels"
          : null;
    const previous = previousModal.current;
    if (previous && !current && document.activeElement === document.body) {
      const target =
        previous === "help"
          ? helpButtonRef
          : previous === "levels"
            ? levelsButtonRef
            : runButtonRef;
      target.current?.focus();
    }
    previousModal.current = current;
  }, [showingResult, helpOpen, levelsOpen]);

  return (
    <div className="page">
      {/* The dialog is modal: nothing behind it should be reachable. */}
      <div className="layout" inert={modalOpen}>
        <GameHeader
          level={level}
          levelNumber={levelNumber(levels, level.id)}
          evaluation={evaluation}
          clubPoints={clubTally.points}
          helpButtonRef={helpButtonRef}
          levelsButtonRef={levelsButtonRef}
          musicOn={music.on}
          onToggleMusic={music.toggle}
          soundOn={sound.on}
          onToggleSound={sound.toggle}
          onShowClub={() => setClubOpen(true)}
          onShowLevels={() => setLevelsOpen(true)}
          onShowHelp={() => setHelpOpen(true)}
        />

        <main className="layout__main">
          {/* The map and its actions read as one unit, on every width. */}
          <div className="layout__play">
            <RouteMap
              level={level}
              route={state.route}
              running={state.phase === "running"}
              rejectedNodeId={state.rejectedNodeId}
              reducedMotion={reducedMotion}
              onSelect={(nodeId) => {
                // Worked out here rather than left to the reducer's own
                // answer, so the click and the sound it makes agree on what
                // just happened without the reducer knowing sound exists.
                const outcome = selectNode(level, state.route, nodeId);
                sound.play(
                  outcome.kind === "rejected"
                    ? "reject"
                    : outcome.kind === "undone"
                      ? "undo"
                      : "select",
                );
                dispatch({ type: "select", nodeId });
              }}
              onRunFinished={() => dispatch({ type: "finish" })}
              gnome={gnome}
              onGnomePressed={() => {
                sound.play("egg");
                moveGnome();
              }}
              onEggPressed={() => sound.play("egg")}
            />

            <GameControls
              level={level}
              route={state.route}
              canRun={canRun}
              running={state.phase === "running"}
              runButtonRef={runButtonRef}
              onRun={() => {
                sound.play("run");
                dispatch({ type: "run" });
              }}
              onReset={() => {
                sound.play("reset");
                dispatch({ type: "reset" });
              }}
            />
          </div>

          <div className="layout__side">
            <ObjectivePanel
              evaluation={evaluation}
              found={levelTally.found}
              toFind={toFind}
              explored={levelTally.explored}
              onOpenBook={() => setBookOpen(true)}
            />
          </div>
        </main>

        <p className="visually-hidden" role="status" aria-live="polite">
          {state.announcement}
        </p>

        <ClubFooter onShowPrivacy={() => setPrivacyOpen(true)} />
      </div>

      {helpOpen && <HelpDialog level={level} onClose={closeHelp} />}

      {privacyOpen && <PrivacyDialog onClose={() => setPrivacyOpen(false)} />}

      {bookOpen && (
        <RunBookDialog
          level={level}
          records={runBook.records}
          onLoad={(route) => {
            dispatch({ type: "load", route });
            setBookOpen(false);
          }}
          onClose={() => setBookOpen(false)}
        />
      )}

      {clubOpen && (
        <ClubDialog
          levels={levels}
          records={runBook.records}
          tableEnabled={clubTableEnabled}
          name={clubName}
          onNameChanged={setClubName}
          onClose={() => setClubOpen(false)}
        />
      )}

      {levelsOpen && (
        <LevelDialog
          levels={levels}
          completed={progress.completed}
          records={runBook.records}
          currentId={level.id}
          onSelect={(next) => dispatch({ type: "select-level", level: next })}
          onClose={() => setLevelsOpen(false)}
        />
      )}

      {showingResult && state.result && (
        <ResultPanel
          level={level}
          route={state.route}
          clubName={clubName}
          onJoinTable={() => setClubOpen(true)}
          result={state.result}
          report={report}
          score={runScore}
          newRoute={freshRoute}
          freshBadges={freshBadges}
          found={levelTally.found}
          toFind={toFind}
          clubPoints={clubTally.points}
          nextLevel={upcoming}
          onEdit={() => dispatch({ type: "edit" })}
          onStartOver={() => dispatch({ type: "reset" })}
          onNextLevel={() =>
            upcoming && dispatch({ type: "select-level", level: upcoming })
          }
        />
      )}
    </div>
  );
}

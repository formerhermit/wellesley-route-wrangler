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
import { BriefingButton } from "./components/BriefingButton";
import { BriefingCoachMark } from "./components/BriefingCoachMark";
import { BriefingDialog } from "./components/BriefingDialog";
import { StartingGun } from "./components/StartingGun";
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
import {
  applyCards,
  briefingAvailable,
  dealBriefing,
  stopsFor,
} from "./game/cards";
import type { Card, Hand } from "./game/cards";

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

/** Remembers that the briefing has been pointed out once (#10). */
const BRIEFING_SEEN_KEY = "route-wrangler:briefing-seen";

function hasSeenBriefing(): boolean {
  try {
    return localStorage.getItem(BRIEFING_SEEN_KEY) === "1";
  } catch {
    // Storage blocked. Better to stay quiet than to point at the same button
    // on every visit.
    return true;
  }
}

function rememberBriefingSeen(): void {
  try {
    localStorage.setItem(BRIEFING_SEEN_KEY, "1");
  } catch {
    // Storage blocked; it offers itself again next time.
  }
}

type Phase = "planning" | "running" | "result";

interface GameState {
  level: Level;
  /**
   * The two cards taken out on this run (#10). They are applied to a derived
   * level everything here plans and judges against; the scoring outside this
   * reducer keeps the level the roster declared, so a card is never worth
   * anything.
   */
  cards: Card[];
  /** Whether the hand has been run yet. There is no redeal before you run. */
  cardsRun: boolean;
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
  | { type: "pick-cards"; cards: Card[] }
  | { type: "select-level"; level: Level };

function initialState(level: Level): GameState {
  return {
    level,
    cards: [],
    cardsRun: false,
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

/**
 * mm:ss for the race chip time (#116) — nobody wants a race result to
 * three decimal places, and no run here takes an hour.
 */
function formatChipTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function reducer(state: GameState, action: Action): GameState {
  const { level } = state;
  // What the run is actually being judged against. The same map with a longer
  // brief on it, or the level itself when no cards were taken.
  const brief = applyCards(level, state.cards);

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

    /*
     * Picking a hand clears whatever was being planned. The brief has just
     * changed underneath the route, so a half-laid loop is now answering a
     * question nobody asked.
     */
    case "pick-cards":
      return {
        ...initialState(level),
        cards: action.cards,
        announcement: `Briefing taken: ${action.cards
          .map((card) => card.name)
          .join(", ")}.`,
        nonce: state.nonce + 1,
      };

    case "reset": {
      const start = nodeById(level, level.startNodeId).label;
      return {
        ...initialState(level),
        // The cards stay. Clearing the route is replanning the same run, not
        // turning up on a different evening.
        cards: state.cards,
        cardsRun: state.cardsRun,
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
      if (!canRunRoute(brief, state.route)) return state;
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
        result: selectResult(brief, evaluateRoute(brief, state.route)),
        // The hand has had its run, so another can be dealt.
        cardsRun: true,
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
  /** The hand on the table, while it is being picked from (#10). */
  const [hand, setHand] = useState<Hand>();
  // The name this device is on the club table under, once we have asked. Left
  // undefined when there is no table configured, which is the usual case.
  const [clubName, setClubName] = useState<string>();
  const showingResult = state.phase === "result";

  /*
   * The starting gun (#116) fires when a race level arrives, not when Run
   * Route is pressed: a gun that only goes off right before the animation
   * looks like decoration for the run rather than a warning that the level
   * itself is timed, and by the time it fires the player has already spent
   * as long planning as they like without knowing it counted. Keyed on the
   * level object itself, so it fires again on every fresh arrival — the
   * fixture list, a reload that resumes here — and not on the edits, resets
   * and retries that keep the same level loaded throughout.
   */
  const [showingStartingGun, setShowingStartingGun] = useState(false);
  useEffect(() => {
    if (level.field) setShowingStartingGun(true);
  }, [level]);

  const modalOpen =
    showingResult ||
    showingStartingGun ||
    hand !== undefined ||
    helpOpen ||
    levelsOpen ||
    privacyOpen ||
    clubOpen ||
    bookOpen;

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

  /*
   * The brief as the cards leave it (#10) — the same map with more asked of
   * it. Everything the player plans and is judged against reads this; the
   * scoring below keeps `level`, so a card is never worth anything.
   */
  const brief = useMemo(
    () => applyCards(level, state.cards),
    [level, state.cards],
  );
  const stops = useMemo(
    () => stopsFor(level, state.cards),
    [level, state.cards],
  );

  const evaluation = useMemo(
    () => evaluateRoute(brief, state.route),
    [brief, state.route],
  );
  const canRun = canRunRoute(brief, state.route);
  const report = useMemo(
    () => buildIncidentReport(brief, state.route, evaluation),
    [brief, state.route, evaluation],
  );

  /*
   * The briefing itself. `dealBriefing` walks the map to check the hand can
   * actually be played, so whether one is on offer is worked out once per
   * level rather than on every render.
   */
  const briefingButtonRef = useRef<HTMLButtonElement>(null);
  const briefingOffered = useMemo(
    () =>
      briefingAvailable(level, progress.completed) &&
      dealBriefing(level, progress.completed, 0) !== undefined,
    [level, progress.completed],
  );
  const canDeal = state.cards.length === 0 || state.cardsRun;
  const [briefingSeen, setBriefingSeen] = useState(hasSeenBriefing);

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

  /*
   * The chip time (#116), race levels only. The watch starts exactly when
   * the gun does — set from `StartingGun`'s own `onGun` below — so the
   * popup's promise and the number on the debrief agree: whatever the gun
   * announces is the whole of what gets timed, planning included. Held in a
   * ref rather than state because starting it must never itself cause a
   * render; it only ever surfaces once, read off at the finish below. Not
   * reset by Reset Route or Try Again, on purpose — those are replanning
   * inside the same race, not a new one, and a real chip has no undo either.
   */
  const solveStartedAt = useRef<number | null>(null);

  const [chipTimeMs, setChipTimeMs] = useState<number | null>(null);
  useEffect(() => {
    if (state.phase !== "result") return;
    // Explicitly nulled on a club run rather than left alone: without this,
    // a race's chip time outlives the level it was set on and turns up on
    // the next result screen that has nothing to do with it.
    setChipTimeMs(
      level.field && solveStartedAt.current !== null
        ? Date.now() - solveStartedAt.current
        : null,
    );
  }, [state.phase, level]);

  // The chip time joins the report card as its own line rather than living
  // inside `buildIncidentReport`: that function is pure and tested against
  // exact route data, and a wall-clock reading has no business in either.
  const reportWithChipTime = useMemo(() => {
    if (chipTimeMs === null) return report;
    return {
      ...report,
      lines: [
        ...report.lines,
        {
          label: "Chip time",
          value: formatChipTime(chipTimeMs),
          tone: "neutral" as const,
        },
      ],
    };
  }, [report, chipTimeMs]);

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
  const previousModal = useRef<"result" | "starting" | "help" | "levels" | null>(
    null,
  );
  useEffect(() => {
    const current = showingResult
      ? "result"
      : showingStartingGun
        ? "starting"
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
          : previous === "levels" || previous === "starting"
            ? levelsButtonRef
            : runButtonRef;
      target.current?.focus();
    }
    previousModal.current = current;
  }, [showingResult, showingStartingGun, helpOpen, levelsOpen]);

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
          briefing={
            briefingOffered ? (
              <BriefingButton
                buttonRef={briefingButtonRef}
                taken={state.cards.length}
                canDeal={canDeal}
                onDeal={() => {
                  const dealt = dealBriefing(
                    level,
                    progress.completed,
                    Math.random(),
                  );
                  if (dealt) setHand(dealt);
                }}
              />
            ) : undefined
          }
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
              stops={stops}
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

      {showingStartingGun && (
        <StartingGun
          level={level}
          reducedMotion={reducedMotion}
          onGun={() => {
            solveStartedAt.current = Date.now();
            sound.play("gun");
          }}
          onDone={() => setShowingStartingGun(false)}
        />
      )}

      {hand && (
        <BriefingDialog
          hand={hand}
          onConfirm={(picked) => {
            setHand(undefined);
            dispatch({ type: "pick-cards", cards: picked });
          }}
          onClose={() => setHand(undefined)}
        />
      )}

      {/* Pointed at once, the first time it is there to be found. */}
      {briefingOffered && !briefingSeen && !modalOpen && (
        <BriefingCoachMark
          anchorRef={briefingButtonRef}
          onDismiss={() => {
            setBriefingSeen(true);
            rememberBriefingSeen();
          }}
        />
      )}

      {showingResult && state.result && (
        <ResultPanel
          level={level}
          route={state.route}
          clubName={clubName}
          onJoinTable={() => setClubOpen(true)}
          result={state.result}
          report={reportWithChipTime}
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

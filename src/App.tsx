import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ClubFooter } from "./components/ClubFooter";
import { GameHeader } from "./components/GameHeader";
import { HelpDialog } from "./components/HelpDialog";
import { GameControls } from "./components/GameControls";
import { ObjectivePanel } from "./components/ObjectivePanel";
import { ResultPanel } from "./components/ResultPanel";
import { RouteMap } from "./components/RouteMap";
import { LevelDialog } from "./components/LevelDialog";
import { levels } from "./data/levels";
import {
  levelNumber,
  nextLevel as levelAfter,
  nextUnlockedLevel,
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
import { useProgress } from "./hooks/useProgress";

/**
 * The house theme. Levels will bring their own tracks as they arrive; the
 * music hook takes the source as an argument for exactly that reason.
 */
const MAIN_THEME = `${import.meta.env.BASE_URL}audio/main-theme.mp3`;

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

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, levels[0], initialState);
  const level = state.level;
  const reducedMotion = useReducedMotion();
  const music = useMusic(MAIN_THEME);
  const progress = useProgress();
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const levelsButtonRef = useRef<HTMLButtonElement>(null);
  // Opens itself on a first visit, and by the ? button after that.
  const [helpOpen, setHelpOpen] = useState(() => !hasSeenHelp());
  const [levelsOpen, setLevelsOpen] = useState(false);
  const showingResult = state.phase === "result";
  const modalOpen = showingResult || helpOpen || levelsOpen;

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

  // A run that met the brief opens the next level, for good. Idempotent, so
  // re-running a level already completed is harmless.
  useEffect(() => {
    if (state.phase === "result" && state.result?.success) {
      progress.complete(level.id);
    }
  }, [state.phase, state.result, level.id, progress]);

  // A win unlocks the next level there and then, so the result panel does not
  // have to wait for the effect above to land before offering it.
  const upcoming =
    showingResult && state.result?.success
      ? levelAfter(levels, level.id)
      : nextUnlockedLevel(levels, progress.completed, level.id);

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
          helpButtonRef={helpButtonRef}
          levelsButtonRef={levelsButtonRef}
          musicOn={music.on}
          onToggleMusic={music.toggle}
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
              onSelect={(nodeId) => dispatch({ type: "select", nodeId })}
              onRunFinished={() => dispatch({ type: "finish" })}
            />

            <GameControls
              level={level}
              route={state.route}
              canRun={canRun}
              running={state.phase === "running"}
              runButtonRef={runButtonRef}
              onRun={() => dispatch({ type: "run" })}
              onReset={() => dispatch({ type: "reset" })}
            />
          </div>

          <div className="layout__side">
            <ObjectivePanel evaluation={evaluation} />
          </div>
        </main>

        <p className="visually-hidden" role="status" aria-live="polite">
          {state.announcement}
        </p>

        <ClubFooter />
      </div>

      {helpOpen && <HelpDialog level={level} onClose={closeHelp} />}

      {levelsOpen && (
        <LevelDialog
          levels={levels}
          completed={progress.completed}
          currentId={level.id}
          onSelect={(next) => dispatch({ type: "select-level", level: next })}
          onClose={() => setLevelsOpen(false)}
        />
      )}

      {showingResult && state.result && (
        <ResultPanel
          level={level}
          result={state.result}
          report={report}
          nextLevel={upcoming}
          onEdit={() => dispatch({ type: "edit" })}
          onTryAgain={() => dispatch({ type: "run" })}
          onReset={() => dispatch({ type: "reset" })}
          onNextLevel={() =>
            upcoming && dispatch({ type: "select-level", level: upcoming })
          }
        />
      )}
    </div>
  );
}

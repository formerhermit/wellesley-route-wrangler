import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { GameHeader } from "./components/GameHeader";
import { HelpDialog } from "./components/HelpDialog";
import { GameControls } from "./components/GameControls";
import { ObjectivePanel } from "./components/ObjectivePanel";
import { ResultPanel } from "./components/ResultPanel";
import { RouteMap } from "./components/RouteMap";
import { thursdaySocialRun } from "./data/thursdaySocialRun";
import { canRunRoute, evaluateRoute } from "./game/routeEvaluation";
import { selectResult } from "./game/resultSelection";
import {
  emptyRoute,
  nodeById,
  selectNode,
  totalDistanceKm,
} from "./game/routeGraph";
import type { GameResult, Route } from "./game/types";
import { useReducedMotion } from "./hooks/useReducedMotion";

const level = thursdaySocialRun;

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
  | { type: "edit" };

function initialState(): GameState {
  return {
    route: emptyRoute(level),
    phase: "planning",
    result: null,
    rejectedNodeId: null,
    announcement: "",
    nonce: 0,
  };
}

function describe(route: Route, prefix: string): string {
  return `${prefix} Route now ${totalDistanceKm(level, route).toFixed(2)} km.`;
}

function reducer(state: GameState, action: Action): GameState {
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
            ? describe(outcome.route, `Removed the road back to ${label}.`)
            : describe(outcome.route, `Added the road to ${label}.`),
        nonce: state.nonce + 1,
      };
    }

    case "clear-rejection":
      return { ...state, rejectedNodeId: null };

    case "reset":
      return {
        ...initialState(),
        announcement: "Route cleared. Everyone back at the Observatory.",
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
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const reducedMotion = useReducedMotion();
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  // Opens itself on a first visit, and by the ? button after that.
  const [helpOpen, setHelpOpen] = useState(() => !hasSeenHelp());
  const showingResult = state.phase === "result";
  const modalOpen = showingResult || helpOpen;

  const closeHelp = () => {
    setHelpOpen(false);
    rememberHelpSeen();
  };

  const evaluation = useMemo(
    () => evaluateRoute(level, state.route),
    [state.route],
  );
  const canRun = canRunRoute(level, state.route);

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
  const previousModal = useRef<"result" | "help" | null>(null);
  useEffect(() => {
    const current = showingResult ? "result" : helpOpen ? "help" : null;
    const previous = previousModal.current;
    if (previous && !current && document.activeElement === document.body) {
      const target = previous === "help" ? helpButtonRef : runButtonRef;
      target.current?.focus();
    }
    previousModal.current = current;
  }, [showingResult, helpOpen]);

  return (
    <div className="page">
      {/* The dialog is modal: nothing behind it should be reachable. */}
      <div className="layout" inert={modalOpen}>
        <GameHeader
          level={level}
          helpButtonRef={helpButtonRef}
          onShowHelp={() => setHelpOpen(true)}
        />

        <main className="layout__main">
          <RouteMap
            level={level}
            route={state.route}
            running={state.phase === "running"}
            rejectedNodeId={state.rejectedNodeId}
            reducedMotion={reducedMotion}
            onSelect={(nodeId) => dispatch({ type: "select", nodeId })}
            onRunFinished={() => dispatch({ type: "finish" })}
          />

          <div className="layout__side">
            <GameControls
              level={level}
              route={state.route}
              evaluation={evaluation}
              canRun={canRun}
              running={state.phase === "running"}
              runButtonRef={runButtonRef}
              onRun={() => dispatch({ type: "run" })}
              onReset={() => dispatch({ type: "reset" })}
            />
            <ObjectivePanel evaluation={evaluation} />
          </div>
        </main>

        <p className="visually-hidden" role="status" aria-live="polite">
          {state.announcement}
        </p>

        <footer className="page__footer">
          <p>
            A Wellesley Runners prototype. No pigeons were negotiated with
            during development.
          </p>
        </footer>
      </div>

      {helpOpen && <HelpDialog level={level} onClose={closeHelp} />}

      {showingResult && state.result && (
        <ResultPanel
          result={state.result}
          evaluation={evaluation}
          onEdit={() => dispatch({ type: "edit" })}
          onTryAgain={() => dispatch({ type: "run" })}
          onReset={() => dispatch({ type: "reset" })}
        />
      )}
    </div>
  );
}

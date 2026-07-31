import type { RefObject } from "react";
import type { Level, Route } from "../game/types";
import { nodeById } from "../game/routeGraph";

interface Props {
  level: Level;
  route: Route;
  canRun: boolean;
  running: boolean;
  /** Focus lands here when the result dialog closes. */
  runButtonRef: RefObject<HTMLButtonElement | null>;
  onRun: () => void;
  onReset: () => void;
}

/** The action bar, sitting directly under the map. */
export function GameControls({
  level,
  route,
  canRun,
  running,
  runButtonRef,
  onRun,
  onReset,
}: Props) {
  const startLabel = nodeById(level, level.startNodeId).label;
  const finishLabel = nodeById(level, level.finishNodeId).label;
  const roadCount = route.roadIds.length;

  return (
    <section className="controls" aria-labelledby="controls-heading">
      <h2 id="controls-heading" className="visually-hidden">
        Route controls
      </h2>

      <div className="controls__buttons">
        <button
          type="button"
          ref={runButtonRef}
          className="button button--primary button--action"
          onClick={onRun}
          disabled={!canRun || running}
        >
          {running ? "Running…" : "Run Route"}
        </button>
        <button
          type="button"
          className="button button--action"
          onClick={onReset}
          disabled={running || roadCount === 0}
        >
          Reset Route
        </button>
      </div>

      {!canRun && !running && (
        <p className="controls__hint">
          {roadCount === 0
            ? `Pick a junction joined to ${startLabel} to lay your first road.`
            : `Bring the route back to ${finishLabel} to enable Run Route.`}
        </p>
      )}
    </section>
  );
}

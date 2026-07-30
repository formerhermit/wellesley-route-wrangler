import type { Level, Route, RouteEvaluation } from "../game/types";
import { nodeById } from "../game/routeGraph";

interface Props {
  level: Level;
  route: Route;
  evaluation: RouteEvaluation;
  canRun: boolean;
  running: boolean;
  onRun: () => void;
  onReset: () => void;
}

export function GameControls({
  level,
  route,
  evaluation,
  canRun,
  running,
  onRun,
  onReset,
}: Props) {
  const finishLabel = nodeById(level, level.finishNodeId).label;
  const roadCount = route.roadIds.length;

  return (
    <section className="controls" aria-labelledby="controls-heading">
      <h3 id="controls-heading" className="visually-hidden">
        Route controls
      </h3>

      <p className="controls__distance">
        <span className="controls__distance-value">
          {evaluation.totalDistanceKm.toFixed(2)} km
        </span>
        <span className="controls__distance-detail">
          {roadCount} {roadCount === 1 ? "road" : "roads"} · target{" "}
          {level.minDistanceKm}–{level.maxDistanceKm} km
        </span>
      </p>

      <div className="controls__buttons">
        <button
          type="button"
          className="button button--primary"
          onClick={onRun}
          disabled={!canRun || running}
        >
          {running ? "Running…" : "Run Route"}
        </button>
        <button
          type="button"
          className="button"
          onClick={onReset}
          disabled={running || roadCount === 0}
        >
          Reset Route
        </button>
      </div>

      {!canRun && !running && (
        <p className="controls__hint">
          {roadCount === 0
            ? "Pick a junction joined to the Observatory to lay your first road."
            : `Bring the route back to ${finishLabel} to enable Run Route.`}
        </p>
      )}
    </section>
  );
}

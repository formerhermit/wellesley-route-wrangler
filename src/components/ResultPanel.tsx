import { useEffect, useRef } from "react";
import type { GameResult, RouteEvaluation } from "../game/types";

interface Props {
  result: GameResult;
  evaluation: RouteEvaluation;
  onEdit: () => void;
  onTryAgain: () => void;
  onReset: () => void;
}

export function ResultPanel({
  result,
  evaluation,
  onEdit,
  onTryAgain,
  onReset,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const failed = evaluation.objectives.filter((o) => o.state !== "passed");

  return (
    <div className="result-backdrop" onKeyDown={(e) => e.key === "Escape" && onEdit()}>
      <div
        className={`result${result.success ? " result--success" : " result--failure"}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="result-title"
        aria-describedby="result-message"
      >
        <p className="result__badge">
          {result.success ? "Club record attempt" : "Post-run debrief"}
        </p>
        <h2 id="result-title" ref={headingRef} tabIndex={-1}>
          {result.title}
        </h2>
        <p id="result-message" className="result__message">
          {result.message}
        </p>

        <dl className="result__stats">
          <div>
            <dt>Distance</dt>
            <dd>{evaluation.totalDistanceKm.toFixed(2)} km</dd>
          </div>
          <div>
            <dt>Pigeon hotspots</dt>
            <dd>{evaluation.pigeonHotspotCount}</dd>
          </div>
          <div>
            <dt>Canal</dt>
            <dd>{evaluation.visitedCheckpoint ? "Visited" : "Missed"}</dd>
          </div>
        </dl>

        {failed.length > 0 && (
          <div className="result__notes">
            <h3>Still outstanding</h3>
            <ul>
              {failed.map((objective) => (
                <li key={objective.id}>
                  {objective.label} — {objective.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="result__actions">
          <button type="button" className="button button--primary" onClick={onEdit}>
            Edit Route
          </button>
          <button type="button" className="button" onClick={onTryAgain}>
            Try Again
          </button>
          <button type="button" className="button" onClick={onReset}>
            Reset Route
          </button>
        </div>
        <p className="result__actions-hint">
          Edit Route keeps what you planned · Try Again replays it · Reset Route
          clears it.
        </p>
      </div>
    </div>
  );
}

import type { RefObject } from "react";
import { distanceTarget } from "../game/routeEvaluation";
import type { Level, RouteEvaluation } from "../game/types";

interface Props {
  level: Level;
  evaluation: RouteEvaluation;
  helpButtonRef: RefObject<HTMLButtonElement | null>;
  onShowHelp: () => void;
}

export function GameHeader({
  level,
  evaluation,
  helpButtonRef,
  onShowHelp,
}: Props) {
  const target = distanceTarget(level);
  const passed = evaluation.objectives.filter(
    (objective) => objective.state === "passed",
  ).length;

  return (
    <header className="game-header">
      <div className="game-header__identity">
        <h1 className="game-header__title">Route Wrangler</h1>
        <p className="game-header__subtitle">
          Wellesley Runners <span aria-hidden="true">·</span> {level.strapline}
        </p>
      </div>

      <button
        type="button"
        ref={helpButtonRef}
        className="icon-button"
        onClick={onShowHelp}
      >
        <span aria-hidden="true">?</span>
        <span className="visually-hidden">How to play</span>
      </button>

      <div className="game-header__stats">
        <p className="stat-pill">
          <span className="stat-pill__value">
            {evaluation.totalDistanceKm.toFixed(2)} km
          </span>
          <span className="stat-pill__label">
            {target ? `of ${target.minKm}–${target.maxKm}` : "so far"}
          </span>
        </p>
        <p className="stat-pill">
          <span className="stat-pill__value">
            {passed}/{evaluation.objectives.length}
          </span>
          <span className="stat-pill__label">objectives</span>
        </p>
      </div>
    </header>
  );
}

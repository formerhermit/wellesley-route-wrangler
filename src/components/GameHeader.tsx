import type { RefObject } from "react";
import { distanceTarget } from "../game/routeEvaluation";
import type { Level, RouteEvaluation } from "../game/types";
import { MusicButton } from "./MusicButton";

interface Props {
  level: Level;
  evaluation: RouteEvaluation;
  helpButtonRef: RefObject<HTMLButtonElement | null>;
  musicOn: boolean;
  onToggleMusic: () => void;
  onShowHelp: () => void;
}

export function GameHeader({
  level,
  evaluation,
  helpButtonRef,
  musicOn,
  onToggleMusic,
  onShowHelp,
}: Props) {
  const target = distanceTarget(level);
  const passed = evaluation.objectives.filter(
    (objective) => objective.state === "passed",
  ).length;

  return (
    <header className="game-header">
      <div className="game-header__identity">
        <h1 className="game-header__title">About Five Kilometres</h1>
        <p className="game-header__subtitle">{level.strapline}</p>
      </div>

      <div className="game-header__tools">
        <MusicButton on={musicOn} onToggle={onToggleMusic} />

        <button
          type="button"
          ref={helpButtonRef}
          className="icon-button"
          onClick={onShowHelp}
        >
          <span aria-hidden="true">?</span>
          <span className="visually-hidden">How to play</span>
        </button>
      </div>

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

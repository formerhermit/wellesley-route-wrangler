import type { RefObject } from "react";
import { distanceTarget } from "../game/routeEvaluation";
import type { Level, RouteEvaluation } from "../game/types";
import { MusicButton } from "./MusicButton";

interface Props {
  level: Level;
  levelNumber: number;
  evaluation: RouteEvaluation;
  helpButtonRef: RefObject<HTMLButtonElement | null>;
  levelsButtonRef: RefObject<HTMLButtonElement | null>;
  musicOn: boolean;
  onToggleMusic: () => void;
  onShowLevels: () => void;
  onShowHelp: () => void;
}

export function GameHeader({
  level,
  levelNumber,
  evaluation,
  helpButtonRef,
  levelsButtonRef,
  musicOn,
  onToggleMusic,
  onShowLevels,
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
        {/* Carries the level number, which has nowhere else to live now that
            the runs are not all laid out on the page. */}
        <button
          type="button"
          ref={levelsButtonRef}
          className="level-button"
          onClick={onShowLevels}
        >
          Level {levelNumber}
          <span className="visually-hidden">: {level.title}. Choose a run</span>
        </button>

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

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
          aria-haspopup="dialog"
          onClick={onShowLevels}
        >
          <span className="level-button__label">
            Level {levelNumber}
            <span className="visually-hidden">: {level.title}</span>
          </span>
          <span className="level-button__hint" aria-hidden="true">
            All runs
          </span>
          {/* Points down at the list it opens. */}
          <svg
            className="level-button__chevron"
            viewBox="0 0 12 8"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M1 1.5 L6 6.5 L11 1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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

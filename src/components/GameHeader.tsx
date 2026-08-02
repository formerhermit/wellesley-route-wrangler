import type { RefObject } from "react";
import type { Level, RouteEvaluation } from "../game/types";
import { MusicButton } from "./MusicButton";

interface Props {
  level: Level;
  levelNumber: number;
  evaluation: RouteEvaluation;
  /** All-time club points, so the long game is visible without opening a menu. */
  clubPoints: number;
  /** Whether there is a club table to open at all. */
  onShowClub: () => void;
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
  clubPoints,
  onShowClub,
  helpButtonRef,
  levelsButtonRef,
  musicOn,
  onToggleMusic,
  onShowLevels,
  onShowHelp,
}: Props) {
  // The distance is the one figure that is either right or it is not, so the
  // pill says which rather than quoting the window back — the window is on the
  // objective panel, which is where the numbers belong. Read off the evaluated
  // objective so "right" means exactly what the level's own rule means, too
  // long included.
  const distance = evaluation.objectives.find((o) => o.kind === "distance");
  const range = distance
    ? distance.state === "passed"
      ? " stat-pill--range is-in-range"
      : " stat-pill--range is-out-of-range"
    : "";

  return (
    <header
      className={`game-header${level.mood ? ` game-header--${level.mood}` : ""}`}
    >
      <div className="game-header__identity">
        {/* The title takes the level's mood: on a dark map it goes with it. */}
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

        {/* Always here: the trophy cabinet is behind it whether or not a club
            table has been configured. */}
        <button
          type="button"
          className="icon-button"
          aria-haspopup="dialog"
          onClick={onShowClub}
        >
          <span aria-hidden="true">🏆</span>
          <span className="visually-hidden">The club</span>
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
        <p className={`stat-pill${range}`}>
          <span className="stat-pill__value">
            {evaluation.totalDistanceKm.toFixed(2)} km
          </span>
          {/* Colour is the whole signal here, so it must not be the only one. */}
          {distance && (
            <span className="visually-hidden">
              {distance.state === "passed"
                ? "Inside the distance for this run."
                : "Outside the distance for this run."}
            </span>
          )}
        </p>

        {/* Only once there is something to show: a nought here on a first
            visit is a worse advert for the scoring than no pill at all. */}
        {clubPoints > 0 && (
          <p className="stat-pill">
            <span className="stat-pill__value">{clubPoints}</span>
            <span className="stat-pill__label">club points</span>
          </p>
        )}
      </div>
    </header>
  );
}

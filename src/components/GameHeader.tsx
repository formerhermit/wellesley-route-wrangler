import type { RefObject } from "react";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  helpButtonRef: RefObject<HTMLButtonElement | null>;
  onShowHelp: () => void;
}

export function GameHeader({ level, helpButtonRef, onShowHelp }: Props) {
  return (
    <header className="game-header">
      <div className="game-header__text">
        <p className="game-header__club">Wellesley Runners</p>
        <h1 className="game-header__title">Route Wrangler</h1>
        <h2 className="game-header__level">
          {level.title} <span aria-hidden="true">·</span>{" "}
          <span className="game-header__strapline">{level.strapline}</span>
        </h2>
      </div>

      <button
        type="button"
        ref={helpButtonRef}
        className="help-button"
        onClick={onShowHelp}
      >
        <span aria-hidden="true">?</span>
        <span className="visually-hidden">How to play</span>
      </button>
    </header>
  );
}

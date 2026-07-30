import type { Level } from "../game/types";

export function GameHeader({ level }: { level: Level }) {
  return (
    <header className="game-header">
      <p className="game-header__club">Wellesley Runners</p>
      <h1 className="game-header__title">Route Wrangler</h1>
      <h2 className="game-header__level">
        {level.title} <span aria-hidden="true">·</span>{" "}
        <span className="game-header__strapline">{level.strapline}</span>
      </h2>
      <p className="game-header__instructions">{level.instructions}</p>
    </header>
  );
}

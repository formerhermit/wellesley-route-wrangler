import type { ObjectiveState, RouteEvaluation } from "../game/types";

const MARK: Record<ObjectiveState, string> = {
  incomplete: "–",
  passed: "✓",
  failed: "✕",
};

const WORD: Record<ObjectiveState, string> = {
  incomplete: "Not yet",
  passed: "Passed",
  failed: "Failed",
};

/**
 * How much of this map is still out there. Said on the panel rather than only
 * after a run, so a level you have already beaten still shows what it has
 * left — which is the whole of the long game and was previously only visible
 * by opening the fixture list.
 */
function routesFound(found: number, toFind: number): string {
  const routes = `route${toFind === 1 ? "" : "s"}`;
  if (found === 0) return `${toFind} ${routes} to find here.`;
  if (found >= toFind) return `All ${toFind} ${routes} found here.`;
  return `${found} of ${toFind} ${routes} found here.`;
}

export function ObjectivePanel({
  evaluation,
  found,
  toFind,
  /** Routes run here at all, winners and duds. Nothing to open without one. */
  explored,
  /** Badges on the wall, across every level. */
  badgesWon,
  onOpenBook,
  onOpenCabinet,
}: {
  evaluation: RouteEvaluation;
  found: number;
  toFind: number;
  explored: number;
  badgesWon: number;
  onOpenBook: () => void;
  onOpenCabinet: () => void;
}) {
  return (
    <section className="objectives" aria-labelledby="objectives-heading">
      <h3 id="objectives-heading">Run objectives</h3>
      <ul className="objectives__list">
        {evaluation.objectives.map((objective) => (
          <li
            key={objective.id}
            className={`objective objective--${objective.state}`}
          >
            <span className="objective__mark" aria-hidden="true">
              {MARK[objective.state]}
            </span>
            <span className="objective__text">
              <span className="objective__label">{objective.label}</span>
              <span className="objective__detail">{objective.detail}</span>
            </span>
            <span className="objective__state">{WORD[objective.state]}</span>
          </li>
        ))}
      </ul>

      {/* The count is the door to the book: it is the number people want to
          interrogate, and it is on screen exactly while they are hunting.
          Until something has been run there is nothing behind it, so it stays
          a plain sentence. */}
      {toFind > 0 &&
        (explored > 0 ? (
          <button
            type="button"
            className={`objectives__found objectives__found--open${
              found > 0 && found < toFind ? " objectives__found--more" : ""
            }`}
            aria-haspopup="dialog"
            onClick={onOpenBook}
          >
            {routesFound(found, toFind)}
            <span className="objectives__open-hint"> See the book</span>
          </button>
        ) : (
          <p className="objectives__found">{routesFound(found, toFind)}</p>
        ))}

      {/* Under the book, in the same quiet register, because it answers the
          same sort of question: what else is there. Withheld until the club
          has run something, so a first visit is not a wall of doors. */}
      {explored > 0 && (
        <button
          type="button"
          className="objectives__found objectives__found--open objectives__cabinet"
          aria-haspopup="dialog"
          onClick={onOpenCabinet}
        >
          {badgesWon === 0
            ? "No badges yet."
            : `${badgesWon} badge${badgesWon === 1 ? "" : "s"} on the wall.`}
          <span className="objectives__open-hint"> Trophy cabinet</span>
        </button>
      )}
    </section>
  );
}

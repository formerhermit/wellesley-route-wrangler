import type { BriefingMark } from "../game/cards";
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
  /**
   * Which lines the briefing put there or rewrote (#10), by index against
   * `evaluation.objectives`. Without the tag a card's rule lands at the
   * bottom of seven look-alike rows and reads as the level's own — the whole
   * change the player just agreed to, invisible.
   */
  marks,
  found,
  toFind,
  /** Routes run here at all, winners and duds. Nothing to open without one. */
  explored,
  onOpenBook,
}: {
  evaluation: RouteEvaluation;
  marks?: (BriefingMark | undefined)[];
  found: number;
  toFind: number;
  explored: number;
  onOpenBook: () => void;
}) {
  return (
    <section className="objectives" aria-labelledby="objectives-heading">
      <h3 id="objectives-heading">Run objectives</h3>
      <ul className="objectives__list">
        {evaluation.objectives.map((objective, index) => {
          const mark = marks?.[index];
          return (
            <li
              key={objective.id}
              className={`objective objective--${objective.state}`}
            >
              <span className="objective__mark" aria-hidden="true">
                {MARK[objective.state]}
              </span>
              <span className="objective__text">
                <span className="objective__label">
                  {objective.label}
                  {mark && (
                    <span className="objective__briefing">Briefing</span>
                  )}
                </span>
                <span className="objective__detail">{objective.detail}</span>
                {/* A rewrite says what it rewrote: two digits changing inside
                    a line that already existed is not something anybody
                    spots from memory. */}
                {mark?.was && (
                  <span className="objective__was">Was {mark.was}.</span>
                )}
              </span>
              <span className="objective__state">{WORD[objective.state]}</span>
            </li>
          );
        })}
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
            <span className="objectives__count">{routesFound(found, toFind)}</span>
            <span className="objectives__open-hint">
              See the book
              {/* Drawn rather than a "›" in the text, which a screen reader
                  would be free to read out. */}
              <svg
                className="objectives__open-chevron"
                viewBox="0 0 8 12"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M1.5 1 L6.5 6 L1.5 11" />
              </svg>
            </span>
          </button>
        ) : (
          <p className="objectives__found">{routesFound(found, toFind)}</p>
        ))}

    </section>
  );
}

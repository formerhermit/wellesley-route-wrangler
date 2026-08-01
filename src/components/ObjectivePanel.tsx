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
}: {
  evaluation: RouteEvaluation;
  found: number;
  toFind: number;
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

      {toFind > 0 && (
        <p
          className={`objectives__found${
            found > 0 && found < toFind ? " objectives__found--more" : ""
          }`}
        >
          {routesFound(found, toFind)}
        </p>
      )}
    </section>
  );
}

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

export function ObjectivePanel({
  evaluation,
}: {
  evaluation: RouteEvaluation;
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
    </section>
  );
}

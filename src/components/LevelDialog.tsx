import { Dialog } from "./Dialog";
import { levelStatus, unlockedBy } from "../game/progression";
import type { Completed } from "../game/progression";
import type { Level } from "../game/types";

interface Props {
  levels: Level[];
  completed: Completed;
  currentId: string;
  onSelect: (level: Level) => void;
  onClose: () => void;
}

const STATUS_LABEL = {
  completed: "Completed",
  unlocked: "Not yet run",
  locked: "Locked",
} as const;

/**
 * The club's fixture list. Finished runs stay here to be run again — the point
 * of a route puzzle is rather lost if you can only attempt it once.
 */
export function LevelDialog({
  levels,
  completed,
  currentId,
  onSelect,
  onClose,
}: Props) {
  return (
    <Dialog titleId="levels-title" onClose={onClose}>
      <p className="dialog__badge">Fixture list</p>
      <h2 id="levels-title" tabIndex={-1}>
        Choose a run
      </h2>

      <ul className="levels">
        {levels.map((level, index) => {
          const status = levelStatus(levels, completed, level.id);
          const blocker = unlockedBy(levels, completed, level.id);
          const current = level.id === currentId;

          return (
            <li key={level.id}>
              <button
                type="button"
                className={`levels__item is-${status}${current ? " is-current" : ""}`}
                disabled={status === "locked"}
                aria-current={current ? "true" : undefined}
                onClick={() => {
                  onSelect(level);
                  onClose();
                }}
              >
                <span className="levels__number" aria-hidden="true">
                  {index + 1}
                </span>

                <span className="levels__body">
                  <span className="levels__title">
                    <span className="visually-hidden">Level {index + 1}: </span>
                    {level.title}
                  </span>
                  <span className="levels__note">
                    {status === "locked" && blocker
                      ? `Finish ${blocker.title} to open this one.`
                      : level.strapline}
                  </span>
                </span>

                <span className="levels__status">
                  {current ? "Current" : STATUS_LABEL[status]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

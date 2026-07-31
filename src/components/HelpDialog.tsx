import { Dialog } from "./Dialog";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  onClose: () => void;
}

/**
 * Deliberately high level. The specific rules for a run live in the objective
 * checklist, which is always on screen and updates as you plan — repeating
 * them here only made two places to keep in step.
 */
export function HelpDialog({ level, onClose }: Props) {
  return (
    <Dialog titleId="help-title" describedBy="help-intro" onClose={onClose}>
      <p className="dialog__badge">How to play</p>
      <h2 id="help-title" tabIndex={-1}>
        {level.title}
      </h2>
      <p id="help-intro" className="dialog__lead">
        {level.instructions}
      </p>

      <h3 className="help__subhead">Building a route</h3>
      <ul className="help__list">
        <li>Choose a junction joined to the end of your route to run there.</li>
        <li>Choose the one you have just come from to undo that step.</li>
        <li>Happy with it? Press Run Route and watch it unfold.</li>
      </ul>

      <h3 className="help__subhead">What counts</h3>
      <p className="help__note">
        The run objectives list is this week's brief. It scores your route as
        you build it, and <em>Not yet</em> means undecided rather than failed.
        You are also free to ignore it completely and send everyone somewhere
        daft — the club will have plenty to say about that afterwards.
      </p>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Right, off we go
        </button>
      </div>
    </Dialog>
  );
}

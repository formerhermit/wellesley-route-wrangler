import { Dialog } from "./Dialog";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  onClose: () => void;
}

/**
 * How the game works, not how this week's run works. It opens itself on a
 * first visit and lives under the ? after that, so it has to make sense
 * whichever run happens to be loaded — the brief for a particular run belongs
 * to the objective checklist, which is always on screen and updates as you
 * plan.
 *
 * Kept short enough to fit a phone without scrolling: the first thing a new
 * player sees should not hide its own way out.
 */
export function HelpDialog({ level, onClose }: Props) {
  return (
    <Dialog titleId="help-title" describedBy="help-intro" onClose={onClose}>
      <p className="dialog__badge">How to play</p>
      <h2 id="help-title" tabIndex={-1}>
        Plan it, run it, take the blame
      </h2>
      <p id="help-intro" className="dialog__lead">
        Every run is a map of junctions and the roads between them. You plan the
        route, the club runs exactly what you planned, and the committee has
        opinions afterwards.
      </p>

      <h3 className="help__subhead">Building a route</h3>
      <ul className="help__list">
        <li>Choose a junction joined to the end of your route to run there.</li>
        <li>Choose the one you came from to undo that step.</li>
        <li>No road twice — plan a way round, not a way back.</li>
        <li>Happy with it? Press Run Route and watch it unfold.</li>
      </ul>

      <h3 className="help__subhead">What counts</h3>
      <p className="help__note">
        Each run sets its own brief, on screen throughout as the run objectives.{" "}
        <em>Not yet</em> means undecided, not failed. Ignore the lot and send
        everyone somewhere daft if you like — finish one as briefed and the next
        run opens up.
      </p>

      <p className="help__today">
        <strong>Today:</strong> {level.title} — {level.strapline}
      </p>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Right, off we go
        </button>
      </div>
    </Dialog>
  );
}

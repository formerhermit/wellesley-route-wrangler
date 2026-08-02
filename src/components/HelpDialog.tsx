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
        Plan the route, the club runs it and everyone judges you afterwards.
      </p>

      <h3 className="help__subhead">Mapping a route</h3>
      <ul className="help__list">
        <li>Tap a junction to run there.</li>
        <li>Tap the one you came from to undo.</li>
        <li>You can&rsquo;t run the same road twice.</li>
        <li>Press Run Route.</li>
      </ul>

      <h3 className="help__subhead">What counts</h3>
      <p className="help__note">
        Each run has objectives. You&rsquo;re welcome to ignore them and send
        everyone somewhere daft if you like. But to qualify for the next level
        you have to follow the rules.
      </p>
      <p className="help__note">
        A loop counts once, whichever way round you run it.
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

import { Dialog } from "./Dialog";
import { nodeById } from "../game/routeGraph";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  onClose: () => void;
}

export function HelpDialog({ level, onClose }: Props) {
  const finish = nodeById(level, level.finishNodeId).label;

  return (
    <Dialog titleId="help-title" describedBy="help-intro" onClose={onClose}>
      <p className="dialog__badge">How to play</p>
      <h2 id="help-title" tabIndex={-1}>
        {level.title}
      </h2>
      <p id="help-intro" className="dialog__lead">
        {level.instructions}
      </p>

      <h3 className="help__subhead">The rules</h3>
      <ul className="help__list">
        <li>
          You may only pick a junction <strong>joined by a road</strong> to the
          end of your route.
        </li>
        <li>
          Picking the junction you have just come from{" "}
          <strong>undoes that step</strong>.
        </li>
        <li>
          <strong>No road twice.</strong> Once you have run down it, it is spent.
        </li>
        <li>
          <strong>Run Route</strong> only wakes up once your route comes back to{" "}
          {finish}.
        </li>
        <li>
          The closed road is <strong>not</strong> blocked off. You are welcome to
          run down it and find out what happens.
        </li>
      </ul>

      <h3 className="help__subhead">Getting it right</h3>
      <p className="help__note">
        The checklist beside the map scores your route as you build it. Anything
        marked <em>Not yet</em> is simply undecided — the canal is not missed
        until you get home without it.
      </p>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Right, off we go
        </button>
      </div>
    </Dialog>
  );
}

import { Dialog } from "./Dialog";
import { MysteryBadge } from "./BadgeSprites";
import { BADGE_ART } from "./badgeArt";
import { cabinetFor, earnedCount } from "../game/achievements";
import type { CabinetEntry } from "../game/achievements";
import type { Records } from "../game/records";
import type { Level } from "../game/types";

/**
 * One badge on the wall.
 *
 * A patch rather than a medal: a rounded square with a stitched edge, which is
 * the thing a running club actually owns. It reuses the card the rest of the
 * game is built from and distinguishes itself only by the dashed border, so it
 * sits beside the run book without looking imported from another game.
 *
 * How much a locked one gives away is the badge's own business — see `reveal`
 * in `achievements.ts`. Some are advertised so there is something to go after,
 * some show only the drawing, and some show nothing at all, because a badge
 * called "You Didn't Even Try, Did You" is worth more arriving than waiting.
 */
function Patch({ entry }: { entry: CabinetEntry }) {
  const Art = BADGE_ART[entry.id] ?? MysteryBadge;
  const showArt = entry.earned || entry.reveal !== "secret";
  const showName = entry.earned || entry.reveal === "teased";

  const spoken = entry.earned
    ? `${entry.name}. Earned. ${entry.blurb}`
    : entry.reveal === "teased"
      ? `${entry.name}. Not yet earned. ${entry.hint}`
      : "A badge nobody has earned yet.";

  return (
    <li className={`badge${entry.earned ? " badge--earned" : ""}`}>
      <span className="badge__patch">{showArt ? <Art /> : <MysteryBadge />}</span>
      <span className="badge__name" aria-hidden="true">
        {showName ? entry.name : " "}
      </span>
      <span className="visually-hidden">{spoken}</span>
    </li>
  );
}

/**
 * The trophy cabinet: what the club has to show for itself.
 *
 * Nothing in here is stored. Every badge is worked out from the routes in the
 * book on the spot, the same way the scoring is, so retuning one re-awards
 * everybody's history rather than stranding it.
 */
export function TrophyCabinetDialog({
  levels,
  records,
  onClose,
}: {
  levels: Level[];
  records: Records;
  onClose: () => void;
}) {
  const cabinet = cabinetFor(records, levels);
  const earned = earnedCount(cabinet);
  const total = cabinet.length;

  return (
    <Dialog titleId="cabinet-title" describedBy="cabinet-intro" onClose={onClose}>
      <p className="dialog__badge">The club</p>
      <h2 id="cabinet-title" tabIndex={-1}>
        Trophy Cabinet
      </h2>
      <p id="cabinet-intro" className="dialog__lead">
        {earned === 0
          ? `Nothing in it yet. ${total} badges are out there, and the club is not saying what for.`
          : earned === total
            ? `All ${total} of them. There is nothing left on the wall to fill.`
            : `${earned} of ${total} earned. The rest are won, not listed.`}
      </p>

      <ul className="cabinet">
        {cabinet.map((entry) => (
          <Patch key={entry.id} entry={entry} />
        ))}
      </ul>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Back to the map
        </button>
      </div>
    </Dialog>
  );
}

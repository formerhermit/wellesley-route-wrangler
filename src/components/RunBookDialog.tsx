import { Dialog } from "./Dialog";
import { RouteThumb } from "./RouteThumb";
import { pageFor } from "../game/runBook";
import { nodeById } from "../game/routeGraph";
import type { BookEntry } from "../game/runBook";
import type { Records } from "../game/records";
import type { Level, Route } from "../game/types";

/**
 * How many failures are worth showing. Every winner is kept — that is the
 * cabinet, and truncating it would be rude — but Tilford alone has 1,179 ways
 * to lose, and a determined player can work through a lot of them.
 *
 * Twelve is enough because of the order they come in: `pageFor` puts the
 * nearest misses first, so these are the twelve worth reopening rather than
 * the twelve most recent. A route that failed on one objective is a road away
 * from working; one that failed on four is a different route.
 */
const FAILURES_SHOWN = 12;

function whenFound(at: number): string {
  if (!at) return "";
  return new Date(at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/**
 * The route as a sentence, for anybody who cannot see the shape. The shape is
 * the whole point of this list, so it must not be the only way to read it.
 */
function spellOut(level: Level, entry: BookEntry): string {
  const via = entry.route.nodeIds
    .map((id) => nodeById(level, id).label)
    .join(", then ");
  const worth = entry.won
    ? `${entry.points} points`
    : (entry.verdict ?? "did not meet the brief");
  return `${entry.distanceKm.toFixed(2)} km, ${worth}. ${via}.`;
}

/**
 * One route in the book, and a way back onto the map.
 *
 * The whole card is the button rather than a "load" link tucked in a corner:
 * the shape is what the player is reading, so the shape is what they should be
 * able to press.
 *
 * Named with `aria-label`, as the junctions are. Left to the subtree, the name
 * would read the visible figures, then the instruction, then the same figures
 * again inside the spelled-out route — accurate, and a mouthful. This way it
 * says what pressing it does before reciting where it goes.
 */
function Card({
  level,
  entry,
  onLoad,
}: {
  level: Level;
  entry: BookEntry;
  onLoad: (route: Route) => void;
}) {
  return (
    <li className={`book__card${entry.won ? "" : " book__card--lost"}`}>
      <button
        type="button"
        className="book__load"
        aria-label={`Lay this route back on the map. ${spellOut(level, entry)}`}
        onClick={() => onLoad(entry.route)}
      >
        <RouteThumb level={level} route={entry.route} />
        <p className="book__figures">
          <span className="book__distance">{entry.distanceKm.toFixed(2)} km</span>
          {entry.won ? (
            <span className="book__points">{entry.points} pts</span>
          ) : (
            <span className="book__verdict">{entry.verdict}</span>
          )}
          <span className="book__when">{whenFound(entry.at)}</span>
        </p>
      </button>
    </li>
  );
}

/**
 * Every route you have run on this level, winners and duds alike.
 *
 * The duds are the point as much as the winners are: the thing that makes
 * hunting a map tiring is not knowing which of the ones you tried already
 * failed, and the run book has quietly been keeping them all along.
 *
 * What it will not do is show you a route you have not found. The count of
 * what is left is the whole of the help on offer.
 *
 * Every route here can be tapped back onto the map. `pageFor` has already
 * dropped anything whose roads no longer describe a walk, so there is no such
 * thing as an entry that will not load: a route the map has outgrown is not
 * in the book to be pressed.
 */
export function RunBookDialog({
  level,
  records,
  onLoad,
  onClose,
}: {
  level: Level;
  records: Records;
  onLoad: (route: Route) => void;
  onClose: () => void;
}) {
  const page = pageFor(records, level);
  const hiddenFailures = Math.max(0, page.tried.length - FAILURES_SHOWN);
  const nothingYet = page.won.length === 0 && page.tried.length === 0;

  return (
    <Dialog titleId="book-title" describedBy="book-intro" onClose={onClose}>
      <p className="dialog__badge">The book</p>
      <h2 id="book-title" tabIndex={-1}>
        {level.title}
      </h2>
      <p id="book-intro" className="dialog__lead">
        {nothingYet
          ? "Nothing in it yet. Run something and it goes in, whether it works or not."
          : `${page.found} of ${page.toFind} route${page.toFind === 1 ? "" : "s"} found` +
            (page.missing > 0 ? `. ${page.missing} still out there.` : ". That is the lot.")}
      </p>

      {page.won.length > 0 && (
        <>
          <h3 className="help__subhead">In the book</h3>
          <ul className="book">
            {page.won.map((entry) => (
              <Card key={entry.key} level={level} entry={entry} onLoad={onLoad} />
            ))}
          </ul>
        </>
      )}

      {page.tried.length > 0 && (
        <>
          <h3 className="help__subhead">Also tried</h3>
          <ul className="book">
            {page.tried.slice(0, FAILURES_SHOWN).map((entry) => (
              <Card key={entry.key} level={level} entry={entry} onLoad={onLoad} />
            ))}
          </ul>
          {hiddenFailures > 0 && (
            <p className="help__note">
              And {hiddenFailures} more that did not work out.
            </p>
          )}
        </>
      )}

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Back to the map
        </button>
      </div>
    </Dialog>
  );
}

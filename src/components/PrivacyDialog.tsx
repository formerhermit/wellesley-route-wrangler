import { Dialog } from "./Dialog";

/**
 * Where to send a deletion request. The repo's issue tracker is public, which
 * is fine for a licensing question and wrong for "please delete my data" —
 * swap this for an address before the club table carries anyone's runs.
 */
const CONTACT_URL =
  "https://github.com/formerhermit/wellesley-route-wrangler/issues";

/**
 * What the game keeps and where it goes. Written to be true both before and
 * after there is a club table, which the opt-in does for us: until somebody
 * puts themselves on it, nothing has left the device at all.
 *
 * Short on purpose. A policy nobody reads protects nobody, and the game is
 * about pigeons.
 */
export function PrivacyDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog titleId="privacy-title" describedBy="privacy-intro" onClose={onClose}>
      <p className="dialog__badge">Privacy</p>
      <h2 id="privacy-title" tabIndex={-1}>
        What this game knows about you
      </h2>
      <p id="privacy-intro" className="dialog__lead">
        Almost nothing, and none of it leaves your device unless you put
        yourself on the club table.
      </p>

      <h3 className="help__subhead">On your device</h3>
      <p className="help__note">
        The game remembers which runs you have completed, the routes you have
        run, and whether you wanted the music on. That is kept in your
        browser&rsquo;s own storage, on your own device. Clearing your browser
        data clears all of it, and nothing is sent anywhere.
      </p>

      <h3 className="help__subhead">If you join the club table</h3>
      <p className="help__note">
        Putting yourself on the table stores three things: the display name you
        choose, an anonymous id for the device you are playing on, and the
        routes you have run. Your score is not stored — it is worked out from
        the routes each time, which is why rebalancing the scoring never
        rewrites anybody&rsquo;s history.
      </p>
      <p className="help__note">
        That is held on Supabase, in the EU (Paris). It is used to show a
        leaderboard and nothing else: no advertising, no tracking, no analytics,
        and it is never shared or sold.
      </p>
      <p className="help__note">
        Pick a display name people would not mind seeing on a leaderboard.
        Whatever you type is what everyone else sees.
      </p>

      <h3 className="help__subhead">Taking it all back</h3>
      <p className="help__note">
        Your runs stay on the table until you remove them. There is a{" "}
        <strong>Remove me from the table</strong> button wherever the table is
        shown: it deletes your runs, your name and the anonymous id, straight
        away, without anybody having to approve it.
      </p>
      <p className="help__note">
        If that ever fails you,{" "}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
          ask here
        </a>{" "}
        and it will be done by hand.
      </p>

      <div className="dialog__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onClose}
        >
          Fair enough
        </button>
      </div>
    </Dialog>
  );
}

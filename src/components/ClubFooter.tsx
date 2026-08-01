import { ShareButton } from "./ShareButton";
import { buildGameShare } from "../game/shareText";

const CLUB_URL = "https://www.wellesleyrunners.co.uk/";
const REPO_URL = "https://github.com/formerhermit/wellesley-route-wrangler";

/**
 * The real-world call to action. The actions sit in a row so the sharing
 * button can join the club link without the layout changing.
 */
export function ClubFooter({ onShowPrivacy }: { onShowPrivacy: () => void }) {
  return (
    <footer className="club-footer">
      <p className="club-footer__text">
        <strong>Wellesley Runners are actually a real running group.</strong> If
        this made you smile, there is an actual Thursday run with actual people,
        and nobody minds how fast you are.
      </p>

      <div className="club-footer__actions">
        <ShareButton payload={buildGameShare()} label="Tell a friend" />
        <a
          className="button button--primary club-footer__cta"
          href={CLUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Run with Wellesley Runners
        </a>
      </div>

      {/* Quiet, and last: the club's message is the one that matters here. */}
      <p className="club-footer__credit">
        © 2026 Jo Hutchins-Joss / Silly Game Studio ·{" "}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          Code on GitHub
        </a>{" "}
        ·{" "}
        <button
          type="button"
          className="link-button"
          aria-haspopup="dialog"
          onClick={onShowPrivacy}
        >
          Privacy
        </button>
      </p>
    </footer>
  );
}

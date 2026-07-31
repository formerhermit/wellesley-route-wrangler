const CLUB_URL = "https://www.wellesleyrunners.co.uk/";

/**
 * The real-world call to action. The actions sit in a row so the sharing
 * button can join the club link without the layout changing.
 */
export function ClubFooter() {
  return (
    <footer className="club-footer">
      <p className="club-footer__text">
        The pigeons in this game are made up —{" "}
        <strong>Wellesley Runners are real.</strong> If this made you smile,
        there is an actual Thursday run with actual people, and nobody minds how
        fast you are.
      </p>

      <div className="club-footer__actions">
        {/* Social sharing joins this row next. */}
        <a
          className="button button--primary club-footer__cta"
          href={CLUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Run with Wellesley Runners
        </a>
      </div>
    </footer>
  );
}

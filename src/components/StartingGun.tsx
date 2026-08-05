import { useEffect, useRef, useState } from "react";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  reducedMotion: boolean;
  /** The gun itself, and the moment the chip time starts (#116) — so the
   * component does not need to know either sound or a clock exists. */
  onGun: () => void;
  /** Called once the gun has gone and the popup should clear itself. */
  onDone: () => void;
}

/**
 * A starting gun for the levels that are a race rather than a club run
 * (#116) — currently just the Farnborough Winter Half, wherever
 * `level.field` is set. Held up over the map the moment the level arrives,
 * not the moment Run Route is pressed: a gun that only fires right before
 * the run animation reads as decoration for the run, and by then the player
 * has already planned for as long as they liked without being told any of
 * it counted. Firing it on arrival is the whole of the warning — the chip
 * time on the debrief is not a surprise if the gun told you it was coming.
 *
 * It waits for the player rather than firing itself on a clock. An earlier
 * version counted itself down and went off after under two seconds, which
 * is not long enough to read a popup that has just appeared — the one thing
 * this screen exists to tell you would have gone before anybody had read
 * it. So the gun stays on your marks until **Go** is pressed, however long
 * that takes, and the chip time is none the worse for it: it was never
 * meant to capture reading the popup, only the race.
 *
 * The bib is decoration and nothing more: rolled fresh every time this shows,
 * never stored, and never read by anything that scores.
 */
export function StartingGun({ level, reducedMotion, onGun, onDone }: Props) {
  const [bib] = useState(() => 100 + Math.floor(Math.random() * 900));
  const [fired, setFired] = useState(false);
  const goButtonRef = useRef<HTMLButtonElement>(null);

  // The only control on the screen, so it takes focus the way a dialog's own
  // heading would — there is nothing else here worth landing on first.
  useEffect(() => {
    goButtonRef.current?.focus();
  }, []);

  const fire = () => {
    if (fired) return;
    setFired(true);
    onGun();

    // Long enough to actually read "GO!" rather than catch it disappearing —
    // the button click already told the player what they pressed, so this
    // is the one pause here that is about the word, not the decision. A
    // player who has asked for less motion still gets it shorter, not gone:
    // reduced motion is about cutting movement, not cutting the reveal down
    // to nothing.
    window.setTimeout(onDone, reducedMotion ? 900 : 2000);
  };

  return (
    <div className="starting-gun-backdrop">
      <div className="starting-gun">
        <p className="starting-gun__bib">
          <span className="starting-gun__club">Wellesley Runners</span>
          <span className="starting-gun__number">{bib}</span>
        </p>
        <p className="starting-gun__strapline">{level.strapline}</p>
        <p className="starting-gun__chip">Chip timed from the gun.</p>

        {fired ? (
          <p className="starting-gun__call" role="status" aria-live="assertive">
            GO!
          </p>
        ) : (
          <button
            ref={goButtonRef}
            type="button"
            className="button button--primary starting-gun__go"
            onClick={fire}
          >
            Go
          </button>
        )}
      </div>
    </div>
  );
}

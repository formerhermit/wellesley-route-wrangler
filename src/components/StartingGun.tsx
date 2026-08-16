import { useEffect, useRef } from "react";
import type { Level } from "../game/types";

interface Props {
  level: Level;
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
 * It waits for the player rather than firing itself on a clock: a countdown
 * is over before a popup that has only just appeared can be read, and the one
 * thing this screen exists to say would go with it. So the gun stays on your
 * marks until **Go** is pressed, however long that takes, and the chip time
 * is none the worse for it — it was never meant to capture reading the popup,
 * only the race.
 *
 * **Go** then clears it, and that is the whole of it (#158). This used to
 * hold a second screen up for two seconds first — the same card with a red
 * GO! where the button had been — which read as a second popup to get past
 * rather than as the start of anything. The player has just pressed Go; the
 * gun is audible; the word was telling them what they had already done, and
 * charging them a two-second wait to be told it. The race starting *is* the
 * map, so the card gets out of the way and lets them see it.
 */
export function StartingGun({ level, onGun, onDone }: Props) {
  const bib = useRef(100 + Math.floor(Math.random() * 900));
  const fired = useRef(false);
  const goButtonRef = useRef<HTMLButtonElement>(null);

  // The only control on the screen, so it takes focus the way a dialog's own
  // heading would — there is nothing else here worth landing on first.
  useEffect(() => {
    goButtonRef.current?.focus();
  }, []);

  // A ref rather than state because it guards a click, and the unmount that
  // follows this one is not going to arrive before a second click can.
  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    onGun();
    onDone();
  };

  return (
    <div className="starting-gun-backdrop">
      <div className="starting-gun">
        <p className="starting-gun__bib">
          <span className="starting-gun__club">Wellesley Runners</span>
          <span className="starting-gun__number">{bib.current}</span>
        </p>
        <p className="starting-gun__strapline">{level.strapline}</p>
        <p className="starting-gun__chip">Chip timed from the gun.</p>

        <button
          ref={goButtonRef}
          type="button"
          className="button button--primary starting-gun__go"
          onClick={fire}
        >
          Go
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface Props {
  /** The button this is pointing at. */
  anchorRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}

/**
 * Said once, the first time a briefing is available anywhere (#10).
 *
 * A new button appearing in a header is not an announcement — it is a thing
 * that was probably always there as far as anybody can tell. So the first
 * time it turns up it gets pointed at, once, and then never again.
 *
 * Positioned off the button's own box rather than parked in a corner of the
 * header, because the header rearranges itself: the strapline goes on a
 * landscape phone and the tools move with it. Measuring means the arrow is
 * under the right button on every layout without any of those being enumerated
 * here.
 */
export function BriefingCoachMark({ anchorRef, onDismiss }: Props) {
  const [box, setBox] = useState<DOMRect | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const measure = () => {
      const here = anchorRef.current?.getBoundingClientRect();
      if (here) setBox(here);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorRef]);

  // Once it has somewhere to be, it takes focus: it is the only thing on
  // screen asking to be read.
  const placed = box !== null;
  useEffect(() => {
    if (placed) closeRef.current?.focus();
  }, [placed]);

  if (!box) return null;

  /*
   * Kept on the page by clamping the card's own left edge, and the arrow is
   * then placed against the button rather than against the card — so when the
   * card has been pushed away from the edge, the arrow still points at the
   * thing rather than at where the card would like the thing to be.
   */
  const WIDTH = 260;
  const MARGIN = 12;
  const centre = box.left + box.width / 2;
  const left = Math.min(
    Math.max(centre - WIDTH / 2, MARGIN),
    Math.max(MARGIN, window.innerWidth - WIDTH - MARGIN),
  );

  return (
    <div
      className="coach-mark"
      style={{ top: box.bottom + 14, left, width: WIDTH }}
      role="dialog"
      aria-labelledby="coach-mark-title"
    >
      <span
        className="coach-mark__arrow"
        style={{ left: centre - left }}
        aria-hidden="true"
      />
      <p id="coach-mark-title" className="coach-mark__title">
        You can be dealt a briefing
      </p>
      <p className="coach-mark__body">
        Now this one is in the book, the club can turn up in whatever state
        it likes.
      </p>
      <button
        ref={closeRef}
        type="button"
        className="button button--primary coach-mark__go"
        onClick={onDismiss}
      >
        Got it
      </button>
    </div>
  );
}

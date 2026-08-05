import type { RefObject } from "react";

interface Props {
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** Cards already taken out on this run, if the briefing has been had. */
  taken: number;
  /** False once a hand is picked, until the run report is in. No redeal. */
  canDeal: boolean;
  onDeal: () => void;
}

/**
 * The way in to the briefing (#10), in the header beside the trophy cabinet
 * and the speaker.
 *
 * A clipboard, because that is what somebody stands at the car park with.
 * Only rendered where a briefing is available at all — never on a race, and
 * never on a level nobody has finished yet — so its presence is the whole of
 * how the feature announces itself after the first time.
 */
export function BriefingButton({ buttonRef, taken, canDeal, onDeal }: Props) {
  return (
    <button
      type="button"
      ref={buttonRef}
      className={`icon-button${taken > 0 ? " icon-button--active" : ""}`}
      aria-haspopup="dialog"
      disabled={!canDeal}
      onClick={onDeal}
    >
      <svg
        className="icon-button__glyph"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x={4}
          y={4}
          width={16}
          height={17}
          rx={2}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x={8.5}
          y={2}
          width={7}
          height={4}
          rx={1.2}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </g>
      </svg>
      <span className="visually-hidden">
        {canDeal
          ? "The briefing"
          : `The briefing: ${taken} cards taken, and no redeal until the run report`}
      </span>
    </button>
  );
}

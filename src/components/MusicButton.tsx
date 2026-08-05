interface Props {
  on: boolean;
  onToggle: () => void;
}

/**
 * Sits beside the speaker in the header (#123). A pair of notes, because that
 * is what music is; the speaker belongs to the sound effects.
 *
 * Struck through rather than emptied when off, so it reads as "no music" and
 * not as "there is no music here".
 */
export function MusicButton({ on, onToggle }: Props) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-pressed={on}
      onClick={onToggle}
    >
      <svg
        className="icon-button__glyph"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        {/* Two stems joined by the beam, drawn as one stroke. */}
        <path
          d="M9.5 17.5V6.2l10-2v11.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx={7} cy={17.6} rx={3} ry={2.5} fill="currentColor" />
        <ellipse cx={17} cy={15.6} rx={3} ry={2.5} fill="currentColor" />
        {!on && (
          <>
            {/*
              Cut out of the notes rather than laid over them. The beam runs
              shallowly the same way, so a single stroke on top merges into it
              and reads as a third line rather than as a strike — the gap is
              what makes it obviously in front.
            */}
            <path
              d="M5 19.5L19.5 5"
              fill="none"
              stroke="var(--card)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M5 19.5L19.5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      <span className="visually-hidden">Music</span>
    </button>
  );
}

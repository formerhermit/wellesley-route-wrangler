interface Props {
  on: boolean;
  onToggle: () => void;
}

/**
 * Sits beside the music note (#107). A pulse rather than a second speaker, so
 * the two buttons read as different things at a glance — one is what plays
 * behind the game, this one is what answers a press.
 */
export function SoundButton({ on, onToggle }: Props) {
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
        <path
          d="M3.5 14.5h3l2.5-6.5 3 12 2.5-9h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {!on && (
          <path
            d="M16 8.5l5 7m0-7l-5 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="visually-hidden">Sound effects</span>
    </button>
  );
}

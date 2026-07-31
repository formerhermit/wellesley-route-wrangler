interface Props {
  on: boolean;
  onToggle: () => void;
}

/**
 * Sits beside the ? in the header. Drawn rather than lettered, because a
 * struck-through musical note reads as "no music here" rather than "off".
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
        <path
          d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {on ? (
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
            <path d="M18 6.7a7.5 7.5 0 0 1 0 10.6" />
          </g>
        ) : (
          <path
            d="M16 9.5l5 5m0-5l-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="visually-hidden">Music</span>
    </button>
  );
}

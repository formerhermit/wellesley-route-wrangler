/**
 * The little drawings on the how-to-play screen.
 *
 * Same flat-fill hand as the map and the badges, and drawn in a 0..40 box so
 * one rule of CSS sizes all of them. They are decorations for text that
 * already says the thing, so every one is `aria-hidden`.
 */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="rule__art" viewBox="0 0 40 40" aria-hidden="true">
      {children}
    </svg>
  );
}

/** A junction, drawn as the map draws one. */
export function StartIcon() {
  return (
    <Icon>
      <circle cx={20} cy={20} r={15} className="rules-ring" />
      <circle cx={20} cy={20} r={9} className="rules-ring-inner" />
      <circle cx={20} cy={20} r={4.5} className="rules-dot" />
    </Icon>
  );
}

/** A finger, about to pick somewhere daft. */
export function TapIcon() {
  return (
    <Icon>
      {/* One finger and a fist. The anatomically fuller hand turned to mud at
          the size this is drawn. */}
      <rect x={13} y={19} width={17} height={16} rx={6} className="rules-hand" />
      <rect x={15.5} y={5} width={7} height={18} rx={3.5} className="rules-hand" />
      <path d="M19 12v6" className="rules-hand-crease" />
    </Icon>
  );
}

/** Club points, and what they are for. */
export function TrophyIcon() {
  return (
    <Icon>
      <path d="M12 6h16v10a8 8 0 0 1-16 0V6Z" className="rules-cup" />
      <path d="M12 10H7.5a5.5 5.5 0 0 0 5.5 5.5M28 10h4.5a5.5 5.5 0 0 1-5.5 5.5" className="rules-cup-handle" />
      <path d="M17.5 24h5v4h-5z" className="rules-cup-stem" />
      <rect x={11} y={28} width={18} height={5} rx={2} className="rules-cup-base" />
    </Icon>
  );
}

/** The committee, watching. */
export function EyesIcon() {
  return (
    <Icon>
      {/* Side by side and barely touching. Overlapped, the two outlines cross
          in the middle and the pair reads as a link in a chain. */}
      <ellipse cx={12} cy={20} rx={8} ry={9.5} className="rules-eye" />
      <ellipse cx={28} cy={20} rx={8} ry={9.5} className="rules-eye" />
      <circle cx={12.5} cy={20.5} r={4} className="rules-pupil" />
      <circle cx={28.5} cy={20.5} r={4} className="rules-pupil" />
    </Icon>
  );
}

/** More than one way round, and many more ways to get it wrong. */
export function RoutesIcon() {
  return (
    <Icon>
      <path d="M11 30q9 -6 18 -14" className="rules-route-dash" />
      <path d="M9 12a5 5 0 0 1 10 0c0 4-5 9-5 9s-5-5-5-9Z" className="rules-pin" />
      <circle cx={14} cy={12} r={2} className="rules-pin-hole" />
      <path d="M25 24a5 5 0 0 1 10 0c0 4-5 9-5 9s-5-5-5-9Z" className="rules-pin" />
      <circle cx={30} cy={24} r={2} className="rules-pin-hole" />
    </Icon>
  );
}

/** Round one way or the other, and it is the same run. */
export function LoopIcon() {
  return (
    <Icon>
      <path d="M20 8a12 12 0 1 1-11 7" className="rules-loop" />
      <path d="M4 9l5 7 8-3" className="rules-loop-head" />
    </Icon>
  );
}

/** The club's own voice, saying something unhelpful. */
export function MegaphoneIcon() {
  return (
    <Icon>
      <path d="M6 16h6l12-7v22l-12-7H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" className="rules-horn" />
      <path d="M12 23v7a2 2 0 0 0 4 0v-5" className="rules-horn-handle" />
      <path d="M29 14a8 8 0 0 1 0 12M33 10a13 13 0 0 1 0 20" className="rules-horn-waves" />
    </Icon>
  );
}

/** The marks either side of the title, which are only there for the noise. */
export function TitleSparks({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`rules__spark${flip ? " rules__spark--flip" : ""}`}
      viewBox="0 0 24 32"
      aria-hidden="true"
    >
      <path d="M20 6 L6 10 M21 16 L5 16 M20 26 L6 22" className="rules-spark-line" />
    </svg>
  );
}

/** Where the pigeon has wandered off to. */
export function PigeonTrail() {
  return (
    <svg className="rules__trail" viewBox="0 0 120 24" aria-hidden="true">
      <path d="M2 14 Q30 2 58 12 T112 10" className="rules-trail-line" />
      <path d="M104 5 L114 10 L104 15" className="rules-trail-head" />
    </svg>
  );
}

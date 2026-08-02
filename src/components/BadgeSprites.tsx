/**
 * The drawings on the badges, in the same hand as the map.
 *
 * Flat fills over ink, the club palette, no gradients — everything here should
 * look like it was cut from the same sheet of paper as `MapSprites`. Each one
 * is drawn in a -30..30 box so the patch can size them all the same way.
 *
 * Deliberately simpler than the map sprites: at the size a patch is shown, a
 * drawing with more than three or four shapes in it turns to mud.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg className="badge__art" viewBox="-30 -30 60 60" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * The map's own hill marker, crossed out.
 *
 * The same two polygons `HillMarker` draws, at the same proportions and in the
 * same classes, so a player who has seen one on a map recognises this without
 * being told. Drawn a little larger, because a patch has the room.
 */
export function NoHillsBadge() {
  return (
    <Frame>
      <g transform="translate(0 6) scale(1.55)">
        <polygon points="-16,10 0,-12 16,10" className="hill-body" />
        <polygon points="-5,-1 0,-12 5,-1" className="hill-cap" />
      </g>
      {/* One stroke, not a saltire. Two crossed at this weight buried the
          hill they were meant to be crossing out. */}
      <path d="M -21 18 L 21 -18" className="badge-strike" />
    </Frame>
  );
}

/** A bird, unbothered, and the group going past it. */
export function PigeonBadge() {
  return (
    <Frame>
      <ellipse cx={-4} cy={0} rx={13} ry={10} className="badge-bird" />
      <circle cx={9} cy={-8} r={6} className="badge-bird" />
      <circle cx={11} cy={-10} r={1.8} className="badge-eye" />
      <path d="M 15 -8 L 21 -6 L 15 -4 Z" className="badge-beak" />
      <path d="M -20 16 L 20 16" className="badge-pass" />
    </Frame>
  );
}

/** Five, and it means five. */
export function ExactlyFiveBadge() {
  return (
    <Frame>
      <circle cx={0} cy={0} r={20} className="badge-ring" />
      <text x={0} y={9} className="badge-number">
        5
      </text>
    </Frame>
  );
}

/** The barrier, and the fact that you went past it anyway. */
export function ClosedRoadBadge() {
  return (
    <Frame>
      <rect x={-3} y={-6} width={6} height={24} className="badge-post" />
      <rect x={-20} y={-12} width={40} height={9} rx={2} className="badge-bar" />
      <path d="M -14 -12 L -8 -3 M -2 -12 L 4 -3 M 10 -12 L 16 -3" className="badge-bar-stripe" />
    </Frame>
  );
}

/** A watch, a hundred metres short, and an opinion about it. */
export function StravaTaxBadge() {
  return (
    <Frame>
      <rect x={-15} y={-15} width={30} height={30} rx={7} className="badge-watch" />
      <circle cx={0} cy={0} r={10} className="badge-watch-face" />
      <path d="M 0 0 L 0 -7 M 0 0 L 5 3" className="badge-hands" />
    </Frame>
  );
}

/**
 * A mug, still steaming.
 *
 * The badge's own line is about the kettle not having finished boiling, and a
 * progress bar is an abstraction where a mug is a picture. It reads at any
 * size, which a bar does not.
 */
export function ShortRunBadge() {
  return (
    <Frame>
      <path d="M -14 -4 L -11 16 Q -10 20 -6 20 L 6 20 Q 10 20 11 16 L 14 -4 Z" className="badge-mug" />
      <path d="M 14 0 Q 23 1 22 7 Q 21 12 13 12" className="badge-mug-handle" />
      <path d="M -6 -12 Q -2 -17 -6 -22" className="badge-steam" />
      <path d="M 4 -12 Q 8 -17 4 -22" className="badge-steam" />
    </Frame>
  );
}

/** Up, and up, and up. */
export function HillsBadge() {
  return (
    <Frame>
      <path d="M -22 14 L -8 -6 L 0 6 L 10 -14 L 22 14 Z" className="badge-hill" />
      <path d="M 10 -14 L 15 -10 L 10 -7 Z" className="badge-flag" />
    </Frame>
  );
}

/** A sign, roundly ignored, five separate times. */
export function IgnoredSignBadge() {
  return (
    <Frame>
      <rect x={-2.5} y={0} width={5} height={20} className="badge-post" />
      <circle cx={0} cy={-8} r={14} className="badge-sign" />
      <path d="M -8 -8 L 8 -8" className="badge-sign-bar" />
    </Frame>
  );
}

/**
 * The car that came to collect them.
 *
 * The punchline of the badge's own line — two people have gone home in one —
 * and the map already has a car on it, so this is that car with the fumes and
 * the ground line taken off. A wandering squiggle said "a route"; it did not
 * say "much further than anybody agreed to".
 */
export function LongRunBadge() {
  return (
    <Frame>
      <g transform="translate(0 4)">
        <path
          d="M -24 6 L -24 0 Q -24 -3 -20 -4 L -14 -11 Q -12 -13 -8 -13 L 8 -13 Q 12 -13 13 -11 L 19 -4 Q 24 -3 24 0 L 24 6 Z"
          className="car-body"
        />
        <path
          d="M -12 -10 L -3 -10 L -3 -4 L -17 -4 Z M 0 -10 L 9 -10 L 13 -4 L 0 -4 Z"
          className="car-window"
        />
        <circle cx={-13} cy={6} r={4.5} className="car-wheel" />
        <circle cx={13} cy={6} r={4.5} className="car-wheel" />
        <circle cx={-13} cy={6} r={1.7} className="car-hub" />
        <circle cx={13} cy={6} r={1.7} className="car-hub" />
      </g>
    </Frame>
  );
}

/** Every route on the first five maps. */
export function LocalLegendBadge() {
  return (
    <Frame>
      <path
        d="M 0 -22 L 6 -7 L 22 -7 L 9 3 L 14 18 L 0 9 L -14 18 L -9 3 L -22 -7 L -6 -7 Z"
        className="badge-star"
      />
    </Frame>
  );
}

/**
 * The cow off the map, not a drawing of one.
 *
 * It is a bitmap there and there is no reason for it to be anything else here:
 * a vector cow at this size was a blob with spots on. Same file, same animal.
 */
export function CowBadge() {
  return (
    <Frame>
      <image
        href={`${import.meta.env.BASE_URL}sprites/cow.png`}
        x={-26}
        y={-16}
        width={52}
        height={32}
      />
    </Frame>
  );
}

/** After dark, and the thing in it. */
export function SpookyBadge() {
  return (
    <Frame>
      <path
        d="M -13 16 L -13 -4 A 13 13 0 0 1 13 -4 L 13 16 L 8 11 L 3 16 L -3 11 L -8 16 Z"
        className="badge-ghost"
      />
      <circle cx={-5} cy={-3} r={2.4} className="badge-eye" />
      <circle cx={5} cy={-3} r={2.4} className="badge-eye" />
    </Frame>
  );
}

/** In the hats, in the cold. */
export function ChristmasBadge() {
  return (
    <Frame>
      <path d="M 0 -20 L 12 0 L -12 0 Z" className="badge-tree" />
      <path d="M 0 -8 L 17 14 L -17 14 Z" className="badge-tree" />
      <rect x={-3} y={14} width={6} height={7} className="badge-trunk" />
      <circle cx={0} cy={-22} r={3.4} className="badge-star-small" />
    </Frame>
  );
}

/**
 * The map's own loo cabin, one of the pair, drawn bigger.
 *
 * Same shapes and same classes as `LooCabin`: body, the roof that overhangs at
 * an angle, the door, three vent slots and the handle. The earlier badge was a
 * blue rectangle with a dot on it and looked like a door, or a book.
 */
export function PortalooBadge() {
  return (
    <Frame>
      <g transform="scale(1.55)">
        <rect x={-9} y={-14} width={18} height={28} rx={1.5} className="loo-body" />
        <path d="M -10 -14 h 20 l -2 -4 h -16 Z" className="loo-roof" />
        <rect x={-6} y={-10} width={12} height={22} rx={1} className="loo-door" />
        <path d="M -4 -7 h 8 M -4 -4.5 h 8 M -4 -2 h 8" className="loo-vent" />
        <circle cx={4} cy={2} r={1.2} className="loo-handle" />
      </g>
    </Frame>
  );
}

/**
 * The goose off the map, for the same reason as the cow. It is the one the
 * player has been followed home by, so it should be the one on the badge.
 */
export function GooseBadge() {
  return (
    <Frame>
      <image
        href={`${import.meta.env.BASE_URL}sprites/goose.png`}
        x={-19}
        y={-23}
        width={38}
        height={46}
      />
    </Frame>
  );
}

/** A locked badge nobody is being told about. */
export function MysteryBadge() {
  return (
    <Frame>
      <text x={0} y={11} className="badge-number badge-number--mystery">
        ?
      </text>
    </Frame>
  );
}

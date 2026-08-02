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

/** Flat road, no climb in sight. */
export function NoHillsBadge() {
  return (
    <Frame>
      <path d="M -22 12 L 22 12" className="badge-line" />
      <path d="M -20 -6 L -6 -6 L 2 -14 L 12 -2 L 20 -6" className="badge-hill-crossed" />
      <path d="M -20 -18 L 20 6" className="badge-strike" />
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

/** Nowhere near far enough. */
export function ShortRunBadge() {
  return (
    <Frame>
      <path d="M -20 6 L 20 6" className="badge-line" />
      <path d="M -20 6 L -4 6" className="badge-progress" />
      <circle cx={-4} cy={6} r={5} className="badge-dot" />
      <path d="M -14 -14 L 14 -14" className="badge-line-faint" />
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

/** Considerably further than anybody agreed to. */
export function LongRunBadge() {
  return (
    <Frame>
      <path d="M -22 10 C -10 -14, 6 20, 22 -8" className="badge-route" />
      <circle cx={-22} cy={10} r={4} className="badge-dot" />
      <circle cx={22} cy={-8} r={4} className="badge-dot-end" />
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

/** They have started to expect it. */
export function CowBadge() {
  return (
    <Frame>
      <ellipse cx={0} cy={2} rx={18} ry={12} className="badge-cow" />
      <ellipse cx={-7} cy={-1} rx={6} ry={5} className="badge-cow-patch" />
      <ellipse cx={7} cy={5} rx={5} ry={4} className="badge-cow-patch" />
      <circle cx={13} cy={-9} r={7} className="badge-cow" />
      <circle cx={15} cy={-11} r={1.6} className="badge-eye" />
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

/** Nobody is judging. Everybody is judging. */
export function PortalooBadge() {
  return (
    <Frame>
      <rect x={-12} y={-16} width={24} height={32} rx={3} className="badge-loo" />
      <rect x={-12} y={-16} width={24} height={8} rx={3} className="badge-loo-roof" />
      <circle cx={6} cy={2} r={2} className="badge-eye" />
      <path d="M -6 -4 L 2 -4" className="badge-loo-vent" />
    </Frame>
  );
}

/** Twice now. That is a pattern. */
export function GooseBadge() {
  return (
    <Frame>
      <ellipse cx={-3} cy={6} rx={15} ry={10} className="badge-goose" />
      <path d="M 6 0 C 12 -4, 12 -14, 8 -18" className="badge-goose-neck" />
      <circle cx={8} cy={-19} r={5} className="badge-goose" />
      <path d="M 12 -19 L 19 -17 L 12 -15 Z" className="badge-beak" />
      <circle cx={10} cy={-21} r={1.5} className="badge-eye" />
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

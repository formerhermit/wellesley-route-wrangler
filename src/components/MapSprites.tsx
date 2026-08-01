/**
 * Small, deliberately simple SVG sprites. Each draws around its own origin so
 * callers can place it with a single translate.
 */

export function Observatory() {
  return (
    <g className="sprite sprite--observatory" aria-hidden="true">
      <rect x={-22} y={-6} width={44} height={26} rx={4} className="build-wall" />
      <path d="M -22 -6 A 22 22 0 0 1 22 -6 Z" className="build-dome" />
      <line x1={6} y1={-14} x2={26} y2={-26} className="build-telescope" />
      <circle cx={0} cy={6} r={4} className="build-door" />
    </g>
  );
}

/**
 * A discreet bush. The joke is entirely in the place name.
 *
 * Three lobes, but one plant: the outline is the same three shapes drawn
 * fatter and in ink underneath, so what shows is a single silhouette. Stroking
 * each lobe instead leaves the lines where they overlap, and it reads as three
 * circles that happen to be touching.
 */
const BUSH_LOBES = [
  { cx: -11, cy: 4, rx: 12, ry: 10 },
  { cx: 11, cy: 4, rx: 12, ry: 10 },
  { cx: 0, cy: -5, rx: 14, ry: 12 },
];

export function Bush() {
  return (
    <g className="sprite sprite--bush" aria-hidden="true">
      <g className="bush-outline">
        {BUSH_LOBES.map((lobe, index) => (
          <ellipse
            key={index}
            cx={lobe.cx}
            cy={lobe.cy}
            rx={lobe.rx + 1.4}
            ry={lobe.ry + 1.4}
          />
        ))}
      </g>
      <g className="bush-body">
        {BUSH_LOBES.map((lobe, index) => (
          <ellipse key={index} {...lobe} />
        ))}
      </g>
      <ellipse cx={-5} cy={-9} rx={6} ry={5} className="bush-highlight" />
    </g>
  );
}

/** Sitting, tail curled, entirely uninterested in the run. */
export function Cat() {
  return (
    <g className="sprite sprite--cat" aria-hidden="true">
      <path d="M -5 10 q -4 -8 0 -13 q 5 -4 9 1 q 2 5 1 12 Z" className="cat-body" />
      <circle cx={5.5} cy={-8} r={4.6} className="cat-body" />
      <path d="M 1.6 -11 l -0.6 -5 l 4 2.6 M 9.4 -11 l 0.8 -5 l -4 2.6" className="cat-body" />
      <path d="M -5 9 q -8 1 -6 -7" className="cat-tail" />
      <path d="M 3.4 -8.4 v 1.6 M 7.6 -8.4 v 1.6" className="cat-face" />
      <path d="M -8 10 h 20" className="hangar-ground" />
    </g>
  );
}

/** Red, amber, green, and a group of runners waiting for none of them. */
export function TrafficLight() {
  return (
    <g className="sprite sprite--lights" aria-hidden="true">
      <path d="M 0 12 v -14" className="lights-post" />
      <rect x={-5} y={-24} width={10} height={23} rx={2.5} className="lights-box" />
      <circle cx={0} cy={-19} r={2.6} className="lights-stop" />
      <circle cx={0} cy={-12.5} r={2.6} className="lights-wait" />
      <circle cx={0} cy={-6} r={2.6} className="lights-go" />
      <path d="M -7 12 h 14" className="hangar-ground" />
    </g>
  );
}

/**
 * Somebody's dog, delighted, and about to be in the way. A bitmap, like the
 * cow and the goose, and drawn facing left as it was given to us.
 */
const DOG_IMAGE = `${import.meta.env.BASE_URL}sprites/dog.png`;

export function Dog({ flip = false }: { flip?: boolean }) {
  return (
    <g className="sprite sprite--dog" aria-hidden="true">
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <image href={DOG_IMAGE} x={-15} y={-12} width={30} height={22} />
      </g>
    </g>
  );
}

/** Somewhere to sit and watch a group of adults argue about a map. */
export function Bench() {
  return (
    <g className="sprite sprite--bench" aria-hidden="true">
      <path d="M -14 -1 h 28 M -14 -5 h 28 M -14 -9 h 28" className="bench-slat" />
      <path d="M -11 -1 v 9 M 11 -1 v 9 M -11 -11 v 10 M 11 -11 v 10" className="bench-frame" />
      <path d="M -17 8 h 34" className="hangar-ground" />
    </g>
  );
}

/** Nobody will admit to putting it there. */
export function Gnome() {
  return (
    <g className="sprite sprite--gnome" aria-hidden="true">
      <path d="M -5 9 q 0 -8 5 -8 q 5 0 5 8 Z" className="gnome-coat" />
      <circle cx={0} cy={-2} r={3.4} className="gnome-face" />
      <path d="M -3.4 -1 q 3.4 7 6.8 0 q -1.4 4 -3.4 4 q -2 0 -3.4 -4" className="gnome-beard" />
      <path d="M -5 -3.5 q 5 -12 10 0 Z" className="gnome-hat" />
      <path d="M -8 9 h 16" className="hangar-ground" />
    </g>
  );
}

/** Youths. Doing nothing, at length, in a way that feels deliberate. */
export function Youths() {
  return (
    <g className="sprite sprite--youths" aria-hidden="true">
      <path d="M -13 10 v -11 a 5 5 0 0 1 10 0 v 11 Z" className="youth-hoodie" />
      <path d="M -13.5 -1 q 5.5 -7 11 0 Z" className="youth-hood" />
      <circle cx={-8} cy={-1.5} r={2.6} className="youth-face" />

      <path d="M 1 10 v -13 a 5 5 0 0 1 10 0 v 13 Z" className="youth-hoodie" />
      <path d="M 0.5 -3 q 5.5 -7 11 0 Z" className="youth-hood" />
      <circle cx={6} cy={-3.5} r={2.6} className="youth-face" />
      <path d="M -17 10 h 32" className="hangar-ground" />
    </g>
  );
}

export function Flowers() {
  return (
    <g className="sprite sprite--flowers" aria-hidden="true">
      <path d="M -7 9 q -1 -7 0 -11 M 0 9 q 1 -8 0 -13 M 7 9 q 1 -6 0 -10" className="flower-stem" />
      <circle cx={-7} cy={-3} r={3} className="flower-pink" />
      <circle cx={0} cy={-5} r={3.2} className="flower-purple" />
      <circle cx={7} cy={-2} r={2.8} className="flower-yellow" />
      <circle cx={-7} cy={-3} r={1} className="flower-eye" />
      <circle cx={0} cy={-5} r={1} className="flower-eye" />
      <circle cx={7} cy={-2} r={0.9} className="flower-eye" />
    </g>
  );
}

export function Butterfly() {
  return (
    <g className="sprite sprite--butterfly" aria-hidden="true">
      <path d="M 0 0 q -8 -8 -9 -1 q -1 6 9 1 Z" className="butterfly-wing" />
      <path d="M 0 0 q 8 -8 9 -1 q 1 6 -9 1 Z" className="butterfly-wing" />
      <path d="M 0 -3 v 6" className="butterfly-body" />
      <path d="M -0.5 -3 l -2.5 -3 M 0.5 -3 l 2.5 -3" className="butterfly-body" />
    </g>
  );
}

/** The van the club would stop for, and has. */
export function IceCreamVan() {
  return (
    <g className="sprite sprite--icecream" aria-hidden="true">
      <path d="M -22 8 v -13 h 25 l 9 8 v 5 Z" className="icecream-body" />
      <rect x={-19} y={-2} width={12} height={7} rx={1} className="icecream-window" />
      <path d="M -22 0 h 25" className="icecream-stripe" />
      <circle cx={-13} cy={9} r={3.5} className="van-wheel" />
      <circle cx={7} cy={9} r={3.5} className="van-wheel" />
      {/* The cone on the roof, which is the whole point of an ice cream van. */}
      <path d="M -5 -5 l 3.5 8 l 3.5 -8 Z" className="icecream-cone" />
      <circle cx={-1.5} cy={-7} r={3.4} className="icecream-scoop" />
    </g>
  );
}

/** Parked where nobody parks, and nobody will say whose it is. */
export function SuspiciousCar({ variant = 0 }: { variant?: number }) {
  return (
    <g className={`sprite sprite--car sprite--car-${variant}`} aria-hidden="true">
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
      {/* The engine is running. It has been running for an hour. */}
      <path d="M -26 3 q -5 -1 -7 -4" className="car-fumes" />
      <path d="M -30 10 h 60" className="hangar-ground" />
    </g>
  );
}

export function Tree() {
  return (
    <g className="sprite sprite--tree" aria-hidden="true">
      <rect x={-2} y={0} width={4} height={12} rx={1.5} className="tree-trunk" />
      <circle cx={0} cy={-8} r={9} className="tree-leaf" />
      <circle cx={-7} cy={-2} r={6.5} className="tree-leaf" />
      <circle cx={7} cy={-2} r={6.5} className="tree-leaf" />
    </g>
  );
}

/**
 * Plastic army men, bitmaps like the cow and the Duke. Drawn standing on
 * their own origin so a scatter position reads as where the feet are, and
 * sized per pose — the kneeling one is not as tall as the rest.
 */
const SOLDIERS = [
  { src: "soldier-1.png", w: 16.6, h: 19.5 },
  { src: "soldier-2.png", w: 13.2, h: 20 },
  { src: "soldier-3.png", w: 13.9, h: 13 },
  { src: "soldier-4.png", w: 14.1, h: 18.6 },
];

export function Soldier({ index, flip = false }: { index: number; flip?: boolean }) {
  const { src, w, h } = SOLDIERS[index % SOLDIERS.length];
  return (
    <g className="sprite sprite--soldier" aria-hidden="true">
      {/* They are all drawn facing right, so half of them need turning. */}
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <image
          href={`${import.meta.env.BASE_URL}sprites/${src}`}
          x={-w / 2}
          y={-h}
          width={w}
          height={h}
        />
      </g>
    </g>
  );
}

/**
 * Minley Manor: red brick, French château roofs, a round tower with a conical
 * cap and more chimneys than a house needs. Distinctive enough that the
 * silhouette alone does the work.
 */
export function MinleyManor() {
  return (
    <g className="sprite sprite--manor" aria-hidden="true">
      <rect x={-26} y={-14} width={40} height={26} rx={1.5} className="manor-wall" />
      <path d="M -28 -14 h 44 l -8 -13 h -28 Z" className="manor-roof" />
      <path d="M -19 -27 v -7 M -6 -30 v -6 M 6 -28 v -6" className="manor-chimney" />

      {/* The tower, which is the bit everybody remembers. */}
      <rect x={14} y={-24} width={16} height={36} rx={1.5} className="manor-wall" />
      <path d="M 12 -24 h 20 l -10 -16 Z" className="manor-roof" />
      <path d="M 22 -40 v -5" className="manor-finial" />

      <path d="M -21 -8 h 6 v 7 h -6 Z M -10 -8 h 6 v 7 h -6 Z M 1 -8 h 6 v 7 h -6 Z" className="manor-window" />
      <path d="M 18 -18 h 8 v 8 h -8 Z" className="manor-window" />
      <path d="M -12 12 v -10 a 5 5 0 0 1 10 0 v 10 Z" className="manor-door" />
      <path d="M -30 12 h 62" className="hangar-ground" />
    </g>
  );
}

/** Alpine, and planted in rows, which is how you know it is not a wood. */
export function AlpineTree() {
  return (
    <g className="sprite sprite--alpine" aria-hidden="true">
      <rect x={-2} y={2} width={4} height={10} rx={1} className="tree-trunk" />
      <path d="M 0 -22 l 8 12 h -16 Z" className="alpine-leaf" />
      <path d="M 0 -14 l 10 13 h -20 Z" className="alpine-leaf" />
      <path d="M 0 -6 l 12 10 h -24 Z" className="alpine-leaf" />
    </g>
  );
}

/**
 * A giant sequoia, which the Victorians planted up drives like this one and
 * which now dwarfs everything the lime trees were meant to match.
 */
export function Wellingtonia() {
  return (
    <g className="sprite sprite--wellingtonia" aria-hidden="true">
      <rect x={-3} y={4} width={6} height={12} rx={1.5} className="sequoia-trunk" />
      <path d="M 0 -34 q 11 20 9 30 q -9 6 -18 0 q -2 -10 9 -30 Z" className="sequoia-leaf" />
      <path d="M -7 -6 q 7 4 14 0 M -8 -16 q 8 4 16 0" className="sequoia-shade" />
    </g>
  );
}

/** Heather. Purple, springy, and everywhere out here. */
export function Heather() {
  return (
    <g className="sprite sprite--heather" aria-hidden="true">
      <path d="M -8 8 q -1 -6 1 -9 M 0 8 q 0 -7 0 -11 M 8 8 q 1 -6 -1 -9" className="heather-stem" />
      <ellipse cx={-7} cy={-2} rx={3.4} ry={4.4} className="heather-bloom" />
      <ellipse cx={0} cy={-4} rx={3.6} ry={4.8} className="heather-bloom" />
      <ellipse cx={7} cy={-2} rx={3.4} ry={4.4} className="heather-bloom" />
    </g>
  );
}

/** Gorse: spiky, yellow, and always slightly on fire somewhere. */
export function Gorse() {
  return (
    <g className="sprite sprite--gorse" aria-hidden="true">
      <path
        d="M -14 10 q -4 -12 4 -15 q 3 -8 10 -4 q 8 -4 11 5 q 5 5 -1 14 Z"
        className="gorse-body"
      />
      <path d="M -9 -2 l -3 -4 M -2 -8 l -1 -5 M 5 -6 l 4 -4 M 9 2 l 5 -2" className="gorse-spine" />
      <circle cx={-6} cy={2} r={2.2} className="gorse-flower" />
      <circle cx={2} cy={-2} r={2.4} className="gorse-flower" />
      <circle cx={8} cy={4} r={2} className="gorse-flower" />
      <circle cx={-1} cy={6} r={2} className="gorse-flower" />
    </g>
  );
}

/** The bit everyone walks round and one person runs straight through. */
export function Mud() {
  return (
    <g className="sprite sprite--mud" aria-hidden="true">
      <ellipse cx={0} cy={2} rx={22} ry={9} className="mud-pool" />
      <ellipse cx={-4} cy={0} rx={11} ry={4} className="mud-shine" />
      <path d="M -16 8 q 8 3 14 0 M 4 9 q 6 2 11 -1" className="mud-rut" />
    </g>
  );
}

/** Hecking Sand, which is exactly as advertised. */
export function SandPatch() {
  return (
    <g className="sprite sprite--sand" aria-hidden="true">
      <ellipse cx={0} cy={2} rx={24} ry={10} className="sand-body" />
      <path d="M -15 0 q 7 -3 13 0 M -6 6 q 8 -3 15 0" className="sand-ripple" />
    </g>
  );
}

/** A dinghy, doing what dinghies do, which is very little rather slowly. */
export function SailingBoat() {
  return (
    <g className="sprite sprite--boat" aria-hidden="true">
      <path d="M -10 6 h 20 l -4 5 h -12 Z" className="boat-hull" />
      <path d="M 0 5 v -18" className="boat-mast" />
      <path d="M 1 -12 l 8 15 h -8 Z" className="boat-sail" />
      <path d="M -1 -11 l -6 13 h 6 Z" className="boat-jib" />
    </g>
  );
}

/** An island, which is a bush that has got itself surrounded. */
export function Island() {
  return (
    <g className="sprite sprite--island" aria-hidden="true">
      <ellipse cx={0} cy={4} rx={16} ry={6} className="island-ground" />
      <g transform="translate(-4 -2) scale(0.7)">
        <AlpineTree />
      </g>
      <g transform="translate(8 2) scale(0.5)">
        <AlpineTree />
      </g>
    </g>
  );
}

/** Ministry of Defence: the sign, and the assumption you will ignore it. */
export function WarningSign() {
  return (
    <g className="sprite sprite--warning" aria-hidden="true">
      <path d="M 0 12 v -12" className="sign-post" />
      <path d="M 0 -22 l 11 19 h -22 Z" className="warning-plate" />
      <path d="M 0 -16 v 7" className="warning-mark" />
      <circle cx={0} cy={-6} r={1.2} className="warning-mark-dot" />
    </g>
  );
}

/** Somebody's dog, and for once somebody. */
export function DogWalker() {
  return (
    <g className="sprite sprite--walker" aria-hidden="true">
      <circle cx={0} cy={-14} r={4} className="walker-head" />
      <path d="M 0 -10 v 9" className="walker-body" />
      <path d="M 0 -8 l -6 5 M 0 -8 l 6 3" className="walker-arms" />
      <path d="M 0 -1 l -4 9 M 0 -1 l 5 9" className="walker-legs" />
      <path d="M 6 -5 q 7 4 9 8" className="walker-lead" />
    </g>
  );
}

/** A BMX track, deep in the woods, built by nobody who will admit to it. */
export function BmxTrack() {
  return (
    <g className="sprite sprite--bmx" aria-hidden="true">
      <path d="M -22 10 q 6 -12 12 0 q 6 -14 12 0 q 6 -10 12 0" className="bmx-jump" />
      <path d="M -24 10 h 48" className="bmx-ground" />
    </g>
  );
}

/** A boulder and its smaller companion. Heath, not mountains. */
export function Rock() {
  return (
    <g className="sprite sprite--rock" aria-hidden="true">
      <path d="M -14 8 q -2 -11 8 -13 q 11 -2 12 8 l 1 5 Z" className="rock-body" />
      <path d="M 6 8 q -1 -7 5 -8 q 7 -1 7 8 Z" className="rock-body" />
      <path d="M -9 0 q 3 -4 8 -3" className="rock-highlight" />
    </g>
  );
}

/**
 * The Random Portaloos, which are not on any map anybody planned and are
 * nonetheless the most welcome thing on this one.
 */
export function Portaloo() {
  return (
    <g className="sprite sprite--portaloo" aria-hidden="true">
      <rect x={-13} y={-20} width={26} height={40} rx={2} className="loo-body" />
      <path d="M -14 -20 h 28 l -3 -5 h -22 Z" className="loo-roof" />
      <rect x={-9} y={-15} width={18} height={31} rx={1.5} className="loo-door" />
      <path d="M -6 -11 h 12 M -6 -8 h 12 M -6 -5 h 12" className="loo-vent" />
      <circle cx={6} cy={2} r={1.6} className="loo-handle" />
    </g>
  );
}

/** The same tree in October, after whatever happened here happened. */
export function DeadTree() {
  return (
    <g className="sprite sprite--dead-tree" aria-hidden="true">
      <path d="M 0 12 v -15" className="dead-trunk" />
      <path
        d="M 0 -1 l -8 -7 M 0 -3 l 7 -6 M 0 -9 l -5 -7 M 0 -10 l 6 -8"
        className="dead-branch"
      />
      <path
        d="M -8 -8 l -4 -4 M 7 -9 l 4 -3 M -5 -16 l -2 -5 M 6 -18 l 4 -3"
        className="dead-twig"
      />
    </g>
  );
}

/** Points two ways, neither of them helpfully. */
export function Signpost() {
  return (
    <g className="sprite sprite--signpost" aria-hidden="true">
      <path d="M 0 11 v -20" className="sign-post" />
      <path d="M -1 -9 h 11 l 3 3 l -3 3 h -11 Z" className="sign-board" />
      <path d="M 1 -1 h -10 l -3 3 l 3 3 h 10 Z" className="sign-board" />
    </g>
  );
}

export function Pumpkin() {
  return (
    <g className="sprite sprite--pumpkin" aria-hidden="true">
      <ellipse cx={0} cy={2} rx={10} ry={8} className="pumpkin-body" />
      <path d="M -4 -5 q -2.5 7 0 14 M 4 -5 q 2.5 7 0 14" className="pumpkin-rib" />
      <path d="M 0 -6 v -4 q 3 -2 5 -1" className="pumpkin-stalk" />
      <path d="M -6 1 l 3 -4 l 3 4 Z M 0 1 l 3 -4 l 3 4 Z" className="pumpkin-face" />
      <path d="M -5 5 h 10 l -2 3 h -6 Z" className="pumpkin-face" />
    </g>
  );
}

/** One stone, leaning. The cemetery sprite is a whole row of them. */
export function Gravestone() {
  return (
    <g className="sprite sprite--gravestone" aria-hidden="true">
      <g transform="rotate(-5)">
        <path d="M -6 9 v -9 a 6 6 0 0 1 12 0 v 9 Z" className="grave-stone" />
        <path d="M -3 0 h 6 M 0 -4 v 8" className="grave-mark" />
      </g>
      <path d="M -10 10 h 20" className="hangar-ground" />
    </g>
  );
}

export function Bat() {
  return (
    <g className="sprite sprite--bat" aria-hidden="true">
      <ellipse cx={0} cy={0} rx={2.4} ry={3.2} className="bat-body" />
      <path d="M -1.8 -1 q -5 -4 -9 -1 q 3 0.4 3.6 3 q 2.4 -2 5.4 0.6 Z" className="bat-body" />
      <path d="M 1.8 -1 q 5 -4 9 -1 q -3 0.4 -3.6 3 q -2.4 -2 -5.4 0.6 Z" className="bat-body" />
      <path d="M -1.6 -3 l -1 -3 l 2.2 1.4 M 1.6 -3 l 1 -3 l -2.2 1.4" className="bat-body" />
    </g>
  );
}

/** Full, obviously. */
export function Moon() {
  return (
    <g className="sprite sprite--moon" aria-hidden="true">
      <circle cx={0} cy={0} r={27} className="moon-glow" />
      <circle cx={0} cy={0} r={18} className="moon-disc" />
      <circle cx={-6} cy={-5} r={3.6} className="moon-crater" />
      <circle cx={5} cy={5} r={5} className="moon-crater" />
      <circle cx={8} cy={-7} r={2.4} className="moon-crater" />
    </g>
  );
}

export function HillMarker() {
  return (
    <g className="sprite sprite--hill" aria-hidden="true">
      <polygon points="-16,10 0,-12 16,10" className="hill-body" />
      <polygon points="-5,-1 0,-12 5,-1" className="hill-cap" />
    </g>
  );
}

export function RoadClosedMarker() {
  return (
    <g className="sprite sprite--closed" aria-hidden="true">
      <rect x={-17} y={-6} width={34} height={12} rx={2} className="closed-bar" />
      <path
        d="M -17 -6 h 8 v 12 h -8 Z M -1 -6 h 8 v 12 h -8 Z"
        className="closed-stripe"
      />
      <line x1={0} y1={6} x2={0} y2={18} className="closed-post" />
    </g>
  );
}

/** Club kit: Wellesley blue, green and white, so the group reads as a club. */
const VESTS = ["vest-blue", "vest-green", "vest-white", "vest-deep", "vest-green"];

/** The one drawn sprite that is a bitmap: everything else here is vector. */
const COW_IMAGE = `${import.meta.env.BASE_URL}sprites/cow.png`;

export function Cow({ flip = false }: { flip?: boolean }) {
  return (
    <g className="sprite sprite--cow" aria-hidden="true">
      {/* Drawn facing left, and left is back towards Cow Field from where it
          stands — so it is looking at the junction, not away off the map. */}
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <image href={COW_IMAGE} x={-22} y={-13.5} width={44} height={27} />
      </g>
    </g>
  );
}

/**
 * The goose. Waits by the Jetty, and if the group runs past it, falls in at
 * the back and follows them home. Drawn standing on its own origin, facing
 * right, so the run animation can turn it round by the way it is going.
 */
export function Goose() {
  return (
    <g className="sprite sprite--goose" aria-hidden="true">
      <image
        href={`${import.meta.env.BASE_URL}sprites/goose.png`}
        x={-9.1}
        y={-22}
        width={18.2}
        height={22}
      />
    </g>
  );
}

export function CarPark() {
  return (
    <g className="sprite sprite--carpark" aria-hidden="true">
      <rect x={-20} y={-16} width={40} height={32} rx={4} className="carpark-sign" />
      <path
        d="M -6 8 v -18 h 8 a 6 6 0 0 1 0 12 h -8"
        className="carpark-letter"
      />
    </g>
  );
}

export function Superstore() {
  return (
    <g className="sprite sprite--shop" aria-hidden="true">
      <rect x={-26} y={-10} width={52} height={24} rx={3} className="build-wall" />
      <rect x={-26} y={-19} width={52} height={9} rx={2} className="shop-sign" />
      <rect x={-16} y={-2} width={13} height={16} rx={1.5} className="shop-door" />
      <rect x={2} y={-2} width={20} height={10} rx={1.5} className="shop-window" />
    </g>
  );
}

export function Hangar() {
  return (
    <g className="sprite sprite--hangar" aria-hidden="true">
      <path d="M -24 12 v -8 a 24 20 0 0 1 48 0 v 8 Z" className="hangar-shell" />
      <path d="M -9 12 v -13 a 9 9 0 0 1 18 0 v 13 Z" className="hangar-door" />
      <line x1={-24} y1={12} x2={24} y2={12} className="hangar-ground" />
    </g>
  );
}

/** The Duke, on his horse, on his plinth. The second bitmap sprite. */
const STATUE_IMAGE = `${import.meta.env.BASE_URL}sprites/statue.png`;

export function Statue() {
  return (
    <g className="sprite sprite--statue" aria-hidden="true">
      <image href={STATUE_IMAGE} x={-16} y={-20} width={32} height={39} />
    </g>
  );
}

/**
 * A parade of shops with the clock tower behind. Deliberately busier than the
 * lone superstore, so the town centre reads as somewhere rather than a shop.
 */
export function TownCentre() {
  return (
    <g className="sprite sprite--towncentre" aria-hidden="true">
      <rect x={-4} y={-30} width={13} height={22} rx={1.5} className="build-wall" />
      <path d="M -6 -30 h 17 l -8.5 -8 Z" className="tower-roof" />
      <circle cx={2.5} cy={-24} r={3.4} className="tower-clock" />
      <rect x={-26} y={-8} width={20} height={20} rx={2} className="build-wall" />
      <rect x={-4} y={-8} width={16} height={20} rx={2} className="build-wall" />
      <rect x={14} y={-8} width={18} height={20} rx={2} className="build-wall" />
      <rect x={-22} y={-3} width={12} height={6} rx={1} className="shop-window" />
      <rect x={0} y={-3} width={8} height={6} rx={1} className="shop-window" />
      <rect x={18} y={-3} width={10} height={6} rx={1} className="shop-window" />
      <line x1={-26} y1={12} x2={32} y2={12} className="hangar-ground" />
    </g>
  );
}

/** Three headstones and a yew. Nobody is in a hurry here. */
export function Cemetery() {
  return (
    <g className="sprite sprite--cemetery" aria-hidden="true">
      <path d="M -18 10 v -9 a 5 5 0 0 1 10 0 v 9 Z" className="grave-stone" />
      <path d="M -4 10 v -12 a 4.5 4.5 0 0 1 9 0 v 12 Z" className="grave-stone" />
      <path d="M 9 10 v -7 h 3 v -4 h 4 v 4 h 3 v 7 Z" className="grave-cross" />
      <line x1={-22} y1={10} x2={22} y2={10} className="hangar-ground" />
    </g>
  );
}

/** Not a wood, exactly. Enough trees together to get lost in. */
export function Woods() {
  return (
    <g className="sprite sprite--woods" aria-hidden="true">
      <g transform="translate(-16 4)">
        <Tree />
      </g>
      <g transform="translate(16 2)">
        <Tree />
      </g>
      <g transform="translate(0 -8)">
        <Tree />
      </g>
    </g>
  );
}

/** The van that is never in the same place twice, hence the surprise. */
export function CoffeeVan() {
  return (
    <g className="sprite sprite--coffee" aria-hidden="true">
      <path d="M -22 8 v -12 h 26 l 9 8 v 4 Z" className="van-body" />
      <rect x={-18} y={-2} width={11} height={7} rx={1} className="van-window" />
      <circle cx={-13} cy={9} r={3.5} className="van-wheel" />
      <circle cx={7} cy={9} r={3.5} className="van-wheel" />
      {/* Steam, because it is always freezing at the pond. */}
      <path
        d="M -4 -8 q 4 -4 0 -8 M 4 -8 q 4 -4 0 -8"
        className="van-steam"
      />
    </g>
  );
}

/** A stretch of the line. The level crossing is somebody else's problem. */
export function Railway() {
  return (
    <g className="sprite sprite--railway" aria-hidden="true">
      <line x1={-24} y1={-5} x2={24} y2={-5} className="rail" />
      <line x1={-24} y1={5} x2={24} y2={5} className="rail" />
      <path
        d="M -18 -9 v 8 M -6 -9 v 8 M 6 -9 v 8 M 18 -9 v 8"
        className="sleeper"
      />
    </g>
  );
}

export function FootballPitch() {
  return (
    <g className="sprite sprite--football" aria-hidden="true">
      <rect x={-26} y={-15} width={52} height={30} rx={2} className="pitch" />
      <line x1={0} y1={-15} x2={0} y2={15} className="pitch-line" />
      <circle cx={0} cy={0} r={6} className="pitch-line" fill="none" />
      <rect x={-26} y={-6} width={5} height={12} className="pitch-line" fill="none" />
      <rect x={21} y={-6} width={5} height={12} className="pitch-line" fill="none" />
    </g>
  );
}

export function GolfFlag() {
  return (
    <g className="sprite sprite--golf" aria-hidden="true">
      <ellipse cx={0} cy={10} rx={20} ry={7} className="golf-green" />
      <line x1={0} y1={10} x2={0} y2={-16} className="golf-pole" />
      <path d="M 0 -16 l 14 5 l -14 5 Z" className="golf-flag" />
      <circle cx={0} cy={10} r={2.4} className="golf-hole" />
    </g>
  );
}

/**
 * The building the road goes round. Drawn small enough to sit inside its own
 * loop without the road running over the roof.
 */
export function SportsCentre() {
  return (
    <g className="sprite sprite--sportscentre" aria-hidden="true">
      <rect x={-23} y={-13} width={46} height={26} rx={3} className="build-wall" />
      <path d="M -23 -13 h 46 l -6 -8 h -34 Z" className="centre-roof" />
      <rect x={-6} y={1} width={12} height={12} rx={1.5} className="shop-door" />
      <rect x={-18} y={-6} width={9} height={6} rx={1} className="shop-window" />
      <rect x={9} y={-6} width={9} height={6} rx={1} className="shop-window" />
    </g>
  );
}

/** Round the back of the sports centre, where the bins live. */
export function Bin() {
  return (
    <g className="sprite sprite--bin" aria-hidden="true">
      <path d="M -11 -6 h 22 l -2 20 h -18 Z" className="bin-body" />
      <rect x={-13} y={-11} width={26} height={5} rx={1.5} className="bin-lid" />
      <rect x={-4} y={-14} width={8} height={3} rx={1.5} className="bin-lid" />
      <path d="M -4 -2 v 12 M 4 -2 v 12" className="bin-rib" />
      <circle cx={-7} cy={15} r={2.4} className="bin-wheel" />
      <circle cx={7} cy={15} r={2.4} className="bin-wheel" />
    </g>
  );
}

/** Hecking Airport: one aeroplane, permanently about to leave. */
export function Aeroplane() {
  return (
    <g className="sprite sprite--airport" aria-hidden="true">
      <path d="M -24 2 q 24 -8 48 0 q -24 6 -48 0 Z" className="plane-body" />
      <path d="M -2 0 l -12 -14 h 7 l 14 12 Z" className="plane-wing" />
      <path d="M -2 2 l -12 14 h 7 l 14 -12 Z" className="plane-wing" />
      <path d="M -22 0 l -6 -8 h 4 l 7 7 Z" className="plane-tail" />
    </g>
  );
}

/** The Barley Mow, hanging sign and all. The destination, really. */
export function Pub() {
  return (
    <g className="sprite sprite--pub" aria-hidden="true">
      <rect x={-30} y={-10} width={44} height={22} rx={3} className="build-wall" />
      <path d="M -32 -10 h 48 l -7 -9 h -34 Z" className="tower-roof" />
      <rect x={-22} y={1} width={11} height={11} rx={1.5} className="shop-door" />
      <rect x={-6} y={-5} width={16} height={9} rx={1.5} className="shop-window" />
      <line x1={20} y1={-16} x2={20} y2={12} className="pub-post" />
      <rect x={20} y={-14} width={16} height={11} rx={1.5} className="pub-sign" />
    </g>
  );
}

/** Stumps and a ball. Enough cricket for anybody running past it. */
export function CricketStumps() {
  return (
    <g className="sprite sprite--cricket" aria-hidden="true">
      <path d="M -6 10 v -18 M 0 10 v -18 M 6 10 v -18" className="stump" />
      <path d="M -9 -9 h 18" className="bail" />
      <circle cx={20} cy={7} r={4} className="cricket-ball" />
      <line x1={-24} y1={10} x2={26} y2={10} className="hangar-ground" />
    </g>
  );
}

export function Mosque() {
  return (
    <g className="sprite sprite--mosque" aria-hidden="true">
      <rect x={-24} y={-6} width={38} height={20} rx={3} className="build-wall" />
      <path d="M -13 -6 a 13 14 0 0 1 26 0 Z" className="mosque-dome" />
      <path d="M 0 -20 v -7" className="mosque-finial" />
      <rect x={18} y={-18} width={9} height={32} rx={2} className="mosque-minaret" />
      <path d="M 17 -18 h 11 l -5.5 -8 Z" className="mosque-cap" />
      <path d="M -10 14 v -8 a 5 5 0 0 1 10 0 v 8 Z" className="shop-door" />
    </g>
  );
}

/**
 * The bridge, drawn on its junction rather than beside it — it stands in the
 * river, and landmarks are drawn over the water and under the roads, which is
 * exactly where a bridge belongs.
 */
export function Bridge() {
  return (
    <g className="sprite sprite--bridge" aria-hidden="true">
      <path d="M -34 14 v -5 a 34 22 0 0 1 68 0 v 5 Z" className="bridge-body" />
      <path d="M -16 14 a 16 13 0 0 1 32 0 Z" className="bridge-arch" />
      <path d="M -33 -2 h 66" className="bridge-parapet" />
    </g>
  );
}

/** The spooky church, and the only steeple on any of the maps. */
export function Church() {
  return (
    <g className="sprite sprite--church" aria-hidden="true">
      <rect x={-24} y={-6} width={34} height={20} rx={2} className="build-wall" />
      <path d="M -26 -6 h 38 l -7 -8 h -24 Z" className="tower-roof" />
      <rect x={12} y={-22} width={16} height={36} rx={2} className="build-wall" />
      <path d="M 10 -22 h 20 l -10 -16 Z" className="church-spire" />
      <path d="M 20 -40 v -6 M 17 -43 h 6" className="church-cross" />
      <path d="M -14 14 v -9 a 5 5 0 0 1 10 0 v 9 Z" className="church-door" />
      <circle cx={17} cy={-12} r={3} className="church-window" />
    </g>
  );
}

/** The one that keeps turning up. Bitmap, like the cow and the Duke. */
const GHOST_IMAGE = `${import.meta.env.BASE_URL}sprites/ghost.png`;

export function Ghost() {
  return (
    <g className="sprite sprite--ghost" aria-hidden="true">
      <image href={GHOST_IMAGE} x={-10.9} y={-12} width={21.8} height={24} />
    </g>
  );
}

/**
 * Three trick or treaters, which is as many as fit and rather fewer than are
 * ever actually there.
 */
export function Treaters() {
  return (
    <g className="sprite sprite--treaters" aria-hidden="true">
      {/* A witch, a sheet, and a small person in a bin bag. */}
      <path d="M -22 14 v -12 a 7 7 0 0 1 14 0 v 12 Z" className="treater-cloak" />
      <circle cx={-15} cy={-4} r={4} className="treater-head" />
      <path d="M -23 -7 h 16 l -8 -9 Z" className="treater-hat" />

      <path d="M -4 14 v -13 a 7 7 0 0 1 14 0 v 13 Z" className="treater-sheet" />
      <circle cx={-1} cy={-2} r={1.4} className="treater-eye" />
      <circle cx={6} cy={-2} r={1.4} className="treater-eye" />

      <path d="M 13 14 v -9 a 6 6 0 0 1 12 0 v 9 Z" className="treater-cloak" />
      <circle cx={19} cy={-1} r={3.6} className="treater-head" />
      <circle cx={26} cy={8} r={4} className="treater-bucket" />
    </g>
  );
}

export function Runner({ index }: { index: number }) {
  const vest = VESTS[index % VESTS.length];
  return (
    <g className="sprite sprite--runner" aria-hidden="true">
      <circle cx={0} cy={-11} r={4} className="runner-head" />
      <path d="M 0 -7 v 8" className="runner-casing" />
      <path d="M 0 -7 v 8" className={`runner-body ${vest}`} />
      <path d="M 0 -5 l -6 4 M 0 -5 l 6 -2" className="runner-arms" />
      <path d="M 0 1 l -5 7 M 0 1 l 6 6" className="runner-legs" />
    </g>
  );
}

/**
 * The same bird, later in the year: bigger, blacker, and with a beak that
 * means it. Drawn to the pigeon's proportions so the flock animation, which
 * knows nothing about species, still lands them in the same places.
 */
export function Crow({ alarmed = false }: { alarmed?: boolean }) {
  return (
    <g className={`sprite sprite--crow${alarmed ? " is-alarmed" : ""}`} aria-hidden="true">
      <ellipse cx={0} cy={0} rx={10} ry={6.5} className="crow-body" />
      <circle cx={7.5} cy={-6.5} r={4.2} className="crow-body" />
      <polygon points="10.5,-7 19,-5 10.5,-3" className="crow-beak" />
      <circle cx={8.8} cy={-7.6} r={0.9} className="crow-eye" />
      <polygon points="-13,-2 -1,-4.5 -3,3.5" className="crow-tail" />
      <path d="M -2 -3 q 7 -6.5 12 1 q -6.5 3.5 -12 -1 Z" className="crow-wing" />
      <path d="M -3 6 v 4 M 3 6 v 4" className="crow-legs" />
    </g>
  );
}

/**
 * The same bird again, on the water: white, brown and green rather than grey,
 * and drawn to the pigeon's proportions so the flock animation lands them in
 * the same places whichever species a level keeps.
 */
export function Duck({ alarmed = false }: { alarmed?: boolean }) {
  return (
    <g className={`sprite sprite--duck${alarmed ? " is-alarmed" : ""}`} aria-hidden="true">
      <ellipse cx={0} cy={0} rx={9.5} ry={6} className="duck-body" />
      <circle cx={7} cy={-6.5} r={4.2} className="duck-head" />
      <polygon points="10,-7 18,-5 10,-3.5" className="duck-bill" />
      <circle cx={8.4} cy={-7.6} r={0.9} className="duck-eye" />
      <polygon points="-12,-1 -1,-4 -3,3" className="duck-tail" />
      <path d="M -2 -3 q 7 -6 11 1 q -6 3 -11 -1 Z" className="duck-wing" />
      <path d="M -3 6 v 4 M 3 6 v 4" className="duck-legs" />
    </g>
  );
}

export function Pigeon({ alarmed = false }: { alarmed?: boolean }) {
  return (
    <g className={`sprite sprite--pigeon${alarmed ? " is-alarmed" : ""}`} aria-hidden="true">
      <ellipse cx={0} cy={0} rx={9} ry={6} className="pigeon-body" />
      <circle cx={7} cy={-6} r={4} className="pigeon-head" />
      <polygon points="10,-6 17,-4 10,-3" className="pigeon-beak" />
      <circle cx={8.4} cy={-7} r={0.9} className="pigeon-eye" />
      <polygon points="-12,-1 -1,-4 -3,3" className="pigeon-tail" />
      <path d="M -2 -3 q 7 -6 11 1 q -6 3 -11 -1 Z" className="pigeon-wing" />
      <path d="M -3 6 v 4 M 3 6 v 4" className="pigeon-legs" />
    </g>
  );
}

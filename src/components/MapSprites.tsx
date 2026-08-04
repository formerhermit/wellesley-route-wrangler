import type { Level } from "../game/types";

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
      {/*
       * What is in the bush (#104). Tucked behind the leaves at nothing like
       * full size and invisible until the egg is pressed, so the bush is still
       * a bush right up until it is not.
       */}
      <g className="bush-lurker">
        <g transform="scale(0.62)">
          <Pigeon />
        </g>
      </g>
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
      <rect x={-2} y={-2} width={4} height={14} rx={1} className="tree-trunk" />
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
      <rect x={-3} y={-8} width={6} height={24} rx={1.5} className="sequoia-trunk" />
      <path d="M 0 -34 q 11 20 9 30 q -9 6 -18 0 q -2 -10 9 -30 Z" className="sequoia-leaf" />
      <path d="M -7 -6 q 7 4 14 0 M -8 -16 q 8 4 16 0" className="sequoia-shade" />
    </g>
  );
}

/**
 * Gorse: spiky, and always slightly on fire somewhere. Yellow as it comes;
 * purple where the heather has got into it.
 */
export function Gorse({ purple = false }: { purple?: boolean }) {
  return (
    <g
      className={`sprite sprite--gorse${purple ? " sprite--gorse-purple" : ""}`}
      aria-hidden="true"
    >
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

/** One cabin. Smaller than it was, because there are two of them now. */
function LooCabin() {
  return (
    <g>
      <rect x={-9} y={-14} width={18} height={28} rx={1.5} className="loo-body" />
      <path d="M -10 -14 h 20 l -2 -4 h -16 Z" className="loo-roof" />
      <rect x={-6} y={-10} width={12} height={22} rx={1} className="loo-door" />
      <path d="M -4 -7 h 8 M -4 -4.5 h 8 M -4 -2 h 8" className="loo-vent" />
      <circle cx={4} cy={2} r={1.2} className="loo-handle" />
    </g>
  );
}

/**
 * The Random Portaloos, which are not on any map anybody planned and are
 * nonetheless the most welcome thing on this one. Plural, and always have
 * been — the name said two and the drawing showed one.
 *
 * The second stands a little lower than the first, because they are put down
 * on heathland by a man in a lorry and not surveyed in.
 */
export function Portaloo() {
  return (
    <g className="sprite sprite--portaloo" aria-hidden="true">
      <g transform="translate(-11 0)">
        <LooCabin />
      </g>
      <g transform="translate(11 3)">
        <LooCabin />
      </g>
      {/*
       * Who is in it (#104). Behind the left-hand cabin and invisible until
       * the egg is pressed, at which point he comes out of it sideways.
       */}
      <g className="loo-occupant">
        <Soldier index={1} />
      </g>
    </g>
  );
}

/**
 * The Medical Centre Toilet: a real one, with a cistern and a door that locks,
 * which is why the club plans whole routes around it.
 *
 * A bitmap, like the cow and the goose. It is a drawing of a specific object
 * with a lot of curve in it, and the vector version of that at this size comes
 * out as a blob with a lid.
 */
export function Toilet() {
  return (
    <g className="sprite sprite--toilet" aria-hidden="true">
      <image
        href={`${import.meta.env.BASE_URL}sprites/toilet.png`}
        x={-11}
        y={-19}
        width={22}
        height={36}
      />
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
      {/*
       * The wink (#104). No face is drawn on the moon and none is added: the
       * crater at -6, -5 is already the right size and in the right place to
       * read as an eye, so the lid simply closes over it. Invisible until the
       * egg is pressed, which is why the moon still looks like a moon.
       */}
      <path d="M -10 -5 q 4 4 8 0" className="moon-lid" />
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

/**
 * The track by the sports centre, six lanes and a bit of infield.
 *
 * A stadium shape rather than an ellipse, because that is what a track is —
 * two straights and two bends — and an ellipse with lines drawn on it reads as
 * a pond somebody has scribbled over. Rounded rectangles with `rx` at exactly
 * half the height give the bends for nothing.
 *
 * Three lanes, which takes two lines: a line is a boundary, so n of them
 * divide the ring into n + 1. They are inset by an equal step on both axes so
 * every lane comes out the same width on the bends as on the straights —
 * insetting x and y by different amounts is what makes nested stadium shapes
 * go lumpy at the corners.
 *
 * Three is about the ceiling here. A real track has six or eight and an
 * infield big enough for a football pitch, and at 72 by 42 there is not room
 * for both: every lane added comes out of the green in the middle, and past
 * this the whole thing greys out into a solid ring.
 */
const TRACK_LANES = [
  { x: 32, y: 17 },
  { x: 28, y: 13 },
];
export function RunningTrack() {
  return (
    <g className="sprite sprite--track" aria-hidden="true">
      <rect x={-36} y={-21} width={72} height={42} rx={21} className="track-surface" />
      {TRACK_LANES.map((lane) => (
        <rect
          key={lane.x}
          x={-lane.x}
          y={-lane.y}
          width={lane.x * 2}
          height={lane.y * 2}
          rx={lane.y}
          className="track-lane"
          fill="none"
        />
      ))}
      <rect x={-24} y={-9} width={48} height={18} rx={9} className="track-infield" />
      {/* The start line, across the outside lane on the top straight. */}
      <line x1={12} y1={-21} x2={12} y2={-17} className="track-lane" />
    </g>
  );
}

/**
 * The start and finish, which is the same arch twice on a lapped course.
 *
 * A gantry and a strip of chequer, because a race needs one thing on the map
 * that says "race" before you have read a word of the brief. The chequers are
 * generated rather than written out: eight hand-placed four-unit squares is
 * eight chances to fat-finger a coordinate.
 */
const START_CHEQUERS = Array.from({ length: 10 }, (_, i) => ({
  x: -25 + i * 5,
  dark: i % 2 === 0,
}));

export function StartLine() {
  return (
    <g className="sprite sprite--startline" aria-hidden="true">
      {START_CHEQUERS.map((square) => (
        <rect
          key={square.x}
          x={square.x}
          y={7}
          width={5}
          height={5}
          className={square.dark ? "start-chequer-dark" : "start-chequer-light"}
        />
      ))}
      <path d="M -25 12 h 50" className="start-edge" />
      <path d="M -23 7 v -22 M 23 7 v -22" className="start-post" />
      <rect x={-28} y={-25} width={56} height={11} rx={2} className="start-banner" />
      <text x={0} y={-16.4} className="start-banner-word">
        START
      </text>
    </g>
  );
}

/**
 * The people who came out in February to stand still for two hours and shout.
 *
 * Three of them, one with a placard, drawn small: a supporter is not a landmark
 * and should read as a knot of people rather than as portraiture.
 */
export function Supporters() {
  return (
    <g className="sprite sprite--supporters" aria-hidden="true">
      <path d="M -11 9 v -8 a 4 4 0 0 1 8 0 v 8 Z" className="supporter-coat" />
      <circle cx={-7} cy={-2} r={3} className="supporter-face" />
      <path d="M -11 0 l -4 -6" className="supporter-arm" />

      <path d="M -1 9 v -9 a 4 4 0 0 1 8 0 v 9 Z" className="supporter-coat-two" />
      <circle cx={3} cy={-3} r={3} className="supporter-face" />
      <path d="M 7 -1 l 4 -5" className="supporter-arm" />

      <path d="M 9 9 v -7 a 3.4 3.4 0 0 1 7 0 v 7 Z" className="supporter-coat" />
      <circle cx={12.5} cy={-1} r={2.8} className="supporter-face" />
      {/* The placard, which says something nobody can read at running pace. */}
      <path d="M 16 2 v -14" className="supporter-stick" />
      <rect x={13} y={-20} width={13} height={8} rx={1} className="supporter-sign" />
      <path d="M -16 9 h 44" className="hangar-ground" />
    </g>
  );
}

/**
 * A penguin, which is not native to Farnborough and is not going to explain
 * itself. There is one in every February field.
 */
export function Penguin() {
  return (
    <g className="sprite sprite--penguin" aria-hidden="true">
      <ellipse cx={0} cy={0} rx={7.5} ry={10} className="penguin-back" />
      <ellipse cx={0} cy={1.5} rx={5} ry={7.5} className="penguin-front" />
      <circle cx={0} cy={-9} r={5.5} className="penguin-back" />
      {/* Both of them, facing out. A mascot looks at you. */}
      <circle cx={-2.2} cy={-10.2} r={1.5} className="penguin-eye" />
      <circle cx={2.2} cy={-10.2} r={1.5} className="penguin-eye" />
      <circle cx={-2.2} cy={-10} r={0.7} className="penguin-pupil" />
      <circle cx={2.2} cy={-10} r={0.7} className="penguin-pupil" />
      <path d="M -2.4 -7.4 h 4.8 L 0 -4 Z" className="penguin-beak" />
      <path d="M -7.2 -1 q -4.5 5 -1.4 9 M 7.2 -1 q 4.5 5 1.4 9" className="penguin-flipper" />
      <path d="M -4.5 9.5 l -2 4.5 h 5 Z M 4.5 9.5 l 2 4.5 h -5 Z" className="penguin-foot" />
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

/**
 * Carol singers: a lantern, a songbook, and three people who have committed to
 * this. Drawn to the trick or treaters' proportions, since the two are the same
 * mechanism — a crowd that joins the back of the run — and the map places both
 * the same way.
 */
export function CarolSingers() {
  return (
    <g className="sprite sprite--carollers" aria-hidden="true">
      {/* The one holding the lantern, and holding it too high. */}
      <path d="M -22 14 v -12 a 6.5 6.5 0 0 1 13 0 v 12 Z" className="caroller-coat" />
      <circle cx={-15.5} cy={-4} r={4} className="caroller-face" />
      <path d="M -20 -7 h 9 l -1.5 -4 h -6 Z" className="caroller-hat" />
      <path d="M -23 -2 h 5" className="caroller-scarf" />
      <path d="M -26 2 v -9" className="caroller-pole" />
      <rect x={-29} y={-14} width={6} height={7} rx={1} className="caroller-lantern" />

      {/* The one who knows the words. */}
      <path d="M -5 14 v -13 a 6.5 6.5 0 0 1 13 0 v 13 Z" className="caroller-coat-alt" />
      <circle cx={1.5} cy={-5} r={4} className="caroller-face" />
      <path d="M -3 -8 h 9 l -1.5 -4 h -6 Z" className="caroller-hat-alt" />
      <path d="M -2 3 h 7 l 1 6 h -9 Z" className="caroller-book" />

      {/* And the one who does not, mouthing it a beat behind. */}
      <path d="M 12 14 v -10 a 6 6 0 0 1 12 0 v 10 Z" className="caroller-coat" />
      <circle cx={18} cy={-2} r={3.6} className="caroller-face" />
      <path d="M 13.5 -5 h 9 l -1.5 -3.6 h -6 Z" className="caroller-hat-alt" />

      {/* Three notes, going up, which is more than can be said for the singing. */}
      <path d="M 26 -12 v -6 M 30 -16 v -6 M 34 -20 v -6" className="caroller-note" />
      <circle cx={25} cy={-12} r={1.6} className="caroller-note-head" />
      <circle cx={29} cy={-16} r={1.6} className="caroller-note-head" />
      <circle cx={33} cy={-20} r={1.6} className="caroller-note-head" />
    </g>
  );
}

/**
 * The town Christmas tree. Wonky, because the council put it up, and lit,
 * because the council are very proud of that part.
 */
export function ChristmasTree() {
  return (
    <g className="sprite sprite--christmastree" aria-hidden="true">
      <path d="M -16 14 l 3 -4 h 26 l 3 4 Z" className="xmas-skirt" />
      <rect x={-3} y={2} width={6} height={9} rx={1} className="tree-trunk" />
      <path d="M 1 -6 l 14 16 h -28 Z" className="xmas-branch" />
      <path d="M 0.5 -18 l 11 13 h -22 Z" className="xmas-branch" />
      <path d="M 0 -29 l 8 12 h -16 Z" className="xmas-branch" />
      <path
        d="M 0 -40 l 1.7 3.5 l 3.9 0.6 l -2.8 2.7 l 0.7 3.9 l -3.5 -1.9 l -3.5 1.9 l 0.7 -3.9 l -2.8 -2.7 l 3.9 -0.6 Z"
        className="xmas-star"
      />
      {/* The lights, which only go round the front. */}
      <path d="M -9 -21 q 9 4 18 -1 M -12 -9 q 12 5 24 -1" className="xmas-string" />
      <circle cx={-6} cy={-21} r={1.8} className="xmas-bauble--red" />
      <circle cx={5} cy={-19} r={1.8} className="xmas-bauble--gold" />
      <circle cx={-8} cy={-8} r={1.8} className="xmas-bauble--blue" />
      <circle cx={7} cy={-7} r={1.8} className="xmas-bauble--red" />
      <circle cx={0} cy={3} r={1.8} className="xmas-bauble--gold" />
    </g>
  );
}

/**
 * Wellesley Humble: the house that does the whole street's lights on its own,
 * every year, and has never once been asked to.
 */
export function FestiveHouse() {
  return (
    <g className="sprite sprite--cottage" aria-hidden="true">
      <rect x={-20} y={-8} width={40} height={22} rx={2} className="build-wall" />
      <path d="M -23 -8 h 46 l -11 -11 h -24 Z" className="cottage-roof" />
      <path d="M -23 -8 h 46" className="cottage-snow" />
      <rect x={4} y={-30} width={7} height={12} className="cottage-chimney" />
      {/* Smoke, because somebody is in and has the fire going. */}
      <path
        d="M 7.5 -32 q 5 -4 0 -8 q -5 -4 0 -8 M 14 -33 q 5 -4 0 -7"
        className="cottage-smoke"
      />
      <rect x={-14} y={-3} width={9} height={7} rx={1} className="cottage-window" />
      <rect x={5} y={-3} width={9} height={7} rx={1} className="cottage-window" />
      <rect x={-5} y={2} width={9} height={12} rx={1} className="cottage-door" />
      {/* Lights along the eaves, and one string too many down the wall. */}
      <path d="M -21 -9 q 10 6 21 0 q 10 -6 21 0" className="xmas-string" />
      <circle cx={-15} cy={-6.2} r={1.5} className="xmas-bauble--red" />
      <circle cx={-8} cy={-6.6} r={1.5} className="xmas-bauble--gold" />
      <circle cx={0} cy={-9} r={1.5} className="xmas-bauble--blue" />
      <circle cx={8} cy={-6.6} r={1.5} className="xmas-bauble--red" />
      <circle cx={15} cy={-6.2} r={1.5} className="xmas-bauble--gold" />
    </g>
  );
}

/**
 * The Mulled Wine Stop: a trestle table, an urn, and a queue that forms before
 * the group has finished stopping. Billed to the club as a hydration station.
 */
export function MulledWineStall() {
  return (
    <g className="sprite sprite--mulledwine" aria-hidden="true">
      <path d="M -20 -8 h 40 l -4 9 h -32 Z" className="stall-awning" />
      <rect x={-16} y={1} width={32} height={13} rx={1} className="stall-body" />
      <path d="M -16 5 h 32" className="stall-counter" />
      {/* The urn, its tap, and the steam off it — the whole advertisement. */}
      <rect x={-8} y={-6} width={14} height={12} rx={1.5} className="stall-urn" />
      <rect x={-9.5} y={-9} width={17} height={3.5} rx={1.5} className="stall-urn" />
      <path d="M 6 0 h 3 v 3" className="stall-handle" />
      <path d="M -4 -11 q 4 -5 0 -9 M 3 -11 q 4 -5 0 -9" className="stall-steam" />
      <path d="M -22 14 h 44" className="hangar-ground" />
    </g>
  );
}

/** Hi-vis, because the club risk assessment covers snowmen too. */
export function Snowman() {
  return (
    <g className="sprite sprite--snowman" aria-hidden="true">
      <circle cx={0} cy={5} r={9} className="snow-body" />
      <circle cx={0} cy={-7} r={6} className="snow-body" />
      <path d="M -9 5 h 18 l 2 8 h -22 Z" className="snow-vest" />
      <path d="M -9.5 8 h 19" className="snow-vest-band" />
      <path d="M -6 -1 l -8 -5 M 6 -1 l 8 -5" className="snow-arm" />
      <path d="M 0 -7 l 7 1.6 l -7 1.6 Z" className="snow-nose" />
      <circle cx={-2.4} cy={-9} r={0.9} className="snow-coal" />
      <circle cx={2.4} cy={-9} r={0.9} className="snow-coal" />
      <path d="M -6 -12 h 12 v 2.5 h -12 Z M -3.5 -18 h 7 v 6 h -7 Z" className="snow-hat" />
    </g>
  );
}

/** One candy cane, planted, and slightly too large to be for eating. */
export function CandyCane() {
  return (
    <g className="sprite sprite--candycane" aria-hidden="true">
      <path
        d="M -2 12 v -16 a 5 5 0 0 1 10 0 v 3"
        className="cane-body"
      />
      <path
        d="M -2 12 v -16 a 5 5 0 0 1 10 0 v 3"
        className="cane-stripe"
      />
    </g>
  );
}

/** Presents, left out, which around here is a decision. */
export function Presents() {
  return (
    <g className="sprite sprite--present" aria-hidden="true">
      <rect x={-11} y={0} width={13} height={12} rx={1} className="gift-box" />
      <path d="M -4.5 0 v 12 M -11 5 h 13" className="gift-ribbon" />
      <rect x={2} y={3} width={10} height={9} rx={1} className="gift-box-alt" />
      <path d="M 7 3 v 9 M 2 7 h 10" className="gift-ribbon" />
      <path d="M -4.5 0 q -4 -5 -1 -5 q 3 0 1 5 q 4 -5 1 -5 q -3 0 -1 5" className="gift-bow" />
    </g>
  );
}

/**
 * Holly, laid out the way it is on every card: leaf, berries, leaf. The spikes
 * are drawn as a zig-zag rather than curves, which is what makes the shape
 * read as holly and not as a laurel at the size this is ever seen.
 */
const HOLLY_LEAF =
  "M 5 0 L 7 -4.6 L 9.6 -1.8 L 12.4 -5.6 L 15 -1.8 L 17.4 -4 L 19 0 L 17.4 4 L 15 1.8 L 12.4 5.6 L 9.6 1.8 L 7 4.6 Z";

export function Holly() {
  return (
    <g className="sprite sprite--holly" aria-hidden="true">
      {/* Both leaves swept up into a V, meeting at the stem, rather than lying
          end to end in a straight line — which read as one long leaf with a
          bulge in the middle rather than as a sprig. */}
      <g transform="rotate(-32)">
        <path d={HOLLY_LEAF} className="holly-leaf" />
        <path d="M 8 0 h 9" className="holly-vein" />
      </g>
      <g transform="scale(-1 1) rotate(-32)">
        <path d={HOLLY_LEAF} className="holly-leaf" />
        <path d="M 8 0 h 9" className="holly-vein" />
      </g>
      {/* In the crook of the V, where the two stems meet. */}
      <circle cx={-2.4} cy={3.4} r={2.2} className="holly-berry" />
      <circle cx={2.4} cy={3.4} r={2.2} className="holly-berry" />
      <circle cx={0} cy={7.2} r={2.2} className="holly-berry" />
    </g>
  );
}

export function Runner({
  index,
  kit,
  vest: override,
}: {
  index: number;
  kit?: Level["kit"];
  /** Overrides the club vest. For runners who are not in the club (#104). */
  vest?: string;
}) {
  const vest = override ?? VESTS[index % VESTS.length];
  return (
    <g className="sprite sprite--runner" aria-hidden="true">
      <circle cx={0} cy={-11} r={4} className="runner-head" />
      {/* Club policy is that the hats are optional. Nobody has taken that up. */}
      {kit === "santa" && (
        <g className="runner-hat">
          <path d="M -4.4 -13.6 q 1.6 -6.4 8.4 -4.6 l -3.4 4.6 Z" className="hat-felt" />
          <rect x={-5} y={-14.6} width={10} height={2.2} rx={1.1} className="hat-brim" />
          <circle cx={4.6} cy={-18.4} r={1.5} className="hat-brim" />
        </g>
      )}
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

/**
 * The same bird once more, in December: brown, round, and with the red front
 * that gets it on every card in the shop. Drawn to the pigeon's proportions
 * like the rest, so the flock animation lands them all in the same places.
 */
export function Robin({ alarmed = false }: { alarmed?: boolean }) {
  return (
    <g className={`sprite sprite--robin${alarmed ? " is-alarmed" : ""}`} aria-hidden="true">
      <ellipse cx={0} cy={0} rx={9} ry={6.5} className="robin-body" />
      <polygon points="-12,-1 -1,-4 -3,3" className="robin-tail" />
      <circle cx={7} cy={-6} r={4.2} className="robin-body" />
      {/* The front, from under the beak to the belly. The wing goes on behind
          it rather than over it: the red is the entire point of a robin. */}
      <path
        d="M 1 -9.5 q 10 0.5 9.5 7 q -0.5 6.5 -7 6.5 q -6.5 -1 -6.5 -7 q 0 -5 4 -6.5 Z"
        className="robin-breast"
      />
      <path d="M -7 -3 q 6 -5 10 1 q -5 3.5 -10 -1 Z" className="robin-wing" />
      <polygon points="10.5,-6.5 17,-4.5 10.5,-3" className="robin-beak" />
      <circle cx={8.6} cy={-7.4} r={0.9} className="robin-eye" />
      <path d="M -3 6 v 4 M 3 6 v 4" className="robin-legs" />
    </g>
  );
}

/**
 * The Atlantic Wall on Hankley Common: a full-size concrete replica of a
 * stretch of the Normandy defences, built in 1943 for the Canadians to
 * practise blowing up and never tidied away.
 *
 * Long and flat-topped rather than a box, because the first draft came out a
 * shed. What makes it read as this wall and not a wall is the damage — the
 * bites out of the top, the shelled end, and the two holes — since being blown
 * up repeatedly is the only thing it was ever for.
 */
export function AtlanticWall() {
  return (
    <g className="sprite sprite--wall" aria-hidden="true">
      <path
        d="M -38 9 L -38 -12 L -19 -12 L -15 -8 L -11 -12 L 12 -12 L 16 -7 L 20 -12 L 31 -12 L 31 -2 L 38 -2 L 38 9 Z"
        className="wall-concrete"
      />
      <path d="M -38 -4 h 69 M -38 2 h 76" className="wall-course" />
      <path d="M -26 -12 v 21 M -4 -12 v 21 M 9 -12 v 21 M 24 -12 v 21" className="wall-course" />
      <circle cx={-30} cy={-6} r={2.4} className="wall-hole" />
      <circle cx={4} cy={4} r={1.8} className="wall-hole" />
      <path d="M -44 9 h 88" className="hangar-ground" />
      {/*
       * Three presses' worth (#104). The notch has to be the hole rather than
       * a chunk drawn over the top: the concrete is one path, so a piece
       * painted in its own colour and then taken away would leave exactly what
       * was there before. This is the ground showing through instead, hidden
       * until the third press. The dust goes up on every one.
       */}
      <g className="wall-dust">
        <circle cx={22} cy={-12} r={4} />
        <circle cx={30} cy={-15} r={2.8} />
        <circle cx={15} cy={-16} r={2.2} />
      </g>
      <path d="M 19 -12.8 L 31.8 -12.8 L 31.8 -1 L 25 -3.6 Z" className="wall-notch" />
    </g>
  );
}

/**
 * The Thursley dragonfly, which is the reserve's whole identity — the
 * boardwalk out over the mire is called the Dragonfly Trail.
 *
 * Drawn from above, unlike every bird on the map, and that is not an
 * inconsistency. A bird's iconic silhouette is its profile; a dragonfly's is
 * the four wings in an X, and side-on it is a stick with a face. Each animal
 * gets the view it is recognised from.
 */
export function Dragonfly({ alarmed = false }: { alarmed?: boolean }) {
  return (
    <g
      className={`sprite sprite--dragonfly${alarmed ? " is-alarmed" : ""}`}
      aria-hidden="true"
    >
      {/* Four blades rather than four ellipses: a wing is narrow where it
          meets the body and rounded at the tip, and an ellipse is neither, so
          the first draft came out a flower. */}
      <g className="dragonfly-wings">
        <path
          d="M 2.6 -2.6 C -0.8 -9 -0.4 -15.5 3.8 -17.6 C 7.4 -14.2 6.6 -7.4 5 -2.4 Z"
          className="dragonfly-wing"
        />
        <path
          d="M 2.6 2.6 C -0.8 9 -0.4 15.5 3.8 17.6 C 7.4 14.2 6.6 7.4 5 2.4 Z"
          className="dragonfly-wing"
        />
        <path
          d="M -3.2 -2.4 C -7.4 -8 -8 -13.6 -4.6 -16 C -1.4 -12.8 -1.4 -6.8 -1.6 -2.2 Z"
          className="dragonfly-wing"
        />
        <path
          d="M -3.2 2.4 C -7.4 8 -8 13.6 -4.6 16 C -1.4 12.8 -1.4 6.8 -1.6 2.2 Z"
          className="dragonfly-wing"
        />
        <path
          d="M 3.4 -3.6 Q 2.4 -10 3.9 -16.4 M 3.4 3.6 Q 2.4 10 3.9 16.4
             M -2.6 -3.2 Q -4.4 -9 -4.4 -14.6 M -2.6 3.2 Q -4.4 9 -4.4 14.6"
          className="dragonfly-vein"
        />
      </g>
      <path
        d="M 3.4 -1.8 C -6 -1.2 -16 -0.7 -23 -0.5 L -23 0.5 C -16 0.7 -6 1.2 3.4 1.8 Z"
        className="dragonfly-abdomen"
      />
      <path
        d="M -5 -1.35 v 2.7 M -11 -1.1 v 2.2 M -17 -0.85 v 1.7"
        className="dragonfly-segment"
      />
      <ellipse cx={5.6} cy={0} rx={4.3} ry={3.3} className="dragonfly-thorax" />
      {/* One shape, not two: compound eyes wrap the whole head, and drawing
          them as a pair of circles read as a lumpy skull. */}
      <ellipse cx={10.4} cy={0} rx={2.8} ry={3.6} className="dragonfly-eyes" />
      <circle cx={11} cy={-1.7} r={0.85} className="dragonfly-glint" />
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

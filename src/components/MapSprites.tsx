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

/** A discreet bush. The joke is entirely in the place name. */
export function Bush() {
  return (
    <g className="sprite sprite--bush" aria-hidden="true">
      <ellipse cx={-11} cy={4} rx={12} ry={10} className="bush-leaf" />
      <ellipse cx={11} cy={4} rx={12} ry={10} className="bush-leaf" />
      <ellipse cx={0} cy={-5} rx={14} ry={12} className="bush-leaf" />
      <ellipse cx={-5} cy={-9} rx={6} ry={5} className="bush-highlight" />
      <path
        d="M -18 12 h 36"
        className="bush-ground"
      />
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

/** A duck and two ducklings, in the usual formation: behind, and late. */
export function Ducks() {
  return (
    <g className="sprite sprite--ducks" aria-hidden="true">
      <ellipse cx={6} cy={0} rx={11} ry={7} className="duck-body" />
      <circle cx={15} cy={-8} r={5} className="duck-head" />
      <polygon points="19,-9 27,-7 19,-5" className="duck-beak" />
      <circle cx={16.4} cy={-9.4} r={0.9} className="duck-eye" />
      <ellipse cx={-12} cy={5} rx={5} ry={3.5} className="duck-body" />
      <circle cx={-8} cy={1} r={2.8} className="duck-head" />
      <ellipse cx={-26} cy={8} rx={5} ry={3.5} className="duck-body" />
      <circle cx={-22} cy={4} r={2.8} className="duck-head" />
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
      <image href={GHOST_IMAGE} x={-16} y={-16} width={32} height={33} />
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

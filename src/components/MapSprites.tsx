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

export function Cow() {
  return (
    <g className="sprite sprite--cow" aria-hidden="true">
      {/* Drawn facing left, and left is back towards Cow Field from where it
          stands — so it is looking at the junction, not away off the map. */}
      <image href={COW_IMAGE} x={-22} y={-13.5} width={44} height={27} />
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

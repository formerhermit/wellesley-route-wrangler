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

export function Depot() {
  return (
    <g className="sprite sprite--depot" aria-hidden="true">
      <rect x={-22} y={-14} width={44} height={26} rx={3} className="build-wall" />
      <rect x={-14} y={-4} width={28} height={16} rx={2} className="build-shutter" />
      <circle cx={-11} cy={14} r={4} className="build-wheel" />
      <circle cx={11} cy={14} r={4} className="build-wheel" />
    </g>
  );
}

/** Club kit: Wellesley blue, green and white, so the group reads as a club. */
const VESTS = ["vest-blue", "vest-green", "vest-white", "vest-deep", "vest-green"];

export function Cow() {
  return (
    <g className="sprite sprite--cow" aria-hidden="true">
      <ellipse cx={0} cy={0} rx={13} ry={8} className="cow-body" />
      <ellipse cx={-5} cy={-2} rx={4.5} ry={3.2} className="cow-patch" />
      <ellipse cx={5} cy={2.5} rx={3.2} ry={2.2} className="cow-patch" />
      <circle cx={12.5} cy={-6} r={4.6} className="cow-body" />
      {/* A white blaze, so the head still reads as a head at map scale. */}
      <ellipse cx={14.6} cy={-5.6} rx={2.6} ry={3.6} className="cow-face" />
      <path d="M 9 -10 l -2 -3.5 M 16 -10 l 2 -3.5" className="cow-horns" />
      <circle cx={14.2} cy={-7.4} r={0.9} className="cow-eye" />
      <path d="M -8.5 7 v 5.5 M -2.5 7 v 5.5 M 4 7 v 5.5 M 9 6.5 v 6" className="cow-legs" />
      <path d="M -13 -2.5 q -5.5 -2.5 -4 5.5" className="cow-tail" />
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

import { roadAnglesAt } from "./routeGraph";
import type { Level, MapNode, MapNodeType } from "./types";

/** Every kind of scenery a level may place by hand. */
export type ScatterKind = NonNullable<Level["scatter"]>[number]["kind"];

/**
 * Where each kind of landmark sits relative to its junction. Data, not
 * drawing: the map needs it to place a sprite, and the scenery test needs it
 * to check nothing has been parked on top of one.
 */
export const LANDMARK_OFFSET: Partial<
  Record<MapNodeType, { dx: number; dy: number }>
> = {
  observatory: { dx: -52, dy: 42 },
  bush: { dx: 45, dy: 30 },
  shop: { dx: 0, dy: -50 },
  carpark: { dx: 0, dy: -50 },
  cow: { dx: 60, dy: -32 },
  hill: { dx: -44, dy: 4 },
  hangar: { dx: 2, dy: -46 },
  statue: { dx: 0, dy: -48 },
  towncentre: { dx: 0, dy: -52 },
  cemetery: { dx: 0, dy: -34 },
  woods: { dx: 0, dy: -46 },
  coffee: { dx: 0, dy: -44 },
  railway: { dx: 0, dy: -42 },
  football: { dx: 40, dy: -48 },
  golf: { dx: -48, dy: -26 },
  sportscentre: { dx: 0, dy: -52 },
  bin: { dx: 0, dy: -34 },
  church: { dx: 0, dy: -52 },
  portaloo: { dx: -48, dy: 4 },
  /*
   * Straight down (#102). Up and to the right clears the roads on all four
   * maps that carry one but not the writing: every toilet junction is a
   * Medical Centre Toilet, twenty-one characters is always two lines, and
   * every one of them sets `labelAbove` — so the name reaches out to within
   * three units of the cistern and reads as one object.
   *
   * Below the junction is the quarter the label has vacated by being above it,
   * and it is clear of the roads on all four. Fixed here rather than four
   * times over in the data, because the clash is a property of the type: a
   * toilet always has that name over it.
   */
  toilet: { dx: 0, dy: 42 },
  /* Below the junction, and wide: eighty units of concrete will not tuck in
     beside anything. */
  wall: { dx: 0, dy: 40 },
  car: { dx: -18, dy: 34 },
  ghost: { dx: 0, dy: -42 },
  treaters: { dx: 0, dy: -44 },
  airport: { dx: -92, dy: 2 },
  pub: { dx: 0, dy: -60 },
  cricket: { dx: 0, dy: -58 },
  mosque: { dx: 0, dy: -48 },
  bridge: { dx: 0, dy: 0 },
  manor: { dx: 0, dy: -54 },
  sailing: { dx: 0, dy: -30 },
  sand: { dx: 0, dy: 30 },
  mud: { dx: 0, dy: 30 },
  cottage: { dx: 0, dy: -46 },
  // Beside its junction rather than over it: the tree is the tallest thing on
  // any map, and hanging it above a junction puts the star off the paper.
  christmastree: { dx: 44, dy: -6 },
  mulledwine: { dx: 0, dy: -44 },
  // Bourne Wood's film unit, and the wood's own archaeology (#113).
  filmset: { dx: 0, dy: -44 },
  filmunit: { dx: 0, dy: -40 },
  cave: { dx: 0, dy: -40 },
  searchlight: { dx: 0, dy: -42 },
  /* Below, unlike the rest. A barrow is a metre high and forty-four wide, and
     hanging it above its junction draws it as a hill, which is the one thing
     it is not. */
  barrow: { dx: 0, dy: 34 },
};

/**
 * How big each drawing actually is, as `[left, right, top, bottom]` around its
 * own anchor (#110).
 *
 * A sprite is placed by a point and drawn around it, and for a long time that
 * point was the only thing anything checked. Seven landmarks shipped sitting on
 * a road or under a label while clearing every threshold in `scenery.test.ts`
 * by a comfortable margin — Pyestock Wood cleared the road by 20.5 against a
 * limit of 18 and lay across it, because a wood is sixty units wide.
 *
 * Measured rather than guessed. `atlas.tsx` rendered one junction of every type
 * and one of every scatter kind through the app's own tables and read
 * `getBoundingClientRect` off each; these are those numbers, rounded out. That
 * matters more than it sounds: a table of eyeballed half-widths would be wrong
 * in exactly the cases that caused the bug, since the sprites nobody thinks of
 * as big are the ones that are.
 *
 * Boxes are given as drawn, facing right. `flip` mirrors a sprite about its
 * anchor, so anything a level may flip is squared off to the wider side before
 * it is used — see `boxOf`.
 */
export type SpriteBox = readonly [
  left: number,
  right: number,
  top: number,
  bottom: number,
];

export const LANDMARK_BOX: Partial<Record<MapNodeType, SpriteBox>> = {
  observatory: [-22, 26, -28, 20],
  bush: [-24, 24, -18, 15],
  shop: [-26, 26, -19, 14],
  carpark: [-20, 20, -16, 16],
  cow: [-22, 22, -13, 14],
  hill: [-16, 16, -12, 10],
  hangar: [-24, 24, -16, 12],
  statue: [-16, 16, -20, 19],
  towncentre: [-26, 32, -38, 12],
  cemetery: [-22, 22, -6, 10],
  woods: [-29, 30, -25, 16],
  coffee: [-22, 13, -16, 13],
  railway: [-24, 24, -9, 5],
  football: [-26, 26, -15, 15],
  golf: [-20, 20, -16, 17],
  sportscentre: [-23, 23, -21, 13],
  bin: [-13, 13, -14, 17],
  church: [-26, 30, -46, 14],
  portaloo: [-21, 21, -20, 17],
  toilet: [-11, 11, -19, 17],
  wall: [-44, 44, -18, 9],
  car: [-33, 30, -13, 11],
  ghost: [-11, 11, -12, 12],
  treaters: [-23, 30, -16, 14],
  airport: [-28, 24, -14, 16],
  pub: [-32, 36, -19, 12],
  cricket: [-24, 26, -9, 11],
  mosque: [-24, 28, -27, 14],
  bridge: [-34, 34, -13, 14],
  manor: [-30, 32, -45, 12],
  sailing: [-10, 10, -13, 11],
  sand: [-24, 24, -8, 12],
  mud: [-22, 22, -7, 11],
  cottage: [-23, 23, -48, 14],
  christmastree: [-16, 16, -40, 14],
  mulledwine: [-22, 22, -20, 14],
  /* The water, which is all a pond junction draws. Well off to one side. */
  pond: [-70, -10, 11, 41],
  // Bourne Wood (#113). The searchlight is wide because the beam is drawn:
  // a light ray is still ink on the paper, and something behind it is hidden.
  filmset: [-11, 15, -18, 16],
  filmunit: [-24, 24, -14, 10],
  barrow: [-22, 22, -8, 8],
  cave: [-20, 20, -12, 16],
  searchlight: [-17, 33, -32, 18],
};

/**
 * And the same for hand-placed scenery. `moon` is the sky and `bat` is in it;
 * both are still measured, and the test exempts them by kind rather than by
 * pretending they are small.
 */
export const SCATTER_BOX: Record<ScatterKind, SpriteBox> = {
  tree: [-13, 14, -17, 12],
  rock: [-14, 18, -5, 8],
  soldier: [-8, 8, -19, 0],
  cow: [-22, 22, -13, 14],
  signpost: [-12, 13, -9, 11],
  track: [-36, 36, -21, 21],
  startline: [-28, 48, -31, 12],
  supporters: [-16, 28, -20, 9],
  penguin: [-10, 10, -14, 14],
  pumpkin: [-10, 10, -11, 10],
  gravestone: [-10, 10, -6, 10],
  bat: [-11, 11, -6, 3],
  moon: [-27, 27, -27, 27],
  cat: [-11, 12, -16, 10],
  lights: [-7, 7, -24, 12],
  car: [-33, 30, -13, 11],
  bin: [-13, 13, -14, 17],
  dog: [-15, 15, -12, 10],
  bench: [-17, 17, -11, 8],
  gnome: [-8, 8, -9, 9],
  youths: [-17, 15, -8, 10],
  flowers: [-10, 10, -8, 9],
  butterfly: [-9, 9, -6, 3],
  icecream: [-22, 12, -10, 13],
  alpine: [-12, 12, -22, 12],
  wellingtonia: [-9, 9, -34, 16],
  gorse: [-15, 14, -13, 10],
  unittruck: [-24, 24, -14, 10],
  clapperboard: [-13, 11, -16, 10],
  directorchair: [-9, 9, -11, 10],
  boat: [-10, 10, -13, 11],
  island: [-16, 16, -17, 10],
  warning: [-11, 11, -22, 12],
  snowman: [-14, 14, -18, 14],
  candycane: [-2, 8, -9, 12],
  present: [-11, 12, -5, 12],
  // Shorter than it was: the berries moved up into the crook (#114).
  holly: [-20, 20, -15, 5],
  xmastree: [-10, 10, -24, 8],
};

/**
 * Whether a junction of this type brings a drawing with it.
 *
 * A `Record` over the whole union rather than a list, so it does not compile
 * until a new `MapNodeType` says which it is. That is the point: three of the
 * four bugs in this family were a new thing the map draws that nothing knew to
 * check, and a hand-kept list would have gone stale in exactly the same way.
 *
 * The seven that do not draw one are not undrawn — they are drawn by something
 * other than `LANDMARK_OFFSET`. A pond and a shore are water, a canal is a
 * ribbon through its own junctions, a park is a green with its own trees, and
 * a plain junction, a pigeon hotspot and a pool are the dot and nothing else.
 */
export const LANDMARK_DRAWS: Record<MapNodeType, boolean> = {
  junction: false,
  canal: false,
  park: false,
  pigeon: false,
  pond: false,
  shore: false,
  pool: false,

  observatory: true,
  bush: true,
  shop: true,
  carpark: true,
  cow: true,
  hill: true,
  hangar: true,
  statue: true,
  towncentre: true,
  cemetery: true,
  coffee: true,
  railway: true,
  football: true,
  golf: true,
  woods: true,
  sportscentre: true,
  bin: true,
  airport: true,
  pub: true,
  cricket: true,
  mosque: true,
  bridge: true,
  church: true,
  ghost: true,
  portaloo: true,
  toilet: true,
  car: true,
  manor: true,
  sailing: true,
  sand: true,
  mud: true,
  treaters: true,
  cottage: true,
  christmastree: true,
  mulledwine: true,
  wall: true,
  filmset: true,
  filmunit: true,
  barrow: true,
  cave: true,
  searchlight: true,
};

/**
 * Two drawings the map places for itself, off road geometry rather than off a
 * junction: the triangle beside a climb (#118) and the barrier across a
 * closure. Here rather than as literals inside the test, which is where they
 * were and which made this the third place a sprite's size was written down.
 */
/**
 * The traffic lights, which stand beside their junction rather than on it:
 * a post twelve units tall with the box on top, so the drawing runs well
 * above the anchor and barely below it.
 */
export const LIGHTS_BOX: SpriteBox = [-7, 7, -24, 12];

export const HILL_MARKER_BOX: SpriteBox = [-11, 11, -8, 7];
export const ROAD_CLOSED_BOX: SpriteBox = [-17, 17, -6, 18];

/**
 * A tree with the leaves off, which is what a park plants once a level has a
 * `mood` — October took them and December has not given them back. Four units
 * taller than a live one and a little narrower, and until the rendered suite
 * went looking nothing knew it existed: the park trees were measured as live
 * ones on every dusk and frost map.
 */
export const DEAD_TREE_BOX: SpriteBox = [-12, 11, -21, 12];

/** And the bird inside the bush, which is an easter egg rather than a level's. */
export const PIGEON_BOX: SpriteBox = [-12, 17, -10, 10];

/**
 * Every box the map can draw, keyed by the class the sprite actually carries.
 *
 * Derived rather than written, so it cannot drift from the tables above. The
 * rendered suite checks the map against this; nothing else needs it, because
 * everything else knows what it is looking at.
 */
export const DRAWN_BOX: Record<string, SpriteBox> = {
  ...SCATTER_BOX,
  ...(LANDMARK_BOX as Record<string, SpriteBox>),
  roadhill: HILL_MARKER_BOX,
  closed: ROAD_CLOSED_BOX,
  "dead-tree": DEAD_TREE_BOX,
  pigeon: PIGEON_BOX,
  lights: LIGHTS_BOX,
};

/** Anything not in the tables: big enough to be worth flagging, no more. */
export const DEFAULT_BOX: SpriteBox = [-16, 16, -16, 16];

/**
 * A sprite's box in map units, placed at `x, y`. `flip` is squared off rather
 * than mirrored, because a level may flip a sprite and the same entry has to
 * hold either way round.
 */
export function boxOf(
  box: SpriteBox | undefined,
  x: number,
  y: number,
  flip = false,
): { left: number; right: number; top: number; bottom: number } {
  const [l, r, t, b] = box ?? DEFAULT_BOX;
  const reach = flip ? Math.max(Math.abs(l), Math.abs(r)) : 0;
  return {
    left: x + (flip ? -reach : l),
    right: x + (flip ? reach : r),
    top: y + t,
    bottom: y + b,
  };
}

/**
 * The three trees a `park` junction scatters round itself, which until #110
 * nothing checked at all — the scenery test knew about `TRAIL_TREES` and had
 * never heard of these, so the supporters at Cove Green were placed squarely
 * behind one and the suite was happy. Seven levels have a park.
 *
 * Here rather than in `MapLandmarks` for the same reason the trail trees are.
 */
export const PARK_TREES: { dx: number; dy: number }[] = [
  { dx: -46, dy: -26 },
  { dx: 40, dy: 12 },
  { dx: -30, dy: 34 },
];

/**
 * The trees a trail map scatters on its own, before a level places anything by
 * hand. Here rather than in the component so the scenery test can keep hand
 * placements from landing on them.
 */
export const TRAIL_TREES: { x: number; y: number }[] = [
  { x: 90, y: 90 },
  { x: 250, y: 60 },
  { x: 610, y: 70 },
  { x: 740, y: 200 },
  { x: 60, y: 210 },
  { x: 170, y: 530 },
  { x: 700, y: 505 },
  { x: 180, y: 520 },
];

/**
 * A rough box round a junction's name, matching what `MapJunctions` draws: two
 * lines over eighteen characters, above or below or beside, and about six units
 * to the character.
 *
 * Here rather than in either caller because two things need it and they must
 * not drift apart — `scenery.test.ts` uses it to keep hand-placed scenery off
 * the writing, and `eggs.ts` uses it to find somewhere the gnome can stand.
 */
export function labelBox(node: MapNode): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const lines = node.label.length > 18 || node.labelWrap ? 2 : 1;
  const longest =
    lines === 1 ? node.label.length : Math.ceil(node.label.length / 2);
  const width = longest * 6.2;
  const height = lines * 13 + 6;
  const side = node.labelSide;
  const top =
    (side
      ? node.y + 4 - (lines - 1) * 6.5 - 11
      : node.labelAbove
        ? node.y - 30 - (lines - 1) * 13 - 11
        : node.y + 32 - 11) + (node.labelDy ?? 0);
  const left =
    side === "left"
      ? node.x - 24 - width
      : side === "right"
        ? node.x + 24
        : node.x - width / 2;
  return { left, right: left + width, top, bottom: top + height };
}

/** How far out from its junction a set of traffic lights stands. */
export const LIGHTS_RADIUS = 30;

/** And how far round from a road it has to be to count as off the road. */
const LIGHTS_CLEARANCE = (22 * Math.PI) / 180;

/** How finely the gaps between roads are searched. */
const LIGHTS_STEP = (6 * Math.PI) / 180;

function overlaps(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
): boolean {
  return (
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0
  );
}

/**
 * Where a junction's traffic lights stand: out along a gap between the roads
 * leaving it, and the widest gap that is also clear of the writing.
 *
 * Two bugs had one cause. Placed at a fixed offset to one side, a lamp post
 * lands *in* a road on a junction whose roads happen to run that way — and,
 * worse, lands *along* a road the group is running, so they pass it before
 * stopping one way round the loop and after stopping the other. Every route
 * here can be run in either direction, so there is no side that is right.
 *
 * In a gap it is beside the junction rather than on the way to it, and the
 * group draws level with it whichever way they arrive. The gaps are then
 * tried widest first, because the widest is the most room and the one that
 * clears the name is the one that can actually be seen.
 */
export function lightsAt(level: Level, node: MapNode): { x: number; y: number } {
  const angles = roadAnglesAt(level, node.id);
  const at = (bearing: number) => ({
    x: node.x + Math.cos(bearing) * LIGHTS_RADIUS,
    y: node.y + Math.sin(bearing) * LIGHTS_RADIUS,
  });
  // A junction with no roads has no direction to avoid; anywhere will do.
  if (angles.length === 0) return at(0);

  const gaps = angles.map((from, i) => {
    // The last gap wraps past three o'clock to the first road again.
    const to = i + 1 < angles.length ? angles[i + 1] : angles[0] + Math.PI * 2;
    return { from, to };
  });

  /*
   * Every bearing worth trying: across each gap, at a few degrees'
   * resolution, and never within `LIGHTS_CLEARANCE` of a road itself.
   *
   * Sampled rather than taking each gap's middle, because a junction can be
   * busy enough that no middle works — the Big Tesco has two roads, its shop
   * above and its name below, so both bisectors are compromised while there
   * is a perfectly good spot a few degrees off one of them.
   */
  const candidates: { bearing: number; room: number }[] = [];
  for (const { from, to } of gaps) {
    for (
      let bearing = from + LIGHTS_CLEARANCE;
      bearing <= to - LIGHTS_CLEARANCE;
      bearing += LIGHTS_STEP
    ) {
      // How far this bearing is from the nearer of the two roads.
      candidates.push({ bearing, room: Math.min(bearing - from, to - bearing) });
    }
  }
  // No gap wide enough to stand in: take the widest and accept it, which is a
  // junction whose roads leave no pavement anywhere.
  if (candidates.length === 0) {
    const widest = gaps.reduce((a, b) => (b.to - b.from > a.to - a.from ? b : a));
    return at(widest.from + (widest.to - widest.from) / 2);
  }

  const name = labelBox(node);
  const kind = node.sprite ?? node.type;
  const place = kind ? LANDMARK_OFFSET[kind] : undefined;
  const sprite =
    kind && place && LANDMARK_DRAWS[kind]
      ? boxOf(
          LANDMARK_BOX[kind],
          node.x + (node.spriteDx ?? place.dx),
          node.y + (node.spriteDy ?? place.dy),
        )
      : undefined;

  /*
   * The name costs more than the sprite: a lamp post touching a shopfront
   * reads as a street, and one touching the writing reads as a mistake.
   */
  const cost = (bearing: number) => {
    const spot = at(bearing);
    const box = boxOf(LIGHTS_BOX, spot.x, spot.y);
    return (
      (overlaps(box, name) ? 2 : 0) + (sprite && overlaps(box, sprite) ? 1 : 0)
    );
  };
  const best = candidates.reduce((a, b) => {
    const costA = cost(a.bearing);
    const costB = cost(b.bearing);
    // Furthest from a road wins a tie: the middle of a pavement looks placed,
    // the edge of one looks dropped.
    return costB < costA || (costB === costA && b.room > a.room) ? b : a;
  });
  return at(best.bearing);
}

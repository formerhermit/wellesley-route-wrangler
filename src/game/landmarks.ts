import type { MapNodeType } from "./types";

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
};

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

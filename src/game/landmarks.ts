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
};

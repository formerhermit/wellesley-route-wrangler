/**
 * Everything the server needs to know about the game, and nothing else.
 *
 * This is the entry point bundled into the submit-run function. Keeping it to
 * one small file means the shared surface is something you can read in ten
 * seconds and check: the levels, how to turn road ids back into a route, and
 * what a route is worth.
 */
export { levels } from "../data/levels";
export { routeFromRoads } from "../game/records";
export { scoreRun, routeKey, SCORE_VERSION } from "../game/scoring";
export type { Level, Route } from "../game/types";

import { levels } from "../data/levels";
import type { Level } from "../game/types";

export function levelById(id: string): Level | undefined {
  return levels.find((level) => level.id === id);
}

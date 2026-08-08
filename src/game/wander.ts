import { graphFor, otherEnd } from "./routeGraph";
import type { Level, Road, Route } from "./types";

/**
 * Where the group actually goes when nobody is navigating (#10).
 *
 * A wander is a `Route` like any other — a walk through the graph — which is
 * the whole trick. Every piece of machinery downstream is written against
 * that shape: `routePathData` draws it, `routeMilestones` times the pigeons
 * off it, `paceOf` finds its hills. Handing them a walk with wrong turnings
 * in it needs none of them to learn what a wrong turning is.
 *
 * It is not a route the player could lay, because it runs roads twice. That
 * is legal here and nowhere else: this walk is never judged, never scored and
 * never stored. It is only ever drawn.
 */

/** How many wrong turnings the group makes, at most. Three is plenty. */
const MAX_DETOURS = 3;

interface Spot {
  /** Index into the plotted route's junctions: where they go wrong. */
  index: number;
  /** The wrong ways available from it. */
  roads: Road[];
}

/**
 * Junctions on the route the group could plausibly blunder off, and where to.
 *
 * Interior only: a wrong turning off the start line is a group that has not
 * set off, and one off the finish is a group that has already got home.
 * Closed roads are left out — the barrier is drawn across them, and running
 * a lost group through it would look like the closure meant nothing.
 */
function detourSpots(level: Level, route: Route): Spot[] {
  const byNode = graphFor(level).roadsByNode;
  const spots: Spot[] = [];

  for (let i = 1; i < route.nodeIds.length - 1; i += 1) {
    const here = route.nodeIds[i];
    const arrived = route.roadIds[i - 1];
    const leaving = route.roadIds[i];
    const roads = (byNode.get(here) ?? []).filter(
      (road) => road.id !== arrived && road.id !== leaving && !road.closed,
    );
    if (roads.length > 0) spots.push({ index: i, roads });
  }

  return spots;
}

/**
 * Whether this map has anywhere to go wrong at all: a junction with a third
 * road at it, over and above the one you arrived on and the one you leave by.
 * Asked of the map rather than of a route, because a card has to decide
 * whether it fits before the player has drawn anything.
 */
export function canWander(level: Level): boolean {
  const byNode = graphFor(level).roadsByNode;
  return level.nodes.some(
    (node) =>
      (byNode.get(node.id) ?? []).filter((road) => !road.closed).length >= 3,
  );
}

/**
 * The same route always goes wrong the same way.
 *
 * Taken from the roads themselves rather than from `Math.random`, for two
 * reasons: a fresh number every render would redraw the rail underneath a run
 * in progress, and a group that got lost on the way to the canal ought to get
 * lost there again when you run it back. FNV-1a, for no reason beyond it
 * being short and well spread.
 */
export function wanderRoll(route: Route): number {
  let hash = 2166136261;
  for (const id of route.roadIds) {
    for (let i = 0; i < id.length; i += 1) {
      hash ^= id.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }
  return (hash >>> 0) / 4294967296;
}

/**
 * The plotted route with the group's wrong turnings spliced into it: out to
 * somewhere nobody asked for, a pause while that is discussed, and back.
 *
 * Returns the route untouched where there is nowhere to go wrong, so a caller
 * never has to check first.
 */
export function wanderRoute(
  level: Level,
  route: Route,
  roll: number,
): Route {
  const spots = detourSpots(level, route);
  if (spots.length === 0) return route;

  const clamped = Math.min(Math.max(roll, 0), 0.999999);
  const count = Math.min(MAX_DETOURS, spots.length);
  // Spread along the route rather than taken from one end, so the group is
  // lost all the way round instead of only at the start.
  const first = Math.floor(clamped * spots.length);
  const stride = Math.max(1, Math.floor(spots.length / count));

  const wrongTurns = new Map<number, Road>();
  for (let k = 0; k < count; k += 1) {
    const spot = spots[(first + k * stride) % spots.length];
    if (wrongTurns.has(spot.index)) continue;
    // Which wrong way, where the junction offers more than one.
    const pick = (first + k * 7) % spot.roads.length;
    wrongTurns.set(spot.index, spot.roads[pick]);
  }

  const nodeIds = [route.nodeIds[0]];
  const roadIds: string[] = [];

  for (let i = 1; i < route.nodeIds.length; i += 1) {
    nodeIds.push(route.nodeIds[i]);
    roadIds.push(route.roadIds[i - 1]);

    const spur = wrongTurns.get(i);
    if (!spur) continue;
    // Out and straight back: the same road twice, which is what turning round
    // looks like written down.
    const here = route.nodeIds[i];
    nodeIds.push(otherEnd(spur, here), here);
    roadIds.push(spur.id, spur.id);
  }

  return { nodeIds, roadIds };
}

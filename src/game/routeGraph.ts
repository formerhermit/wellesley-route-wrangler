import type { Level, MapNode, Road, Route } from "./types";

interface Graph {
  nodesById: Map<string, MapNode>;
  roadsById: Map<string, Road>;
  /** node id -> roads touching it. Roads are bidirectional. */
  roadsByNode: Map<string, Road[]>;
}

const graphCache = new WeakMap<Level, Graph>();

export function graphFor(level: Level): Graph {
  const cached = graphCache.get(level);
  if (cached) return cached;

  const nodesById = new Map(level.nodes.map((node) => [node.id, node]));
  const roadsById = new Map(level.roads.map((road) => [road.id, road]));
  const roadsByNode = new Map<string, Road[]>();
  for (const node of level.nodes) roadsByNode.set(node.id, []);
  for (const road of level.roads) {
    roadsByNode.get(road.from)?.push(road);
    roadsByNode.get(road.to)?.push(road);
  }

  const graph = { nodesById, roadsById, roadsByNode };
  graphCache.set(level, graph);
  return graph;
}

export function nodeById(level: Level, id: string): MapNode {
  const node = graphFor(level).nodesById.get(id);
  if (!node) throw new Error(`Unknown junction: ${id}`);
  return node;
}

export function roadById(level: Level, id: string): Road {
  const road = graphFor(level).roadsById.get(id);
  if (!road) throw new Error(`Unknown road: ${id}`);
  return road;
}

/**
 * Every road joining two junctions, in either direction. Usually one. Two
 * where a road runs out and back around something, as it does around the
 * Sports Centre.
 */
export function roadsBetween(level: Level, a: string, b: string): Road[] {
  return (graphFor(level).roadsByNode.get(a) ?? []).filter(
    (road) => otherEnd(road, a) === b,
  );
}

/** The first road joining two junctions, where any of them will do. */
export function roadBetween(
  level: Level,
  a: string,
  b: string,
): Road | undefined {
  return roadsBetween(level, a, b)[0];
}

/** How far a road is pushed off the straight line, and to which side. */
const LOOP_OFFSET = 46;
/** The turn at each corner of a loop. Kept tight: it is a building, not a bay. */
const LOOP_CORNER = 15;

function loopSide(level: Level, road: Road): number {
  const pair = roadsBetween(level, road.from, road.to);
  if (pair.length < 2) return 0;
  return pair.findIndex((other) => other.id === road.id) === 0 ? 1 : -1;
}

/**
 * SVG path data for one road. Almost every road is a straight line. A pair
 * joining the same two junctions cannot be, or one would be drawn underneath
 * the other, so each goes out square, along, and back in — three sides of a
 * rectangle with the corners taken off, which is what running round a building
 * actually looks like from above.
 *
 * Built from the road's own ends rather than the direction of travel, so the
 * shape is the same whichever way it is run.
 */
export function roadPathData(level: Level, road: Road): string {
  const from = nodeById(level, road.from);
  return `M ${from.x} ${from.y} ${roadSegmentFrom(level, road, true)}`;
}

export function otherEnd(road: Road, from: string): string {
  return road.from === from ? road.to : road.from;
}

export function emptyRoute(level: Level): Route {
  return { nodeIds: [level.startNodeId], roadIds: [] };
}

export function currentNodeId(route: Route): string {
  return route.nodeIds[route.nodeIds.length - 1];
}

export function previousNodeId(route: Route): string | undefined {
  return route.nodeIds.length > 1
    ? route.nodeIds[route.nodeIds.length - 2]
    : undefined;
}

export function totalDistanceKm(level: Level, route: Route): number {
  const total = route.roadIds.reduce(
    (sum, id) => sum + roadById(level, id).distanceKm,
    0,
  );
  // Distances are one decimal place; keep floating point noise out of the UI.
  return Math.round(total * 100) / 100;
}

/**
 * Undo the last road taken. Pure, so it is directly testable.
 *
 * Going out and straight back between the same two junctions is only possible
 * where two roads join them, since a road cannot be run twice. That whole
 * excursion undoes as one move: undoing half of it would drop the player back
 * on the loop with the return leg still open, and the only way off would be to
 * go round again.
 */
export function undoLastStep(route: Route): Route {
  if (route.roadIds.length === 0) return route;
  const n = route.nodeIds.length;
  const wentRoundALoop = n >= 3 && route.nodeIds[n - 1] === route.nodeIds[n - 3];
  const steps = wentRoundALoop ? 2 : 1;
  return {
    nodeIds: route.nodeIds.slice(0, -steps),
    roadIds: route.roadIds.slice(0, -steps),
  };
}

/**
 * Junctions the player may select next: anything joined to the current end of
 * the route by a road not already used. Closed roads stay selectable on
 * purpose — running down one is a losing move the player is allowed to make.
 */
export function selectableNodeIds(level: Level, route: Route): Set<string> {
  const end = currentNodeId(route);
  const used = new Set(route.roadIds);
  const selectable = new Set<string>();

  for (const road of graphFor(level).roadsByNode.get(end) ?? []) {
    if (used.has(road.id)) continue;
    selectable.add(otherEnd(road, end));
  }

  const previous = previousNodeId(route);
  if (previous) selectable.add(previous);

  return selectable;
}

export type SelectionOutcome =
  | { kind: "extended"; route: Route }
  | { kind: "undone"; route: Route }
  | { kind: "rejected"; reason: string };

/**
 * The single route-editing rule. Selecting the junction you have just come
 * from undoes that step; selecting a connected junction extends the route;
 * anything else is rejected with a reason the interface can announce.
 */
export function selectNode(
  level: Level,
  route: Route,
  nodeId: string,
): SelectionOutcome {
  const end = currentNodeId(route);

  if (nodeId === end) {
    return { kind: "rejected", reason: "You are already standing there." };
  }

  const joining = roadsBetween(level, end, nodeId);
  if (joining.length === 0) {
    return {
      kind: "rejected",
      reason: `No road joins ${nodeById(level, end).label} to ${
        nodeById(level, nodeId).label
      }.`,
    };
  }

  // Where two roads join these junctions and one is still free, going back the
  // way you came means the other side of the loop, not an undo.
  const road = joining.find(({ id }) => !route.roadIds.includes(id));
  if (road) {
    return {
      kind: "extended",
      route: {
        nodeIds: [...route.nodeIds, nodeId],
        roadIds: [...route.roadIds, road.id],
      },
    };
  }

  if (nodeId === previousNodeId(route)) {
    return { kind: "undone", route: undoLastStep(route) };
  }

  return {
    kind: "rejected",
    reason: "That road is already in your route — no doubling back.",
  };
}

/**
 * The angle, in degrees, at which to draw a marker that must lie *across* a
 * road rather than along it — the closure barrier. Sprites are drawn along the
 * x-axis, so this is the road's own angle turned a quarter turn.
 *
 * Normalised to (-90, 90] so the sprite never ends up on its head: the bar is
 * symmetric, so half a turn costs nothing and keeps the post pointing the way
 * it was drawn.
 */
export function acrossRoadAngle(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  const along = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  let across = along + 90;
  if (across > 90) across -= 180;
  else if (across <= -90) across += 180;
  return across;
}

/**
 * Where a hill road's triangle goes (#118): the middle of the road, stepped
 * sideways off it.
 *
 * Here rather than in the component because two things need it and they must
 * agree — `MapRoads` draws it and `scenery.test.ts` checks nothing else is
 * already standing there. A marker the map places automatically can land on a
 * label just as easily as one placed by hand, and it has no author to notice.
 */
export function hillMarkerAt(
  level: Level,
  road: Road,
): { x: number; y: number } {
  const from = nodeById(level, road.from);
  const to = nodeById(level, road.to);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  /*
   * Always to the same side of the road as drawn, so two roads meeting at a
   * junction cannot put their triangles in the same place — which they would
   * if the side were chosen by, say, whichever way is uphill.
   */
  return {
    x: (from.x + to.x) / 2 + (-dy / length) * HILL_MARKER_OFFSET,
    y: (from.y + to.y) / 2 + (dx / length) * HILL_MARKER_OFFSET,
  };
}

/** How far off the tarmac. Clear of a nine-wide road and its route line. */
export const HILL_MARKER_OFFSET = 15;

/**
 * Every bearing leaving a junction that has tarmac on it, in radians.
 *
 * Mostly the roads themselves. Where two roads join the same pair of
 * junctions, though — the Sports Centre, where the road goes round the
 * building — each is drawn out square from the line and back again, so the
 * pair occupies the two bearings at right angles to it as well as its own.
 * Those count: `roadPathData` draws them, and anything placed there ends up
 * underneath a road that is nowhere near the straight line between the ends.
 *
 * Here because it is a fact about the graph and how it is drawn; what gets
 * placed in the gaps is `landmarks.ts`'s business.
 */
export function roadBearingsAt(level: Level, nodeId: string): number[] {
  const here = nodeById(level, nodeId);
  const bearings: number[] = [];

  for (const road of graphFor(level).roadsByNode.get(nodeId) ?? []) {
    const otherId = otherEnd(road, nodeId);
    const other = nodeById(level, otherId);
    const along = Math.atan2(other.y - here.y, other.x - here.x);
    bearings.push(along);
    if (roadsBetween(level, nodeId, otherId).length > 1) {
      bearings.push(along + Math.PI / 2, along - Math.PI / 2);
    }
  }

  // Normalised to one turn so the gaps between them can be walked in order.
  return bearings
    .map((bearing) => Math.atan2(Math.sin(bearing), Math.cos(bearing)))
    .sort((a, b) => a - b);
}

/** Screen-space points of the route, in order, for drawing and animation. */
export function routePoints(level: Level, route: Route): MapNode[] {
  return route.nodeIds.map((id) => nodeById(level, id));
}

/**
 * SVG path data for the drawn route. Empty string for an unstarted route.
 *
 * Follows each road's own shape rather than joining the junctions up, so a leg
 * round a loop is drawn round the loop — and, because the runners are placed
 * by measuring this path, run round it too.
 */
export function routePathData(level: Level, route: Route): string {
  if (route.roadIds.length === 0) return "";
  const start = nodeById(level, route.nodeIds[0]);
  return route.roadIds.reduce((path, roadId, index) => {
    const road = roadById(level, roadId);
    const forwards = road.from === route.nodeIds[index];
    return `${path} ${roadSegmentFrom(level, road, forwards)}`;
  }, `M ${start.x} ${start.y}`);
}

/** One road's path data without its opening move, run in the given direction. */
function roadSegmentFrom(level: Level, road: Road, forwards: boolean): string {
  const from = nodeById(level, road.from);
  const to = nodeById(level, road.to);
  const side = loopSide(level, road);
  if (side === 0) {
    const end = forwards ? to : from;
    return `L ${end.x} ${end.y}`;
  }

  const [head, tail] = forwards ? [from, to] : [to, from];
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // The side is fixed to the road, so flip it when running against the grain.
  const turn = forwards ? side : -side;
  const px = (-dy / length) * turn;
  const py = (dx / length) * turn;

  const out = LOOP_OFFSET;
  const r = Math.min(LOOP_CORNER, out / 2, length / 2);
  const c1 = { x: head.x + px * out, y: head.y + py * out };
  const c2 = { x: tail.x + px * out, y: tail.y + py * out };

  return [
    `L ${(head.x + px * (out - r)).toFixed(1)} ${(head.y + py * (out - r)).toFixed(1)}`,
    `Q ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${(c1.x + ux * r).toFixed(1)} ${(c1.y + uy * r).toFixed(1)}`,
    `L ${(c2.x - ux * r).toFixed(1)} ${(c2.y - uy * r).toFixed(1)}`,
    `Q ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${(c2.x - px * r).toFixed(1)} ${(c2.y - py * r).toFixed(1)}`,
    `L ${tail.x} ${tail.y}`,
  ].join(" ");
}

/**
 * How far along the drawn route each junction sits, as a fraction of the
 * polyline's screen length. Used to time pigeon reactions during playback.
 */
export function routeMilestones(
  level: Level,
  route: Route,
): { nodeId: string; fraction: number }[] {
  const points = routePoints(level, route);
  if (points.length < 2) return [];

  const lengths: number[] = [0];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
  }

  const total = lengths[lengths.length - 1];
  if (total === 0) return [];
  return points.map((node, index) => ({
    nodeId: node.id,
    fraction: lengths[index] / total,
  }));
}

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

/** Roads join two junctions in either direction. */
export function roadBetween(
  level: Level,
  a: string,
  b: string,
): Road | undefined {
  return graphFor(level)
    .roadsByNode.get(a)
    ?.find((road) => otherEnd(road, a) === b);
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

/** Undo the last road taken. Pure, so it is directly testable. */
export function undoLastStep(route: Route): Route {
  if (route.roadIds.length === 0) return route;
  return {
    nodeIds: route.nodeIds.slice(0, -1),
    roadIds: route.roadIds.slice(0, -1),
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

  if (nodeId === previousNodeId(route)) {
    return { kind: "undone", route: undoLastStep(route) };
  }

  if (nodeId === end) {
    return { kind: "rejected", reason: "You are already standing there." };
  }

  const road = roadBetween(level, end, nodeId);
  if (!road) {
    return {
      kind: "rejected",
      reason: `No road joins ${nodeById(level, end).label} to ${
        nodeById(level, nodeId).label
      }.`,
    };
  }

  if (route.roadIds.includes(road.id)) {
    return {
      kind: "rejected",
      reason: "That road is already in your route — no doubling back.",
    };
  }

  return {
    kind: "extended",
    route: {
      nodeIds: [...route.nodeIds, nodeId],
      roadIds: [...route.roadIds, road.id],
    },
  };
}

/** Screen-space points of the route, in order, for drawing and animation. */
export function routePoints(level: Level, route: Route): MapNode[] {
  return route.nodeIds.map((id) => nodeById(level, id));
}

/** SVG path data for the route polyline. Empty string for an unstarted route. */
export function routePathData(level: Level, route: Route): string {
  if (route.roadIds.length === 0) return "";
  return routePoints(level, route)
    .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
    .join(" ");
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

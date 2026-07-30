import {
  currentNodeId,
  nodeById,
  roadById,
  totalDistanceKm,
} from "./routeGraph";
import type { Level, ObjectiveResult, Route, RouteEvaluation } from "./types";

function isCheckpoint(level: Level, nodeId: string): boolean {
  return level.checkpointNodeIds.includes(nodeId);
}

/** Distinct pigeon hotspots the route passes through. */
export function pigeonHotspotIds(level: Level, route: Route): string[] {
  const seen = new Set<string>();
  for (const id of route.nodeIds) {
    if (nodeById(level, id).type === "pigeon") seen.add(id);
  }
  return [...seen];
}

export function usedClosedRoad(level: Level, route: Route): boolean {
  return route.roadIds.some((id) => roadById(level, id).closed === true);
}

export function hasRepeatedRoad(route: Route): boolean {
  return new Set(route.roadIds).size !== route.roadIds.length;
}

export function visitedCheckpoint(level: Level, route: Route): boolean {
  return route.nodeIds.some((id) => isCheckpoint(level, id));
}

/**
 * The whole rule set, in one pure function. Objectives that cannot yet be
 * decided stay "incomplete" rather than showing a premature failure.
 */
export function evaluateRoute(level: Level, route: Route): RouteEvaluation {
  const totalKm = totalDistanceKm(level, route);
  const isEmpty = route.roadIds.length === 0;
  const endsAtFinish = !isEmpty && currentNodeId(route) === level.finishNodeId;
  const endsAtCheckpoint = !isEmpty && isCheckpoint(level, currentNodeId(route));
  const checkpointVisited = visitedCheckpoint(level, route);
  const hotspots = pigeonHotspotIds(level, route);
  const closed = usedClosedRoad(level, route);
  const repeated = hasRepeatedRoad(route);

  const finishLabel = nodeById(level, level.finishNodeId).label;

  const objectives: ObjectiveResult[] = [
    {
      id: "start",
      label: `Start at ${nodeById(level, level.startNodeId).label}`,
      detail: "Everyone gathers by the telescope, as ever.",
      state: "passed",
    },
    {
      id: "finish",
      label: `Finish back at ${finishLabel}`,
      detail: endsAtFinish
        ? "Route closes the loop."
        : isEmpty
          ? "Nobody has set off yet."
          : `Currently ending at ${nodeById(level, currentNodeId(route)).label}.`,
      state: endsAtFinish ? "passed" : "incomplete",
    },
    {
      id: "distance",
      label: `Cover ${level.minDistanceKm}–${level.maxDistanceKm} km`,
      detail: `${totalKm.toFixed(2)} km so far.`,
      state:
        totalKm > level.maxDistanceKm
          ? "failed"
          : totalKm >= level.minDistanceKm
            ? "passed"
            : "incomplete",
    },
    {
      id: "checkpoint",
      label: `Visit ${level.checkpointLabel}`,
      detail: checkpointVisited
        ? "Towpath duly trotted."
        : "Not been anywhere near the water yet.",
      state: checkpointVisited ? "passed" : "incomplete",
    },
    {
      id: "closed-road",
      label: "Avoid the closed road",
      detail: closed
        ? "You have routed everyone through a closure."
        : "Nothing shut on this route.",
      state: closed ? "failed" : "passed",
    },
    {
      id: "pigeons",
      label: `Pass no more than ${level.maxPigeonHotspots} pigeon hotspot`,
      detail: `${hotspots.length} on the route.`,
      state: hotspots.length > level.maxPigeonHotspots ? "failed" : "passed",
    },
    {
      id: "unique-roads",
      label: "Never use the same road twice",
      detail: repeated ? "A road is repeated." : "Every road used once.",
      state: repeated ? "failed" : "passed",
    },
  ];

  return {
    totalDistanceKm: totalKm,
    visitedCheckpoint: checkpointVisited,
    pigeonHotspotCount: hotspots.length,
    usedClosedRoad: closed,
    hasRepeatedRoad: repeated,
    endsAtFinish,
    endsAtCheckpoint,
    isEmpty,
    objectives,
    success: !isEmpty && objectives.every((o) => o.state === "passed"),
  };
}

/** The Run Route button is gated on this. */
export function canRunRoute(level: Level, route: Route): boolean {
  return route.roadIds.length > 0 && currentNodeId(route) === level.finishNodeId;
}

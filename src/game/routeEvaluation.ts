import { currentNodeId, nodeById, roadById, totalDistanceKm } from "./routeGraph";
import type {
  EvaluationStat,
  Level,
  LevelObjective,
  ObjectiveResult,
  ResultCopy,
  RoadTrait,
  Route,
  RouteEvaluation,
} from "./types";

/** `{km}` in level copy becomes the route's distance. */
export function fillCopy(copy: ResultCopy, totalKm: number): ResultCopy {
  const km = totalKm.toFixed(2);
  return {
    title: copy.title,
    message: copy.message.replaceAll("{km}", km),
  };
}

export function visitedNodes(route: Route, nodeIds: string[]): boolean {
  return route.nodeIds.some((id) => nodeIds.includes(id));
}

/** Distinct junctions of a given type on the route — pigeon hotspots and such. */
export function countNodeType(
  level: Level,
  route: Route,
  nodeType: string,
): number {
  const seen = new Set<string>();
  for (const id of route.nodeIds) {
    if (nodeById(level, id).type === nodeType) seen.add(id);
  }
  return seen.size;
}

export function usedClosedRoad(level: Level, route: Route): boolean {
  return route.roadIds.some((id) => roadById(level, id).closed === true);
}

export function countSurface(
  level: Level,
  route: Route,
  surface: string,
): number {
  return route.roadIds.filter(
    (id) => (roadById(level, id).surface ?? "road") === surface,
  ).length;
}

/** Roads marked `hill` on the route. Every time, so a road taken twice counts twice. */
export function countHills(level: Level, route: Route): number {
  return route.roadIds.filter((id) => roadById(level, id).hill === true).length;
}

/** The same count, for whichever trait a brief is asking to keep off. */
export function countTrait(
  level: Level,
  route: Route,
  trait: RoadTrait,
): number {
  return route.roadIds.filter((id) => roadById(level, id)[trait] === true)
    .length;
}

export function hasRepeatedRoad(route: Route): boolean {
  return new Set(route.roadIds).size !== route.roadIds.length;
}

interface Context {
  level: Level;
  route: Route;
  totalKm: number;
  isEmpty: boolean;
  endsAtFinish: boolean;
}

/** One objective, evaluated. Failure copy is resolved here, not later. */
function evaluateObjective(
  objective: LevelObjective,
  context: Context,
): Omit<ObjectiveResult, "id"> & { stat?: EvaluationStat } {
  const { level, route, totalKm, isEmpty, endsAtFinish } = context;

  switch (objective.kind) {
    case "start":
      return {
        kind: objective.kind,
        label: `Start at ${nodeById(level, level.startNodeId).label}`,
        detail: objective.detail,
        state: "passed",
      };

    case "finish": {
      const finish = nodeById(level, level.finishNodeId).label;
      return {
        kind: objective.kind,
        label: `Finish at ${finish}`,
        detail: endsAtFinish
          ? objective.detail
          : isEmpty
            ? "Nobody has set off yet."
            : `Currently ending at ${nodeById(level, currentNodeId(route)).label}.`,
        state: endsAtFinish ? "passed" : "incomplete",
      };
    }

    case "distance": {
      const tooLong = totalKm > objective.maxKm;
      const tooShort = totalKm < objective.minKm;
      return {
        kind: objective.kind,
        label: `Cover ${objective.minKm}–${objective.maxKm} km`,
        detail: `${totalKm.toFixed(2)} km so far.`,
        state: tooLong ? "failed" : tooShort ? "incomplete" : "passed",
        fail: tooLong
          ? fillCopy(objective.tooLong, totalKm)
          : // Only conclusive once the route is home; resultSelection decides.
            fillCopy(objective.tooShort, totalKm),
        stat: { label: "Distance", value: `${totalKm.toFixed(2)} km` },
      };
    }

    case "visit": {
      const visited = visitedNodes(route, objective.nodeIds);
      return {
        kind: objective.kind,
        label: `Visit ${objective.what}`,
        detail: visited ? objective.done : objective.pending,
        state: visited ? "passed" : "incomplete",
        fail: fillCopy(objective.missed, totalKm),
        stat: {
          label: objective.what.replace(/^the /, ""),
          value: visited ? "Visited" : "Missed",
        },
      };
    }

    case "avoid-closed": {
      const closed = usedClosedRoad(level, route);
      return {
        kind: objective.kind,
        label: "Avoid the closed road",
        detail: closed
          ? "You have routed everyone through a closure."
          : "Nothing shut on this route.",
        state: closed ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
      };
    }

    case "avoid-surface": {
      const count = countSurface(level, route, objective.surface);
      return {
        kind: objective.kind,
        label: `Stay off ${objective.what}`,
        detail:
          count === 0
            ? // "No the tarmac" is not a sentence; "3 stretches of the
              // tarmac" is, so the article only goes in the second one.
              `No ${objective.what.replace(/^the /, "")} on this route.`
            : `${count} stretch${count === 1 ? "" : "es"} of ${objective.what}.`,
        state: count > 0 ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
      };
    }

    case "avoid-nodes": {
      const forbidden = new Set(objective.nodeIds);
      const count = route.nodeIds.filter((id) => forbidden.has(id)).length;
      return {
        kind: objective.kind,
        label: `Keep away from ${objective.what}`,
        detail:
          count === 0
            ? `Nowhere near ${objective.what}.`
            : `Straight past ${objective.what}.`,
        state: count > 0 ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
      };
    }

    case "avoid-roads": {
      const count = countTrait(level, route, objective.trait);
      return {
        kind: objective.kind,
        label: `Keep off ${objective.what}`,
        detail:
          count === 0
            ? `None of ${objective.what} on this route.`
            : `${count} stretch${count === 1 ? "" : "es"} of ${objective.what}.`,
        state: count > 0 ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
      };
    }

    case "max-node-type": {
      const count = countNodeType(level, route, objective.nodeType);
      return {
        kind: objective.kind,
        label:
          objective.label ??
          `Pass no more than ${objective.limit} ${objective.what}`,
        detail: `${count} on the route.`,
        state: count > objective.limit ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
        stat: { label: objective.what, value: String(count) },
      };
    }

    case "climb": {
      const climbed = countHills(level, route);
      const done = climbed >= objective.minHills;
      return {
        kind: objective.kind,
        label: `Climb at least ${objective.minHills} hills`,
        /*
         * Incomplete rather than failed while it is short, exactly as an
         * unreached waypoint is: there may be more road to come, and a
         * checklist that goes red on the first leg of every route is telling
         * the player off for not having finished yet. `resultSelection` turns
         * it into a failure once the run has actually been run.
         */
        detail: done
          ? `${climbed} climbed. That will do it.`
          : `${climbed} so far. ${objective.minHills - climbed} to go.`,
        state: done ? "passed" : "incomplete",
        fail: fillCopy(objective.fail, totalKm),
        stat: { label: "Hills climbed", value: String(climbed) },
      };
    }

    case "no-repeat": {
      const repeated = hasRepeatedRoad(route);
      return {
        kind: objective.kind,
        label: "Never use the same road twice",
        detail: repeated ? "A road is repeated." : "Every road used once.",
        state: repeated ? "failed" : "passed",
        fail: fillCopy(objective.fail, totalKm),
      };
    }
  }
}

/**
 * The whole rule set, driven by the level's declared objectives. Objectives
 * that cannot yet be decided stay "incomplete" rather than showing a premature
 * failure.
 */
export function evaluateRoute(level: Level, route: Route): RouteEvaluation {
  const totalKm = totalDistanceKm(level, route);
  const isEmpty = route.roadIds.length === 0;
  const endsAtFinish = !isEmpty && currentNodeId(route) === level.finishNodeId;
  const context: Context = { level, route, totalKm, isEmpty, endsAtFinish };

  const seenKinds = new Map<string, number>();
  const stats: EvaluationStat[] = [];
  let stranded: ResultCopy | undefined;

  const objectives: ObjectiveResult[] = level.objectives.map((objective) => {
    const { stat, ...result } = evaluateObjective(objective, context);
    if (stat) stats.push(stat);

    // Ids stay stable per kind, numbered only if a kind is used twice.
    const count = (seenKinds.get(objective.kind) ?? 0) + 1;
    seenKinds.set(objective.kind, count);
    const id = count === 1 ? objective.kind : `${objective.kind}-${count}`;

    if (
      objective.kind === "visit" &&
      objective.stranded &&
      !isEmpty &&
      !endsAtFinish &&
      objective.nodeIds.includes(currentNodeId(route))
    ) {
      stranded = fillCopy(objective.stranded, totalKm);
    }

    return { id, ...result };
  });

  return {
    totalDistanceKm: totalKm,
    isEmpty,
    endsAtFinish,
    objectives,
    stats,
    stranded,
    success: !isEmpty && objectives.every((o) => o.state === "passed"),
  };
}

/** The Run Route button is gated on this. */
export function canRunRoute(level: Level, route: Route): boolean {
  return route.roadIds.length > 0 && currentNodeId(route) === level.finishNodeId;
}

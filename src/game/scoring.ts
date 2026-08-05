import { evaluateRoute } from "./routeEvaluation";
import { currentNodeId, graphFor, nodeById, otherEnd } from "./routeGraph";
import type { Level, Route } from "./types";

/**
 * Bumped whenever the numbers below change. Every stored run keeps the full
 * route it was scored from, so a new version rescores the whole history rather
 * than stranding it: change the formula, redeploy, done. Nothing anywhere
 * stores a total that cannot be derived again from the routes.
 */
export const SCORE_VERSION = 1;

/** Met the brief. The bulk of a winning route's worth. */
const BRIEF_POINTS = 50;
/** Each objective satisfied, whether or not the whole brief was. */
const OBJECTIVE_POINTS = 10;
/** Each junction taken in that the brief never asked for. */
const JUNCTION_POINTS = 3;
/** And more, for the ones with something worth seeing at them. */
const SIGHT_POINTS = 5;

export interface ScoreLine {
  label: string;
  points: number;
}

export interface RunScore {
  points: number;
  /** Itemised, in the club's own terms, for the result panel. */
  lines: ScoreLine[];
  won: boolean;
}

/**
 * Junction types that are scenery a club would actually detour for. Terrain
 * that every route on a map crosses — the banks of a pond, the junctions a
 * canal runs through — is not a sight, or the score would just be counting
 * junctions.
 */
const SIGHTS = new Set([
  "observatory",
  "bush",
  "park",
  "shop",
  "pond",
  "cow",
  "hangar",
  "statue",
  "towncentre",
  "cemetery",
  "coffee",
  "railway",
  "football",
  "golf",
  "woods",
  "sportscentre",
  "pool",
  "airport",
  "pub",
  "cricket",
  "mosque",
  "church",
  "ghost",
  "portaloo",
  "car",
]);

/**
 * The same set of roads is the same route, whichever way round it was run and
 * whatever order the player laid it in. Used to tell a new discovery from one
 * already in the book.
 */
export function routeKey(route: Route): string {
  return [...route.roadIds].sort().join("|");
}

/**
 * How many winning routes a level has, which is the denominator in "3 of 4
 * found". Walked once per level and remembered: a route cannot use a road
 * twice, so the search is bounded by the roads on the map.
 */
const winningCounts = new WeakMap<Level, number>();

export function winningRouteCount(level: Level): number {
  const cached = winningCounts.get(level);
  if (cached !== undefined) return cached;

  const graph = graphFor(level);
  const shapes = new Set<string>();
  const walk = (route: Route) => {
    const end = currentNodeId(route);
    if (end === level.finishNodeId && route.roadIds.length > 0) {
      if (evaluateRoute(level, route).success) shapes.add(routeKey(route));
      return;
    }
    for (const road of graph.roadsByNode.get(end) ?? []) {
      if (route.roadIds.includes(road.id)) continue;
      walk({
        nodeIds: [...route.nodeIds, otherEnd(road, end)],
        roadIds: [...route.roadIds, road.id],
      });
    }
  };
  walk({ nodeIds: [level.startNodeId], roadIds: [] });

  winningCounts.set(level, shapes.size);
  return shapes.size;
}

/**
 * Whether the brief can be met at all — the same walk as above, stopped at
 * the first route that works rather than counted to the end.
 *
 * For asking of a *derived* level (#10), where the only question is whether
 * the thing is still possible and the count is nobody's business. Early exit
 * matters there: it is asked at the moment a briefing is dealt, and a map
 * with plenty of winners answers almost immediately.
 */
const winnable = new WeakMap<Level, boolean>();

export function hasWinningRoute(level: Level): boolean {
  const cached = winnable.get(level);
  if (cached !== undefined) return cached;

  const graph = graphFor(level);
  const walk = (route: Route): boolean => {
    const end = currentNodeId(route);
    // Home counts as the end of the run, exactly as the count above has it:
    // the walk stops here rather than running on through the finish.
    if (end === level.finishNodeId && route.roadIds.length > 0) {
      return evaluateRoute(level, route).success;
    }
    for (const road of graph.roadsByNode.get(end) ?? []) {
      if (route.roadIds.includes(road.id)) continue;
      const found = walk({
        nodeIds: [...route.nodeIds, otherEnd(road, end)],
        roadIds: [...route.roadIds, road.id],
      });
      if (found) return true;
    }
    return false;
  };

  const answer = walk({ nodeIds: [level.startNodeId], roadIds: [] });
  winnable.set(level, answer);
  return answer;
}

/**
 * What the route took in beyond what it was told to. The distance window is
 * what keeps this honest: you cannot pad a route with junctions and still come
 * home inside the brief, so the grand tour is a choice and not a strategy.
 */
function extras(level: Level, route: Route): { junctions: number; sights: number } {
  const required = new Set(
    level.objectives.flatMap((objective) =>
      objective.kind === "visit" ? objective.nodeIds : [],
    ),
  );
  required.add(level.startNodeId);
  required.add(level.finishNodeId);

  const seen = new Set<string>();
  let sights = 0;
  for (const id of route.nodeIds) {
    if (required.has(id) || seen.has(id)) continue;
    seen.add(id);
    const type = nodeById(level, id).type;
    // Hills and hotspots are not sights: several levels score them against
    // you, and paying for them in one place and fining them in another would
    // make the brief argue with itself.
    if (type && SIGHTS.has(type)) sights += 1;
  }
  return { junctions: seen.size, sights };
}

/**
 * What a run is worth. Pure, and derived only from the level and the route, so
 * a server can recompute it from a stored route and never has to trust a
 * number the client sent.
 */
export function scoreRun(level: Level, route: Route): RunScore {
  const evaluation = evaluateRoute(level, route);

  // A run that missed the brief is worth nothing, which is both simpler than
  // part marks and exactly what the committee would do. It still gets logged
  // as a route explored.
  if (!evaluation.success) return { points: 0, lines: [], won: false };

  const { junctions, sights } = extras(level, route);
  const lines: ScoreLine[] = [
    { label: "Brief satisfied", points: BRIEF_POINTS },
    {
      label: `Objectives met (${evaluation.objectives.length})`,
      points: evaluation.objectives.length * OBJECTIVE_POINTS,
    },
  ];
  if (junctions > 0) {
    lines.push({
      label: `Junctions taken in (${junctions})`,
      points: junctions * JUNCTION_POINTS,
    });
  }
  if (sights > 0) {
    lines.push({
      label: `Sights worth seeing (${sights})`,
      points: sights * SIGHT_POINTS,
    });
  }

  return {
    points: lines.reduce((total, line) => total + line.points, 0),
    lines,
    won: true,
  };
}

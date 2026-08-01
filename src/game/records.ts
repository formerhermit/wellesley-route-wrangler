import { routeKey, scoreRun } from "./scoring";
import type { Level, Route } from "./types";

/**
 * One route the player has actually run, kept as the route and nothing else.
 *
 * Deliberately no points in here. Scores are derived from the route every time
 * they are needed, so changing the scoring changes every score ever recorded,
 * including other people's once there is a table — and a server can recompute
 * a submitted route instead of believing a number the client sent it.
 */
export interface RunRecord {
  /** Road ids in the order they were run. */
  roads: string[];
  /** When it was first run. Not scored; it is there for the club's records. */
  at: number;
}

/** Every route run, by level and then by route. */
export type Records = Readonly<Record<string, Readonly<Record<string, RunRecord>>>>;

export interface LevelTally {
  points: number;
  /** Winning routes found, and how many there are to find. */
  found: number;
  /** Distinct loops run, whether they met the brief or not. */
  explored: number;
}

export const emptyRecords: Records = {};

/**
 * Log a run. Idempotent: running the same route again is the same discovery,
 * so it neither scores twice nor overwrites when it was first found.
 */
export function recordRun(
  records: Records,
  level: Level,
  route: Route,
  at: number = Date.now(),
): Records {
  if (route.roadIds.length === 0) return records;
  const key = routeKey(route);
  const forLevel = records[level.id] ?? {};
  if (forLevel[key]) return records;

  return {
    ...records,
    [level.id]: { ...forLevel, [key]: { roads: [...route.roadIds], at } },
  };
}

export function hasRun(records: Records, level: Level, route: Route): boolean {
  return Boolean(records[level.id]?.[routeKey(route)]);
}

/** Rebuilds the route the record came from, for rescoring. */
function routeFrom(level: Level, record: RunRecord): Route | undefined {
  const nodeIds = [level.startNodeId];
  for (const roadId of record.roads) {
    const road = level.roads.find((candidate) => candidate.id === roadId);
    if (!road) return undefined;
    const here = nodeIds[nodeIds.length - 1];
    if (road.from !== here && road.to !== here) return undefined;
    nodeIds.push(road.from === here ? road.to : road.from);
  }
  return { nodeIds, roadIds: [...record.roads] };
}

/** What one level is worth, scored fresh from the routes stored for it. */
export function tallyLevel(records: Records, level: Level): LevelTally {
  const stored = Object.values(records[level.id] ?? {});
  let points = 0;
  let found = 0;

  for (const record of stored) {
    const route = routeFrom(level, record);
    // A route that no longer fits the map — a road renamed under it — counts
    // as explored and scores nothing, rather than throwing the level away.
    if (!route) continue;
    const score = scoreRun(level, route);
    if (!score.won) continue;
    points += score.points;
    found += 1;
  }

  return { points, found, explored: stored.length };
}

export function tallyAll(records: Records, levels: Level[]): LevelTally {
  return levels
    .map((level) => tallyLevel(records, level))
    .reduce(
      (total, tally) => ({
        points: total.points + tally.points,
        found: total.found + tally.found,
        explored: total.explored + tally.explored,
      }),
      { points: 0, found: 0, explored: 0 },
    );
}

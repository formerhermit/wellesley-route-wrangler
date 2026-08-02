import { evaluateRoute } from "./routeEvaluation";
import { routeFromRoads } from "./records";
import { selectResult } from "./resultSelection";
import { scoreRun, winningRouteCount } from "./scoring";
import { totalDistanceKm } from "./routeGraph";
import type { Records } from "./records";
import type { Level, Route } from "./types";

/**
 * One run, read back out of the book.
 *
 * Every figure on it is worked out here from the road ids and nothing else —
 * the distance, the points, whether it won, and what the level called it when
 * it did not. The book stores routes, exactly as `records.ts` says, so a page
 * of it can be rebuilt after a rebalance without anybody's history going
 * stale or wrong.
 */
export interface BookEntry {
  /** Stable across renders: the same route always keys the same. */
  key: string;
  route: Route;
  distanceKm: number;
  /** What it was worth. Nought for a route that missed the brief. */
  points: number;
  won: boolean;
  /** The level's own name for what went wrong. Absent on a winner. */
  verdict?: string;
  /**
   * How many objectives this route did not satisfy. Nought on a winner, and
   * the measure of how near a miss a dud was: one is a route that wanted a
   * single road changing, five is a route that went the wrong way out of the
   * car park. It is what the failures are ordered by.
   *
   * Counts everything not *passed*, rather than everything failed. Those are
   * the same number while a route is being planned and very different once it
   * has been run: "incomplete" is the objective panel declining to call a
   * half-built route short, and the commonest near miss of all — a loop that
   * came home under the distance — never reaches "failed" at all. In the book
   * the run is over, so not yet means never.
   */
  missed: number;
  /** When it was first run. */
  at: number;
}

export interface BookPage {
  /** The ones that counted, shortest first, so they read as a series. */
  won: BookEntry[];
  /**
   * The ones that did not, nearest miss first. Recency was the obvious order
   * and the wrong one: the reason to look a dud up is to change a road and run
   * it again, and a route that failed on one objective is worth reopening in a
   * way that a route that failed on four is not. Ties go to the most recent.
   */
  tried: BookEntry[];
  found: number;
  toFind: number;
  /** How many winners are still out there. Never how to find them. */
  missing: number;
}

/**
 * Everything run on one level, sorted for reading.
 *
 * A route whose roads no longer describe a walk — a map edited under it — is
 * dropped rather than shown broken. `tallyLevel` already takes the same view.
 */
export function pageFor(records: Records, level: Level): BookPage {
  const stored = Object.entries(records[level.id] ?? {});
  const entries: BookEntry[] = [];

  for (const [key, record] of stored) {
    const route = routeFromRoads(level, record.roads);
    if (!route) continue;

    const score = scoreRun(level, route);
    // Evaluated once, for the verdict and the miss count together, and only
    // for a route that lost — a winner has nothing to explain and nothing to
    // rank. That keeps this to the same one call per dud it always made.
    const evaluation = score.won ? undefined : evaluateRoute(level, route);

    entries.push({
      key,
      route,
      distanceKm: totalDistanceKm(level, route),
      points: score.points,
      won: score.won,
      verdict: evaluation && selectResult(level, evaluation).title,
      missed:
        evaluation?.objectives.filter((o) => o.state !== "passed").length ?? 0,
      at: record.at,
    });
  }

  const won = entries
    .filter((entry) => entry.won)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const tried = entries
    .filter((entry) => !entry.won)
    .sort((a, b) => a.missed - b.missed || b.at - a.at);

  const toFind = winningRouteCount(level);
  return {
    won,
    tried,
    found: won.length,
    toFind,
    missing: Math.max(0, toFind - won.length),
  };
}

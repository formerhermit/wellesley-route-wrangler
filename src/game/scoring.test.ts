import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { tilfordRun } from "../data/tilfordRun";
import { emptyRecords, recordRun, tallyAll, tallyLevel } from "./records";
import { routeKey, scoreRun, winningRouteCount } from "./scoring";
import { roadBetween } from "./routeGraph";
import type { Level, Route } from "./types";

function routeOf(level: Level, ...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

const level = tilfordRun;

/** 7.70 km, meets the brief. */
const winner = routeOf(
  level,
  "barley-mow",
  "cricket-green",
  "mosque",
  "paddling-spot",
  "river-bridge",
  "rooty-bit",
  "the-institute",
  "barley-mow",
);

/** The same loop the other way round: the same route, as far as the book goes. */
const reversed = routeOf(
  level,
  "barley-mow",
  "the-institute",
  "rooty-bit",
  "river-bridge",
  "paddling-spot",
  "mosque",
  "cricket-green",
  "barley-mow",
);

/** 8.00 km, and it takes in the cows nobody asked it to. */
const scenic = routeOf(
  level,
  "barley-mow",
  "cricket-green",
  "paddling-spot",
  "hankley-hill",
  "posh-cows",
  "sandy-track",
  "river-bridge",
  "the-institute",
  "barley-mow",
);

/** A loop home that never crossed the river. */
const loser = routeOf(
  level,
  "barley-mow",
  "the-institute",
  "rooty-bit",
  "sandy-track",
  "posh-cows",
  "hankley-hill",
  "mosque",
  "cricket-green",
  "barley-mow",
);

describe("scoring a run", () => {
  it("pays for the brief, the objectives and the sights", () => {
    const score = scoreRun(level, winner);
    expect(score.won).toBe(true);
    // 50 for the brief, 10 for each of the seven objectives.
    expect(score.points).toBeGreaterThanOrEqual(120);
    expect(score.lines.map((line) => line.label)).toContain("Brief satisfied");
  });

  it("pays more for a route that takes in more of the map", () => {
    // The scenic loop passes the cows and the hill nobody required.
    expect(scoreRun(level, scenic).points).toBeGreaterThan(
      scoreRun(level, winner).points,
    );
  });

  it("pays nothing at all for a run that missed the brief", () => {
    const score = scoreRun(level, loser);
    expect(score.won).toBe(false);
    expect(score.points).toBe(0);
    expect(score.lines).toEqual([]);
  });

  it("treats a loop and its reverse as one route", () => {
    expect(routeKey(winner)).toBe(routeKey(reversed));
    expect(routeKey(winner)).not.toBe(routeKey(scenic));
  });
});

describe("the run book", () => {
  it("banks a discovery once, however often it is run", () => {
    let records = recordRun(emptyRecords, level, winner);
    records = recordRun(records, level, winner);
    records = recordRun(records, level, reversed);

    const tally = tallyLevel(records, level);
    expect(tally.found).toBe(1);
    expect(tally.explored).toBe(1);
    expect(tally.points).toBe(scoreRun(level, winner).points);
  });

  it("logs a losing run as explored, and pays nothing for it", () => {
    const records = recordRun(emptyRecords, level, loser);
    const tally = tallyLevel(records, level);
    expect(tally.explored).toBe(1);
    expect(tally.found).toBe(0);
    expect(tally.points).toBe(0);
  });

  it("adds up across levels", () => {
    let records = recordRun(emptyRecords, level, winner);
    records = recordRun(records, level, scenic);
    const total = tallyAll(records, levels);
    expect(total.found).toBe(2);
    expect(total.points).toBe(
      scoreRun(level, winner).points + scoreRun(level, scenic).points,
    );
  });

  it("survives a stored route that no longer fits the map", () => {
    const records = {
      [level.id]: { "ghost-road": { roads: ["no-such-road"], at: 0 } },
    };
    const tally = tallyLevel(records, level);
    expect(tally.points).toBe(0);
    expect(tally.found).toBe(0);
    expect(tally.explored).toBe(1);
  });

  it("scores a stored route from the route itself, not a stored number", () => {
    // The record holds roads and nothing else, so rescoring is a redeploy.
    const records = recordRun(emptyRecords, level, winner);
    const stored = Object.values(records[level.id])[0];
    expect(Object.keys(stored).sort()).toEqual(["at", "roads"]);
  });
});

describe("how much there is to find", () => {
  it("knows the denominator for every level", () => {
    const counts = levels.map((each) => winningRouteCount(each));
    expect(counts.every((count) => count > 0)).toBe(true);
    // Pinned so a level edit that quietly changes the puzzle is noticed.
    expect(counts).toEqual([9, 2, 2, 8, 3, 4, 4, 4, 7, 6, 5]);
  });
});

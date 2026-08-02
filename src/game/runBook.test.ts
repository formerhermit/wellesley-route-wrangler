import { describe, expect, it } from "vitest";
import { christmasRun } from "../data/christmasRun";
import { emptyRecords, recordRun } from "./records";
import type { Records } from "./records";
import { roadBetween } from "./routeGraph";
import { pageFor } from "./runBook";
import type { Level, Route } from "./types";

function routeOf(level: Level, ...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

/** 8.50 km, a winner. */
const winner = routeOf(
  christmasRun,
  "observatory",
  "polo-fields",
  "mulled-wine",
  "geese-pond",
  "the-hanger",
  "christmas-tree",
  "big-tesco",
  "canal-bridge",
  "towpath",
  "medical-centre",
  "wellesley-rumble",
  "observatory",
);

/** 7.00 km: everything right except the distance. */
const tooShort = routeOf(
  christmasRun,
  "observatory",
  "wellesley-rumble",
  "medical-centre",
  "towpath",
  "canal-bridge",
  "christmas-tree",
  "the-hanger",
  "geese-pond",
  "polo-fields",
  "observatory",
);

/** Straight down a road the club has shut. */
const throughTheClosure = routeOf(
  christmasRun,
  "observatory",
  "wellesley-rumble",
  "geese-pond",
  "towpath",
);

describe("a page of the book", () => {
  it("is empty before anything has been run", () => {
    const page = pageFor(emptyRecords, christmasRun);
    expect(page.won).toEqual([]);
    expect(page.tried).toEqual([]);
    expect(page.found).toBe(0);
    expect(page.toFind).toBe(7);
    expect(page.missing).toBe(7);
  });

  it("separates what counted from what did not", () => {
    let records: Records = emptyRecords;
    records = recordRun(records, christmasRun, winner, 1000);
    records = recordRun(records, christmasRun, tooShort, 2000);

    const page = pageFor(records, christmasRun);
    expect(page.won.map((e) => e.distanceKm)).toEqual([8.5]);
    expect(page.tried.map((e) => e.distanceKm)).toEqual([7]);
    expect(page.found).toBe(1);
    expect(page.missing).toBe(6);
  });

  it("works every figure out from the roads, storing none of them", () => {
    const records = recordRun(emptyRecords, christmasRun, winner, 1000);
    const [entry] = pageFor(records, christmasRun).won;
    expect(entry.distanceKm).toBe(8.5);
    expect(entry.points).toBe(159);
    expect(entry.won).toBe(true);
    expect(entry.verdict).toBeUndefined();
    expect(entry.at).toBe(1000);
  });

  it("gives a failure the level's own name for what went wrong", () => {
    let records: Records = emptyRecords;
    records = recordRun(records, christmasRun, tooShort, 1000);
    records = recordRun(records, christmasRun, throughTheClosure, 2000);

    const verdicts = pageFor(records, christmasRun).tried.map((e) => e.verdict);
    expect(verdicts).toContain("Straight To The Mulled Wine");
    expect(verdicts).toContain("Down The Unlit Towpath");
  });

  it("orders winners by distance and failures by most recent", () => {
    let records: Records = emptyRecords;
    // Logged out of order on purpose.
    records = recordRun(records, christmasRun, throughTheClosure, 3000);
    records = recordRun(records, christmasRun, tooShort, 1000);
    records = recordRun(records, christmasRun, winner, 2000);

    const page = pageFor(records, christmasRun);
    expect(page.won.every((e) => e.won)).toBe(true);
    expect(page.tried.map((e) => e.at)).toEqual([3000, 1000]);
  });

  it("drops a route the map no longer describes rather than showing it broken", () => {
    // A road that is not on this map at all: the level moved under the book.
    const records: Records = {
      "christmas-run": {
        stale: { roads: ["not-a-road-any-more"], at: 1000 },
      },
    };
    const page = pageFor(records, christmasRun);
    expect(page.won).toEqual([]);
    expect(page.tried).toEqual([]);
    // And the level still knows how much there is to find.
    expect(page.toFind).toBe(7);
  });

  it("never reports more found than there are to find", () => {
    const records = recordRun(emptyRecords, christmasRun, winner, 1000);
    const page = pageFor(records, christmasRun);
    expect(page.found + page.missing).toBe(page.toFind);
  });
});

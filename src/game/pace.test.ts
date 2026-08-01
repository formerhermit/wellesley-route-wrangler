import { describe, expect, it } from "vitest";
import { thursdayTownRun } from "../data/thursdayTownRun";
import { paceOf } from "./pace";
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

const level = thursdayTownRun;

describe("pacing a run", () => {
  it("runs a flat route evenly", () => {
    // Observatory to the Medical Centre and back out to the Gardens: no hills.
    const flat = routeOf(level, "observatory", "medical-centre", "municipal-gardens");
    const pace = paceOf(level, flat);
    expect(pace.hilly).toBe(false);
    expect(pace.fractionAt(0.5)).toBeCloseTo(0.5, 5);
  });

  it("gives a hill more of the run than its length", () => {
    // Rumble to Redan Road is a climb; Redan to the Gardens is not.
    const uphill = routeOf(
      level,
      "wellesley-rumble",
      "redan-road",
      "municipal-gardens",
    );
    const pace = paceOf(level, uphill);
    expect(pace.hilly).toBe(true);

    // Half the effort should not yet have covered half the distance, because
    // the climb comes first and eats the clock.
    expect(pace.fractionAt(0.5)).toBeLessThan(0.5);
  });

  it("still starts at the start and finishes at the finish", () => {
    const uphill = routeOf(level, "wellesley-rumble", "redan-road", "cemetery");
    const pace = paceOf(level, uphill);
    expect(pace.fractionAt(0)).toBe(0);
    expect(pace.fractionAt(1)).toBeCloseTo(1, 5);
  });

  it("never goes backwards", () => {
    const mixed = routeOf(
      level,
      "observatory",
      "wellesley-rumble",
      "redan-road",
      "municipal-gardens",
      "town-centre",
      "ski-slope",
    );
    const pace = paceOf(level, mixed);
    let previous = -1;
    for (let effort = 0; effort <= 1.0001; effort += 0.05) {
      const here = pace.fractionAt(effort);
      expect(here).toBeGreaterThanOrEqual(previous);
      previous = here;
    }
  });

  it("copes with a route nobody has started", () => {
    const pace = paceOf(level, { nodeIds: ["observatory"], roadIds: [] });
    expect(pace.fractionAt(0.5)).toBe(0.5);
  });
});

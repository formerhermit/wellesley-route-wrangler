import { describe, expect, it } from "vitest";
import { thursdayTownRun } from "../data/thursdayTownRun";
import { paceOf } from "./pace";
import type { Pace } from "./pace";
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

/**
 * The longest stretch of the run the group spends without moving, as a share
 * of the whole. Sampled rather than reasoned about, because standing still is
 * exactly what this looks like from the animation's side: the curve stops
 * climbing for a while and everything positioned off it stays put.
 */
function longestStandstill(pace: Pace, samples = 2000): number {
  let best = 0;
  let run = 0;
  let previous = pace.fractionAt(0);
  for (let i = 1; i <= samples; i += 1) {
    const here = pace.fractionAt(i / samples);
    if (Math.abs(here - previous) < 1e-9) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    previous = here;
  }
  return best / samples;
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

/**
 * Standing still on the way round (#10). A stop is a leg of no length and
 * real cost, so it shows up as a stretch of the run where the curve does not
 * climb — which is the whole of what the animation needs to be told.
 */
describe("stopping on the way round", () => {
  const flat = routeOf(
    level,
    "observatory",
    "medical-centre",
    "municipal-gardens",
  );
  const long = routeOf(
    level,
    "observatory",
    "wellesley-rumble",
    "redan-road",
    "municipal-gardens",
    "town-centre",
    "ski-slope",
  );

  it("stands still at the junction it was told to stop at", () => {
    const pace = paceOf(level, flat, ["medical-centre"]);
    expect(pace.stops).toBe(1);
    // A stop costs an eighth of the route on top of the route, so it takes
    // an eighth of nine-eighths of the run: one ninth of the clock.
    expect(longestStandstill(pace)).toBeCloseTo(1 / 9, 2);
  });

  it("does not stand still when nothing asked it to", () => {
    expect(paceOf(level, flat).stops).toBe(0);
    expect(longestStandstill(paceOf(level, flat))).toBeCloseTo(0, 2);
  });

  it("still starts at the start and finishes at the finish", () => {
    const pace = paceOf(level, flat, ["medical-centre"]);
    expect(pace.fractionAt(0)).toBe(0);
    expect(pace.fractionAt(1)).toBeCloseTo(1, 5);
  });

  it("never goes backwards to stand still", () => {
    const pace = paceOf(level, long, ["redan-road", "town-centre"]);
    let previous = -1;
    for (let effort = 0; effort <= 1.0001; effort += 0.01) {
      const here = pace.fractionAt(effort);
      expect(here).toBeGreaterThanOrEqual(previous);
      previous = here;
    }
  });

  it("ignores a junction this route never reaches", () => {
    const asked = paceOf(level, flat, ["ski-slope"]);
    expect(asked.stops).toBe(0);
    expect(asked.fractionAt(0.5)).toBeCloseTo(
      paceOf(level, flat).fractionAt(0.5),
      10,
    );
  });

  /*
   * The start line and the finish line are the same junction on every level
   * here, so a stop there would otherwise be counted twice — once before
   * anybody has set off, and once after everybody has finished. Neither is a
   * thing anybody could see.
   */
  it("will not stand still on the start line or the finish line", () => {
    expect(paceOf(level, flat, ["observatory"]).stops).toBe(0);
    expect(paceOf(level, flat, ["municipal-gardens"]).stops).toBe(0);
  });

  it("makes each stop shorter when there are several", () => {
    const once = paceOf(level, long, ["redan-road"]);
    const thrice = paceOf(level, long, [
      "wellesley-rumble",
      "redan-road",
      "town-centre",
    ]);
    expect(thrice.stops).toBe(3);
    expect(longestStandstill(thrice)).toBeLessThan(longestStandstill(once));
  });

  it("stops on a flat route, which used to skip the arithmetic entirely", () => {
    // The flat case returned a straight line before there was anything but a
    // hill to bend it, so this is the regression that matters most.
    const pace = paceOf(level, flat, ["medical-centre"]);
    expect(pace.hilly).toBe(false);
    expect(pace.fractionAt(0.5)).not.toBeCloseTo(0.5, 3);
  });
});

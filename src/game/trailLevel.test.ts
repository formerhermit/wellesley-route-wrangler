import { describe, expect, it } from "vitest";
import { sundayTrailRun as level } from "../data/sundayTrailRun";
import { emptyRoute, roadBetween, totalDistanceKm } from "./routeGraph";
import { canRunRoute, countSurface, evaluateRoute } from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import type { Route } from "./types";

function routeOf(...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

/** 10.00 km, all trail, cows greeted, no barn. */
const perfect = routeOf(
  "village-hall",
  "stile",
  "gate",
  "bogs",
  "ridge",
  "woods",
  "cow-field",
  "ford",
  "car-park",
);

/** 11.20 km over the trig point — a genuinely different winning line. */
const alternative = routeOf(
  "village-hall",
  "stile",
  "gate",
  "bogs",
  "ridge",
  "trig",
  "woods",
  "cow-field",
  "ford",
  "car-park",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Sunday Trail Run", () => {
  it("is a point-to-point, not a loop", () => {
    expect(level.startNodeId).not.toBe(level.finishNodeId);
    expect(canRunRoute(level, perfect)).toBe(true);
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("has at least two winning routes", () => {
    expect(totalDistanceKm(level, perfect)).toBe(10);
    expect(totalDistanceKm(level, alternative)).toBe(11.2);
    expect(evaluateRoute(level, perfect).success).toBe(true);
    expect(evaluateRoute(level, alternative).success).toBe(true);
    expect(titleFor(perfect)).toBe("Textbook Trail Run");
  });

  it("uses no tarmac on a winning route", () => {
    expect(countSurface(level, perfect, "road")).toBe(0);
    expect(countSurface(level, perfect, "trail")).toBe(8);
  });

  it("fails a route that nips along the lanes", () => {
    const onTheRoad = routeOf("village-hall", "gate", "bogs", "ridge", "woods", "cow-field", "ford", "car-park");
    expect(countSurface(level, onTheRoad, "road")).toBe(1);
    expect(titleFor(onTheRoad)).toBe("That Was Just a Road Run");
  });

  it("fails a route that skips the cows", () => {
    const noCows = routeOf("village-hall", "stile", "gate", "bogs", "ridge", "trig", "reservoir", "car-park");
    expect(titleFor(noCows)).toBe("The Cows Were Not Greeted");
  });

  it("fails a route past the pigeon barn", () => {
    const barn = routeOf(
      "village-hall",
      "stile",
      "cow-field",
      "woods",
      "ridge",
      "trig",
      "pigeon-barn",
      "car-park",
    );
    expect(titleFor(barn)).toBe("Pigeon-Controlled Route");
  });

  it("fails a route through the lambing closure", () => {
    const closed = routeOf("village-hall", "stile", "cow-field", "woods", "ridge", "gate");
    expect(titleFor(closed)).toBe("It Was Closed For Lambing");
  });

  it("fails a route that comes up short", () => {
    const short = routeOf("village-hall", "stile", "cow-field", "ford", "car-park");
    expect(totalDistanceKm(level, short)).toBeLessThan(10);
    expect(titleFor(short)).toBe("An Innovative Definition of 10K");
  });
});

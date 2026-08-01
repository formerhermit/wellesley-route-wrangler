import { describe, expect, it } from "vitest";
import { caesarsCamp as level } from "../data/caesarsCamp";
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

/** 11.20 km the long way round, clockwise. */
const perfect = routeOf(
  "car-park",
  "cattlegrid",
  "cow-field",
  "stile",
  "suspicious-car",
  "gate",
  "portaloos",
  "soldiers",
  "woods",
  "trig",
  "stinky-pond",
  "car-park",
);

/** 10.50 km anticlockwise, over the ridge rather than through the woods. */
const alternative = routeOf(
  "car-park",
  "stinky-pond",
  "trig",
  "soldiers",
  "portaloos",
  "gate",
  "suspicious-car",
  "stile",
  "cow-field",
  "cattlegrid",
  "car-park",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Caesar's Camp", () => {
  it("is a loop from the car park", () => {
    expect(level.startNodeId).toBe("car-park");
    expect(level.finishNodeId).toBe("car-park");
    expect(canRunRoute(level, perfect)).toBe(true);
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("has two winning routes, in either direction", () => {
    expect(totalDistanceKm(level, perfect)).toBe(11.2);
    expect(totalDistanceKm(level, alternative)).toBe(10.5);
    expect(evaluateRoute(level, perfect).success).toBe(true);
    expect(evaluateRoute(level, alternative).success).toBe(true);
    expect(titleFor(perfect)).toBe("Textbook Trail Run");
  });

  it("lets a route pass through the cow field in both directions", () => {
    expect(roadBetween(level, "cattlegrid", "cow-field")).toBeDefined();
    expect(roadBetween(level, "cow-field", "stile")).toBeDefined();
    expect(roadBetween(level, "cow-field", "woods")).toBeDefined();
  });

  it("uses no tarmac on a winning route", () => {
    expect(countSurface(level, perfect, "road")).toBe(0);
    expect(countSurface(level, perfect, "trail")).toBe(11);
  });

  it("fails a route that nips along the lanes", () => {
    const onTheRoad = routeOf("car-park", "woods", "cow-field", "cattlegrid", "car-park");
    expect(countSurface(level, onTheRoad, "road")).toBe(1);
    expect(titleFor(onTheRoad)).toBe("That Was Just a Road Run");
  });

  it("fails a route that skips the cows", () => {
    const noCows = routeOf("car-park", "stinky-pond", "trig", "woods", "soldiers");
    expect(titleFor(noCows)).toBe("The Cows Were Not Greeted");
  });

  it("fails a route past the pigeon barn", () => {
    expect(titleFor(routeOf("car-park", "pigeon-barn", "trig"))).toBe(
      "Pigeon-Controlled Route",
    );
  });

  it("fails a route through the lambing closure", () => {
    const closed = routeOf(
      "car-park",
      "cattlegrid",
      "cow-field",
      "stile",
      "suspicious-car",
      "gate",
      "soldiers",
    );
    expect(titleFor(closed)).toBe("It Was Closed For Lambing");
  });

  it("fails a loop that comes up short", () => {
    const short = routeOf(
      "car-park",
      "cattlegrid",
      "cow-field",
      "woods",
      "trig",
      "stinky-pond",
      "car-park",
    );
    expect(totalDistanceKm(level, short)).toBe(6.4);
    expect(titleFor(short)).toBe("An Innovative Definition of 10K");
  });
});

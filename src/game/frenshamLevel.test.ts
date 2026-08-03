import { describe, expect, it } from "vitest";
import { frenshamPonds as level } from "../data/frenshamPonds";
import { graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
import { evaluateRoute } from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import { routeKey, winningRouteCount } from "./scoring";
import type { Route } from "./types";

function routeOf(...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

/** 9.20 km: round the water, over the common, down the Jumps and home. */
const perfect = routeOf(
  "great-pond-car-park",
  "the-beach",
  "farnham-road",
  "sandy-lane",
  "little-pond",
  "jumps-stream",
  "the-flashes",
  "stony-jump",
  "churt",
  "sailing-club",
  "great-pond-car-park",
);

/** The same loop the other way round, which banks as the same route. */
const reversed = routeOf(
  "great-pond-car-park",
  "sailing-club",
  "churt",
  "stony-jump",
  "the-flashes",
  "jumps-stream",
  "little-pond",
  "sandy-lane",
  "farnham-road",
  "the-beach",
  "great-pond-car-park",
);

/** 10.20 km: the same run with the King's Ridge taken in on the way out. */
const overTheRidge = routeOf(
  "great-pond-car-park",
  "the-beach",
  "farnham-road",
  "kings-ridge",
  "sandy-lane",
  "little-pond",
  "jumps-stream",
  "the-flashes",
  "stony-jump",
  "churt",
  "sailing-club",
  "great-pond-car-park",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Frensham Great Pond", () => {
  it("is a loop from the Great Pond car park", () => {
    expect(level.startNodeId).toBe("great-pond-car-park");
    expect(level.finishNodeId).toBe("great-pond-car-park");
  });

  /*
   * A Thursday out of town rather than a seasonal edition, so `mood` and
   * `music` stay unset. `flock` does not: the birds on the Great Pond are
   * ducks, which is the same mechanism Hawley Lake uses and changes only the
   * drawing and the paperwork.
   */
  it("runs in daylight, on the house theme, with ducks on the water", () => {
    expect(level.mood).toBeUndefined();
    expect(level.music).toBeUndefined();
    expect(level.flock).toBe("duck");
  });

  /*
   * Four bank junctions, and the order they are declared in is the order round
   * the water — `waterThrough` walks the list to draw the pond, so a bank
   * junction filed in the wrong place folds the shape inside out.
   */
  it("draws the Great Pond from four junctions in bank order", () => {
    const bank = level.nodes
      .filter((node) => node.type === "shore")
      .map((node) => node.id);
    expect(bank).toEqual([
      "great-pond-car-park",
      "the-beach",
      "farnham-road",
      "sailing-club",
    ]);
  });

  it("passes the run the club drove out for", () => {
    expect(evaluateRoute(level, perfect).success).toBe(true);
    expect(totalDistanceKm(level, perfect)).toBeCloseTo(9.2, 5);
  });

  it("banks the same loop run backwards as the same route", () => {
    expect(evaluateRoute(level, reversed).success).toBe(true);
    expect(routeKey(reversed)).toBe(routeKey(perfect));
  });

  it("passes the longer way round by the King's Ridge", () => {
    expect(evaluateRoute(level, overTheRidge).success).toBe(true);
    expect(totalDistanceKm(level, overTheRidge)).toBeCloseTo(10.2, 5);
  });

  /*
   * The two waypoints are independently failable, which is the whole reason
   * the chord from the King's Ridge to the Flashes is on the map: without it
   * the east is one chain and reaching either end means reaching both.
   */
  it("fails a route that never crosses to the Little Pond", () => {
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "farnham-road",
      "kings-ridge",
      "the-flashes",
      "stony-jump",
      "churt",
      "sailing-club",
      "great-pond-car-park",
    );
    expect(titleFor(route)).toBe("One Pond Short");
  });

  it("fails a route that leaves the Devil's Jumps alone", () => {
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "sandy-lane",
      "little-pond",
      "jumps-stream",
      "the-flashes",
      "kings-ridge",
      "churt",
      "sailing-club",
      "great-pond-car-park",
    );
    expect(titleFor(route)).toBe("The Devil Was Not Troubled");
  });

  it("shuts the path roped off for the nesting", () => {
    const road = roadBetween(level, "kings-ridge", "stony-jump");
    expect(road?.closed).toBe(true);
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "farnham-road",
      "kings-ridge",
      "stony-jump",
      "churt",
      "sailing-club",
      "great-pond-car-park",
    );
    expect(titleFor(route)).toBe("It Was Roped Off For The Nesting");
  });

  it("fails a lap of the water and nothing else", () => {
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "farnham-road",
      "sailing-club",
      "great-pond-car-park",
    );
    // The Little Pond is the first waypoint declared, so it names the failure.
    expect(titleFor(route)).toBe("One Pond Short");
  });

  it("fails a loop that met the brief and came home short", () => {
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "sandy-lane",
      "little-pond",
      "jumps-stream",
      "the-flashes",
      "stony-jump",
      "churt",
      "sailing-club",
      "great-pond-car-park",
    );
    // Two hundred metres under, which is the nearest miss the map allows.
    expect(totalDistanceKm(level, route)).toBeCloseTo(8.8, 5);
    expect(titleFor(route)).toBe("A Nice Walk Round A Pond");
  });

  it("fails a loop that met the brief and went too far", () => {
    const route = routeOf(
      "great-pond-car-park",
      "the-beach",
      "farnham-road",
      "sandy-lane",
      "little-pond",
      "jumps-stream",
      "the-flashes",
      "stony-jump",
      "churt",
      "kings-ridge",
      "farnham-road",
      "sailing-club",
      "great-pond-car-park",
    );
    expect(totalDistanceKm(level, route)).toBeCloseTo(10.8, 5);
    expect(titleFor(route)).toBe("That Was Not A Ten");
  });

  /* Both waypoints reached first: `visit` outranks `stranded`, so a group that
     sat down before the Jumps gets told about the Jumps instead. */
  it("says so when the group sits down at the Little Pond", () => {
    const route = routeOf(
      "great-pond-car-park",
      "sailing-club",
      "churt",
      "stony-jump",
      "the-flashes",
      "jumps-stream",
      "little-pond",
    );
    expect(titleFor(route)).toBe("Nobody Left The Little Pond");
  });

  /*
   * The whole map, walked. Six routes and fourteen journeys: four of the six
   * work either way round, and two pass through the Sailing Club twice, which
   * the walk counts separately and the book does not.
   */
  it("has exactly six winning routes, and fourteen ways to run them", () => {
    const graph = graphFor(level);
    const winners: Route[] = [];
    const walk = (route: Route) => {
      const here = route.nodeIds[route.nodeIds.length - 1];
      if (route.roadIds.length > 0 && here === level.finishNodeId) {
        if (evaluateRoute(level, route).success) winners.push(route);
        return;
      }
      for (const road of graph.roadsByNode.get(here) ?? []) {
        if (route.roadIds.includes(road.id)) continue;
        walk({
          nodeIds: [...route.nodeIds, otherEnd(road, here)],
          roadIds: [...route.roadIds, road.id],
        });
      }
    };
    walk({ nodeIds: [level.startNodeId], roadIds: [] });

    expect(winners.length).toBe(14);
    expect(new Set(winners.map(routeKey)).size).toBe(6);
    expect(winningRouteCount(level)).toBe(6);
  });

  /*
   * Same rule as the Thursday Night Run, and for the same reason: a landmark
   * no winning route can reach is scenery with a name on it. The Flashes was
   * the one that nearly was.
   */
  it("puts every junction on at least one winning route", () => {
    const graph = graphFor(level);
    const reached = new Set<string>();
    const walk = (route: Route) => {
      const here = route.nodeIds[route.nodeIds.length - 1];
      if (route.roadIds.length > 0 && here === level.finishNodeId) {
        if (evaluateRoute(level, route).success) {
          for (const id of route.nodeIds) reached.add(id);
        }
        return;
      }
      for (const road of graph.roadsByNode.get(here) ?? []) {
        if (route.roadIds.includes(road.id)) continue;
        walk({
          nodeIds: [...route.nodeIds, otherEnd(road, here)],
          roadIds: [...route.roadIds, road.id],
        });
      }
    };
    walk({ nodeIds: [level.startNodeId], roadIds: [] });

    const stranded = level.nodes
      .map((node) => node.id)
      .filter((id) => !reached.has(id));
    expect(stranded).toEqual([]);
  });

  /*
   * Rank is roads minus junctions plus one. See the density note in the README
   * before adding a road here — this came in at 9 with 1,862 loops, and 8 is
   * where it settled once the east side stopped being a dead end.
   */
  it("stays inside the density budget", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(8);
    expect(rank).toBeLessThanOrEqual(9);
  });
});

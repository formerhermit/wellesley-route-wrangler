import { describe, expect, it } from "vitest";
import { thursleyCommon as level } from "../data/thursleyCommon";
import { graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
import { countSurface, evaluateRoute } from "./routeEvaluation";
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

/** 8.60 km: out over the boardwalk to the dragonflies, round by the wall. */
const perfect = routeOf(
  "moat-car-park",
  "moat-pond",
  "boardwalk",
  "pudmore",
  "hammer-pond",
  "atlantic-wall",
  "hankley-sands",
  "the-mire",
  "moat-car-park",
);

/** The same loop the other way round, which banks as the same route. */
const reversed = routeOf(
  "moat-car-park",
  "the-mire",
  "hankley-sands",
  "atlantic-wall",
  "hammer-pond",
  "pudmore",
  "boardwalk",
  "moat-pond",
  "moat-car-park",
);

/** Over the hill instead of straight down to the pond. */
const overTheHill = routeOf(
  "moat-car-park",
  "moat-pond",
  "boardwalk",
  "pudmore",
  "gibbet-view",
  "hammer-pond",
  "atlantic-wall",
  "hankley-sands",
  "moat-car-park",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Thursley Common", () => {
  it("is a loop from the Moat Pond car park", () => {
    expect(level.startNodeId).toBe("moat-car-park");
    expect(level.finishNodeId).toBe("moat-car-park");
  });

  it("passes a route that takes in all three", () => {
    const evaluation = evaluateRoute(level, perfect);
    expect(evaluation.success).toBe(true);
    expect(totalDistanceKm(level, perfect)).toBeCloseTo(8.6, 5);
  });

  it("banks the same loop run backwards as the same route", () => {
    expect(evaluateRoute(level, reversed).success).toBe(true);
    expect(routeKey(reversed)).toBe(routeKey(perfect));
  });

  it("passes the long way over Gibbet View", () => {
    expect(evaluateRoute(level, overTheHill).success).toBe(true);
    expect(routeKey(overTheHill)).not.toBe(routeKey(perfect));
  });

  it("fails a route that skips the boardwalk", () => {
    const route = routeOf(
      "moat-car-park",
      "the-mire",
      "hammer-pond",
      "atlantic-wall",
      "hankley-sands",
      "moat-car-park",
    );
    expect(titleFor(route)).toBe("You Came All This Way And Missed It");
  });

  /* Boardwalk and wall both taken in, and still no good: the dragonflies are
     the point of the place and the route went round the pond they live on. */
  it("fails a route that never finds a dragonfly", () => {
    const route = routeOf(
      "moat-car-park",
      "moat-pond",
      "boardwalk",
      "the-mire",
      "hammer-pond",
      "atlantic-wall",
      "hankley-sands",
      "moat-car-park",
    );
    expect(titleFor(route)).toBe("Not One Dragonfly");
  });

  it("fails a route that misses the wall", () => {
    const route = routeOf(
      "moat-car-park",
      "moat-pond",
      "boardwalk",
      "pudmore",
      "hammer-pond",
      "the-mire",
      "moat-car-park",
    );
    expect(titleFor(route)).toBe("The Wall Went Unvisited");
  });

  it("fails a route that goes round by the village on the lanes", () => {
    const route = routeOf(
      "moat-car-park",
      "moat-pond",
      "boardwalk",
      "pine-island",
      "elstead-green",
      "moat-pond",
      "moat-car-park",
    );
    expect(titleFor(route)).toBe("Out On The Lanes Again");
  });

  it("shuts the flooded bridleway", () => {
    const road = roadBetween(level, "moat-pond", "the-mire");
    expect(road?.closed).toBe(true);
    const route = routeOf("moat-car-park", "moat-pond", "the-mire", "moat-car-park");
    expect(titleFor(route)).toBe("The Bridleway Was Under Water");
  });

  it("keeps the village on tarmac, and therefore out of every legal run", () => {
    for (const id of ["elstead-green", "three-horseshoes"]) {
      const roads = level.roads.filter((r) => r.from === id || r.to === id);
      expect(roads.length).toBeGreaterThan(0);
      expect(roads.every((r) => (r.surface ?? "road") === "road")).toBe(true);
    }
  });

  it("counts the lanes as lanes", () => {
    expect(countSurface(level, perfect, "road")).toBe(0);
  });

  /*
   * The whole map, walked. Every loop out of the car park and back, held to
   * exactly the winners the level is designed around — six routes, twelve
   * journeys, because each of them works either way round.
   *
   * The route count is the one a player sees; the journey count is the
   * stricter check, since a level whose journeys move has certainly changed.
   */
  it("has exactly six winning routes, and twelve ways to run them", () => {
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

    expect(winners.length).toBe(12);
    expect(new Set(winners.map(routeKey)).size).toBe(6);
    expect(winningRouteCount(level)).toBe(6);
  });

  /*
   * Rank is roads minus junctions plus one, and it is the only thing on a map
   * that costs the player anything — the search grows exponentially in it. See
   * the density note in the README before adding a road here.
   */
  it("stays inside the density budget", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(9);
    expect(rank).toBeLessThanOrEqual(9);
  });
});

import { describe, expect, it } from "vitest";
import { tilfordRun as level } from "../data/tilfordRun";
import { emptyRoute, graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
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

/** 7.70 km: over the green, down the far bank, back over the bridge. */
const perfect = routeOf(
  "barley-mow",
  "cricket-green",
  "mosque",
  "paddling-spot",
  "river-bridge",
  "rooty-bit",
  "the-institute",
  "barley-mow",
);

/** The same loop the other way round, which is equally legal. */
const reversed = routeOf(
  "barley-mow",
  "the-institute",
  "rooty-bit",
  "river-bridge",
  "paddling-spot",
  "mosque",
  "cricket-green",
  "barley-mow",
);

/** 8.00 km, the long way over the hill and past the cows. */
const viaTheCows = routeOf(
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

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Tilford", () => {
  it("is a loop from the Barley Mow", () => {
    expect(level.startNodeId).toBe("barley-mow");
    expect(level.finishNodeId).toBe("barley-mow");
    expect(canRunRoute(level, perfect)).toBe(true);
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("wins in either direction, on tarmac-free trails", () => {
    expect(totalDistanceKm(level, perfect)).toBe(7.7);
    expect(totalDistanceKm(level, reversed)).toBe(7.7);
    expect(evaluateRoute(level, perfect).success).toBe(true);
    expect(evaluateRoute(level, reversed).success).toBe(true);
    expect(countSurface(level, perfect, "road")).toBe(0);
    expect(titleFor(perfect)).toBe("Textbook Tilford");
  });

  it("leaves the posh cows optional rather than compulsory", () => {
    // A winning route may take them in, and three of the four loops do not.
    expect(totalDistanceKm(level, viaTheCows)).toBe(8);
    expect(evaluateRoute(level, viaTheCows).success).toBe(true);
    expect(perfect.nodeIds).not.toContain("posh-cows");
    expect(
      level.objectives.some(
        (objective) =>
          objective.kind === "visit" && objective.nodeIds.includes("posh-cows"),
      ),
    ).toBe(false);
  });

  it("puts the village shop beyond any legal route", () => {
    // Every lane into the shop is tarmac, so a run that stays off the lanes
    // can never get to it. That is the joke, and it only works if it holds.
    const lanes = (graphFor(level).roadsByNode.get("village-shop") ?? []).map(
      (road) => road.surface ?? "road",
    );
    expect(lanes.length).toBeGreaterThan(0);
    expect(lanes.every((surface) => surface === "road")).toBe(true);
  });

  it("fails a route that nips along the lanes", () => {
    const throughTheVillage = routeOf(
      "barley-mow",
      "river-bridge",
      "paddling-spot",
      "cricket-green",
      "barley-mow",
    );
    expect(countSurface(level, throughTheVillage, "road")).toBe(1);
    expect(titleFor(throughTheVillage)).toBe("That Was A Village Amble");
  });

  it("fails a route that never crosses the river", () => {
    const sameSide = routeOf(
      "barley-mow",
      "cricket-green",
      "mosque",
      "paddling-spot",
      "hankley-hill",
      "posh-cows",
      "sandy-track",
      "rooty-bit",
      "the-institute",
      "barley-mow",
    );
    expect(titleFor(sameSide)).toBe("Same Side All Along");
  });

  it("fails a route that misses the ducks", () => {
    const noDucks = routeOf(
      "barley-mow",
      "the-institute",
      "river-bridge",
      "sandy-track",
      "posh-cows",
      "hankley-hill",
      "mosque",
      "cricket-green",
      "barley-mow",
    );
    expect(titleFor(noDucks)).toBe("The Ducks Were Not Consulted");
  });

  it("fails a route over the stepping stones", () => {
    const inTheRiver = routeOf(
      "barley-mow",
      "cricket-green",
      "paddling-spot",
      "posh-cows",
    );
    expect(titleFor(inTheRiver)).toBe("The Stepping Stones Are Under");
  });

  it("fails a group that stops at the paddling spot", () => {
    const stopped = routeOf(
      "barley-mow",
      "the-institute",
      "river-bridge",
      "paddling-spot",
    );
    expect(titleFor(stopped)).toBe("Everyone Is In The River");
  });

  it("fails a loop that comes up short", () => {
    const short = routeOf(
      "barley-mow",
      "cricket-green",
      "paddling-spot",
      "river-bridge",
      "the-institute",
      "barley-mow",
    );
    expect(totalDistanceKm(level, short)).toBe(5.2);
    expect(titleFor(short)).toBe("Straight To The Bar");
  });

  it("has eight winning routes and no more", () => {
    // Four loops, each runnable either way. Enumerated over every route that
    // leaves the pub and comes back without repeating a road.
    const graph = graphFor(level);
    let wins = 0;
    const walk = (route: Route) => {
      const end = route.nodeIds[route.nodeIds.length - 1];
      if (end === level.finishNodeId && route.roadIds.length > 0) {
        if (evaluateRoute(level, route).success) wins += 1;
        return;
      }
      for (const road of graph.roadsByNode.get(end) ?? []) {
        if (route.roadIds.includes(road.id)) continue;
        walk({
          nodeIds: [...route.nodeIds, otherEnd(road, end)],
          roadIds: [...route.roadIds, road.id],
        });
      }
    };
    walk(emptyRoute(level));
    expect(wins).toBe(8);
  });
});

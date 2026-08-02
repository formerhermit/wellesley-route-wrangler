import { describe, expect, it } from "vitest";
import { hawleyLake as level } from "../data/hawleyLake";
import { emptyRoute, graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
import { canRunRoute, evaluateRoute } from "./routeEvaluation";
import { buildIncidentReport } from "./incidentReport";
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

/** 9.20 km: the short lap, out through the woods and up to the Manor. */
const shortLap = routeOf(
  "sailing-centre",
  "hawley-woods",
  "minley-manor",
  "the-spit",
  "bird-bay",
  "hecking-sand",
  "the-mud-bath",
  "sailing-centre",
);

/** 10.30 km: the same ground with the portaloos and the gorse added. */
const longWayRound = routeOf(
  "sailing-centre",
  "hawley-woods",
  "the-portaloos",
  "gorse-corner",
  "the-mud-bath",
  "hecking-sand",
  "bird-bay",
  "the-spit",
  "minley-manor",
  "sailing-centre",
);

/** 11.30 km, with the one hill the brief allows. */
const overBeacon = routeOf(
  "sailing-centre",
  "minley-manor",
  "the-spit",
  "bird-bay",
  "hecking-sand",
  "the-mud-bath",
  "beacon-hill",
  "gorse-corner",
  "the-mud-bath",
  "sailing-centre",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Hawley Lake", () => {
  it("is a lap of the water from the Sailing Centre", () => {
    expect(level.startNodeId).toBe("sailing-centre");
    expect(level.finishNodeId).toBe("sailing-centre");
    expect(canRunRoute(level, shortLap)).toBe(true);
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("draws its lake from four bank junctions", () => {
    // Three or more shore junctions is what makes MapLandmarks draw water, so
    // the lake existing at all depends on this staying true.
    const bank = level.nodes.filter((node) => node.type === "shore");
    expect(bank.length).toBe(4);
    expect(bank.map((node) => node.id)).toEqual([
      "sailing-centre",
      "the-spit",
      "hecking-sand",
      "the-mud-bath",
    ]);
  });

  it("wins on the short lap and the long way round", () => {
    expect(totalDistanceKm(level, shortLap)).toBe(9.2);
    expect(totalDistanceKm(level, longWayRound)).toBe(10.3);
    expect(evaluateRoute(level, shortLap).success).toBe(true);
    expect(evaluateRoute(level, longWayRound).success).toBe(true);
    expect(titleFor(shortLap)).toBe("A Textbook Lap Of Hawley");
  });

  it("allows exactly one of the two epic hills", () => {
    expect(totalDistanceKm(level, overBeacon)).toBe(11.3);
    expect(evaluateRoute(level, overBeacon).success).toBe(true);

    const bothHills = routeOf(
      "sailing-centre",
      "the-spit",
      "bird-bay",
      "hecking-sand",
      "cricket-hill",
      "beacon-hill",
      "gorse-corner",
      "the-portaloos",
      "hawley-woods",
      "minley-manor",
      "sailing-centre",
    );
    expect(titleFor(bothHills)).toBe("Both Hills. In One Evening.");
  });

  it("counts ducks rather than pigeons", () => {
    expect(level.flock).toBe("duck");
    const report = buildIncidentReport(
      level,
      shortLap,
      evaluateRoute(level, shortLap),
    );
    expect(report.lines.map((line) => line.label)).toContain("Unexpected ducks");
  });

  it("keeps the goose at Bird Bay", () => {
    expect(level.followers?.map((one) => [one.kind, one.nodeId])).toEqual([
      ["goose", "bird-bay"],
    ]);
  });

  it("fails a route down the range road", () => {
    const throughTheRange = routeOf(
      "sailing-centre",
      "the-spit",
      "bird-bay",
      "mod-gate",
      "cricket-hill",
    );
    expect(titleFor(throughTheRange)).toBe("That Range Road Is Shut");
  });

  it("fails a route that misses the Manor", () => {
    const noManor = routeOf(
      "sailing-centre",
      "the-spit",
      "bird-bay",
      "hecking-sand",
      "the-mud-bath",
      "gorse-corner",
      "the-portaloos",
      "hawley-woods",
      "sailing-centre",
    );
    expect(titleFor(noManor)).toBe("The Manor Went Unseen");
  });

  it("fails a route that never reaches the birds", () => {
    const noBirds = routeOf(
      "sailing-centre",
      "minley-manor",
      "hawley-woods",
      "the-portaloos",
      "gorse-corner",
      "the-mud-bath",
      "sailing-centre",
    );
    expect(titleFor(noBirds)).toBe("The Birds Were Not Greeted");
  });

  it("fails a lap that only saw one end of the lake", () => {
    // Everything the brief asks for, in 8 km, by cutting out the west side.
    const short = routeOf(
      "sailing-centre",
      "minley-manor",
      "the-spit",
      "bird-bay",
      "hecking-sand",
      "the-mud-bath",
      "sailing-centre",
    );
    expect(totalDistanceKm(level, short)).toBe(8);
    expect(titleFor(short)).toBe("You Saw One End Of It");
  });

  it("has four winning routes, run ten ways", () => {
    // Both numbers are asserted. The journeys are the stricter check — a road
    // whose distance drifts moves them — but the routes are what a player is
    // told there is to find, and the two can move independently.
    const graph = graphFor(level);
    const shapes = new Set<string>();
    let wins = 0;
    const walk = (route: Route) => {
      const end = route.nodeIds[route.nodeIds.length - 1];
      if (end === level.finishNodeId && route.roadIds.length > 0) {
        if (evaluateRoute(level, route).success) {
          wins += 1;
          shapes.add(routeKey(route));
        }
        return;
      }
      if (route.roadIds.length > 16) return;
      for (const road of graph.roadsByNode.get(end) ?? []) {
        if (route.roadIds.includes(road.id)) continue;
        walk({
          nodeIds: [...route.nodeIds, otherEnd(road, end)],
          roadIds: [...route.roadIds, road.id],
        });
      }
    };
    walk(emptyRoute(level));
    expect(wins).toBe(10);
    expect(shapes.size).toBe(winningRouteCount(level));
    expect(shapes.size).toBe(4);
  });
});

import { describe, expect, it } from "vitest";
import { spookyRun as level } from "../data/spookyRun";
import { thursdayTownRun } from "../data/thursdayTownRun";
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

/** 6.60 km, spending the one hill on Redan Road. */
const overRedan = routeOf(
  "observatory",
  "wellesley-rumble",
  "spooky-church",
  "redan-road",
  "cemetery",
  "municipal-gardens",
  "town-centre",
  "dark-alley",
  "hospital-hill",
  "medical-centre",
  "observatory",
);

/** 7.00 km, spending it on the ski slope instead. */
const overTheSkiSlope = routeOf(
  "observatory",
  "medical-centre",
  "hospital-hill",
  "dark-alley",
  "ski-slope",
  "town-centre",
  "municipal-gardens",
  "medical-centre",
  "wellesley-rumble",
  "spooky-church",
  "observatory",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Spooky Run", () => {
  it("is the town map after dark, with its own light, birds and music", () => {
    expect(level.mood).toBe("dusk");
    expect(level.flock).toBe("crow");
    expect(level.music).toBe("halloween-theme.mp3");
  });

  it("has lost the Big Tesco and the Duke, and every road off them", () => {
    const ids = new Set(level.nodes.map((node) => node.id));
    expect(ids.has("big-tesco")).toBe(false);
    expect(ids.has("wellington-statue")).toBe(false);
    for (const road of level.roads) {
      expect([road.from, road.to]).not.toContain("big-tesco");
      expect([road.from, road.to]).not.toContain("wellington-statue");
    }
    // Still recognisably the same town, though.
    const town = new Set(thursdayTownRun.nodes.map((node) => node.id));
    const kept = level.nodes.filter((node) => town.has(node.id));
    expect(kept.length).toBeGreaterThanOrEqual(9);
  });

  it("stands the church between Wellesley Rumble and Redan Road", () => {
    expect(roadBetween(level, "wellesley-rumble", "spooky-church")).toBeDefined();
    expect(roadBetween(level, "spooky-church", "redan-road")).toBeDefined();
    // The old road straight between the two is gone: the church is on it now.
    expect(roadBetween(level, "wellesley-rumble", "redan-road")).toBeUndefined();
  });

  it("wins over either hill", () => {
    expect(totalDistanceKm(level, overRedan)).toBe(6.6);
    expect(totalDistanceKm(level, overTheSkiSlope)).toBe(7);
    expect(evaluateRoute(level, overRedan).success).toBe(true);
    expect(evaluateRoute(level, overTheSkiSlope).success).toBe(true);
    expect(titleFor(overRedan)).toBe("A Properly Spooky Run");
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("counts crows rather than pigeons in the paperwork", () => {
    const report = buildIncidentReport(
      level,
      overRedan,
      evaluateRoute(level, overRedan),
    );
    const labels = report.lines.map((line) => line.label);
    expect(labels).toContain("Unexpected crows");
    expect(labels).not.toContain("Unexpected pigeons");
  });

  it("fails a route into the trick or treaters", () => {
    const swarmed = routeOf(
      "observatory",
      "medical-centre",
      "hospital-hill",
      "sweet-street",
    );
    expect(titleFor(swarmed)).toBe("Surrounded By Small Witches");
  });

  it("fails a route over both hills", () => {
    const bothHills = routeOf(
      "observatory",
      "wellesley-rumble",
      "spooky-church",
      "redan-road",
      "cemetery",
      "ski-slope",
      "town-centre",
      "municipal-gardens",
      "medical-centre",
      "observatory",
    );
    expect(titleFor(bothHills)).toBe("Two Hills. In The Dark.");
  });

  it("fails a route that avoids the church", () => {
    const noChurch = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "municipal-gardens",
      "town-centre",
      "dark-alley",
      "hospital-hill",
      "medical-centre",
      "observatory",
    );
    expect(titleFor(noChurch)).toBe("The Church Went Unvisited");
  });

  it("fails a route that never reaches the town centre", () => {
    const noTown = routeOf(
      "observatory",
      "spooky-church",
      "redan-road",
      "cemetery",
      "municipal-gardens",
      "medical-centre",
      "observatory",
    );
    expect(titleFor(noTown)).toBe("You Skipped the Town");
  });

  it("fails a route through the closure", () => {
    const throughTheFence = routeOf(
      "observatory",
      "medical-centre",
      "hospital-hill",
      "town-centre",
    );
    expect(titleFor(throughTheFence)).toBe("The Town Centre Was Still Dug Up");
  });

  it("fails a loop that comes up short", () => {
    const short = routeOf(
      "observatory",
      "spooky-church",
      "redan-road",
      "municipal-gardens",
      "town-centre",
      "dark-alley",
      "hospital-hill",
      "medical-centre",
      "observatory",
    );
    expect(totalDistanceKm(level, short)).toBe(5.9);
    expect(titleFor(short)).toBe("Home Before The Streetlights");
  });

  it("has four winning routes, run ten ways, over both hills", () => {
    // Both numbers are asserted. The journeys are the stricter check — a road
    // whose distance drifts moves them — but the routes are what a player is
    // told there is to find, and the two can move independently.
    const graph = graphFor(level);
    const wins: string[] = [];
    const routes = new Map<string, string[]>();
    const walk = (route: Route) => {
      const end = route.nodeIds[route.nodeIds.length - 1];
      if (end === level.finishNodeId && route.roadIds.length > 0) {
        if (evaluateRoute(level, route).success) {
          wins.push(route.nodeIds.join(">"));
          routes.set(routeKey(route), route.nodeIds);
        }
        return;
      }
      if (route.roadIds.length > 14) return;
      for (const road of graph.roadsByNode.get(end) ?? []) {
        if (route.roadIds.includes(road.id)) continue;
        walk({
          nodeIds: [...route.nodeIds, otherEnd(road, end)],
          roadIds: [...route.roadIds, road.id],
        });
      }
    };
    walk(emptyRoute(level));

    expect(wins.length).toBe(10);
    expect(routes.size).toBe(winningRouteCount(level));
    expect(routes.size).toBe(4);

    // Neither hill is the only way round: the choice is real. Counted over
    // routes rather than journeys, since that is what the club is hunting —
    // and it is a thinner split that way, three against one.
    const over = (hill: string) =>
      [...routes.values()].filter((nodeIds) => nodeIds.includes(hill)).length;
    expect(over("redan-road")).toBe(3);
    expect(over("ski-slope")).toBe(1);
  });
});

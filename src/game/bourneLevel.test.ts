import { describe, expect, it } from "vitest";
import { bourneWood as level } from "../data/bourneWood";
import { levels } from "../data/levels";
import { LANDMARK_BOX, SCATTER_BOX } from "./landmarks";
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

/** The long way round, because the short way in is somebody's film set. */
const theLongWayRound = routeOf(
  "bourne-car-park",
  "the-searchlight",
  "lower-bourne",
  "unit-base",
  "moor-park",
  "mother-ludlams-cave",
  "waverley-abbey",
  "farnham-heath",
  "the-barrows",
  "the-promontory",
  "the-clearing",
  "bourne-car-park",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

const walkHome = (): Route[] => {
  const graph = graphFor(level);
  const home: Route[] = [];
  const walk = (route: Route) => {
    const here = route.nodeIds[route.nodeIds.length - 1];
    if (route.roadIds.length > 0 && here === level.finishNodeId) {
      home.push(route);
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
  return home;
};

describe("Bourne Wood", () => {
  it("starts and finishes in the forest car park", () => {
    expect(level.startNodeId).toBe("bourne-car-park");
    expect(level.finishNodeId).toBe("bourne-car-park");
  });

  it("is an ordinary Sunday, whatever is being filmed", () => {
    expect(level.mood).toBeUndefined();
    expect(level.flock).toBeUndefined();
    expect(level.music).toBeUndefined();
    expect(level.field).toBeUndefined();
  });

  it("gets round the long way", () => {
    expect(evaluateRoute(level, theLongWayRound).success).toBe(true);
    expect(totalDistanceKm(level, theLongWayRound)).toBeCloseTo(9.8, 5);
  });

  /*
   * The whole puzzle. The short track from Unit Base into the Clearing is the
   * obvious way in and it is shut, so the Clearing has to be reached from the
   * far side — which is what makes an otherwise gentle map worth planning.
   */
  it("shuts the short way into the clearing", () => {
    const road = roadBetween(level, "unit-base", "the-clearing");
    expect(road?.closed).toBe(true);
    const through = routeOf(
      "bourne-car-park",
      "lower-bourne",
      "unit-base",
      "the-clearing",
      "bourne-car-park",
    );
    expect(titleFor(through)).toBe("You Are In The Shot");
  });

  it("fails a route that never reaches the clearing", () => {
    const route = routeOf(
      "bourne-car-park",
      "lower-bourne",
      "unit-base",
      "moor-park",
      "mother-ludlams-cave",
      "waverley-abbey",
      "farnham-heath",
      "the-barrows",
      "the-promontory",
      "rowledge",
      "bourne-car-park",
    );
    expect(route.nodeIds).not.toContain("the-clearing");
    expect(titleFor(route)).toBe("Ran Past Rome Entirely");
  });

  it("fails a route that never reaches the abbey", () => {
    // Round the west side and home. Short as well as abbey-less, and `visit`
    // outranks `distance`, so it is the abbey that names the failure.
    const route = routeOf(
      "bourne-car-park",
      "rowledge",
      "the-promontory",
      "the-barrows",
      "farnham-heath",
      "the-clearing",
      "bourne-car-park",
    );
    expect(route.nodeIds).not.toContain("waverley-abbey");
    expect(titleFor(route)).toBe("Nine Hundred Years, Ignored");
  });

  /* The Frensham rule: two objectives that cannot fail apart are one rule. */
  it("lets its two waypoints fail independently", () => {
    const home = walkHome();
    expect(
      home.filter(
        (r) => r.nodeIds.includes("the-clearing") && !r.nodeIds.includes("waverley-abbey"),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      home.filter(
        (r) => !r.nodeIds.includes("the-clearing") && r.nodeIds.includes("waverley-abbey"),
      ).length,
    ).toBeGreaterThan(0);
  });

  it("has exactly six winning routes", () => {
    const winners = walkHome().filter((r) => evaluateRoute(level, r).success);
    expect(new Set(winners.map(routeKey)).size).toBe(6);
    expect(winningRouteCount(level)).toBe(6);
    for (const winner of winners) {
      expect(totalDistanceKm(level, winner)).toBeGreaterThanOrEqual(9.5);
      expect(totalDistanceKm(level, winner)).toBeLessThanOrEqual(11);
    }
  });

  /* A landmark no winner reaches is scenery with a name on it. */
  it("puts every junction on at least one winning route", () => {
    const winners = walkHome().filter((r) => evaluateRoute(level, r).success);
    const reached = new Set(winners.flatMap((r) => r.nodeIds));
    expect(
      level.nodes.map((node) => node.id).filter((id) => !reached.has(id)),
    ).toEqual([]);
  });

  /*
   * The sparsest map on the roster, and deliberately so: it comes straight
   * after Crooksbury, which added a whole new objective, and this one adds
   * none. Rank 6 against a usual 7 to 9 — the density note in the README is
   * about the cost of searching, and under the range is never the problem.
   */
  it("is the plain one", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(6);
    expect(level.objectives.map((one) => one.kind)).toEqual([
      "start",
      "finish",
      "distance",
      "visit",
      "visit",
      "avoid-closed",
    ]);
  });
});

describe("the film unit", () => {
  it("brings drawings nothing else on the roster has", () => {
    const mine = ["filmset", "filmunit", "barrow", "cave", "searchlight"];
    for (const kind of mine) {
      expect(LANDMARK_BOX[kind as keyof typeof LANDMARK_BOX], kind).toBeDefined();
      // Only this level uses them, so a stray one elsewhere is a mistake.
      const users = levels.filter((one) =>
        one.nodes.some((node) => (node.sprite ?? node.type) === kind),
      );
      expect(users.map((one) => one.id), kind).toEqual(["bourne-wood"]);
    }
  });

  it("measures its scenery, rather than guessing at it (#110)", () => {
    for (const kind of ["unittruck", "clapperboard", "directorchair"]) {
      expect(SCATTER_BOX[kind], kind).toBeDefined();
    }
    // The truck is the widest thing the level puts down by hand, and the whole
    // point of the box table is that the test knows that.
    expect(SCATTER_BOX.unittruck[1] - SCATTER_BOX.unittruck[0]).toBeGreaterThan(40);
  });

  it("parks the trucks on the hard ground, which is why it is drawn", () => {
    const patch = (level.ground ?? []).find((one) => one.x > 300);
    expect(patch).toBeDefined();
    const trucks = (level.scatter ?? []).filter((one) => one.kind === "unittruck");
    expect(trucks.length).toBeGreaterThan(1);
  });
});

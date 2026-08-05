import { describe, expect, it } from "vitest";
import { farnboroughHalf as level } from "../data/farnboroughHalf";
import { levels } from "../data/levels";
import { cabinetFor } from "./achievements";
import { emptyRecords, recordRun } from "./records";
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

/** The course: one anti-clockwise lap of the airfield, and 21.10 km of it. */
const theCourse = routeOf(
  "airship-hangars",
  "elles-road",
  "ively-road",
  "cody-park",
  "pyestock-wood",
  "miles-hill",
  "aerospace-centre",
  "danger-hill",
  "cockadobby-hill",
  "airship-hangars",
);

/** The same lap the other way round, which banks as the same route. */
const clockwise = routeOf(
  "airship-hangars",
  "cockadobby-hill",
  "danger-hill",
  "aerospace-centre",
  "miles-hill",
  "pyestock-wood",
  "cody-park",
  "ively-road",
  "elles-road",
  "airship-hangars",
);

/** Out through the station and Cove Green instead of straight along the top. */
const throughTown = routeOf(
  "airship-hangars",
  "farnborough-main",
  "cove-green",
  "elles-road",
  "ively-road",
  "cody-park",
  "pyestock-wood",
  "miles-hill",
  "aerospace-centre",
  "danger-hill",
  "cockadobby-hill",
  "airship-hangars",
);

/** And round Southwood instead of down Elles Road. */
const roundSouthwood = routeOf(
  "airship-hangars",
  "elles-road",
  "southwood",
  "ively-road",
  "cody-park",
  "pyestock-wood",
  "miles-hill",
  "aerospace-centre",
  "danger-hill",
  "cockadobby-hill",
  "airship-hangars",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("the Farnborough Winter Half", () => {
  it("starts and finishes under the arch", () => {
    expect(level.startNodeId).toBe("airship-hangars");
    expect(level.finishNodeId).toBe("airship-hangars");
  });

  /*
   * The Winter Half is in February, so this is the one level that wears the
   * Christmas Run's frost without being Christmas, and the only one outside
   * the seasonal editions with a track of its own. `flock` stays unset: the
   * birds are pigeons like anywhere else.
   */
  it("is frosty and has its own music, because it is a race", () => {
    expect(level.mood).toBe("frost");
    expect(level.music).toBe("race-theme.mp3");
    expect(level.flock).toBeUndefined();
  });

  it("measures 21.1 km, because that is what a half marathon is", () => {
    expect(totalDistanceKm(level, theCourse)).toBeCloseTo(21.1, 5);
    expect(evaluateRoute(level, theCourse).success).toBe(true);
  });

  it("banks the lap run the other way as the same route", () => {
    expect(evaluateRoute(level, clockwise).success).toBe(true);
    expect(routeKey(clockwise)).toBe(routeKey(theCourse));
  });

  /*
   * The point of the map. There is more than one legal way round and every one
   * of them comes to exactly the same distance, which is what having a course
   * measured actually buys you.
   */
  it("measures every legal way round at exactly the same distance", () => {
    for (const route of [theCourse, throughTown, roundSouthwood]) {
      expect(evaluateRoute(level, route).success).toBe(true);
      expect(totalDistanceKm(level, route)).toBeCloseTo(21.1, 5);
    }
    expect(routeKey(throughTown)).not.toBe(routeKey(theCourse));
    expect(routeKey(roundSouthwood)).not.toBe(routeKey(theCourse));
  });

  it("fails a lap that cut the corner off Cody", () => {
    const route = routeOf(
      "airship-hangars",
      "elles-road",
      "ively-road",
      "cody-park",
      "miles-hill",
      "aerospace-centre",
      "danger-hill",
      "cockadobby-hill",
      "airship-hangars",
    );
    expect(titleFor(route)).toBe("Coned Off, And You Know Why");
  });

  it("shuts the way from the station back onto the airfield", () => {
    const road = roadBetween(level, "farnborough-main", "elles-road");
    expect(road?.closed).toBe(true);
  });

  it("fails a route that never goes round Cody", () => {
    const route = routeOf(
      "airship-hangars",
      "farnborough-main",
      "cove-green",
      "southwood",
      "ively-road",
      "elles-road",
      "airship-hangars",
    );
    expect(titleFor(route)).toBe("Half A Lap Of An Airfield");
  });

  it("fails a lap of the town, which is nowhere near far enough", () => {
    const route = routeOf(
      "airship-hangars",
      "farnborough-main",
      "cove-green",
      "elles-road",
      "airship-hangars",
    );
    // Both waypoints missed, and `visit` outranks distance — Cody is declared
    // first, so it is Cody that names the failure.
    expect(totalDistanceKm(level, route)).toBeCloseTo(8.8, 5);
    expect(titleFor(route)).toBe("Half A Lap Of An Airfield");
  });

  it("fails a lap and a bit", () => {
    const route = routeOf(
      "airship-hangars",
      "farnborough-main",
      "cove-green",
      "southwood",
      "elles-road",
      "ively-road",
      "cody-park",
      "pyestock-wood",
      "miles-hill",
      "aerospace-centre",
      "danger-hill",
      "cockadobby-hill",
      "airship-hangars",
    );
    expect(totalDistanceKm(level, route)).toBeCloseTo(22.5, 5);
    expect(titleFor(route)).toBe("Your Watch Will Say Otherwise");
  });

  /*
   * The whole map, walked. Four routes and eight journeys — every one of them
   * works either way round, and there is not a single winner at any distance
   * but 21.1.
   */
  it("has exactly four winning routes, all of them 21.1 km", () => {
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

    expect(winners.length).toBe(8);
    expect(new Set(winners.map(routeKey)).size).toBe(4);
    expect(winningRouteCount(level)).toBe(4);
    for (const winner of winners) {
      expect(totalDistanceKm(level, winner)).toBeCloseTo(21.1, 5);
    }
  });

  /* Same rule as the last two maps: a landmark no winner reaches is scenery
     with a name on it. */
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

  it("stays inside the density budget", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(7);
    expect(rank).toBeLessThanOrEqual(9);
  });
});

/*
 * A measured 21.1 km race is the opposite of an accidental long run (#119).
 * The badge used to test distance alone, so every legal lap of this course
 * awarded "The Unexpected Long Run" — on the one level where the distance was
 * printed on the entry form.
 */
describe("the badge it must not hand out", () => {
  it("is not an accidental long run at twenty-one kilometres", () => {
    const records = recordRun(emptyRecords, level, theCourse);
    const badge = cabinetFor(records, levels).find(
      (one) => one.id === "unexpected-long-run",
    )!;
    expect(totalDistanceKm(level, theCourse)).toBeGreaterThan(13);
    expect(badge.earned).toBe(false);
  });

  /* But a Thursday that ran to thirteen still is, which is the joke. */
  it("still fires on a run that was advertised as five", () => {
    const short = levels.find((one) => one.id === "thursday-social-run")!;
    const brief = short.objectives.find((one) => one.kind === "distance");
    expect(brief?.kind === "distance" && brief.maxKm).toBeLessThan(13);
  });
});

describe("the badge for running it", () => {
  const badgeFor = (records: Parameters<typeof cabinetFor>[0]) =>
    cabinetFor(records, levels).find((entry) => entry.id === "thirteen-point-one")!;

  it("is not won by simply owning the game", () => {
    expect(badgeFor(emptyRecords).earned).toBe(false);
  });

  it("is won by finishing the race", () => {
    const records = recordRun(emptyRecords, level, theCourse);
    expect(badgeFor(records).earned).toBe(true);
  });

  /*
   * The one thing a level badge must not do: hand itself out for turning up.
   * A run that missed the brief is logged in the book exactly like a winner,
   * so the test has to ask whether it *won* and not whether it happened.
   */
  it("is not won by a lap of the town", () => {
    const short = routeOf(
      "airship-hangars",
      "farnborough-main",
      "cove-green",
      "elles-road",
      "airship-hangars",
    );
    const records = recordRun(emptyRecords, level, short);
    expect(badgeFor(records).earned).toBe(false);
  });
});

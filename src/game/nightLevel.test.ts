import { describe, expect, it } from "vitest";
import { thursdayNightRun as level } from "../data/thursdayNightRun";
import { graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
import { countNodeType, evaluateRoute } from "./routeEvaluation";
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

/** 8.70 km: up Claycart, across the plain, and home down the Fleet road. */
const perfect = routeOf(
  "wellington-statue",
  "claycart-bottom",
  "banger-track",
  "eelmoor-plain",
  "laffans-plain",
  "puckridge-hill",
  "puckridge-car-park",
  "wharf-copse",
  "wellington-statue",
);

/** The same loop the other way round, which banks as the same route. */
const reversed = routeOf(
  "wellington-statue",
  "wharf-copse",
  "puckridge-car-park",
  "puckridge-hill",
  "laffans-plain",
  "eelmoor-plain",
  "banger-track",
  "claycart-bottom",
  "wellington-statue",
);

/** 10.90 km: out through the plantation first, which is the long way round. */
const throughTheWoods = routeOf(
  "wellington-statue",
  "firs-hill",
  "jubilee-plantation",
  "long-valley",
  "eelmoor-plain",
  "banger-track",
  "rushmoor-arena",
  "puckridge-hill",
  "puckridge-car-park",
  "wharf-copse",
  "wellington-statue",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Thursday Night Run", () => {
  it("is a loop from the Wellington Statue", () => {
    expect(level.startNodeId).toBe("wellington-statue");
    expect(level.finishNodeId).toBe("wellington-statue");
  });

  /*
   * It is a Thursday, not an occasion. `mood`, `flock` and `music` are the
   * Halloween and Christmas kit between them, and a draft that reached for
   * dusk and crows read as a second Spooky Run rather than as a normal week.
   */
  it("runs in daylight, on the house theme, with the usual pigeons", () => {
    expect(level.mood).toBeUndefined();
    expect(level.flock).toBeUndefined();
    expect(level.music).toBeUndefined();
  });

  it("passes the run the club actually does", () => {
    expect(evaluateRoute(level, perfect).success).toBe(true);
    expect(totalDistanceKm(level, perfect)).toBeCloseTo(8.7, 5);
  });

  it("banks the same loop run backwards as the same route", () => {
    expect(evaluateRoute(level, reversed).success).toBe(true);
    expect(routeKey(reversed)).toBe(routeKey(perfect));
  });

  it("passes the long way home through the plantation", () => {
    expect(evaluateRoute(level, throughTheWoods).success).toBe(true);
    expect(totalDistanceKm(level, throughTheWoods)).toBeCloseTo(10.9, 5);
  });

  it("fails a route that never goes past the bangers", () => {
    const route = routeOf(
      "wellington-statue",
      "firs-hill",
      "jubilee-plantation",
      "long-valley",
      "eelmoor-plain",
      "laffans-plain",
      "puckridge-hill",
      "puckridge-car-park",
      "wharf-copse",
      "wellington-statue",
    );
    // Right length, one hotspot, nothing shut: the track is all that is wrong.
    expect(totalDistanceKm(level, route)).toBeCloseTo(9.7, 5);
    expect(titleFor(route)).toBe("You Missed The Bangers");
  });

  it("fails a route that never gets as far as Puckridge", () => {
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "banger-track",
      "rushmoor-arena",
      "wharf-copse",
      "wellington-statue",
    );
    expect(titleFor(route)).toBe("Puckridge Went Unvisited");
  });

  /*
   * The squeeze the level is built on. Both ways north out of the banger track
   * go through a hotspot — Rushmoor Arena on one side, Laffan's Plain on the
   * other — so every legal run disturbs exactly one, and a route greedy enough
   * to take both in is the commonest way to lose here.
   */
  it("fails a route that puts up both flocks", () => {
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "banger-track",
      "rushmoor-arena",
      "puckridge-hill",
      "laffans-plain",
      "eelmoor-plain",
      "long-valley",
      "jubilee-plantation",
      "firs-hill",
      "wellington-statue",
    );
    expect(countNodeType(level, route, "pigeon")).toBe(2);
    expect(titleFor(route)).toBe("The Whole Heath Went Up");
  });

  it("shuts the Long Valley crossing, because the range is live", () => {
    const road = roadBetween(level, "banger-track", "long-valley");
    expect(road?.closed).toBe(true);
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "banger-track",
      "long-valley",
      "jubilee-plantation",
      "firs-hill",
      "wellington-statue",
    );
    expect(titleFor(route)).toBe("The Flags Were Up");
  });

  it("fails a loop that met the brief and came home short", () => {
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "banger-track",
      "rushmoor-arena",
      "puckridge-hill",
      "puckridge-car-park",
      "wharf-copse",
      "wellington-statue",
    );
    expect(totalDistanceKm(level, route)).toBeCloseTo(7.5, 5);
    expect(titleFor(route)).toBe("Barely Off The Tarmac");
  });

  it("fails a loop that met the brief and went too far", () => {
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "firs-hill",
      "jubilee-plantation",
      "long-valley",
      "eelmoor-plain",
      "banger-track",
      "rushmoor-arena",
      "puckridge-hill",
      "puckridge-car-park",
      "wharf-copse",
      "wellington-statue",
    );
    expect(totalDistanceKm(level, route)).toBeCloseTo(11.5, 5);
    expect(titleFor(route)).toBe("Accidental Recce");
  });

  /* Both waypoints reached, so nothing outranks the fact that they are still
     standing in it. */
  it("says so when the group stops in the car park", () => {
    const route = routeOf(
      "wellington-statue",
      "claycart-bottom",
      "banger-track",
      "rushmoor-arena",
      "puckridge-hill",
      "puckridge-car-park",
    );
    expect(titleFor(route)).toBe("Nobody Left The Car Park");
  });

  /*
   * The whole map, walked. Five routes and twelve journeys — three of the five
   * work either way round and bank once, and the other two pass through Wharf
   * Copse twice, which the walk counts separately and the book does not.
   */
  it("has exactly five winning routes, and twelve ways to run them", () => {
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
    expect(new Set(winners.map(routeKey)).size).toBe(5);
    expect(winningRouteCount(level)).toBe(5);
  });

  /*
   * Every junction earns its place. A landmark no winning route can reach is
   * scenery with a name on it, and this map came within one road of having
   * three of them — the plantation, Long Valley and Firs Hill were all cut out
   * by a chord that the distance window then made compulsory.
   *
   * Not a rule for the roster: Tilford's Village Shop and Thursley's Elstead
   * Green are deliberately unreachable and are the better for it. It is a rule
   * for this map, where nothing was meant to be out of bounds.
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
   * Rank is roads minus junctions plus one, and it is the only thing on a map
   * that costs the player anything. See the density note in the README before
   * adding a road here — this one came in at 9 and 2,638 loops, and two roads
   * that enabled no winning route at all were what made the difference.
   */
  it("stays inside the density budget", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(7);
    expect(rank).toBeLessThanOrEqual(9);
  });
});

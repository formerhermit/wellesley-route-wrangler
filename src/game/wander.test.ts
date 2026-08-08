import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import { roadById, selectNode } from "./routeGraph";
import { canWander, wanderRoll, wanderRoute } from "./wander";
import type { Level, Route } from "./types";

/** Lay a route by walking junctions, the way the player would. */
function routeThrough(level: Level, labels: string[]): Route {
  let route: Route = { nodeIds: [level.startNodeId], roadIds: [] };
  for (const id of labels) {
    const outcome = selectNode(level, route, id);
    if (outcome.kind === "rejected") {
      throw new Error(`cannot get to ${id}: ${outcome.reason}`);
    }
    route = outcome.route;
  }
  return route;
}

/** A loop of level 1 with plenty of junctions to go wrong at. */
const socialLoop = routeThrough(thursdaySocialRun, [
  "polo-fields",
  "geese-pond",
  "towpath",
  "medical-centre",
  "wellesley-rumble",
  "observatory",
]);

/**
 * A walk is only a walk if each junction is joined to the last by the road
 * claimed between them. Everything downstream — the drawn path, the pigeon
 * milestones, the pace — believes this without checking.
 */
function isAWalk(level: Level, route: Route): boolean {
  if (route.roadIds.length !== route.nodeIds.length - 1) return false;
  return route.roadIds.every((roadId, index) => {
    const road = roadById(level, roadId);
    const from = route.nodeIds[index];
    const to = route.nodeIds[index + 1];
    return (
      (road.from === from && road.to === to) ||
      (road.to === from && road.from === to)
    );
  });
}

describe("going wrong", () => {
  it("is still a walk somebody could physically do", () => {
    const lost = wanderRoute(thursdaySocialRun, socialLoop, 0.4);
    expect(isAWalk(thursdaySocialRun, lost)).toBe(true);
  });

  it("goes wrong somewhere on a map with somewhere to go wrong", () => {
    const lost = wanderRoute(thursdaySocialRun, socialLoop, 0.4);
    expect(lost.roadIds.length).toBeGreaterThan(socialLoop.roadIds.length);
  });

  it("starts and finishes exactly where the route did", () => {
    for (const roll of [0, 0.2, 0.5, 0.77, 0.99]) {
      const lost = wanderRoute(thursdaySocialRun, socialLoop, roll);
      expect(lost.nodeIds[0]).toBe(socialLoop.nodeIds[0]);
      expect(lost.nodeIds.at(-1)).toBe(socialLoop.nodeIds.at(-1));
    }
  });

  /*
   * The detours are inserted, never substituted: the group still gets round
   * everything the player asked for, which is what lets the run be judged on
   * the route while being drawn as the wander.
   */
  it("still goes everywhere the route went, in order", () => {
    const lost = wanderRoute(thursdaySocialRun, socialLoop, 0.4);
    let at = 0;
    for (const id of lost.nodeIds) {
      if (id === socialLoop.nodeIds[at]) at += 1;
    }
    expect(at).toBe(socialLoop.nodeIds.length);
  });

  it("never runs through a closure", () => {
    for (const roll of [0, 0.15, 0.33, 0.61, 0.88]) {
      const lost = wanderRoute(thursdaySocialRun, socialLoop, roll);
      for (const id of lost.roadIds) {
        expect(roadById(thursdaySocialRun, id).closed ?? false).toBe(false);
      }
    }
  });

  it("turns round rather than pressing on", () => {
    // Every wrong turning is the same road twice: out, and straight back.
    const lost = wanderRoute(thursdaySocialRun, socialLoop, 0.4);
    const twice = lost.roadIds.filter(
      (id, index) => lost.roadIds[index + 1] === id,
    );
    expect(twice.length).toBeGreaterThan(0);
  });

  it("gets lost the same way every time on the same route", () => {
    const roll = wanderRoll(socialLoop);
    const once = wanderRoute(thursdaySocialRun, socialLoop, roll);
    const twice = wanderRoute(thursdaySocialRun, socialLoop, roll);
    expect(once.nodeIds).toEqual(twice.nodeIds);
    expect(once.roadIds).toEqual(twice.roadIds);
    // And a different route is a different mess.
    const shorter = routeThrough(thursdaySocialRun, [
      "wellesley-rumble",
      "observatory",
    ]);
    expect(wanderRoll(shorter)).not.toBe(roll);
  });

  it("hands back an unstarted route untouched", () => {
    const empty: Route = {
      nodeIds: [thursdaySocialRun.startNodeId],
      roadIds: [],
    };
    expect(wanderRoute(thursdaySocialRun, empty, 0.5)).toBe(empty);
  });

  it("leaves the route the player laid alone", () => {
    const before = { ...socialLoop };
    wanderRoute(thursdaySocialRun, socialLoop, 0.4);
    expect(socialLoop.nodeIds).toEqual(before.nodeIds);
    expect(socialLoop.roadIds).toEqual(before.roadIds);
  });

  /*
   * The card asks this of the map before the player has drawn anything, so
   * it has to be answerable from the map alone — and it has to be true, or
   * the card is dealt onto a map where it visibly does nothing.
   */
  it("knows which maps have anywhere to go wrong", () => {
    for (const level of levels) {
      expect(canWander(level), level.title).toBe(true);
    }
    // A map that is one road from start to finish has nowhere to blunder.
    const corridor: Level = {
      ...thursdaySocialRun,
      nodes: thursdaySocialRun.nodes.slice(0, 2),
      roads: [
        {
          id: "only-road",
          from: thursdaySocialRun.nodes[0].id,
          to: thursdaySocialRun.nodes[1].id,
          distanceKm: 1,
        },
      ],
    };
    expect(canWander(corridor)).toBe(false);
  });
});

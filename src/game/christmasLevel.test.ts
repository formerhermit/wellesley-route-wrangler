import { describe, expect, it } from "vitest";
import { christmasRun as level } from "../data/christmasRun";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import {
  emptyRoute,
  graphFor,
  otherEnd,
  roadBetween,
  totalDistanceKm,
} from "./routeGraph";
import { canRunRoute, evaluateRoute } from "./routeEvaluation";
import { buildIncidentReport } from "./incidentReport";
import { selectResult } from "./resultSelection";
import { routeKey } from "./scoring";
import type { Route } from "./types";

function routeOf(...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

/** 8.50 km, taking in the mulled wine on the way round. */
const viaTheMulledWine = routeOf(
  "observatory",
  "polo-fields",
  "mulled-wine",
  "geese-pond",
  "the-hanger",
  "christmas-tree",
  "big-tesco",
  "canal-bridge",
  "towpath",
  "medical-centre",
  "wellesley-rumble",
  "observatory",
);

/** 8.50 km, over the hill and past the Tesco rather than the Hanger. */
const overHospitalHill = routeOf(
  "observatory",
  "wellesley-rumble",
  "medical-centre",
  "towpath",
  "canal-bridge",
  "christmas-tree",
  "big-tesco",
  "hospital-hill",
  "medical-centre",
  "polo-fields",
  "observatory",
);

const titleFor = (route: Route) =>
  selectResult(level, evaluateRoute(level, route)).title;

describe("Christmas Run", () => {
  it("is the Thursday map in December, with its own light, birds, hats and music", () => {
    expect(level.mood).toBe("frost");
    expect(level.flock).toBe("robin");
    expect(level.kit).toBe("santa");
    expect(level.music).toBe("christmas-theme.mp3");
  });

  it("is the level 1 map, renamed", () => {
    // Same twelve junctions in the same places: this is the Thursday map with
    // the decorations up, not a new one.
    const thursday = new Map(
      thursdaySocialRun.nodes.map((node) => [`${node.x},${node.y}`, node.id]),
    );
    expect(level.nodes.length).toBe(thursdaySocialRun.nodes.length);
    for (const node of level.nodes) {
      expect(thursday.has(`${node.x},${node.y}`), node.id).toBe(true);
    }
    expect(level.roads.length).toBe(thursdaySocialRun.roads.length);
  });

  it("shuts the unlit towpath and opens the Back Passage", () => {
    const closed = level.roads.filter((road) => road.closed).map((r) => r.id);
    // The three ends of the towpath nobody has lit, and only those.
    expect(closed.sort()).toEqual(["hospital-tow", "pond-tow", "tree-tow"]);
    // The lit stretch, which is the whole of the canal you are allowed.
    expect(level.roads.find((r) => r.id === "canal-tow")?.closed).toBeUndefined();
    expect(level.roads.find((r) => r.id === "tow-medical")?.closed).toBeUndefined();
    // Level 1 shuts this one. This year there is mulled wine on it.
    const passage = thursdaySocialRun.roads.find((r) => r.id === "passage-polo");
    expect(passage?.closed).toBe(true);
    expect(level.roads.find((r) => r.id === "mulled-polo")?.closed).toBeUndefined();
  });

  it("wins with the mulled wine and without it", () => {
    expect(totalDistanceKm(level, viaTheMulledWine)).toBe(8.5);
    expect(totalDistanceKm(level, overHospitalHill)).toBe(8.5);
    expect(evaluateRoute(level, viaTheMulledWine).success).toBe(true);
    expect(evaluateRoute(level, overHospitalHill).success).toBe(true);
    expect(titleFor(viaTheMulledWine)).toBe("A Properly Festive Thursday");
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });

  it("counts robins rather than pigeons in the paperwork", () => {
    const report = buildIncidentReport(
      level,
      viaTheMulledWine,
      evaluateRoute(level, viaTheMulledWine),
    );
    const labels = report.lines.map((line) => line.label);
    expect(labels).toContain("Unexpected robins");
    expect(labels).not.toContain("Unexpected pigeons");
  });

  it("waits with carol singers on three corners, and the goose on the ice", () => {
    const waiting = (level.followers ?? []).map((one) => one.kind);
    expect(waiting.filter((kind) => kind === "carollers").length).toBe(3);
    expect(waiting.filter((kind) => kind === "goose").length).toBe(1);
  });

  it("fails a route down an unlit stretch of towpath", () => {
    const intoTheDark = routeOf(
      "observatory",
      "wellesley-rumble",
      "geese-pond",
      "towpath",
    );
    expect(titleFor(intoTheDark)).toBe("Down The Unlit Towpath");
  });

  it("fails a route past both lots of robins", () => {
    const bothHotspots = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "hospital-hill",
      "big-tesco",
      "christmas-tree",
      "the-hanger",
      "geese-pond",
      "polo-fields",
      "observatory",
    );
    expect(titleFor(bothHotspots)).toBe("Robin-Controlled Route");
  });

  it("fails a route that never crosses the bridge", () => {
    const noBridge = routeOf(
      "observatory",
      "wellesley-rumble",
      "geese-pond",
      "the-hanger",
      "christmas-tree",
      "big-tesco",
      "christmas-tree",
      "the-hanger",
      "geese-pond",
      "polo-fields",
      "observatory",
    );
    expect(titleFor(noBridge)).toBe("The Canal Went Unseen");
  });

  it("fails a route that misses the tree", () => {
    const noTree = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "towpath",
      "canal-bridge",
      "big-tesco",
      "hospital-hill",
      "medical-centre",
      "polo-fields",
      "observatory",
    );
    expect(titleFor(noTree)).toBe("Nobody Saw The Tree");
  });

  it("fails the quick way round, which does everything else right", () => {
    // Bridge, tree, one lot of robins, nothing shut — and still not a run.
    const brisk = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "towpath",
      "canal-bridge",
      "christmas-tree",
      "the-hanger",
      "geese-pond",
      "polo-fields",
      "observatory",
    );
    expect(totalDistanceKm(level, brisk)).toBe(7);
    expect(titleFor(brisk)).toBe("Straight To The Mulled Wine");
  });

  it("has seven winning routes, three of them by way of the mulled wine", () => {
    const graph = graphFor(level);
    // Keyed the way the club's book keys them: the same set of roads is the
    // same route, whichever way round it was run.
    const wins = new Map<string, string[]>();
    const walk = (route: Route) => {
      const end = route.nodeIds[route.nodeIds.length - 1];
      if (end === level.finishNodeId && route.roadIds.length > 0) {
        if (evaluateRoute(level, route).success) {
          wins.set(routeKey(route), route.nodeIds);
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

    expect(wins.size).toBe(7);
    // The mulled wine is optional, and a real choice: it is on not quite half
    // of the winners, so a route can take it in or leave it and still count.
    const withWine = [...wins.values()].filter((nodes) =>
      nodes.includes("mulled-wine"),
    );
    expect(withWine.length).toBe(3);
  });
});

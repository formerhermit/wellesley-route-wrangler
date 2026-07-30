import { describe, expect, it } from "vitest";
import { tuesdaySocialRun as level } from "../data/tuesdaySocialRun";
import {
  emptyRoute,
  roadBetween,
  selectNode,
  totalDistanceKm,
  undoLastStep,
} from "./routeGraph";
import {
  canRunRoute,
  evaluateRoute,
  hasRepeatedRoad,
  pigeonHotspotIds,
  usedClosedRoad,
  visitedCheckpoint,
} from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import type { ObjectiveState, Route } from "./types";

/**
 * Builds a route from a list of junctions without going through the editing
 * rules, so fixtures can express illegal routes (repeated roads) too.
 */
function routeOf(...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

const fixtures = {
  /** 6.20 km, one hotspot, canal visited, closes the loop. */
  perfect: routeOf(
    "observatory",
    "high-street",
    "pigeon-square",
    "private-bush",
    "canal-bridge",
    "towpath",
    "hill-top",
    "gardens",
    "observatory",
  ),
  /** 4.70 km — an honest loop, just not far enough. */
  tooShort: routeOf(
    "observatory",
    "high-street",
    "geese-pond",
    "towpath",
    "hill-top",
    "gardens",
    "observatory",
  ),
  /** 7.50 km via the bin lorry depot. */
  tooLong: routeOf(
    "observatory",
    "high-street",
    "pigeon-square",
    "private-bush",
    "depot",
    "canal-bridge",
    "towpath",
    "hill-top",
    "gardens",
    "observatory",
  ),
  /** Straight through the closure at the shortcut. */
  closedRoad: routeOf(
    "observatory",
    "gardens",
    "shortcut",
    "hill-top",
    "towpath",
    "canal-bridge",
  ),
  /** Pigeon Square and the Bandstand: two hotspots. */
  pigeonInfested: routeOf(
    "observatory",
    "high-street",
    "pigeon-square",
    "private-bush",
    "depot",
    "bandstand",
    "towpath",
    "hill-top",
    "gardens",
    "observatory",
  ),
  /** Out and straight back down the same road. */
  repeatedRoad: routeOf("observatory", "high-street", "observatory"),
  /** Ends on the towpath rather than coming home. */
  strandedAtCanal: routeOf(
    "observatory",
    "gardens",
    "geese-pond",
    "towpath",
  ),
};

function stateOf(route: Route, objectiveId: string): ObjectiveState {
  const objective = evaluateRoute(level, route).objectives.find(
    (o) => o.id === objectiveId,
  );
  if (!objective) throw new Error(`No objective ${objectiveId}`);
  return objective.state;
}

describe("distance", () => {
  it("sums the roads taken", () => {
    expect(totalDistanceKm(level, fixtures.perfect)).toBe(6.2);
    expect(totalDistanceKm(level, fixtures.tooShort)).toBe(4.7);
    expect(totalDistanceKm(level, fixtures.tooLong)).toBe(7.5);
  });

  it("is zero for a route that has not left the start", () => {
    expect(totalDistanceKm(level, emptyRoute(level))).toBe(0);
  });

  it("fails when over the limit but stays incomplete when still short", () => {
    expect(stateOf(fixtures.tooLong, "distance")).toBe("failed");
    expect(stateOf(fixtures.tooShort, "distance")).toBe("incomplete");
    expect(stateOf(fixtures.perfect, "distance")).toBe("passed");
  });
});

describe("roads are bidirectional", () => {
  it("finds the same road from either end", () => {
    const there = roadBetween(level, "observatory", "high-street");
    const back = roadBetween(level, "high-street", "observatory");
    expect(there?.id).toBe("obs-high");
    expect(back?.id).toBe(there?.id);
  });

  it("returns nothing for junctions that are not joined", () => {
    expect(roadBetween(level, "observatory", "depot")).toBeUndefined();
  });
});

describe("checkpoint detection", () => {
  it("spots a visit to the canal", () => {
    expect(visitedCheckpoint(level, fixtures.perfect)).toBe(true);
    expect(visitedCheckpoint(level, fixtures.repeatedRoad)).toBe(false);
  });

  it("holds the objective at incomplete until the canal is reached", () => {
    expect(stateOf(fixtures.repeatedRoad, "checkpoint")).toBe("incomplete");
    expect(stateOf(fixtures.perfect, "checkpoint")).toBe("passed");
  });
});

describe("closed road detection", () => {
  it("notices the shortcut of questionable legality", () => {
    expect(usedClosedRoad(level, fixtures.closedRoad)).toBe(true);
    expect(usedClosedRoad(level, fixtures.perfect)).toBe(false);
    expect(stateOf(fixtures.closedRoad, "closed-road")).toBe("failed");
  });
});

describe("pigeon exposure", () => {
  it("counts distinct hotspots on the route", () => {
    expect(pigeonHotspotIds(level, fixtures.perfect)).toEqual(["pigeon-square"]);
    expect(pigeonHotspotIds(level, fixtures.pigeonInfested)).toHaveLength(2);
    expect(pigeonHotspotIds(level, fixtures.tooShort)).toHaveLength(0);
  });

  it("fails only above the level's allowance", () => {
    expect(stateOf(fixtures.perfect, "pigeons")).toBe("passed");
    expect(stateOf(fixtures.pigeonInfested, "pigeons")).toBe("failed");
  });
});

describe("repeated roads", () => {
  it("detects a road used twice", () => {
    expect(hasRepeatedRoad(fixtures.repeatedRoad)).toBe(true);
    expect(hasRepeatedRoad(fixtures.perfect)).toBe(false);
    expect(stateOf(fixtures.repeatedRoad, "unique-roads")).toBe("failed");
  });
});

describe("successful route", () => {
  it("passes every objective", () => {
    const evaluation = evaluateRoute(level, fixtures.perfect);
    expect(evaluation.success).toBe(true);
    expect(evaluation.objectives.every((o) => o.state === "passed")).toBe(true);
  });

  it("is not awarded to an empty route", () => {
    expect(evaluateRoute(level, emptyRoute(level)).success).toBe(false);
  });

  it("gates Run Route on finishing back at the Observatory", () => {
    expect(canRunRoute(level, fixtures.perfect)).toBe(true);
    expect(canRunRoute(level, fixtures.strandedAtCanal)).toBe(false);
    expect(canRunRoute(level, emptyRoute(level))).toBe(false);
  });
});

describe("result selection", () => {
  const titleFor = (route: Route) =>
    selectResult(level, evaluateRoute(level, route)).title;

  it("celebrates a perfect route", () => {
    expect(titleFor(fixtures.perfect)).toBe("Perfect Social Run");
  });

  it("names the most relevant failure", () => {
    expect(titleFor(emptyRoute(level))).toBe("Barely Left the Start Line");
    expect(titleFor(fixtures.closedRoad)).toBe(
      "The Closed Road Was, In Fact, Closed",
    );
    expect(titleFor(fixtures.repeatedRoad)).toBe("Everyone Returned Eventually");
    expect(titleFor(fixtures.pigeonInfested)).toBe("Pigeon-Controlled Route");
    expect(titleFor(fixtures.strandedAtCanal)).toBe("Nobody Left the Canal");
    expect(titleFor(fixtures.tooLong)).toBe("Accidental Long Run");
    expect(titleFor(fixtures.tooShort)).toBe("An Innovative Definition of 5K");
  });

  it("reports a missing canal before quibbling about distance", () => {
    const noCanal = routeOf("observatory", "high-street", "observatory");
    expect(titleFor(noCanal)).toBe("Everyone Returned Eventually");
    expect(
      titleFor(routeOf("observatory", "high-street", "geese-pond")),
    ).toBe("Nobody Visited the Canal");
  });

  it("is deterministic", () => {
    const evaluation = evaluateRoute(level, fixtures.tooLong);
    expect(selectResult(level, evaluation)).toEqual(
      selectResult(level, evaluation),
    );
  });
});

describe("route editing", () => {
  it("extends the route along a connected road", () => {
    const outcome = selectNode(level, emptyRoute(level), "high-street");
    expect(outcome.kind).toBe("extended");
    if (outcome.kind !== "extended") return;
    expect(outcome.route.nodeIds).toEqual(["observatory", "high-street"]);
    expect(outcome.route.roadIds).toEqual(["obs-high"]);
  });

  it("rejects an unconnected junction with a reason", () => {
    const outcome = selectNode(level, emptyRoute(level), "depot");
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind !== "rejected") return;
    expect(outcome.reason).toMatch(/No road joins/);
  });

  it("undoes the last step when the previous junction is selected", () => {
    const start = emptyRoute(level);
    const stepped = selectNode(level, start, "high-street");
    if (stepped.kind !== "extended") throw new Error("expected extension");
    const undone = selectNode(level, stepped.route, "observatory");
    expect(undone.kind).toBe("undone");
    if (undone.kind !== "undone") return;
    expect(undone.route).toEqual(start);
  });

  it("undoLastStep leaves an untouched route alone", () => {
    const start = emptyRoute(level);
    expect(undoLastStep(start)).toEqual(start);
    expect(undoLastStep(fixtures.perfect).nodeIds).toHaveLength(
      fixtures.perfect.nodeIds.length - 1,
    );
  });

  it("refuses to reuse a road that is not the immediate previous step", () => {
    const route = routeOf("observatory", "high-street", "geese-pond");
    // geese-pond -> high-street would reuse high-pond, and is not an undo.
    const loop = routeOf("observatory", "high-street", "geese-pond", "towpath");
    const outcome = selectNode(level, loop, "geese-pond");
    expect(outcome.kind).toBe("undone");
    expect(selectNode(level, route, "observatory").kind).toBe("rejected");
  });
});

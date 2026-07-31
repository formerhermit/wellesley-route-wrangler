import { describe, expect, it } from "vitest";
import { thursdaySocialRun as level } from "../data/thursdaySocialRun";
import { levels } from "../data/levels";
import {
  emptyRoute,
  roadBetween,
  roadPathData,
  roadsBetween,
  selectNode,
  totalDistanceKm,
  undoLastStep,
} from "./routeGraph";
import {
  canRunRoute,
  countNodeType,
  countSurface,
  evaluateRoute,
  hasRepeatedRoad,
  usedClosedRoad,
  visitedNodes,
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
  /** 6.40 km, one hotspot, canal visited, closes the loop. */
  perfect: routeOf(
    "observatory",
    "wellesley-rumble",
    "medical-centre",
    "towpath",
    "private-bush",
    "the-hanger",
    "geese-pond",
    "polo-fields",
    "observatory",
  ),
  /** 4.40 km — an honest loop, just not far enough. */
  tooShort: routeOf(
    "observatory",
    "wellesley-rumble",
    "medical-centre",
    "towpath",
    "geese-pond",
    "polo-fields",
    "observatory",
  ),
  /** 7.10 km, out around the hangar. */
  tooLong: routeOf(
    "observatory",
    "wellesley-rumble",
    "geese-pond",
    "the-hanger",
    "private-bush",
    "towpath",
    "medical-centre",
    "polo-fields",
    "observatory",
  ),
  /** Straight through the closure at the shortcut. */
  closedRoad: routeOf(
    "observatory",
    "wellesley-rumble",
    "geese-pond",
    "back-passage",
    "polo-fields",
    "observatory",
  ),
  /** The Hangar and Hospital Hill: two hotspots. */
  pigeonInfested: routeOf(
    "observatory",
    "wellesley-rumble",
    "medical-centre",
    "hospital-hill",
    "towpath",
    "private-bush",
    "the-hanger",
    "geese-pond",
    "polo-fields",
    "observatory",
  ),
  /** Out and straight back down the same road. */
  repeatedRoad: routeOf("observatory", "wellesley-rumble", "observatory"),
  /** Ends on the towpath rather than coming home. */
  strandedAtCanal: routeOf(
    "observatory",
    "polo-fields",
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
    expect(totalDistanceKm(level, fixtures.perfect)).toBe(6.4);
    expect(totalDistanceKm(level, fixtures.tooShort)).toBe(4.4);
    expect(totalDistanceKm(level, fixtures.tooLong)).toBe(7.1);
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
    const there = roadBetween(level, "observatory", "wellesley-rumble");
    const back = roadBetween(level, "wellesley-rumble", "observatory");
    expect(there?.id).toBe("obs-rumble");
    expect(back?.id).toBe(there?.id);
  });

  it("returns nothing for junctions that are not joined", () => {
    expect(roadBetween(level, "observatory", "big-tesco")).toBeUndefined();
  });
});

describe("checkpoint detection", () => {
  it("spots a visit to the canal", () => {
    const canal = ["canal-bridge", "towpath"];
    expect(visitedNodes(fixtures.perfect, canal)).toBe(true);
    expect(visitedNodes(fixtures.repeatedRoad, canal)).toBe(false);
  });

  it("holds the objective at incomplete until the canal is reached", () => {
    expect(stateOf(fixtures.repeatedRoad, "visit")).toBe("incomplete");
    expect(stateOf(fixtures.perfect, "visit")).toBe("passed");
  });
});

describe("closed road detection", () => {
  it("notices the shortcut of questionable legality", () => {
    expect(usedClosedRoad(level, fixtures.closedRoad)).toBe(true);
    expect(usedClosedRoad(level, fixtures.perfect)).toBe(false);
    expect(stateOf(fixtures.closedRoad, "avoid-closed")).toBe("failed");
  });
});

describe("pigeon exposure", () => {
  it("counts distinct hotspots on the route", () => {
    expect(countNodeType(level, fixtures.perfect, "pigeon")).toBe(1);
    expect(countNodeType(level, fixtures.pigeonInfested, "pigeon")).toBe(2);
    expect(countNodeType(level, fixtures.tooShort, "pigeon")).toBe(0);
  });

  it("fails only above the level's allowance", () => {
    expect(stateOf(fixtures.perfect, "max-node-type")).toBe("passed");
    expect(stateOf(fixtures.pigeonInfested, "max-node-type")).toBe("failed");
  });
});

describe("repeated roads", () => {
  /**
   * No level declares the "no-repeat" objective any more: `selectNode` refuses
   * a road already in the route, so it could never fail in play and simply sat
   * in the checklist reading "Passed". The rule itself is still enforced, and
   * the engine still carries the objective for a level that one day lets the
   * player double back on purpose.
   */
  it("detects a road used twice", () => {
    expect(hasRepeatedRoad(fixtures.repeatedRoad)).toBe(true);
    expect(hasRepeatedRoad(fixtures.perfect)).toBe(false);
  });

  it("is not something the editing rules will let a player do", () => {
    // Round a loop, back to the start, then try to set off down the first road
    // a second time.
    const loop = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "polo-fields",
      "observatory",
    );
    const outcome = selectNode(level, loop, "wellesley-rumble");
    expect(outcome.kind).toBe("rejected");
  });
});

describe("surfaces", () => {
  it("counts road versus trail stretches", () => {
    // This level is all roads; the trail level exercises the other side.
    expect(countSurface(level, fixtures.perfect, "road")).toBe(8);
    expect(countSurface(level, fixtures.perfect, "trail")).toBe(0);
  });
});

describe("objectives are driven by the level", () => {
  it("builds one checklist entry per declared objective, in order", () => {
    const evaluation = evaluateRoute(level, fixtures.perfect);
    expect(evaluation.objectives.map((o) => o.kind)).toEqual(
      level.objectives.map((o) => o.kind),
    );
  });

  it("puts the route distance into the failure copy", () => {
    const result = selectResult(level, evaluateRoute(level, fixtures.tooLong));
    expect(result.message).toContain("7.10 km");
    expect(result.message).not.toContain("{km}");
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
    expect(titleFor(fixtures.pigeonInfested)).toBe("Pigeon-Controlled Route");
    expect(titleFor(fixtures.strandedAtCanal)).toBe("Nobody Left the Canal");
    expect(titleFor(fixtures.tooLong)).toBe("Accidental Long Run");
    expect(titleFor(fixtures.tooShort)).toBe("An Innovative Definition of 5K");
  });

  it("reports a missing canal before quibbling about distance", () => {
    // A legitimate 3.40 km loop that never goes near the water: short as well
    // as canal-less, and the canal is the one worth saying out loud.
    const noCanal = routeOf(
      "observatory",
      "wellesley-rumble",
      "medical-centre",
      "polo-fields",
      "observatory",
    );
    expect(totalDistanceKm(level, noCanal)).toBe(3.4);
    expect(titleFor(noCanal)).toBe("Nobody Visited the Canal");
    expect(
      titleFor(routeOf("observatory", "wellesley-rumble", "geese-pond")),
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
    const outcome = selectNode(level, emptyRoute(level), "wellesley-rumble");
    expect(outcome.kind).toBe("extended");
    if (outcome.kind !== "extended") return;
    expect(outcome.route.nodeIds).toEqual(["observatory", "wellesley-rumble"]);
    expect(outcome.route.roadIds).toEqual(["obs-rumble"]);
  });

  it("rejects an unconnected junction with a reason", () => {
    const outcome = selectNode(level, emptyRoute(level), "big-tesco");
    expect(outcome.kind).toBe("rejected");
    if (outcome.kind !== "rejected") return;
    expect(outcome.reason).toMatch(/No road joins/);
  });

  it("undoes the last step when the previous junction is selected", () => {
    const start = emptyRoute(level);
    const stepped = selectNode(level, start, "wellesley-rumble");
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
    const route = routeOf("observatory", "wellesley-rumble", "geese-pond");
    // geese-pond -> high-street would reuse high-pond, and is not an undo.
    const loop = routeOf("observatory", "wellesley-rumble", "geese-pond", "towpath");
    const outcome = selectNode(level, loop, "geese-pond");
    expect(outcome.kind).toBe("undone");
    expect(selectNode(level, route, "observatory").kind).toBe("rejected");
  });
});

/**
 * Two roads joining the same two junctions: the road out and back around the
 * Sports Centre building on level 5. The editing rules have to tell them
 * apart, and undo has to unwind the whole excursion rather than half of it.
 */
describe("a road that loops out and back", () => {
  const loopy = levels.find((l) => l.id === "loopy-run")!;
  const atSportsCentre: Route = {
    nodeIds: ["polo-fields", "sports-centre"],
    roadIds: ["polo-sports"],
  };

  it("declares two separate roads between the same pair", () => {
    expect(roadsBetween(loopy, "sports-centre", "pool-loop")).toHaveLength(2);
  });

  it("draws them on different lines", () => {
    const [out, back] = roadsBetween(loopy, "sports-centre", "pool-loop");
    expect(roadPathData(loopy, out)).not.toBe(roadPathData(loopy, back));
  });

  it("goes round the far side rather than undoing, while a road is free", () => {
    const there = selectNode(loopy, atSportsCentre, "pool-loop");
    expect(there.kind).toBe("extended");
    if (there.kind !== "extended") return;

    // Back to the Sports Centre: the other side of the building, not an undo.
    const round = selectNode(loopy, there.route, "sports-centre");
    expect(round.kind).toBe("extended");
    if (round.kind !== "extended") return;
    expect(round.route.roadIds).toHaveLength(3);
    expect(new Set(round.route.roadIds).size).toBe(3);
  });

  it("undoes the whole loop in one move, so nobody is stuck going round", () => {
    const there = selectNode(loopy, atSportsCentre, "pool-loop");
    if (there.kind !== "extended") throw new Error("expected to set off");
    const round = selectNode(loopy, there.route, "sports-centre");
    if (round.kind !== "extended") throw new Error("expected to come back");

    const undone = selectNode(loopy, round.route, "pool-loop");
    expect(undone.kind).toBe("undone");
    if (undone.kind !== "undone") return;
    // All the way back to before the loop, not half way round it.
    expect(undone.route).toEqual(atSportsCentre);
  });

  it("still refuses a road already run, where there is no twin", () => {
    const outAndBack: Route = {
      nodeIds: ["observatory", "polo-fields", "observatory"],
      roadIds: ["obs-polo", "obs-polo"],
    };
    expect(hasRepeatedRoad(outAndBack)).toBe(true);
    const blocked = selectNode(
      loopy,
      { nodeIds: ["observatory", "polo-fields"], roadIds: ["obs-polo"] },
      "sports-centre",
    );
    expect(blocked.kind).toBe("extended");
  });
});

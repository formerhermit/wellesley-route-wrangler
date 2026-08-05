import { describe, expect, it } from "vitest";
import { crooksburyHill as level } from "../data/crooksburyHill";
import { levels } from "../data/levels";
import { buildIncidentReport, hillsTaken } from "./incidentReport";
import { HILL_MARKER_OFFSET, hillMarkerAt } from "./routeGraph";
import { cabinetFor } from "./achievements";
import { emptyRecords, recordRun } from "./records";
import { paceOf } from "./pace";
import { graphFor, otherEnd, roadBetween, totalDistanceKm } from "./routeGraph";
import { countHills, evaluateRoute } from "./routeEvaluation";
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

/** The long way round: the Hog's Back, Botany, The Sands, Crooksbury, Hillbury. */
const theHorseshoe = routeOf(
  "puttenham-common",
  "puttenham",
  "hogs-back",
  "seale",
  "botany-hill",
  "the-sands",
  "crooksbury-hill",
  "hillbury",
  "generals-pond",
  "puttenham-common",
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

describe("Crooksbury", () => {
  it("starts and finishes in the top car park", () => {
    expect(level.startNodeId).toBe("puttenham-common");
    expect(level.finishNodeId).toBe("puttenham-common");
  });

  it("is an ordinary Sunday: no mood, no flock, no track of its own", () => {
    expect(level.mood).toBeUndefined();
    expect(level.flock).toBeUndefined();
    expect(level.music).toBeUndefined();
    expect(level.kit).toBeUndefined();
  });

  it("gets round the horseshoe", () => {
    expect(evaluateRoute(level, theHorseshoe).success).toBe(true);
    expect(totalDistanceKm(level, theHorseshoe)).toBeCloseTo(13.3, 5);
    expect(countHills(level, theHorseshoe)).toBe(7);
  });

  /*
   * The load-bearing fact about this map, and the reason it is not simply
   * every road marked `hill`. `paceOf` costs a climb 45% of its speed, but the
   * run takes the same eight seconds whatever route it is, so the cost comes
   * out of the flat legs. Make everything a hill and the ratio is uniform,
   * `fractionAt` reduces to the identity, and the group runs at a constant
   * speed all the way round — which is what a flat level looks like.
   */
  it("has flat road on it, because a map of only hills has no hills", () => {
    const flat = level.roads.filter((road) => road.hill !== true);
    expect(flat.length).toBeGreaterThan(4);

    /*
     * How far the pace curve bends away from a straight line anywhere on the
     * route. Sampled rather than probed at one point: the curve runs above the
     * line while the group is on the flat and below it while they are
     * climbing, so it crosses back through the middle, and on this route it
     * crosses at almost exactly halfway. A single probe at 0.5 would have
     * measured 0.0003 and concluded the hills did nothing.
     */
    const bend = (route: Route) => {
      const pace = paceOf(level, route);
      let worst = 0;
      for (let t = 0; t <= 1.0001; t += 0.05) {
        worst = Math.max(worst, Math.abs(pace.fractionAt(t) - t));
      }
      return worst;
    };

    expect(paceOf(level, theHorseshoe).hilly).toBe(true);
    expect(bend(theHorseshoe)).toBeGreaterThan(0.02);

    // And the point of the note at the top of the level: three climbs in a row
    // and nothing else. Still `hilly`, and the curve is a straight line —
    // every leg costs the same multiple of itself, so the multiple cancels and
    // the group runs at one speed the whole way.
    const nothingButHills = routeOf(
      "hampton-estate",
      "hillbury",
      "crooksbury-hill",
      "soldiers-ring",
    );
    expect(
      nothingButHills.roadIds.every(
        (id) => level.roads.find((r) => r.id === id)?.hill === true,
      ),
    ).toBe(true);
    expect(paceOf(level, nothingButHills).hilly).toBe(true);
    // Zero to the last few bits of a double, which is what an exact identity
    // looks like after the arithmetic has been through a divide and back.
    expect(bend(nothingButHills)).toBeCloseTo(0, 10);
  });

  it("fails a route that found the flat way round", () => {
    // Out and back along the bottom: both waypoints, and only four climbs.
    const route = routeOf(
      "puttenham-common",
      "hampton-estate",
      "seale",
      "botany-hill",
      "crooksbury-hill",
      "hillbury",
      "generals-pond",
      "puttenham-common",
    );
    expect(route.nodeIds).toContain("crooksbury-hill");
    expect(route.nodeIds).toContain("hillbury");
    expect(countHills(level, route)).toBeLessThan(7);
    expect(titleFor(route)).toBe("You Found The Flat Way Round");
  });

  it("fails a route that never reaches the trig point", () => {
    const route = routeOf(
      "puttenham-common",
      "hampton-estate",
      "hillbury",
      "generals-pond",
      "puttenham-common",
    );
    expect(titleFor(route)).toBe("The Hill It Is Named After");
  });

  it("fails a route that skips the hillfort", () => {
    const route = routeOf(
      "puttenham-common",
      "puttenham",
      "hogs-back",
      "seale",
      "botany-hill",
      "the-sands",
      "crooksbury-hill",
      "soldiers-ring",
      "cutmill-pond",
      "generals-pond",
      "puttenham-common",
    );
    expect(route.nodeIds).not.toContain("hillbury");
    expect(titleFor(route)).toBe("The Iron Age Went Unvisited");
  });

  /*
   * The Frensham rule. Two objectives that cannot fail apart are one objective
   * with two ticks — and Hillbury's only neighbours besides Crooksbury are the
   * two ponds, both of which lead back the way you came. The estate track from
   * Hampton onto the common is what buys the independence, and it is the whole
   * reason that road exists.
   */
  it("lets its two waypoints fail independently", () => {
    const home = walkHome();
    const crooksOnly = home.filter(
      (r) => r.nodeIds.includes("crooksbury-hill") && !r.nodeIds.includes("hillbury"),
    );
    const hillburyOnly = home.filter(
      (r) => !r.nodeIds.includes("crooksbury-hill") && r.nodeIds.includes("hillbury"),
    );
    expect(crooksOnly.length).toBeGreaterThan(0);
    expect(hillburyOnly.length).toBeGreaterThan(0);
  });

  it("has exactly four winning routes, and every one of them climbs seven", () => {
    const winners = walkHome().filter((r) => evaluateRoute(level, r).success);
    expect(new Set(winners.map(routeKey)).size).toBe(4);
    expect(winningRouteCount(level)).toBe(4);
    for (const winner of winners) {
      expect(countHills(level, winner)).toBeGreaterThanOrEqual(7);
      expect(totalDistanceKm(level, winner)).toBeGreaterThanOrEqual(13);
      expect(totalDistanceKm(level, winner)).toBeLessThanOrEqual(14);
    }
  });

  /* A landmark no winner reaches is scenery with a name on it. */
  it("puts every junction on at least one winning route", () => {
    const winners = walkHome().filter((r) => evaluateRoute(level, r).success);
    const reached = new Set(winners.flatMap((r) => r.nodeIds));
    const stranded = level.nodes
      .map((node) => node.id)
      .filter((id) => !reached.has(id));
    expect(stranded).toEqual([]);
  });

  it("stays inside the density budget", () => {
    const rank = level.roads.length - level.nodes.length + 1;
    expect(rank).toBe(8);
    expect(rank).toBeLessThanOrEqual(9);
  });

  /*
   * The distance floor cannot fire on this map and that is a property of the
   * design, not an oversight: seven climbs cost more than twelve kilometres
   * before you have run a step of anything flat. Pinned so that anyone who
   * retunes the hills finds out here rather than by shipping copy nobody can
   * reach.
   */
  it("cannot be failed for being too short, because seven climbs is far enough", () => {
    const short = walkHome().filter(
      (r) =>
        countHills(level, r) >= 7 &&
        r.nodeIds.includes("crooksbury-hill") &&
        r.nodeIds.includes("hillbury") &&
        totalDistanceKm(level, r) < 12,
    );
    expect(short).toEqual([]);
  });
});

describe("the climb objective", () => {
  it("counts hill roads and not summits", () => {
    // Reaches two hill junctions on two roads, only one of which is a climb.
    const route = routeOf("puttenham-common", "hampton-estate", "hillbury");
    expect(route.nodeIds.filter((id) => id === "hillbury").length).toBe(1);
    expect(countHills(level, route)).toBe(1);
  });

  it("stays incomplete rather than failed while the route is still short", () => {
    const partial = routeOf("puttenham-common", "puttenham");
    const climb = evaluateRoute(level, partial).objectives.find(
      (o) => o.kind === "climb",
    );
    expect(climb?.state).toBe("incomplete");
    expect(climb?.label).toBe("Climb at least 7 hills");
  });

  it("passes once the hills are in", () => {
    const climb = evaluateRoute(level, theHorseshoe).objectives.find(
      (o) => o.kind === "climb",
    );
    expect(climb?.state).toBe("passed");
  });

  /*
   * The same number, the opposite joke. On a Thursday a hill is something you
   * needlessly ran up; here it is the reason anybody got in a car.
   */
  it("turns the report's unnecessary hills into hills climbed", () => {
    const { lines } = buildIncidentReport(
      level,
      theHorseshoe,
      evaluateRoute(level, theHorseshoe),
    );
    const hills = lines.find((line) => line.label === "Hills climbed");
    expect(hills?.value).toBe("7 of 7");
    expect(hills?.tone).toBe("good");
    expect(lines.some((line) => line.label === "Unnecessary hills")).toBe(false);
    expect(hillsTaken(level, theHorseshoe)).toBe(7);
  });

  /*
   * Every climb carries a triangle beside it (#118). Before that the only sign
   * a road was a hill was its dash pattern, and on a trail map the dash already
   * means the surface — so on the one level whose objective is *take seven of
   * these*, there was no way to tell which seven. Playtesters were guessing.
   */
  it("marks every climb on the map, not just the summits", () => {
    const hills = level.roads.filter((road) => road.hill);
    expect(hills.length).toBe(12);
    for (const road of hills) {
      const spot = hillMarkerAt(level, road);
      const from = level.nodes.find((one) => one.id === road.from)!;
      const to = level.nodes.find((one) => one.id === road.to)!;
      // Beside the road rather than on it: the route line is fifteen wide and
      // would swallow a marker drawn on the tarmac.
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      expect(Math.hypot(spot.x - mid.x, spot.y - mid.y)).toBeCloseTo(
        HILL_MARKER_OFFSET,
        5,
      );
    }
  });

  /*
   * And the flat roads do not get one, which is the other half of saying it.
   * Pinned as a number because the file's own note about the ratio was written
   * before the estate track was added and quietly went stale — twelve and
   * seven, not eleven and eight.
   */
  it("puts no triangle on a road that is not a climb", () => {
    const flat = level.roads.filter((road) => road.hill !== true);
    expect(flat.length).toBe(7);
    expect(flat.length + level.roads.filter((road) => road.hill).length).toBe(
      level.roads.length,
    );
  });

  /*
   * Seven climbs and, as far as anybody can reconstruct afterwards, no
   * descents (#117). The one line of the report this level writes itself —
   * and only when the run worked, because the committee's escalation on a
   * failure is the joke and a level does not get to step off it.
   */
  it("signs off an Escher painting, but only when the run worked", () => {
    const won = buildIncidentReport(
      level,
      theHorseshoe,
      evaluateRoute(level, theHorseshoe),
    );
    expect(won.verdict).toBe("Did we just run an Escher painting?");

    const flat = routeOf(
      "puttenham-common",
      "hampton-estate",
      "seale",
      "botany-hill",
      "crooksbury-hill",
      "hillbury",
      "generals-pond",
      "puttenham-common",
    );
    const lost = buildIncidentReport(level, flat, evaluateRoute(level, flat));
    expect(lost.verdict).not.toContain("Escher");
    expect(lost.verdict).toMatch(/committee|Questions|acceptable/i);
  });

  /*
   * And it is not an accidental long run (#119). Thirteen kilometres used to
   * be the whole test, which handed the badge out for every correct route
   * here and for every legal lap of the Farnborough Half — a race advertised
   * as 21.1 km, which is the opposite of accidental.
   */
  it("does not hand out The Unexpected Long Run for doing as it asked", () => {
    const records = recordRun(emptyRecords, level, theHorseshoe);
    const badge = cabinetFor(records, levels).find(
      (one) => one.id === "unexpected-long-run",
    )!;
    expect(totalDistanceKm(level, theHorseshoe)).toBeGreaterThan(13);
    expect(badge.earned).toBe(false);
  });

  it("is the only level that asks for the climbing", () => {
    const climbing = levels.filter((l) =>
      l.objectives.some((o) => o.kind === "climb"),
    );
    expect(climbing.map((l) => l.id)).toEqual(["crooksbury-hill"]);
  });

  /* And every other level still gets the old line, unchanged. */
  it("leaves the unnecessary hills alone everywhere else", () => {
    const thursday = levels.find((l) => l.id === "thursday-town-run")!;
    expect(thursday.objectives.some((o) => o.kind === "climb")).toBe(false);
  });
});

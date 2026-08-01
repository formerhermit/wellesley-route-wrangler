import { describe, expect, it } from "vitest";
import { christmasRun } from "../data/christmasRun";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import { buildRunShare, payloadToClipboard } from "./shareText";
import { buildIncidentReport } from "./incidentReport";
import { evaluateRoute } from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import { roadBetween } from "./routeGraph";
import type { Level, Route } from "./types";

function routeOf(level: Level, ...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

function shareFor(
  level: Level,
  route: Route,
  standing?: { clubPoints: number; found: number; toFind: number },
) {
  const evaluation = evaluateRoute(level, route);
  return buildRunShare(
    level,
    selectResult(level, evaluation),
    buildIncidentReport(level, route, evaluation),
    standing,
  );
}

/** A winner on the Thursday map, and one on the Christmas map. */
const thursdayWin = routeOf(
  thursdaySocialRun,
  "observatory",
  "wellesley-rumble",
  "medical-centre",
  "towpath",
  "canal-bridge",
  "private-bush",
  "the-hanger",
  "geese-pond",
  "polo-fields",
  "observatory",
);

const christmasWin = routeOf(
  christmasRun,
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

describe("share text", () => {
  it("names the level's own birds rather than assuming pigeons", () => {
    // The bug this pins: the boastable lines were matched against a hardcoded
    // "Unexpected pigeons", so on any level that kept something else the line
    // matched nothing and the shared run quietly lost its birds.
    expect(shareFor(thursdaySocialRun, thursdayWin).text).toContain(
      "unexpected pigeons",
    );

    const christmas = shareFor(christmasRun, christmasWin).text;
    expect(christmas).toContain("unexpected robins");
    expect(christmas).not.toContain("unexpected pigeons");
  });

  it("carries the club standing when it is given one", () => {
    const text = shareFor(christmasRun, christmasWin, {
      clubPoints: 142,
      found: 3,
      toFind: 7,
    }).text;
    expect(text).toContain("142 club points");
    expect(text).toContain("3 of 7 routes found here");
  });

  it("says nothing about points when there is no standing to report", () => {
    const text = shareFor(christmasRun, christmasWin).text;
    expect(text).not.toContain("club point");
    expect(text).not.toContain("found here");
  });

  it("counts one point and one route in the singular", () => {
    const text = shareFor(christmasRun, christmasWin, {
      clubPoints: 1,
      found: 1,
      toFind: 1,
    }).text;
    expect(text).toContain("1 club point ·");
    expect(text).toContain("1 of 1 route found here");
  });

  it("still leads with the result and keeps the url off the text", () => {
    const payload = shareFor(christmasRun, christmasWin, {
      clubPoints: 50,
      found: 1,
      toFind: 7,
    });
    expect(payload.text.split("\n")[0]).toBe(
      "A Properly Festive Thursday on the Christmas Run.",
    );
    expect(payload.text).not.toContain(payload.url);
    // The clipboard fallback is the only place the two are joined.
    expect(payloadToClipboard(payload)).toContain(payload.url);
  });
});

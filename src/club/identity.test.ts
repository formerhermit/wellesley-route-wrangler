import { describe, expect, it } from "vitest";
import { christmasRun } from "../data/christmasRun";
import { routeFromRoads } from "../game/records";
import { scoreRun } from "../game/scoring";
import { cleanDisplayName, NAME_MAX, submissionFor } from "./identity";

describe("display names", () => {
  it("takes an ordinary name as typed", () => {
    expect(cleanDisplayName("Jo")).toEqual({ ok: true, name: "Jo" });
  });

  it("trims and collapses the whitespace people paste in", () => {
    expect(cleanDisplayName("  Slow   Steve  ")).toEqual({
      ok: true,
      name: "Slow Steve",
    });
  });

  it("strips control characters and bidi overrides", () => {
    // A name that would otherwise reorder the text printed after it.
    const nasty = "Jo‮gnihtemos";
    const checked = cleanDisplayName(nasty);
    expect(checked).toEqual({ ok: true, name: "Jognihtemos" });
  });

  it("refuses names that are too short or too long", () => {
    expect(cleanDisplayName(" x ").ok).toBe(false);
    expect(cleanDisplayName("").ok).toBe(false);
    expect(cleanDisplayName("a".repeat(NAME_MAX + 1)).ok).toBe(false);
    expect(cleanDisplayName("a".repeat(NAME_MAX)).ok).toBe(true);
  });

  it("counts the length after tidying, not before", () => {
    // Padding is not length: this is a two-character name in a lot of spaces.
    expect(cleanDisplayName("        Jo        ")).toEqual({
      ok: true,
      name: "Jo",
    });
  });
});

describe("what gets submitted", () => {
  it("carries the route and no score at all", () => {
    const submission = submissionFor("christmas-run", ["obs-rumble"]);
    expect(Object.keys(submission).sort()).toEqual(["levelId", "roadIds"]);
    expect(JSON.stringify(submission)).not.toContain("points");
  });

  it("copies the roads rather than aliasing the caller's array", () => {
    const roads = ["obs-rumble"];
    const submission = submissionFor("christmas-run", roads);
    roads.push("polo-obs");
    expect(submission.roadIds).toEqual(["obs-rumble"]);
  });
});

describe("the surface the server scores with", () => {
  /**
   * The server replays a submitted run through a bundle generated from these
   * very modules. If rebuilding the route or scoring it ever stopped being
   * deterministic, the table would disagree with the game and neither would be
   * obviously wrong — so pin the pair here.
   */
  it("rebuilds a route from road ids alone and scores it the same every time", () => {
    const roads = [
      "polo-obs",
      "mulled-polo",
      "mulled-pond",
      "hanger-pond",
      "hanger-tree",
      "tree-tesco",
      "tesco-canal",
      "canal-tow",
      "tow-medical",
      "rumble-medical",
      "obs-rumble",
    ];
    const route = routeFromRoads(christmasRun, roads);
    expect(route).toBeDefined();

    const score = scoreRun(christmasRun, route!);
    expect(score.won).toBe(true);
    expect(score.points).toBe(scoreRun(christmasRun, route!).points);
  });

  it("refuses road ids that are not a route", () => {
    // A real road, but not one that leaves the Observatory.
    expect(routeFromRoads(christmasRun, ["tesco-canal"])).toBeUndefined();
    // And one that is not on this map at all.
    expect(routeFromRoads(christmasRun, ["not-a-road"])).toBeUndefined();
  });
});

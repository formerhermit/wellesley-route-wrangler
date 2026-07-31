import { describe, expect, it } from "vitest";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import { sundayTrailRun } from "../data/sundayTrailRun";
import { emptyRoute, roadBetween } from "./routeGraph";
import { evaluateRoute } from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import {
  buildIncidentReport,
  closedRoadsIgnored,
  committeeComplaints,
  pigeonsSighted,
  unnecessaryHills,
  verdictFor,
} from "./incidentReport";
import { buildGameShare, buildRunShare, payloadToClipboard } from "./shareText";
import { shareLinksFor } from "./shareLinks";
import type { Level, Route } from "./types";

function routeOf(level: Level, ...nodeIds: string[]): Route {
  const roadIds = nodeIds.slice(1).map((to, index) => {
    const road = roadBetween(level, nodeIds[index], to);
    if (!road) throw new Error(`No road from ${nodeIds[index]} to ${to}`);
    return road.id;
  });
  return { nodeIds, roadIds };
}

const town = thursdaySocialRun;
const perfect = routeOf(
  town,
  "observatory",
  "wellesley-rumble",
  "medical-centre",
  "towpath",
  "private-bush",
  "the-hanger",
  "geese-pond",
  "polo-fields",
  "observatory",
);
/** Over Hospital Hill, which is where the hills live on this level. */
const overHospitalHill = routeOf(
  town,
  "observatory",
  "wellesley-rumble",
  "medical-centre",
  "hospital-hill",
  "big-tesco",
  "private-bush",
  "the-hanger",
);
const throughTheClosure = routeOf(
  town,
  "observatory",
  "wellesley-rumble",
  "geese-pond",
  "back-passage",
  "polo-fields",
  "observatory",
);

const reportFor = (level: Level, route: Route) =>
  buildIncidentReport(level, route, evaluateRoute(level, route));

const lineIn = (level: Level, route: Route, label: string) =>
  reportFor(level, route).lines.find((line) => line.label === label);

describe("incident report tallies", () => {
  it("counts pigeons from the roads actually taken", () => {
    // Rises with exposure, and is the same every time for the same route.
    expect(pigeonsSighted(town, perfect)).toBe(pigeonsSighted(town, perfect));
    expect(pigeonsSighted(town, perfect)).toBeGreaterThan(0);
    expect(pigeonsSighted(town, emptyRoute(town))).toBe(0);
  });

  it("counts hills and closures", () => {
    // The perfect route dodges Hospital Hill entirely.
    expect(unnecessaryHills(town, perfect)).toBe(0);
    expect(unnecessaryHills(town, overHospitalHill)).toBe(2);
    expect(closedRoadsIgnored(town, perfect)).toBe(0);
    expect(closedRoadsIgnored(town, throughTheClosure)).toBe(1);
  });

  it("raises one committee complaint per unmet objective", () => {
    expect(committeeComplaints(evaluateRoute(town, perfect))).toBe(0);
    expect(
      committeeComplaints(evaluateRoute(town, throughTheClosure)),
    ).toBeGreaterThan(0);
  });
});

describe("incident report lines", () => {
  it("ticks distance and everyone being home on a perfect run", () => {
    expect(lineIn(town, perfect, "Distance")).toMatchObject({
      value: "6.40 km",
      tone: "good",
    });
    expect(lineIn(town, perfect, "Nobody forgotten")).toMatchObject({
      value: "Yes",
      tone: "good",
    });
    expect(lineIn(town, perfect, "Committee complaints")).toMatchObject({
      value: "0",
      tone: "good",
    });
  });

  it("marks the closure in red when one was ignored", () => {
    expect(lineIn(town, throughTheClosure, "Closed paths ignored")).toMatchObject(
      { value: "1", tone: "bad" },
    );
  });

  it("reports on whatever the level happens to care about", () => {
    const trailRoute = routeOf(
      sundayTrailRun,
      "car-park",
      "cattlegrid",
      "cow-field",
      "stile",
      "suspicious-car",
      "gate",
      "portaloos",
      "soldiers",
      "woods",
      "trig",
      "stinky-pond",
      "car-park",
    );
    const labels = reportFor(sundayTrailRun, trailRoute).lines.map(
      (line) => line.label,
    );
    // The trail level cares about cows and tarmac; the town level does not.
    expect(labels).toContain("Cows greeted");
    expect(labels).toContain("Tarmac stretches");
    const townLabels = reportFor(town, perfect).lines.map((l) => l.label);
    expect(townLabels).not.toContain("Tarmac stretches");
    expect(townLabels).toContain("Canal visited");
  });
});

describe("verdict", () => {
  it("is deterministic and gets worse with complaints", () => {
    const good = evaluateRoute(town, perfect);
    expect(verdictFor(good, 0)).toBe("Surprisingly competent.");
    expect(verdictFor(good, 0)).toBe(verdictFor(good, 0));

    const bad = evaluateRoute(town, throughTheClosure);
    expect(verdictFor(bad, 1)).toBe("Broadly acceptable.");
    expect(verdictFor(bad, 3)).toBe("The committee will be in touch.");
    expect(verdictFor(bad, 99)).toBe("The committee will be in touch.");
  });

  it("says nothing happened for an empty route", () => {
    const nothing = evaluateRoute(town, emptyRoute(town));
    expect(verdictFor(nothing, 0)).toMatch(/No run/);
  });
});

describe("share text", () => {
  it("describes the run without leaving placeholders behind", () => {
    const evaluation = evaluateRoute(town, perfect);
    const payload = buildRunShare(
      town,
      selectResult(town, evaluation),
      buildIncidentReport(town, perfect, evaluation),
    );
    expect(payload.title).toContain("Perfect Social Run");
    expect(payload.text).toContain("6.40 km");
    expect(payload.text).toContain("Thursday Social Run");
    expect(payload.text).not.toContain("{km}");
    expect(payload.url).toBe("https://runners.sillygame.studio");
  });

  it("has a generic message for telling a friend", () => {
    const payload = buildGameShare();
    expect(payload.title).toBe("About Five Kilometres");
    expect(payloadToClipboard(payload)).toContain(payload.url);
  });
});

describe("share links", () => {
  const payload = buildGameShare();
  const links = shareLinksFor(payload);

  it("offers the platforms that have a web intent", () => {
    expect(links.map((l) => l.id)).toEqual([
      "whatsapp",
      "x",
      "facebook",
      "threads",
    ]);
  });

  it("encodes the message into every link", () => {
    for (const link of links) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.href).toContain(encodeURIComponent(payload.url));
      // Nothing raw and unescaped should reach the query string.
      expect(link.href).not.toContain(" ");
    }
  });

  it("sends Facebook the link only, since it writes its own preview", () => {
    const facebook = links.find((l) => l.id === "facebook");
    expect(facebook?.href).toContain(encodeURIComponent(payload.url));
    expect(facebook?.href).not.toContain(encodeURIComponent(payload.text));
  });
});

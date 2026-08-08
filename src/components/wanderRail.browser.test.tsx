import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import { selectNode } from "../game/routeGraph";
import { RouteMap } from "./RouteMap";
import "../styles.css";
import type { Level, Route } from "../game/types";

/**
 * The wander's one wiring rule (#10), which no pure test can see.
 *
 * The group's position is measured off a path element, and with nobody
 * navigating there are two candidates on screen: the route the player drew
 * and the rail they actually run. Getting them the wrong way round would
 * draw the wander and run the route — which looks *exactly* like the feature
 * working until you notice the group never leaves the line.
 *
 * So this asserts what is in the document: the drawn route is always the
 * plan, and the rail is the wander when the group is lost and the plan when
 * it is not.
 */

function routeThrough(level: Level, ids: string[]): Route {
  let route: Route = { nodeIds: [level.startNodeId], roadIds: [] };
  for (const id of ids) {
    const outcome = selectNode(level, route, id);
    if (outcome.kind === "rejected") throw new Error(outcome.reason);
    route = outcome.route;
  }
  return route;
}

const loop = routeThrough(thursdaySocialRun, [
  "polo-fields",
  "geese-pond",
  "towpath",
  "medical-centre",
  "wellesley-rumble",
  "observatory",
]);

function render(wander: boolean): SVGSVGElement {
  const host = document.createElement("div");
  document.body.append(host);
  act(() => {
    createRoot(host).render(
      <RouteMap
        level={thursdaySocialRun}
        route={loop}
        running={false}
        rejectedNodeId={null}
        reducedMotion={false}
        onSelect={() => {}}
        onRunFinished={() => {}}
        gnome={undefined}
        onGnomePressed={() => {}}
        wander={wander}
      />,
    );
  });
  const svg = host.querySelector("svg.map-svg");
  if (!svg) throw new Error("no map rendered");
  return svg as SVGSVGElement;
}

function lengthOf(svg: SVGSVGElement, selector: string): number {
  const path = svg.querySelector<SVGPathElement>(selector);
  if (!path) throw new Error(`no ${selector} in the map`);
  return path.getTotalLength();
}

describe("the rail the group runs on", () => {
  it("is the route itself when somebody is navigating", () => {
    const svg = render(false);
    expect(lengthOf(svg, ".route-rail")).toBeCloseTo(
      lengthOf(svg, ".route-line"),
      1,
    );
  });

  it("is longer than the route when nobody is", () => {
    const svg = render(true);
    // Every wrong turning is run twice, so the rail cannot help but be longer.
    expect(lengthOf(svg, ".route-rail")).toBeGreaterThan(
      lengthOf(svg, ".route-line") * 1.2,
    );
  });

  it("leaves the drawn route showing the plan either way", () => {
    // The player's line is the one thing the card must not touch: it is the
    // route being judged, and it is how they check what they laid.
    const planned = render(false).querySelector(".route-line")?.getAttribute("d");
    const lost = render(true).querySelector(".route-line")?.getAttribute("d");
    expect(lost).toBe(planned);
    expect(lost).toBeTruthy();
  });

  it("never paints the rail", () => {
    // It exists to be measured. Painted, it would read as a second route.
    const rail = render(true).querySelector(".route-rail");
    if (!rail) throw new Error("no rail");
    const style = getComputedStyle(rail);
    expect(style.stroke).toBe("none");
    expect(style.fill).toBe("none");
  });
});

import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { buildShareCard } from "./shareCard";
import { buildIncidentReport } from "./incidentReport";
import { evaluateRoute } from "./routeEvaluation";
import { selectResult } from "./resultSelection";
import { graphFor, otherEnd } from "./routeGraph";
import type { Level, Route } from "./types";

/**
 * Any loop out of the start and back, so every level has a real route to draw
 * rather than a fixture that goes stale the moment a map is edited.
 */
function someLoop(level: Level): Route {
  const graph = graphFor(level);
  const walk = (route: Route): Route | undefined => {
    const here = route.nodeIds[route.nodeIds.length - 1];
    if (route.roadIds.length > 0 && here === level.startNodeId) return route;
    if (route.roadIds.length > 7) return undefined;
    for (const road of graph.roadsByNode.get(here) ?? []) {
      if (route.roadIds.includes(road.id)) continue;
      const found = walk({
        nodeIds: [...route.nodeIds, otherEnd(road, here)],
        roadIds: [...route.roadIds, road.id],
      });
      if (found) return found;
    }
    return undefined;
  };
  return walk({ nodeIds: [level.startNodeId], roadIds: [] })!;
}

function cardFor(level: Level) {
  const route = someLoop(level);
  const evaluation = evaluateRoute(level, route);
  const result = selectResult(level, evaluation);
  const report = buildIncidentReport(level, route, evaluation);
  return { card: buildShareCard(level, route, result, report), route };
}

describe.each(levels.map((level) => [level.id, level] as const))(
  "%s share card",
  (_id, level: Level) => {
    it("is a whole SVG of the size it claims", () => {
      const { card } = cardFor(level);
      expect(card.svg.startsWith("<svg")).toBe(true);
      expect(card.svg.endsWith("</svg>")).toBe(true);
      expect(card.svg).toContain(`width="${card.width}"`);
      expect(card.svg).toContain(`height="${card.height}"`);
      expect(card.height).toBeGreaterThan(card.width / 2);
    });

    /*
     * The one that matters. A canvas will not fetch anything an SVG points at,
     * and a single external reference taints it so `toBlob` throws instead of
     * returning a picture — so the failure is a share with no image, which
     * nobody sees until they share a run. Everything is drawn, and every
     * colour is written out, precisely so this holds.
     */
    it("points at nothing outside itself", () => {
      const { card } = cardFor(level);
      expect(card.svg).not.toContain("<image");
      expect(card.svg).not.toContain("xlink:href");
      expect(card.svg).not.toContain("url(");
      expect(card.svg).not.toContain("@import");
      expect(card.svg).not.toMatch(/href="(?!#)/);
      // A class would need a stylesheet, and a detached SVG has none.
      expect(card.svg).not.toContain("class=");
    });

    it("draws the map it was run on, and the route over it", () => {
      const { card, route } = cardFor(level);
      // Every road on the level, faint, so the shape has something to mean.
      for (const road of level.roads) {
        expect(card.svg).toContain(`d="M ${nodeOf(level, road.from)}`);
      }
      expect(route.roadIds.length).toBeGreaterThan(0);
    });

    it("says which run it was", () => {
      const { card } = cardFor(level);
      // Escaped, because Caesar's Camp has an apostrophe in it and XML minds.
      const name = level.title.toUpperCase().replace(/'/g, "&apos;");
      expect(card.svg).toContain(name);
    });
  },
);

function nodeOf(level: Level, id: string): string {
  const node = level.nodes.find((n) => n.id === id)!;
  return `${node.x} ${node.y}`;
}

describe("a title with XML in it", () => {
  it("is escaped rather than left to break the picture", () => {
    const level = levels[0];
    const route = someLoop(level);
    const evaluation = evaluateRoute(level, route);
    const report = buildIncidentReport(level, route, evaluation);
    const result = {
      ...selectResult(level, evaluation),
      title: 'Pigeons & "friends" <script>',
    };
    const { svg } = buildShareCard(level, route, result, report);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&quot;");
  });
});

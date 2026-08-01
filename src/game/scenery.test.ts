import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import type { Level } from "./types";

/**
 * Scenery has no rules to break, so the only thing that can go wrong with it
 * is that it lands on something. Every sprite this catches was placed by hand
 * against roads worked out on paper, and the ones that went wrong went wrong
 * quietly — a hill marker under a road looks fine until you zoom in.
 *
 * The thresholds are deliberately loose. This is here to catch a decimal
 * point in the wrong place, not to art-direct.
 */

/** Distance from a point to a line segment. */
function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared),
  );
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** How close a piece of scenery may sit to the middle of a road. */
const ROAD_CLEARANCE = 14;
/** And to a junction, whose dot and halo take up sixteen units on their own. */
const JUNCTION_CLEARANCE = 20;

/** The moon is scenery in the sky, and the sky is over everything. */
const OVERHEAD = new Set(["moon", "bat", "butterfly"]);

describe.each(levels.map((level) => [level.id, level] as const))(
  "%s scenery",
  (_id, level: Level) => {
    const scatter = (level.scatter ?? []).filter(
      (item) => !OVERHEAD.has(item.kind),
    );

    it("keeps its scenery out of the roads", () => {
      const onTheRoad = scatter.filter((item) =>
        level.roads.some((road) => {
          const from = level.nodes.find((node) => node.id === road.from);
          const to = level.nodes.find((node) => node.id === road.to);
          if (!from || !to) return false;
          return (
            distanceToSegment(item.x, item.y, from.x, from.y, to.x, to.y) <
            ROAD_CLEARANCE
          );
        }),
      );
      expect(onTheRoad).toEqual([]);
    });

    it("keeps its scenery off the junctions", () => {
      const onAJunction = scatter.filter((item) =>
        level.nodes.some(
          (node) => Math.hypot(item.x - node.x, item.y - node.y) < JUNCTION_CLEARANCE,
        ),
      );
      expect(onAJunction).toEqual([]);
    });

    it("keeps its scenery off the writing", () => {
      // A rough box round each name, matching what MapJunctions draws: two
      // lines over eighteen characters, above or below or beside, and about
      // six units to the character.
      const boxes = level.nodes.map((node) => {
        const lines = node.label.length > 18 ? 2 : 1;
        const longest =
          lines === 1 ? node.label.length : Math.ceil(node.label.length / 2);
        const width = longest * 6.2;
        const height = lines * 13 + 6;
        const side = node.labelSide;
        const top =
          (side
            ? node.y + 4 - (lines - 1) * 6.5 - 11
            : node.labelAbove
              ? node.y - 30 - (lines - 1) * 13 - 11
              : node.y + 32 - 11) + (node.labelDy ?? 0);
        const left =
          side === "left"
            ? node.x - 24 - width
            : side === "right"
              ? node.x + 24
              : node.x - width / 2;
        return { left, right: left + width, top, bottom: top + height, node };
      });

      const onTheWriting = scatter.filter((item) =>
        boxes.some(
          (box) =>
            item.x > box.left - 10 &&
            item.x < box.right + 10 &&
            item.y > box.top - 12 &&
            item.y < box.bottom + 12,
        ),
      );
      expect(onTheWriting).toEqual([]);
    });

    it("keeps its scenery on the map", () => {
      for (const item of level.scatter ?? []) {
        expect(item.x, `${item.kind}.x`).toBeGreaterThanOrEqual(0);
        expect(item.x, `${item.kind}.x`).toBeLessThanOrEqual(level.view.width);
        expect(item.y, `${item.kind}.y`).toBeGreaterThanOrEqual(0);
        expect(item.y, `${item.kind}.y`).toBeLessThanOrEqual(level.view.height);
      }
    });
  },
);

import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { nodeById } from "./routeGraph";

/**
 * A road drawn underneath an unrelated junction makes that junction look as
 * though it sits on that road, which is exactly the sort of thing a player
 * cannot un-see. Junction dots have radius 9 and a halo of 16.
 */
const CLEARANCE = 20;

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq),
  );
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

describe("the detector itself", () => {
  it("flags the tarmac that used to run under Cow Field", () => {
    // stile -> cattlegrid passed 7.7 units from the Cow Field junction.
    expect(distanceToSegment(425, 480, 245, 505, 610, 470)).toBeCloseTo(7.7, 1);
  });

  it("does not flag a road that genuinely misses", () => {
    expect(distanceToSegment(425, 480, 245, 505, 455, 330)).toBeGreaterThan(
      CLEARANCE,
    );
  });
});

describe.each(levels.map((level) => [level.title, level] as const))(
  "%s map geometry",
  (_title, level) => {
    it("draws no road underneath an unrelated junction", () => {
      const offenders: string[] = [];

      for (const road of level.roads) {
        const from = nodeById(level, road.from);
        const to = nodeById(level, road.to);

        for (const node of level.nodes) {
          if (node.id === road.from || node.id === road.to) continue;
          const gap = distanceToSegment(
            node.x,
            node.y,
            from.x,
            from.y,
            to.x,
            to.y,
          );
          if (gap < CLEARANCE) {
            offenders.push(`${road.id} passes ${gap.toFixed(1)} from ${node.id}`);
          }
        }
      }

      expect(offenders).toEqual([]);
    });
  },
);

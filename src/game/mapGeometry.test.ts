import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { acrossRoadAngle, nodeById } from "./routeGraph";

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

describe("the closure barrier lies across its road", () => {
  it("turns a horizontal road's barrier upright", () => {
    expect(acrossRoadAngle({ x: 0, y: 0 }, { x: 100, y: 0 })).toBeCloseTo(90, 5);
  });

  it("lays a vertical road's barrier flat", () => {
    expect(acrossRoadAngle({ x: 0, y: 0 }, { x: 0, y: 100 })).toBeCloseTo(0, 5);
  });

  it("reads a road the same from either end", () => {
    const a = acrossRoadAngle({ x: 10, y: 20 }, { x: 90, y: 70 });
    const b = acrossRoadAngle({ x: 90, y: 70 }, { x: 10, y: 20 });
    expect(a).toBeCloseTo(b, 5);
  });

  it("never stands the sign on its head", () => {
    for (let deg = -180; deg <= 180; deg += 7) {
      const r = (deg * Math.PI) / 180;
      const angle = acrossRoadAngle(
        { x: 0, y: 0 },
        { x: Math.cos(r) * 100, y: Math.sin(r) * 100 },
      );
      expect(angle).toBeGreaterThan(-90.0001);
      expect(angle).toBeLessThanOrEqual(90.0001);
    }
  });
});

describe.each(levels.map((level) => [level.title, level] as const))(
  "%s map geometry",
  (_title, level) => {
    it("bars every closed road across its width, not along its length", () => {
      for (const road of level.roads.filter((r) => r.closed)) {
        const from = nodeById(level, road.from);
        const to = nodeById(level, road.to);
        const along = Math.atan2(to.y - from.y, to.x - from.x);
        const across = (acrossRoadAngle(from, to) * Math.PI) / 180;
        // Perpendicular means the two directions have no component in common.
        const dot = Math.abs(
          Math.cos(along) * Math.cos(across) + Math.sin(along) * Math.sin(across),
        );
        expect(dot, `${road.id} barrier is not across the road`).toBeCloseTo(0, 5);
      }
    });

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

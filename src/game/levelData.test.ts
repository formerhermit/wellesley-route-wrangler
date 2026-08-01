import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { graphFor, otherEnd, roadPathData } from "./routeGraph";
import type { Level } from "./types";

/**
 * Structural checks over the shipped levels. None of this is about whether a
 * level is fun — it is about the mistakes that are easy to make by hand in a
 * 280-line data file and hard to spot by eye: a road to a junction that was
 * renamed, an objective naming a node that no longer exists, a second road
 * between the same pair that the editing rules can never reach.
 */
describe.each(levels.map((level) => [level.id, level] as const))(
  "%s",
  (_id, level: Level) => {
    const nodeIds = new Set(level.nodes.map((node) => node.id));

    it("gives every junction and road a unique id", () => {
      expect(nodeIds.size).toBe(level.nodes.length);
      expect(new Set(level.roads.map((road) => road.id)).size).toBe(
        level.roads.length,
      );
    });

    it("joins roads to junctions that exist", () => {
      for (const road of level.roads) {
        expect(nodeIds, `${road.id}.from`).toContain(road.from);
        expect(nodeIds, `${road.id}.to`).toContain(road.to);
        expect(road.from, `${road.id} joins a junction to itself`).not.toBe(
          road.to,
        );
      }
    });

    it("gives every road a positive distance", () => {
      for (const road of level.roads) {
        expect(road.distanceKm, road.id).toBeGreaterThan(0);
      }
    });

    it("joins any pair of junctions by at most two roads", () => {
      // Two is a loop out and back around something, which the editing rules
      // and the drawing both handle. Three would have nowhere left to go: the
      // third road would be drawn on top of one of the first two.
      const pairs = new Map<string, string[]>();
      for (const road of level.roads) {
        const key = [road.from, road.to].sort().join(" – ");
        pairs.set(key, [...(pairs.get(key) ?? []), road.id]);
      }
      const crowded = [...pairs].filter(([, ids]) => ids.length > 2);
      expect(crowded).toEqual([]);
    });

    it("draws every road on its own line", () => {
      // Whatever the level says, no two roads may end up with the same path.
      const drawn = new Map<string, string[]>();
      for (const road of level.roads) {
        const d = roadPathData(level, road);
        drawn.set(d, [...(drawn.get(d) ?? []), road.id]);
      }
      const overlapping = [...drawn.values()].filter((ids) => ids.length > 1);
      expect(overlapping).toEqual([]);
    });

    it("starts and finishes at junctions that exist", () => {
      expect(nodeIds).toContain(level.startNodeId);
      expect(nodeIds).toContain(level.finishNodeId);
    });

    it("leaves no junction stranded off the network", () => {
      const graph = graphFor(level);
      const seen = new Set([level.startNodeId]);
      const queue = [level.startNodeId];
      while (queue.length > 0) {
        const id = queue.shift()!;
        for (const road of graph.roadsByNode.get(id) ?? []) {
          const next = otherEnd(road, id);
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      const unreachable = level.nodes
        .map((node) => node.id)
        .filter((id) => !seen.has(id));
      expect(unreachable).toEqual([]);
    });

    it("points its objectives at things the level actually has", () => {
      for (const objective of level.objectives) {
        if (objective.kind === "visit") {
          for (const id of objective.nodeIds) expect(nodeIds).toContain(id);
        }

        if (objective.kind === "max-node-type") {
          const matching = level.nodes.filter(
            (node) => node.type === objective.nodeType,
          );
          expect(matching.length, objective.nodeType).toBeGreaterThan(0);
        }

        if (objective.kind === "avoid-surface") {
          const matching = level.roads.filter(
            (road) => (road.surface ?? "road") === objective.surface,
          );
          expect(matching.length, objective.surface).toBeGreaterThan(0);
        }

        if (objective.kind === "avoid-closed") {
          expect(level.roads.some((road) => road.closed === true)).toBe(true);
        }
      }
    });

    it("waits for its follower at a junction that exists", () => {
      if (level.follower) expect(nodeIds).toContain(level.follower.nodeId);
    });

    it("keeps every junction inside the map's viewBox", () => {
      for (const node of level.nodes) {
        expect(node.x, `${node.id}.x`).toBeGreaterThanOrEqual(0);
        expect(node.x, `${node.id}.x`).toBeLessThanOrEqual(level.view.width);
        expect(node.y, `${node.id}.y`).toBeGreaterThanOrEqual(0);
        expect(node.y, `${node.id}.y`).toBeLessThanOrEqual(level.view.height);
      }
    });
  },
);

describe("the roster", () => {
  it("gives every level a distinct id", () => {
    expect(new Set(levels.map((level) => level.id)).size).toBe(levels.length);
  });
});

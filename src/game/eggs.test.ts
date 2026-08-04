import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { loopyRun } from "../data/loopyRun";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import {
  EGG_LANDMARKS,
  EGG_SCATTER,
  RIVAL_LAPS,
  eggResponds,
  gnomeSpots,
  hasTrackEgg,
  nextGnomeHome,
  pressesFor,
  rivalCircuit,
} from "./eggs";
import { LANDMARK_OFFSET, TRAIL_TREES, labelBox } from "./landmarks";
import { currentNodeId, roadById } from "./routeGraph";

/**
 * The easter eggs are a flourish, so what is worth testing is not that they
 * are funny but that they cannot break anything: the circuit has to describe a
 * real walk on a real map, and it has to stay described when somebody edits
 * the level underneath it.
 */
describe("the running track egg", () => {
  it("only exists on the level that has a track drawn", () => {
    const withTrack = levels.filter((level) => hasTrackEgg(level));
    expect(withTrack.map((level) => level.id)).toEqual(["loopy-run"]);
  });

  it("puts the track and the egg on the same map", () => {
    // A circuit on a level with no track to press would never fire, and a
    // track on a level with no circuit would be a dead thing to press.
    for (const level of levels) {
      const drawn = (level.scatter ?? []).some((item) => item.kind === "track");
      expect(hasTrackEgg(level), level.id).toBe(drawn);
    }
  });

  it("goes round the Hockey Loop circuit and comes back", () => {
    const circuit = rivalCircuit(loopyRun)!;
    expect(circuit.nodeIds).toEqual([
      "hockey-loop",
      "sports-centre",
      "polo-fields",
      "back-passage",
      "hockey-loop",
    ]);
    // Closed, or three laps would be three laps of something with two ends.
    expect(currentNodeId(circuit)).toBe(circuit.nodeIds[0]);
  });

  it("describes a real walk, road by road", () => {
    const circuit = rivalCircuit(loopyRun)!;
    expect(circuit.roadIds).toHaveLength(circuit.nodeIds.length - 1);
    circuit.roadIds.forEach((roadId, index) => {
      const road = roadById(loopyRun, roadId);
      const from = circuit.nodeIds[index];
      const to = circuit.nodeIds[index + 1];
      expect([road.from, road.to].sort()).toEqual([from, to].sort());
    });
  });

  it("uses each road once, so a lap is a lap", () => {
    const circuit = rivalCircuit(loopyRun)!;
    expect(new Set(circuit.roadIds).size).toBe(circuit.roadIds.length);
  });

  it("never sends them down anything shut", () => {
    const circuit = rivalCircuit(loopyRun)!;
    const closed = circuit.roadIds.filter(
      (id) => roadById(loopyRun, id).closed === true,
    );
    expect(closed).toEqual([]);
  });

  it("runs more than one lap, or it is not showing off", () => {
    expect(RIVAL_LAPS).toBeGreaterThan(1);
  });
});


describe("how often an egg answers", () => {
  it("answers once, unless it is the wall", () => {
    expect(pressesFor("cat")).toBe(1);
    expect(pressesFor("wall")).toBe(3);
  });

  it("stops answering once it has been found", () => {
    expect(eggResponds("cat", 0)).toBe(true);
    expect(eggResponds("cat", 1)).toBe(false);
    // The wall takes three, and the third is the one that costs it a chunk.
    expect(eggResponds("wall", 2)).toBe(true);
    expect(eggResponds("wall", 3)).toBe(false);
  });
});

describe("the gnome", () => {
  it("is in no level's scatter, because there is only one of him", () => {
    for (const level of levels) {
      const gnomes = (level.scatter ?? []).filter((one) => one.kind === "gnome");
      expect(gnomes, level.id).toEqual([]);
    }
    expect(EGG_SCATTER.has("gnome")).toBe(false);
  });

  /*
   * "Never on the roads or behind other SVGs" is the issue's wording and it is
   * the whole of the placement rule, so it gets checked on every map rather
   * than on one.
   */
  it("only ever stands somewhere clear, on every map", () => {
    const distanceToSegment = (
      px: number, py: number, ax: number, ay: number, bx: number, by: number,
    ) => {
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - ax, py - ay);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    };

    // One assertion per level rather than one per spot: there are a few
    // thousand spots on each map and `expect` is the expensive part.
    const broken: string[] = [];

    for (const level of levels) {
      const spots = gnomeSpots(level);
      expect(spots.length, `${level.id} has nowhere to put him`).toBeGreaterThan(0);

      const roads = level.roads
        .map((road) => ({
          id: road.id,
          from: level.nodes.find((node) => node.id === road.from)!,
          to: level.nodes.find((node) => node.id === road.to)!,
        }))
        .filter((road) => road.from && road.to);
      const landmarks = level.nodes
        .map((node) => {
          const kind = node.sprite ?? node.type;
          const place = kind ? LANDMARK_OFFSET[kind] : undefined;
          if (!place) return undefined;
          return {
            x: node.x + (node.spriteDx ?? place.dx),
            y: node.y + (node.spriteDy ?? place.dy),
          };
        })
        .filter((spot) => spot !== undefined);
      const boxes = level.nodes.map(labelBox);
      const trees = level.theme === "trail" ? TRAIL_TREES : [];

      for (const spot of spots) {
        const where = `${level.id} at ${spot.x},${spot.y}`;
        if (
          spot.x < 0 || spot.x > level.view.width ||
          spot.y < 0 || spot.y > level.view.height
        ) {
          broken.push(`${where} is off the paper`);
        }
        const road = roads.find(
          (one) =>
            distanceToSegment(spot.x, spot.y, one.from.x, one.from.y, one.to.x, one.to.y) < 18,
        );
        if (road) broken.push(`${where} is on ${road.id}`);
        if (level.nodes.some((n) => Math.hypot(spot.x - n.x, spot.y - n.y) < 26)) {
          broken.push(`${where} is on a junction`);
        }
        if (landmarks.some((p) => Math.hypot(spot.x - p.x, spot.y - p.y) < 26)) {
          broken.push(`${where} is on a landmark`);
        }
        if ((level.scatter ?? []).some((i) => Math.hypot(spot.x - i.x, spot.y - i.y) < 24)) {
          broken.push(`${where} is on some scenery`);
        }
        if (trees.some((t) => Math.hypot(spot.x - t.x, spot.y - t.y) < 26)) {
          broken.push(`${where} is in a tree`);
        }
        const onWriting = boxes.some(
          (box) =>
            spot.x > box.left - 10 && spot.x < box.right + 10 &&
            spot.y > box.top - 10 && spot.y < box.bottom + 10,
        );
        if (onWriting) broken.push(`${where} is on a name`);
      }
    }

    expect(broken.slice(0, 10)).toEqual([]);
  });

  it("always moves to a different map", () => {
    const completed = new Set(levels.map((level) => level.id));
    for (let roll = 0; roll < 1; roll += 0.01) {
      const home = nextGnomeHome(levels, completed, "loopy-run", roll)!;
      expect(home.levelId).not.toBe("loopy-run");
    }
  });

  it("never goes anywhere still locked", () => {
    // Nothing completed, so only level one is open — and he is on it.
    const nowhere = nextGnomeHome(levels, new Set<string>(), levels[0].id, 0.5);
    expect(nowhere).toBeUndefined();

    // One level completed opens the second, and that is the only way out.
    const completed = new Set([levels[0].id]);
    const home = nextGnomeHome(levels, completed, levels[0].id, 0.5)!;
    expect(home.levelId).toBe(levels[1].id);
  });

  it("puts him somewhere the map actually allows", () => {
    const completed = new Set(levels.map((level) => level.id));
    for (let roll = 0; roll < 1; roll += 0.017) {
      const home = nextGnomeHome(levels, completed, undefined, roll)!;
      const level = levels.find((one) => one.id === home.levelId)!;
      expect(
        gnomeSpots(level).some((spot) => spot.x === home.x && spot.y === home.y),
      ).toBe(true);
    }
  });
});

describe("what the map lets you press", () => {
  it("only lists kinds that something on the roster actually draws", () => {
    const scatterKinds = new Set(
      levels.flatMap((level) => (level.scatter ?? []).map((one) => one.kind)),
    );
    for (const kind of EGG_SCATTER) {
      expect(scatterKinds.has(kind), kind).toBe(true);
    }
    const nodeKinds = new Set(
      levels.flatMap((level) => level.nodes.map((node) => node.sprite ?? node.type)),
    );
    for (const kind of EGG_LANDMARKS) {
      expect(nodeKinds.has(kind), kind).toBe(true);
    }
  });

  it("finds A Private Bush, which is the one everybody will try", () => {
    const bush = thursdaySocialRun.nodes.find((node) => node.type === "bush");
    expect(bush).toBeDefined();
    expect(EGG_LANDMARKS.has("bush")).toBe(true);
  });
});

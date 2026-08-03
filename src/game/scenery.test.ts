import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { LANDMARK_OFFSET, TRAIL_TREES } from "./landmarks";
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

/**
 * And to a junction's own landmark. Loose enough that a soldier may tuck in
 * beside the hill he is hiding on, tight enough to catch a car parked under an
 * aeroplane.
 */
const LANDMARK_CLEARANCE = 26;

/**
 * How close a junction's own landmark may sit to any name on the map.
 *
 * Sixteen, and the number was measured rather than picked. Every landmark on
 * the roster clears twelve; at sixteen exactly the two real clashes fall out
 * (#102) and nothing else does; by twenty it is flagging a bush tucked under
 * its own label on purpose. A landmark is anchored by a point but drawn around
 * it, which is the whole reason a gap of nothing still reads as a collision.
 */
const LABEL_CLEARANCE = 16;

/**
 * The moon is scenery in the sky, and the sky is over everything.
 *
 * A butterfly used to be on this list and should not have been. It is drawn at
 * ground level on a daylight map like everything else, and the exemption was
 * quietly letting one sit on a road at Thursley. Nothing else on the roster
 * was relying on it — Tilford's two are forty-five and seventy-three units
 * from the nearest road.
 */
const OVERHEAD = new Set(["moon", "bat"]);

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

    it("keeps its scenery off the landmarks", () => {
      // Where every junction's own sprite ends up, which is not the junction:
      // Hecking Airport's aeroplane parks ninety units to its left, and a car
      // scattered there sits underneath it.
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

      // A closed road carries a barrier across its middle, and that barrier is
      // a good deal wider than the road it bars. Scenery cleared the road and
      // then sat under the sign, which is how the holly on the Christmas Run
      // ended up beneath a road closure.
      const barriers = level.roads
        .filter((road) => road.closed === true)
        .map((road) => {
          const from = level.nodes.find((node) => node.id === road.from);
          const to = level.nodes.find((node) => node.id === road.to);
          if (!from || !to) return undefined;
          return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        })
        .filter((spot) => spot !== undefined);

      const onALandmark = scatter.filter((item) =>
        [...landmarks, ...barriers].some(
          (spot) => Math.hypot(item.x - spot.x, item.y - spot.y) < LANDMARK_CLEARANCE,
        ),
      );
      expect(onALandmark).toEqual([]);
    });

    it("keeps its scenery off the trees the theme already planted", () => {
      if (level.theme !== "trail") return;
      const onATree = scatter.filter((item) =>
        TRAIL_TREES.some(
          (tree) => Math.hypot(item.x - tree.x, item.y - tree.y) < LANDMARK_CLEARANCE,
        ),
      );
      expect(onATree).toEqual([]);
    });

    /**
     * A rough box round each name, matching what MapJunctions draws: two
     * lines over eighteen characters, above or below or beside, and about six
     * units to the character.
     */
    const labelBoxes = () =>
      level.nodes.map((node) => {
        const lines = node.label.length > 18 || node.labelWrap ? 2 : 1;
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

    it("keeps its scenery off the writing", () => {
      const onTheWriting = scatter.filter((item) =>
        labelBoxes().some(
          (box) =>
            item.x > box.left - 10 &&
            item.x < box.right + 10 &&
            item.y > box.top - 12 &&
            item.y < box.bottom + 12,
        ),
      );
      expect(onTheWriting).toEqual([]);
    });

    /*
     * The one above checks scattered scenery. This checks the sprite a
     * junction brings with it, which nothing was checking at all — which is
     * how a toilet came to be parked against the word "Toilet" on four maps at
     * once, and stayed there through everything else this file caught.
     */
    it("keeps a junction's own landmark off the writing", () => {
      const boxes = labelBoxes();
      const clashes = level.nodes
        .map((node) => {
          const kind = node.sprite ?? node.type;
          const place = kind ? LANDMARK_OFFSET[kind] : undefined;
          if (!place) return undefined;
          const x = node.x + (node.spriteDx ?? place.dx);
          const y = node.y + (node.spriteDy ?? place.dy);
          const box = boxes.find(
            (b) =>
              x > b.left - LABEL_CLEARANCE &&
              x < b.right + LABEL_CLEARANCE &&
              y > b.top - LABEL_CLEARANCE &&
              y < b.bottom + LABEL_CLEARANCE,
          );
          return box ? `${kind} of ${node.id} on the name of ${box.node.id}` : undefined;
        })
        .filter((clash) => clash !== undefined);

      expect(clashes).toEqual([]);
    });

    /*
     * And off the roads, which nothing was checking either — a landmark could
     * sit squarely across a track and only a person looking at the map would
     * know. Thursley shipped five of them at once: a coffee van under a lane,
     * a pub off the top of the paper, a hill marker lying along a track, the
     * Atlantic Wall across the dam, and a bridge buried under its own
     * junction.
     *
     * Eighteen, measured the same way the label clearance was. Everything on
     * the roster clears it but three, and all three are deliberate: a bridge
     * stands *in* the road by definition, the road round the Sports Centre is
     * the whole point of that junction, and the ski slope marks itself
     * `spriteOnTop` because there is nowhere on that map it can stand that a
     * road does not already cross.
     */
    it("keeps a junction's own landmark out of the roads", () => {
      const exempt = new Set(["bridge", "sportscentre"]);
      const across = level.nodes
        .map((node) => {
          const kind = node.sprite ?? node.type;
          const place = kind ? LANDMARK_OFFSET[kind] : undefined;
          if (!place || !kind || exempt.has(kind) || node.spriteOnTop) return undefined;
          const x = node.x + (node.spriteDx ?? place.dx);
          const y = node.y + (node.spriteDy ?? place.dy);
          const tooClose = level.roads.some((road) => {
            const from = level.nodes.find((n) => n.id === road.from);
            const to = level.nodes.find((n) => n.id === road.to);
            if (!from || !to) return false;
            return distanceToSegment(x, y, from.x, from.y, to.x, to.y) < 18;
          });
          return tooClose ? `${kind} of ${node.id}` : undefined;
        })
        .filter((clash) => clash !== undefined);

      expect(across).toEqual([]);
    });

    /*
     * And on the paper at all. A pub hangs sixty units above its junction, and
     * on a junction sixty from the top of the map that drew it off the paper
     * entirely.
     *
     * Twenty, not thirty: this is a point test and the sprites have their own
     * widths, so it can only catch a landmark that has plainly left the map.
     * Hawley's Not a Hill sits at 774 of 800 and is fine — the marker is
     * sixteen wide and ends at 790 — and a stricter line would fail it.
     */
    it("keeps a junction's own landmark on the map", () => {
      for (const node of level.nodes) {
        const kind = node.sprite ?? node.type;
        const place = kind ? LANDMARK_OFFSET[kind] : undefined;
        if (!place) continue;
        const x = node.x + (node.spriteDx ?? place.dx);
        const y = node.y + (node.spriteDy ?? place.dy);
        expect(x, `${kind} of ${node.id} x`).toBeGreaterThanOrEqual(20);
        expect(x, `${kind} of ${node.id} x`).toBeLessThanOrEqual(level.view.width - 20);
        expect(y, `${kind} of ${node.id} y`).toBeGreaterThanOrEqual(20);
        expect(y, `${kind} of ${node.id} y`).toBeLessThanOrEqual(level.view.height - 20);
      }
    });

    it("puts the theme's own trees somewhere sensible too", () => {
      if (level.theme !== "trail") return;

      const inTheWay = TRAIL_TREES.filter((tree) => {
        const onRoad = level.roads.some((road) => {
          const from = level.nodes.find((node) => node.id === road.from);
          const to = level.nodes.find((node) => node.id === road.to);
          if (!from || !to) return false;
          return (
            distanceToSegment(tree.x, tree.y, from.x, from.y, to.x, to.y) <
            ROAD_CLEARANCE
          );
        });
        const onJunction = level.nodes.some(
          (node) => Math.hypot(tree.x - node.x, tree.y - node.y) < JUNCTION_CLEARANCE,
        );
        const onWriting = labelBoxes().some(
          (box) =>
            tree.x > box.left - 10 &&
            tree.x < box.right + 10 &&
            tree.y > box.top - 12 &&
            tree.y < box.bottom + 12,
        );
        return onRoad || onJunction || onWriting;
      });
      expect(inTheWay).toEqual([]);
    });

    /*
     * Ground is allowed under anything — roads crossing it is the point — so
     * the only thing it can get wrong is running off the paper, where it would
     * square off against the rounded corner of the map instead of fading into
     * it.
     *
     * This used to assert that only town maps had any, on the reasoning that a
     * trail map is already a field. It is not quite: a trail map is mostly a
     * field, and the raceway apron and the car park on the Thursday Night Run
     * are hardstanding wherever they happen to be. The rule that replaced it is
     * about colour rather than permission — a patch takes its theme's own grey,
     * because the town's was mixed against cream paper and reads as a warm
     * blotch on grass.
     */
    it("keeps the built-up ground on the map", () => {
      for (const patch of level.ground ?? []) {
        expect(patch.x).toBeGreaterThanOrEqual(0);
        expect(patch.y).toBeGreaterThanOrEqual(0);
        expect(patch.x + patch.width).toBeLessThanOrEqual(level.view.width);
        expect(patch.y + patch.height).toBeLessThanOrEqual(level.view.height);
      }
    });

    /*
     * Two patches that overlap merge into one shape with a seam across it,
     * which is neither of the two areas anybody meant to draw. They may abut;
     * they may not overlap.
     */
    it("does not lay one patch of ground over another", () => {
      const patches = level.ground ?? [];
      const overlapping = patches.flatMap((a, i) =>
        patches.slice(i + 1).flatMap((b) =>
          a.x < b.x + b.width &&
          b.x < a.x + a.width &&
          a.y < b.y + b.height &&
          b.y < a.y + a.height
            ? [`${i} over ${patches.indexOf(b)}`]
            : [],
        ),
      );
      expect(overlapping).toEqual([]);
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

import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import {
  LANDMARK_BOX,
  LANDMARK_OFFSET,
  PARK_TREES,
  SCATTER_BOX,
  TRAIL_TREES,
  boxOf,
  labelBox,
} from "./landmarks";
import { hillMarkerAt } from "./routeGraph";
import type { Level, MapNode } from "./types";

/**
 * Scenery has no rules to break, so the only thing that can go wrong with it
 * is that it lands on something. Every sprite this catches was placed by hand
 * against roads worked out on paper, and the ones that went wrong went wrong
 * quietly — a hill marker under a road looks fine until you zoom in.
 *
 * Everything here measures the sprite's **drawing**, not its anchor (#110).
 * That distinction was the bug: a sprite is placed by a point and drawn around
 * it, and checking the point let seven landmarks ship sitting on a road or
 * under a label while clearing the old thresholds comfortably. Pyestock Wood
 * was 20.5 units from the road against a limit of 18, and lay across it,
 * because a wood is sixty units wide. The extents are in `landmarks.ts` and
 * were measured off the rendered sprites rather than guessed.
 *
 * What is measured is overlap rather than distance, which is the other half of
 * getting this right — see `roadDepth`. A box is a crude stand-in for a
 * triangle or a cottage, so asking how far a sprite sits from a road flags
 * everything drawn near a lane; asking how far the road gets inside it does
 * not.
 */

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

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

/**
 * How far a road's centre line runs *inside* a drawing, at its deepest.
 *
 * Depth rather than distance, and that is the whole calibration. A box is a
 * crude stand-in for a triangle or a cottage, so its corners are mostly empty
 * paper — measuring the gap between box and road flags every sprite that
 * happens to sit near a lane, and 39 of the 303 drawings on the roster do.
 * Measuring how far the road gets *in* separates the two cases a person
 * actually sees: a road grazing the corner of a sprite (fine, and everywhere)
 * from a road running through the middle of one (wrong, and rare).
 */
function roadDepth(box: Box, ax: number, ay: number, bx: number, by: number) {
  const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / 2));
  let worst = 0;
  for (let i = 0; i <= steps; i += 1) {
    const x = ax + ((bx - ax) * i) / steps;
    const y = ay + ((by - ay) * i) / steps;
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
    worst = Math.max(
      worst,
      Math.min(x - box.left, box.right - x, y - box.top, box.bottom - y),
    );
  }
  return worst;
}

/** And how far two drawings overlap, in whichever direction they overlap least. */
const boxDepth = (a: Box, b: Box) =>
  Math.max(
    0,
    Math.min(
      Math.min(a.right, b.right) - Math.max(a.left, b.left),
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
    ),
  );

/*
 * The three numbers, and all three were measured rather than picked — see the
 * top of the file. Every drawing on the roster was ranked by depth and each of
 * these sits in a gap in that ranking, so there is room on both sides: the
 * deepest road graze anybody has shipped on purpose is 2.8 and the shallowest
 * genuine clash is 7.2; the deepest accidental overlap between two drawings is
 * 3.0 and the shallowest real one is 16.
 */
const ROAD_DEPTH = 6;
const SOLID_DEPTH = 8;
const NAME_DEPTH = 6;
/**
 * A junction's halo is drawn at r=16 with a stroke on top, so about eighteen
 * units of the map belong to the dot and anything under it is invisible.
 * Junctions are drawn after the landmarks, so "under" is literal.
 */
const JUNCTION_DOT = 18;
/** A junction's dot and halo take up sixteen units on their own. */
const JUNCTION_CLEARANCE = 10;

/** How far a point is from a box. Zero when it is inside it. */
const boxToPoint = (box: Box, x: number, y: number) =>
  Math.hypot(
    Math.max(box.left - x, 0, x - box.right),
    Math.max(box.top - y, 0, y - box.bottom),
  );

/**
 * The moon is scenery in the sky, and the sky is over everything.
 *
 * A butterfly used to be on this list and should not have been. It is drawn at
 * ground level on a daylight map like everything else, and the exemption was
 * quietly letting one sit on a road at Thursley.
 */
const OVERHEAD = new Set(["moon", "bat"]);

/**
 * Landmarks that stand in a road by design. A bridge crosses one by definition;
 * the road round the Sports Centre is the whole point of that junction; and a
 * `park` is a green with roads through it, which is what a green is.
 */
/**
 * And the one landmark that is drawn *on* its junction on purpose: a bridge
 * stands in the river at the point the road crosses it.
 */
const ON_THE_JUNCTION = new Set(["bridge"]);

const IN_THE_ROAD = new Set([
  "bridge",
  "sportscentre",
  "park",
  "pond",
  // A start line is painted across the tarmac. That is what a start line is.
  "startline",
]);

describe.each(levels.map((level) => [level.id, level] as const))(
  "%s scenery",
  (_id, level: Level) => {
    const scatter = (level.scatter ?? []).filter(
      (item) => !OVERHEAD.has(item.kind),
    );

    /** Every hand-placed thing, as the box it is actually drawn in. */
    const scatterBoxes = () =>
      scatter.map((item) => ({
        what: `${item.kind} at ${item.x},${item.y}`,
        kind: item.kind as string,
        box: boxOf(SCATTER_BOX[item.kind], item.x, item.y, item.flip),
      }));

    const kindOf = (node: MapNode) => node.sprite ?? node.type;

    /** And every landmark a junction brings with it. */
    const landmarkBoxes = () =>
      level.nodes
        .map((node) => {
          const kind = kindOf(node);
          const place = kind ? LANDMARK_OFFSET[kind] : undefined;
          if (!place || !kind) return undefined;
          return {
            what: `${kind} of ${node.id}`,
            kind,
            node,
            box: boxOf(
              LANDMARK_BOX[kind],
              node.x + (node.spriteDx ?? place.dx),
              node.y + (node.spriteDy ?? place.dy),
            ),
          };
        })
        .filter((one) => one !== undefined);

    /**
     * The trees a park scatters round itself, which nothing checked at all
     * before #110 — seven levels have a park, and the supporters at Cove Green
     * were placed squarely behind one with the suite perfectly happy.
     */
    const parkTrees = () =>
      level.nodes
        .filter((node) => node.type === "park" && !node.noTrees)
        .flatMap((node) =>
          PARK_TREES.map((tree) => ({
            what: `a park tree at ${node.id}`,
            box: boxOf(SCATTER_BOX.tree, node.x + tree.dx, node.y + tree.dy),
          })),
        );

    const themeTrees = () =>
      level.theme === "trail"
        ? TRAIL_TREES.map((tree) => ({
            what: `the trail tree at ${tree.x},${tree.y}`,
            box: boxOf(SCATTER_BOX.tree, tree.x, tree.y),
          }))
        : [];

    const labelBoxes = () =>
      level.nodes.map((node) => ({ what: `the name of ${node.id}`, ...labelBox(node) }));

    /**
     * The triangles the map puts beside every climb (#118). Checked here for
     * the same reason the park's trees are: nobody places them, so nobody
     * notices when one lands on a name.
     */
    const hillMarkers = () =>
      level.roads
        .filter((road) => road.hill)
        .map((road) => {
          const spot = hillMarkerAt(level, road);
          return {
            what: `the hill marker on ${road.id}`,
            box: boxOf([-11, 11, -8, 7], spot.x, spot.y),
          };
        });

    const roadRunsThrough = (box: Box) =>
      level.roads.some((road) => {
        const from = level.nodes.find((node) => node.id === road.from);
        const to = level.nodes.find((node) => node.id === road.to);
        if (!from || !to) return false;
        return roadDepth(box, from.x, from.y, to.x, to.y) > ROAD_DEPTH;
      });

    const onAJunction = (box: Box) =>
      level.nodes.some(
        (node) =>
          distanceToSegment(node.x, node.y, box.left, box.top, box.right, box.top) <
            JUNCTION_CLEARANCE ||
          distanceToSegment(node.x, node.y, box.left, box.bottom, box.right, box.bottom) <
            JUNCTION_CLEARANCE ||
          (node.x > box.left && node.x < box.right && node.y > box.top && node.y < box.bottom),
      );

    it("keeps its scenery out of the roads", () => {
      const onTheRoad = scatterBoxes()
        .filter((one) => !IN_THE_ROAD.has(one.kind) && roadRunsThrough(one.box))
        .map((one) => one.what);
      expect(onTheRoad).toEqual([]);
    });

    it("keeps its scenery off the junctions", () => {
      const sitting = scatterBoxes()
        .filter((one) => onAJunction(one.box))
        .map((one) => one.what);
      expect(sitting).toEqual([]);
    });

    it("keeps its scenery off the landmarks", () => {
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
          return {
            what: `the closure on ${road.id}`,
            box: boxOf([-17, 17, -6, 18], (from.x + to.x) / 2, (from.y + to.y) / 2),
          };
        })
        .filter((one) => one !== undefined);

      const solid = [...landmarkBoxes(), ...barriers];
      const clashes = scatterBoxes().flatMap((one) =>
        solid
          .filter((mark) => boxDepth(one.box, mark.box) > SOLID_DEPTH)
          .map((mark) => `${one.what} over ${mark.what}`),
      );
      expect(clashes).toEqual([]);
    });

    it("keeps its scenery off the trees, the theme's and the parks'", () => {
      const trees = [...themeTrees(), ...parkTrees()];
      const clashes = scatterBoxes().flatMap((one) =>
        trees
          .filter((tree) => boxDepth(one.box, tree.box) > SOLID_DEPTH)
          .map((tree) => `${one.what} over ${tree.what}`),
      );
      expect(clashes).toEqual([]);
    });

    it("keeps its scenery off the writing", () => {
      const clashes = scatterBoxes().flatMap((one) =>
        labelBoxes()
          .filter((name) => boxDepth(one.box, name) > NAME_DEPTH)
          .map((name) => `${one.what} over ${name.what}`),
      );
      expect(clashes).toEqual([]);
    });

    /*
     * The three below check the sprite a junction brings with it, which for a
     * long time nothing checked at all — which is how a toilet came to be
     * parked against the word "Toilet" on four maps at once.
     */
    it("keeps a junction's own landmark off the writing", () => {
      const clashes = landmarkBoxes().flatMap((mark) =>
        labelBoxes()
          .filter((name) => boxDepth(mark.box, name) > NAME_DEPTH)
          .map((name) => `${mark.what} on ${name.what}`),
      );
      expect(clashes).toEqual([]);
    });

    it("keeps the hill markers off the writing and the scenery", () => {
      const marks = hillMarkers();
      const clashes = [
        ...marks.flatMap((mark) =>
          labelBoxes()
            .filter((name) => boxDepth(mark.box, name) > NAME_DEPTH)
            .map((name) => `${mark.what} over ${name.what}`),
        ),
        ...marks.flatMap((mark) =>
          [...landmarkBoxes(), ...scatterBoxes(), ...themeTrees(), ...parkTrees()]
            .filter((thing) => boxDepth(mark.box, thing.box) > SOLID_DEPTH)
            .map((thing) => `${mark.what} over ${thing.what}`),
        ),
      ];
      expect(clashes).toEqual([]);
    });

    it("keeps the hill markers on the map", () => {
      const off = hillMarkers()
        .filter(
          (mark) =>
            mark.box.left < 0 ||
            mark.box.top < 0 ||
            mark.box.right > level.view.width ||
            mark.box.bottom > level.view.height,
        )
        .map((mark) => mark.what);
      expect(off).toEqual([]);
    });

    it("keeps a junction's own landmark off every other one", () => {
      /*
       * Tree against tree is allowed and is why this is not simply every pair.
       * The theme plants two of its eight within fourteen units of each other
       * on purpose — that is a copse, not a collision, and it would otherwise
       * fail every trail map on the roster identically.
       */
      const marks = [
        ...landmarkBoxes().map((m) => ({ ...m, tree: false })),
        ...themeTrees().map((m) => ({ ...m, tree: true })),
        ...parkTrees().map((m) => ({ ...m, tree: true })),
      ];
      const clashes = marks.flatMap((a, i) =>
        marks
          .slice(i + 1)
          .filter((b) => !(a.tree && b.tree) && boxDepth(a.box, b.box) > SOLID_DEPTH)
          .map((b) => `${a.what} over ${b.what}`),
      );
      expect(clashes).toEqual([]);
    });

    /*
     * Junctions are drawn after the landmarks, so a sprite that strays under
     * one is simply gone. Nothing checked this until level 15 shipped four of
     * them at once — a cave, an abbey, a hill marker and a car park sign, all
     * tucked behind their own junction's dot.
     */
    it("keeps a junction's own landmark out from under the dots", () => {
      const hidden = landmarkBoxes()
        .filter((mark) => !ON_THE_JUNCTION.has(mark.kind))
        .flatMap((mark) =>
          level.nodes
            .filter((node) => boxToPoint(mark.box, node.x, node.y) < JUNCTION_DOT)
            .map((node) => `${mark.what} under ${node.id}`),
        );
      expect(hidden).toEqual([]);
    });

    it("keeps a junction's own landmark out of the roads", () => {
      const across = landmarkBoxes()
        .filter(
          (mark) =>
            !IN_THE_ROAD.has(mark.kind) &&
            !mark.node.spriteOnTop &&
            roadRunsThrough(mark.box),
        )
        .map((mark) => mark.what);
      expect(across).toEqual([]);
    });

    /*
     * And on the paper at all. A pub hangs sixty units above its junction, and
     * on a junction sixty from the top of the map that drew it off the paper
     * entirely. Measured on the drawing now, so it means what it says.
     */
    it("keeps a junction's own landmark on the map", () => {
      const off = landmarkBoxes()
        .filter(
          (mark) =>
            mark.box.left < 0 ||
            mark.box.top < 0 ||
            mark.box.right > level.view.width ||
            mark.box.bottom > level.view.height,
        )
        .map((mark) => mark.what);
      expect(off).toEqual([]);
    });

    it("puts the theme's own trees somewhere sensible too", () => {
      const inTheWay = themeTrees()
        .filter(
          (tree) =>
            roadRunsThrough(tree.box) ||
            onAJunction(tree.box) ||
            labelBoxes().some((name) => boxDepth(tree.box, name) > NAME_DEPTH),
        )
        .map((tree) => tree.what);
      expect(inTheWay).toEqual([]);
    });

    /*
     * Ground is allowed under anything — roads crossing it is the point — so
     * the only thing it can get wrong is running off the paper, where it would
     * square off against the rounded corner of the map instead of fading into
     * it.
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
        const box = boxOf(SCATTER_BOX[item.kind], item.x, item.y, item.flip);
        expect(box.left, `${item.kind}.x`).toBeGreaterThanOrEqual(0);
        expect(box.right, `${item.kind}.x`).toBeLessThanOrEqual(level.view.width);
        expect(box.top, `${item.kind}.y`).toBeGreaterThanOrEqual(0);
        expect(box.bottom, `${item.kind}.y`).toBeLessThanOrEqual(level.view.height);
      }
    });
  },
);

/*
 * And the bug itself, pinned (#110). Everything above says the roster is clean
 * today; this says the *method* is the one that would have caught it, which is
 * the part that can quietly rot. Both cases below passed every threshold in the
 * old point-based file and both were visibly wrong on the map.
 */
describe("measuring the drawing rather than its anchor", () => {
  const box = (kind: string, x: number, y: number) => boxOf(SCATTER_BOX[kind] ?? LANDMARK_BOX[kind as never], x, y);

  /*
   * Wharf Copse on the Thursday Night Run, exactly as it shipped. Its anchor
   * sat 21 units from the nearest lane — clear of the old limit of 18, and the
   * suite was green — while the drawing had that lane ten units inside it. Both
   * halves are asserted, because the point of the change is the gap between
   * them.
   */
  it("catches a wood with a road inside it that its anchor clears", () => {
    const level = levels.find((one) => one.id === "thursday-night-run")!;
    const node = level.nodes.find((one) => one.id === "wharf-copse")!;
    const asShipped = { x: node.x - 62, y: node.y - 42 };
    const wood = boxOf(LANDMARK_BOX.woods, asShipped.x, asShipped.y);

    let anchor = Infinity;
    let depth = 0;
    for (const road of level.roads) {
      const from = level.nodes.find((one) => one.id === road.from)!;
      const to = level.nodes.find((one) => one.id === road.to)!;
      anchor = Math.min(
        anchor,
        distanceToSegment(asShipped.x, asShipped.y, from.x, from.y, to.x, to.y),
      );
      depth = Math.max(depth, roadDepth(wood, from.x, from.y, to.x, to.y));
    }
    expect(anchor).toBeGreaterThan(18);
    expect(depth).toBeGreaterThan(6);
  });

  /* And the same gap between a landmark and a tree the theme plants itself. */
  it("catches a shop drawn on top of a tree nobody placed by hand", () => {
    const level = levels.find((one) => one.id === "tilford-run")!;
    const node = level.nodes.find((one) => one.id === "village-shop")!;
    const shop = boxOf(LANDMARK_BOX.shop, node.x, node.y - 62);
    const tree = boxOf(SCATTER_BOX.tree, 90, 90);
    expect(Math.hypot(node.x - 90, node.y - 62 - 90)).toBeGreaterThan(20);
    expect(boxDepth(shop, tree)).toBeGreaterThan(8);
  });

  it("catches a crowd standing under a road on the side it is drawn", () => {
    // The Farnborough supporters: eighteen units off the road, which cleared
    // the old fourteen, with a sprite that runs from x-16 to x+26. The anchor
    // was on the pavement and the far end of the drawing was on the tarmac.
    const crowd = box("supporters", -18, 0);
    expect(Math.abs(-18)).toBeGreaterThan(14);
    expect(roadDepth(crowd, 0, -200, 0, 200)).toBeGreaterThan(6);
  });

  it("knows a road grazing a corner is not the same thing", () => {
    // The other half of the calibration. If this failed, the test would be
    // flagging a third of the roster and would be turned off within a week.
    const hill = boxOf(LANDMARK_BOX.hill, 0, 0);
    expect(roadDepth(hill, -200, 12, 200, 12)).toBeLessThanOrEqual(6);
  });

  it("knows about the trees a park plants, which nothing used to", () => {
    expect(PARK_TREES.length).toBe(3);
    const parks = levels.filter((level) =>
      level.nodes.some((node) => node.type === "park" && !node.noTrees),
    );
    expect(parks.length).toBeGreaterThan(4);
  });
});

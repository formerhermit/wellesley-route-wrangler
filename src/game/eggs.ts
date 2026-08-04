import { LANDMARK_OFFSET, PARK_TREES, TRAIL_TREES, labelBox } from "./landmarks";
import { isUnlocked } from "./progression";
import { roadBetween } from "./routeGraph";
import type { Completed } from "./progression";
import type { Level, MapNode, MapNodeType, Route } from "./types";

type ScatterItem = NonNullable<Level["scatter"]>[number];
type ScatterKind = ScatterItem["kind"];

/**
 * Easter eggs: scenery that does something when you press it (#104).
 *
 * Two rules hold the whole idea together and both are the issue's own. They
 * fire **once per level**, so the delight is in finding one rather than in
 * poking it; and they **never score**. Nothing in here touches the route, the
 * run book or the scoring, and it must stay that way — an egg that moved the
 * total would turn a joke into a mechanic, and the mechanic would be "click
 * the scenery a lot".
 *
 * Pure, like the rest of `src/game/`, so what an egg *is* can be tested
 * without a browser. What it looks like is the component's problem.
 */

/**
 * Scenery that answers a press, by what it is drawn as.
 *
 * Two lists because the map draws from two places: `scatter` is put down by
 * hand and landmarks come from a junction's type. Nothing else about them
 * differs — both are decoration, both are `aria-hidden`, and neither scores.
 */
export const EGG_SCATTER: ReadonlySet<ScatterKind> = new Set<ScatterKind>([
  "track",
  "cat",
  "lights",
  "icecream",
  "soldier",
  "snowman",
  "moon",
  "cow",
]);

export const EGG_LANDMARKS: ReadonlySet<MapNodeType> = new Set<MapNodeType>([
  "bush",
  "portaloo",
  "cow",
  "wall",
  "airport",
]);

/**
 * How many presses each one answers before it stops.
 *
 * One is the rule and the Atlantic Wall is the exception: it takes three, a
 * puff of dust each time, and loses a chunk on the last. Everything not listed
 * here answers once and then it has been found.
 */
const EGG_PRESSES: Partial<Record<string, number>> = { wall: 3 };

export function pressesFor(kind: string): number {
  return EGG_PRESSES[kind] ?? 1;
}

/** Whether a press does anything, given how many it has already had. */
export function eggResponds(kind: string, pressed: number): boolean {
  return pressed < pressesFor(kind);
}

/**
 * What an egg is called, so the same sprite in two places on one map counts as
 * two eggs rather than one. Scatter is keyed on where it was put; a landmark is
 * keyed on its junction, which is unique already.
 */
export function scatterEggId(item: ScatterItem): string {
  return `${item.kind}-${item.x}-${item.y}`;
}

export function landmarkEggId(node: MapNode): string {
  return `node-${node.id}`;
}

/**
 * The circuit the rival runners take on Loopy, as junctions in order.
 *
 * The issue asks for "the hockey loop to the sports centre to the back passage
 * to the polo fields", which is the right four junctions in an order the map
 * does not have: there is no road from the Sports Centre to the Back Passage.
 * The loop those four actually make is this one, and it is already spelled out
 * in `loopyRun`'s own road comments — Polo Fields down to the Sports Centre,
 * across to the Hockey Loop, back to the Back Passage, and the Back Passage to
 * the Polo Fields again.
 */
const TRACK_CIRCUIT: Record<string, string[]> = {
  "loopy-run": [
    "hockey-loop",
    "sports-centre",
    "polo-fields",
    "back-passage",
    "hockey-loop",
  ],
};

/** How many times round they go before they are done showing off. */
export const RIVAL_LAPS = 3;

/**
 * The lap the rival runners run, or undefined on a level that has no track.
 *
 * Built through `roadBetween` rather than written as road ids, so a level that
 * renames a road takes this with it instead of leaving a circuit that quietly
 * describes nothing. Undefined rather than a throw: an egg is a flourish, and
 * a flourish that can break the map is not worth having.
 */
export function rivalCircuit(level: Level): Route | undefined {
  const nodeIds = TRACK_CIRCUIT[level.id];
  if (!nodeIds) return undefined;

  const roadIds: string[] = [];
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    const road = roadBetween(level, nodeIds[i], nodeIds[i + 1]);
    if (!road) return undefined;
    roadIds.push(road.id);
  }
  return { nodeIds, roadIds };
}

/**
 * Where the track is drawn on this level, if it has one.
 *
 * Read off the level's own scatter rather than written down twice, so anything
 * that has to sit beside the track — the shout, for one — moves when the track
 * does instead of being left pointing at a patch of paper.
 */
export function trackPlace(level: Level): { x: number; y: number } | undefined {
  const item = (level.scatter ?? []).find((one) => one.kind === "track");
  return item ? { x: item.x, y: item.y } : undefined;
}

/** Whether this level has a running track worth pressing. */
export function hasTrackEgg(level: Level): boolean {
  return rivalCircuit(level) !== undefined;
}


/**
 * The gnome (#104), who is the only egg that does not stay where it is put.
 *
 * There is exactly one of him in the whole game, he is not in any level's
 * `scatter`, and every press sends him to a different unlocked map. That is
 * why he is state rather than data: a gnome written into a level would be a
 * gnome on every level at once.
 */
export interface GnomeHome {
  levelId: string;
  x: number;
  y: number;
}

/** How much room he needs from each thing already on the paper. */
const GNOME_ROAD = 18;
const GNOME_JUNCTION = 26;
const GNOME_LANDMARK = 26;
const GNOME_SCATTER = 24;
const GNOME_LABEL = 10;
/** He is about sixteen across and eighteen tall, so this keeps him on it. */
const GNOME_EDGE = 24;

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

function landmarkSpots(level: Level): { x: number; y: number }[] {
  return level.nodes
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
}

/**
 * Everywhere on a map the gnome could stand: never on a road, a junction, a
 * name, another sprite or the theme's own trees, and never off the paper.
 *
 * Walked on a twelve-unit grid rather than solved, because the map is 800 by
 * 560 and a few thousand candidate points is nothing next to being able to
 * read the rules straight down the list.
 */
export function gnomeSpots(level: Level): { x: number; y: number }[] {
  const landmarks = landmarkSpots(level);
  const boxes = level.nodes.map(labelBox);
  /*
   * Both kinds, and the second was the other half of #110. A park scatters
   * three trees round itself and nothing on this map knew it, so the gnome
   * could be sent to stand behind one on any of the seven levels with a green.
   * Small enough that a point still does for him — he is eight units across —
   * but he has to know the trees are there.
   */
  const trees = [
    ...(level.theme === "trail" ? TRAIL_TREES : []),
    ...level.nodes
      .filter((node) => node.type === "park" && !node.noTrees)
      .flatMap((node) =>
        PARK_TREES.map((tree) => ({ x: node.x + tree.dx, y: node.y + tree.dy })),
      ),
  ];
  const spots: { x: number; y: number }[] = [];

  for (let x = GNOME_EDGE; x <= level.view.width - GNOME_EDGE; x += 12) {
    for (let y = GNOME_EDGE; y <= level.view.height - GNOME_EDGE; y += 12) {
      const onRoad = level.roads.some((road) => {
        const from = level.nodes.find((node) => node.id === road.from);
        const to = level.nodes.find((node) => node.id === road.to);
        if (!from || !to) return false;
        return distanceToSegment(x, y, from.x, from.y, to.x, to.y) < GNOME_ROAD;
      });
      if (onRoad) continue;
      if (
        level.nodes.some(
          (node) => Math.hypot(x - node.x, y - node.y) < GNOME_JUNCTION,
        )
      ) {
        continue;
      }
      if (landmarks.some((spot) => Math.hypot(x - spot.x, y - spot.y) < GNOME_LANDMARK)) {
        continue;
      }
      if (
        (level.scatter ?? []).some(
          (item) => Math.hypot(x - item.x, y - item.y) < GNOME_SCATTER,
        )
      ) {
        continue;
      }
      if (trees.some((tree) => Math.hypot(x - tree.x, y - tree.y) < GNOME_LANDMARK)) {
        continue;
      }
      const onWriting = boxes.some(
        (box) =>
          x > box.left - GNOME_LABEL &&
          x < box.right + GNOME_LABEL &&
          y > box.top - GNOME_LABEL &&
          y < box.bottom + GNOME_LABEL,
      );
      if (onWriting) continue;
      spots.push({ x, y });
    }
  }
  return spots;
}

/**
 * Where he goes next: a different unlocked map, and a clear patch of it.
 *
 * `roll` is a number in [0, 1) rather than a call to `Math.random`, so this
 * stays pure and a test can say exactly where he lands. Undefined when there
 * is nowhere to go — one level unlocked and he is already on it — and the
 * caller leaves him where he is rather than making something up.
 */
export function nextGnomeHome(
  levels: Level[],
  completed: Completed,
  from: string | undefined,
  roll: number,
): GnomeHome | undefined {
  const open = levels.filter(
    (level) => level.id !== from && isUnlocked(levels, completed, level.id),
  );
  if (open.length === 0) return undefined;

  const level = open[Math.min(open.length - 1, Math.floor(roll * open.length))];
  const spots = gnomeSpots(level);
  if (spots.length === 0) return undefined;

  // A second helping of the same roll, so one number places him twice over
  // without the two choices marching in step.
  const index = Math.floor(((roll * open.length) % 1) * spots.length);
  const spot = spots[Math.min(spots.length - 1, index)];
  return { levelId: level.id, x: spot.x, y: spot.y };
}

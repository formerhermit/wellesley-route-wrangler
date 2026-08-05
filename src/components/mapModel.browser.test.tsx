import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { levels } from "../data/levels";
import "../styles.css";
import { MapJunctions } from "./MapJunctions";
import { MapLandmarks } from "./MapLandmarks";
import { MapRoads } from "./MapRoads";
import {
  DRAWN_BOX,
  LANDMARK_DRAWS,
  PARK_TREES,
  TRAIL_TREES,
} from "../game/landmarks";
import type { Level, Route } from "../game/types";

/**
 * The one test that renders a map.
 *
 * `scenery.test.ts` holds every rule about what may sit where, and it is pure,
 * fast, and entirely dependent on a *model* of what the map draws — a table of
 * sizes and a list of layers, both written by hand in `landmarks.ts`. Four bugs
 * in a row came from that model being out of date rather than from the rules
 * being wrong: sizes that were never modelled (#110), a park's trees that
 * nothing knew existed, hill markers that had to be registered in two places by
 * hand (#118), and junction dots that nobody had thought of as things which
 * hide other things.
 *
 * So this file tests the model rather than the map. It renders every level in a
 * real browser, reads the geometry the browser actually produced, and asserts
 * that it is what the pure suite believes. It deliberately does **not** repeat
 * any of the rules — a second copy of the thresholds is a second thing to keep
 * in step, which is the disease rather than the cure.
 */

/** Room for anti-aliasing and the odd half-pixel. Sizes are in map units. */
const TOLERANCE = 1.5;

function renderMap(level: Level): SVGSVGElement {
  const host = document.createElement("div");
  document.body.append(host);
  const empty: Route = { nodeIds: [level.startNodeId], roadIds: [] };
  act(() => {
    createRoot(host).render(
      <svg
        viewBox={`0 0 ${level.view.width} ${level.view.height}`}
        width={level.view.width}
        height={level.view.height}
      >
        <MapLandmarks level={level} />
        <MapRoads level={level} route={empty} />
        <MapLandmarks level={level} onTop />
        <MapJunctions
          level={level}
          route={empty}
          selectable={new Set()}
          locked={false}
          rejectedNodeId={null}
        />
      </svg>,
    );
  });
  return host.querySelector("svg")!;
}

/**
 * Every drawn sprite, by the class it carries, in its own local coordinates.
 *
 * `outer` marks the ones that are a thing the map placed rather than a part of
 * one: a wood is built out of three trees and each carries `sprite--tree`, so
 * counting every match would report eleven trees on a map that placed eight.
 */
function spritesIn(svg: SVGSVGElement) {
  const found: {
    kind: string;
    outer: boolean;
    box: [number, number, number, number];
  }[] = [];
  for (const el of svg.querySelectorAll('[class*="sprite--"]')) {
    const kind = [...el.classList]
      .find((one) => one.startsWith("sprite--"))
      ?.slice(8);
    if (!kind) continue;
    const box = (el as SVGGraphicsElement).getBBox();
    if (!box.width && !box.height) continue;
    found.push({
      kind,
      outer: !el.parentElement?.closest('[class*="sprite--"]'),
      box: [box.x, box.x + box.width, box.y, box.y + box.height],
    });
  }
  return found;
}

/** The box the model holds for a drawn class. */
const boxFor = (kind: string) => DRAWN_BOX[kind];

/**
 * How many separate things the pure model believes this map puts down.
 *
 * A total rather than a tally by kind, because the class a sprite carries is
 * the *component's* name and the model's key is the level's — a `sailing`
 * junction draws a boat, a `filmunit` draws a unit truck, an `xmastree` draws
 * a christmastree at six tenths. Those are not drift, and a per-kind
 * comparison would report them forever. What is drift is the map drawing a
 * thing the model never counted at all, and the total says that.
 */
function expectedCount(level: Level): number {
  let n = 0;
  for (const node of level.nodes) {
    const kind = node.sprite ?? node.type;
    if (kind && LANDMARK_DRAWS[kind]) n += 1;
    if (node.type === "park" && !node.noTrees) n += PARK_TREES.length;
  }
  n += (level.scatter ?? []).length;
  if (level.theme === "trail") n += TRAIL_TREES.length;
  n += level.roads.filter((road) => road.hill).length;
  n += level.roads.filter((road) => road.closed).length;
  return n;
}

describe.each(levels.map((level) => [level.id, level] as const))(
  "%s as drawn",
  (_id, level: Level) => {
    it("draws exactly as many things as the model counts", () => {
      const svg = renderMap(level);
      const drawn = spritesIn(svg).filter((one) => one.outer).length;
      expect(drawn).toBe(expectedCount(level));
    });

    /*
     * And every one of them is something the model can measure. A class with
     * no box anywhere is a drawing the rules cannot see — which is the whole
     * family of bugs this file was written for.
     */
    it("draws nothing the model has never measured", () => {
      const svg = renderMap(level);
      const unknown = [
        ...new Set(
          spritesIn(svg)
            .filter((one) => !boxFor(one.kind))
            .map((one) => one.kind),
        ),
      ];
      expect(unknown).toEqual([]);
    });

    /*
     * And the sizes. These are the numbers `scenery.test.ts` measures every
     * clearance against, and until now they were a snapshot taken by hand off
     * a browser once — so redrawing a sprite wider left the whole suite
     * checking the old shape and passing.
     */
    /*
     * And nothing is drawn bigger than the model thinks it is. Only that
     * direction matters: a box larger than the drawing costs a little room on
     * the paper, a box smaller than the drawing is a collision the rules
     * cannot see, and that is #110 exactly. Some are legitimately generous —
     * a soldier has four variants and the table holds the largest, and the
     * start line's width depends on a web font that may not have loaded.
     */
    it("draws nothing bigger than the model believes", () => {
      const svg = renderMap(level);
      const wrong: string[] = [];
      for (const { kind, box } of spritesIn(svg)) {
        const table = boxFor(kind);
        if (!table) continue;
        const over =
          table[0] - box[0] > TOLERANCE ||
          box[1] - table[1] > TOLERANCE ||
          table[2] - box[2] > TOLERANCE ||
          box[3] - table[3] > TOLERANCE;
        if (over) {
          wrong.push(
            `${kind}: drawn [${box.map((n) => n.toFixed(1))}], table [${table}]`,
          );
        }
      }
      expect([...new Set(wrong)]).toEqual([]);
    });
  },
);

describe("the junction dot", () => {
  /*
   * `scenery.test.ts` keeps every landmark eighteen units clear of a junction
   * because the halo is opaque white to about seventeen. That is a number in
   * one file about a shape drawn in another, so it is checked here: restyle
   * the halo bigger and the suite says so rather than quietly letting sprites
   * hide under it again.
   */
  it("is no bigger than the clearance the rules assume", () => {
    const svg = renderMap(levels[0]);
    const halo = svg.querySelector(".junction-halo")!;
    const radius = Number(halo.getAttribute("r"));
    const stroke = Number(
      getComputedStyle(halo).strokeWidth.replace("px", "") || 0,
    );
    expect(radius + stroke / 2).toBeLessThanOrEqual(18);
    /*
     * And it really is opaque, which is why "under it" means gone rather than
     * dimmed. Not white, though — the start junction is club amber and others
     * take the level's own colour. Any solid fill hides what is behind it.
     */
    const style = getComputedStyle(halo);
    expect(style.fill).not.toBe("none");
    expect(Number(style.fillOpacity)).toBe(1);
  });
});

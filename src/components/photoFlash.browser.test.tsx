import { describe, expect, it, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { thursdayTownRun } from "../data/thursdayTownRun";
import { PhotoFlash } from "./PhotoFlash";
import { RouteMap } from "./RouteMap";
import "../styles.css";
import type { MapNode, Route } from "../game/types";

/**
 * Roo's flash (#10), which is a drawing and so has to be looked at.
 *
 * The pure suite can say where the camera comes out; only a browser can say
 * that the thing which appears there covers the map, is white, is on nobody's
 * pointer path, and — the one that would go wrong silently — actually
 * animates rather than sitting on screen as a permanent white sheet over the
 * level.
 */

const spot: MapNode = thursdayTownRun.nodes.find(
  (node) => node.type === "cemetery",
)!;

function render(): SVGSVGElement {
  const host = document.createElement("div");
  document.body.append(host);
  act(() => {
    createRoot(host).render(
      <svg
        viewBox={`0 0 ${thursdayTownRun.view.width} ${thursdayTownRun.view.height}`}
        width={thursdayTownRun.view.width}
        height={thursdayTownRun.view.height}
      >
        <PhotoFlash
          at={spot}
          width={thursdayTownRun.view.width}
          height={thursdayTownRun.view.height}
        />
      </svg>,
    );
  });
  const svg = host.querySelector("svg");
  if (!svg) throw new Error("nothing rendered");
  return svg;
}

describe("the camera flash", () => {
  it("washes the whole map rather than a corner of it", () => {
    const wash = render().querySelector<SVGRectElement>(".photo-flash__wash");
    if (!wash) throw new Error("no wash");
    expect(wash.width.baseVal.value).toBe(thursdayTownRun.view.width);
    expect(wash.height.baseVal.value).toBe(thursdayTownRun.view.height);
    expect(getComputedStyle(wash).fill).toBe("rgb(255, 255, 255)");
  });

  it("goes off where the group is standing", () => {
    const burst = render().querySelector(".photo-flash__burst");
    const owner = burst?.closest("g[transform]");
    expect(owner?.getAttribute("transform")).toBe(
      `translate(${spot.x} ${spot.y})`,
    );
  });

  it("is an animation and not a white sheet left over the level", () => {
    // Every part of it has to be on a finite animation that ends at nothing.
    // A flash that forgot to fade would hide the whole map for the rest of
    // the run, and the map would still be under there working perfectly.
    for (const selector of [
      ".photo-flash__wash",
      ".photo-flash__burst",
      ".photo-flash__rays",
    ]) {
      const el = render().querySelector(selector);
      if (!el) throw new Error(`no ${selector}`);
      const style = getComputedStyle(el);
      expect(style.animationName, selector).not.toBe("none");
      expect(style.animationIterationCount, selector).toBe("1");
      // It starts invisible; the keyframes bring it up and take it away.
      expect(style.opacity, selector).toBe("0");
    }
  });

  it("cannot be clicked through to the junctions underneath", () => {
    const flash = render().querySelector(".photo-flash");
    if (!flash) throw new Error("no flash");
    expect(getComputedStyle(flash).pointerEvents).toBe("none");
  });
});

/**
 * And the half no still picture can show: that the run itself sets it off.
 *
 * The route deliberately *starts* at the photo stop, which puts the shutter
 * at the very beginning of the run — otherwise this would have to sit through
 * most of an eight-second animation to find out.
 */
describe("the camera during a run", () => {
  const atTheCemetery: Route = {
    nodeIds: ["cemetery", "ski-slope", "wellington-statue"],
    roadIds: ["cemetery-ski", "ski-statue"],
  };

  function runMap(options: { reducedMotion: boolean }): HTMLDivElement {
    const host = document.createElement("div");
    document.body.append(host);
    act(() => {
      createRoot(host).render(
        <RouteMap
          level={thursdayTownRun}
          route={atTheCemetery}
          running
          rejectedNodeId={null}
          reducedMotion={options.reducedMotion}
          onSelect={() => {}}
          onRunFinished={() => {}}
          gnome={undefined}
          onGnomePressed={() => {}}
          stops={["cemetery"]}
          photoStops={["cemetery"]}
        />,
      );
    });
    return host;
  }

  it("goes off when the group gets there", async () => {
    const host = runMap({ reducedMotion: false });
    await vi.waitFor(
      () => expect(host.querySelector(".photo-flash")).not.toBeNull(),
      { timeout: 4000, interval: 40 },
    );
  });

  it("stays in its bag when motion is not wanted", async () => {
    /*
     * A bright pulse over the whole map is exactly what reduced motion is
     * asking us not to do. The group still stops for the photograph — that
     * is the pace curve, not the drawing — so only the flash is withheld.
     */
    const host = runMap({ reducedMotion: true });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(host.querySelector(".photo-flash")).toBeNull();
  });
});

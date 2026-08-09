import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { thursdayTownRun } from "../data/thursdayTownRun";
import { MapLandmarks } from "./MapLandmarks";
import "../styles.css";

/**
 * The lamps (#160), which are a drawing and so have to be looked at.
 *
 * The half no pure test can reach: at rest a set of lights is a sign on a
 * map, with all three lamps lit; while the group is out it becomes a working
 * light, red where they are standing and green everywhere else. Getting the
 * two the wrong way round would leave every crossing permanently red, which
 * reads as a broken map rather than a broken rule.
 */

const lit = thursdayTownRun.nodes.filter((node) => node.lights);

function render(options: { running: boolean; haltedAt: string | null }) {
  const host = document.createElement("div");
  document.body.append(host);
  act(() => {
    createRoot(host).render(
      <svg
        viewBox={`0 0 ${thursdayTownRun.view.width} ${thursdayTownRun.view.height}`}
        width={thursdayTownRun.view.width}
        height={thursdayTownRun.view.height}
      >
        <MapLandmarks
          level={thursdayTownRun}
          onTop
          running={options.running}
          haltedAt={options.haltedAt}
        />
      </svg>,
    );
  });
  return host;
}

/** The lamps of the one set of lights standing at this junction. */
function lampsAt(host: HTMLElement, index: number) {
  const light = host.querySelectorAll(".sprite--lights")[index];
  const opacity = (selector: string) =>
    Number(getComputedStyle(light.querySelector(selector)!).opacity);
  return {
    className: light.getAttribute("class") ?? "",
    stop: opacity(".lights-stop"),
    go: opacity(".lights-go"),
  };
}

describe("the traffic lights", () => {
  it("are a sign, not a light, until the group sets off", () => {
    const host = render({ running: false, haltedAt: null });
    expect(host.querySelectorAll(".sprite--lights")).toHaveLength(lit.length);
    for (let i = 0; i < lit.length; i += 1) {
      const lamps = lampsAt(host, i);
      expect(lamps.className).not.toContain("--stop");
      expect(lamps.className).not.toContain("--go");
      // All three lit, which is how a traffic light is drawn on a map.
      expect(lamps.stop).toBe(1);
      expect(lamps.go).toBe(1);
    }
  });

  it("go red at the crossing the group is standing at", () => {
    const host = render({ running: true, haltedAt: lit[0].id });
    const waiting = lampsAt(host, 0);
    expect(waiting.className).toContain("--stop");
    expect(waiting.stop).toBe(1);
    expect(waiting.go).toBe(0.15);
  });

  it("and green at every other one while they are out", () => {
    const host = render({ running: true, haltedAt: lit[0].id });
    for (let i = 1; i < lit.length; i += 1) {
      const moving = lampsAt(host, i);
      expect(moving.className, lit[i].id).toContain("--go");
      expect(moving.go, lit[i].id).toBe(1);
    }
  });

  it("are all green once nobody is waiting", () => {
    const host = render({ running: true, haltedAt: null });
    for (let i = 0; i < lit.length; i += 1) {
      expect(lampsAt(host, i).className).toContain("--go");
    }
  });
});

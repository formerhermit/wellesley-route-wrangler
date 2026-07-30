import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

export const RUNNER_COUNT = 5;

interface Milestone {
  nodeId: string;
  fraction: number;
}

interface Options {
  /** The drawn route; measured with the native SVG geometry API. */
  pathRef: RefObject<SVGPathElement | null>;
  runnersRef: RefObject<(SVGGElement | null)[]>;
  reducedMotion: boolean;
  /** Points along the route that should make pigeons react. */
  milestones: Milestone[];
  onReachHotspot: (nodeId: string | null) => void;
  onFinish: () => void;
}

const FULL_DURATION_MS = 8200;
const REDUCED_DURATION_MS = 2600;
const ALARM_MS = 1800;

/**
 * Drives the runners with requestAnimationFrame, writing transforms straight
 * to the DOM. React only hears about the run when it starts, when the group
 * hits a pigeon hotspot, and when it finishes.
 */
export function useRunAnimation({
  pathRef,
  runnersRef,
  reducedMotion,
  milestones,
  onReachHotspot,
  onFinish,
}: Options) {
  const frameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  // Callbacks are read through a ref so a re-render mid-run cannot restart it.
  const latest = useRef({ milestones, onReachHotspot, onFinish, reducedMotion });
  latest.current = { milestones, onReachHotspot, onFinish, reducedMotion };

  const cancel = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    for (const runner of runnersRef.current ?? []) {
      runner?.setAttribute("opacity", "0");
    }
  }, [runnersRef]);

  const start = useCallback(() => {
    cancel();

    const path = pathRef.current;
    const options = latest.current;
    const length = path?.getTotalLength() ?? 0;
    if (!path || length === 0) {
      options.onFinish();
      return;
    }

    const duration = options.reducedMotion
      ? REDUCED_DURATION_MS
      : FULL_DURATION_MS;
    const lag = options.reducedMotion ? 0 : Math.min(20, length * 0.02);
    const travel = length + lag * (RUNNER_COUNT - 1);
    const hotspots = [...options.milestones].sort(
      (a, b) => a.fraction - b.fraction,
    );
    let nextHotspot = 0;
    const startedAt = performance.now();

    for (const runner of runnersRef.current ?? []) {
      runner?.setAttribute("opacity", "1");
    }

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / duration);
      const lead = progress * travel;

      for (let i = 0; i < RUNNER_COUNT; i += 1) {
        const runner = runnersRef.current?.[i];
        if (!runner) continue;
        const distance = Math.min(Math.max(lead - i * lag, 0), length);
        const point = path.getPointAtLength(distance);
        const bounce = options.reducedMotion
          ? 0
          : Math.sin(elapsed / 80 + i * 1.3) * 2.2;
        runner.setAttribute(
          "transform",
          `translate(${point.x.toFixed(2)} ${(point.y + bounce).toFixed(2)})`,
        );
      }

      const leadFraction = Math.min(1, lead / length);
      while (
        nextHotspot < hotspots.length &&
        leadFraction >= hotspots[nextHotspot].fraction
      ) {
        const { nodeId } = hotspots[nextHotspot];
        options.onReachHotspot(nodeId);
        timersRef.current.push(
          window.setTimeout(() => options.onReachHotspot(null), ALARM_MS),
        );
        nextHotspot += 1;
      }

      if (progress >= 1) {
        frameRef.current = null;
        options.onFinish();
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [cancel, pathRef, runnersRef]);

  useEffect(() => cancel, [cancel]);

  return { start, cancel };
}

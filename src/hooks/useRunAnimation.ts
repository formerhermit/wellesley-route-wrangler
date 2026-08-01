import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

export const RUNNER_COUNT = 5;

interface Milestone {
  nodeId: string;
  fraction: number;
}

export interface Follower {
  ref: RefObject<SVGGElement | null>;
  /** Where it stands, in map units, until it has something to follow. */
  home: { x: number; y: number };
  /**
   * How far along the route its junction sits, 0–1, or null when the route
   * never goes past it — in which case it never moves at all.
   */
  joinFraction: number | null;
}

interface Options {
  /** The drawn route; measured with the native SVG geometry API. */
  pathRef: RefObject<SVGPathElement | null>;
  runnersRef: RefObject<(SVGGElement | null)[]>;
  reducedMotion: boolean;
  /** Points along the route that should make pigeons react. */
  milestones: Milestone[];
  follower?: Follower;
  onReachHotspot: (nodeId: string | null) => void;
  onFinish: () => void;
}

const FULL_DURATION_MS = 8200;
const REDUCED_DURATION_MS = 2600;
const ALARM_MS = 1800;
/** How long the follower takes to get across and into the group. */
const JOIN_MS = 420;

function homeTransform({ home }: Follower): string {
  return `translate(${home.x} ${home.y})`;
}

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
  follower,
  onReachHotspot,
  onFinish,
}: Options) {
  const frameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  // Callbacks are read through a ref so a re-render mid-run cannot restart it.
  const latest = useRef({
    milestones,
    follower,
    onReachHotspot,
    onFinish,
    reducedMotion,
  });
  latest.current = {
    milestones,
    follower,
    onReachHotspot,
    onFinish,
    reducedMotion,
  };

  const cancel = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    for (const runner of runnersRef.current ?? []) {
      runner?.setAttribute("opacity", "0");
    }
    // The follower stays on the map between runs, so it goes home rather than
    // being hidden where the group happened to leave it.
    const back = latest.current.follower;
    back?.ref.current?.setAttribute("transform", homeTransform(back));
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
    // When the group's back marker first drew level with the follower, so the
    // hop across into the group can be eased rather than teleported.
    let joinedAt: number | null = null;
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

      // The follower runs one place further back than the last runner, and
      // only once the back of the group has actually reached it.
      const follow = options.follower;
      const followEl = follow?.ref.current;
      if (follow && followEl && follow.joinFraction !== null) {
        const joinAt = follow.joinFraction * length;
        const back = lead - RUNNER_COUNT * lag;
        if (back <= joinAt) {
          followEl.setAttribute("transform", homeTransform(follow));
        } else {
          if (joinedAt === null) joinedAt = now;
          const distance = Math.min(back, length);
          const point = path.getPointAtLength(distance);
          // Eased across from where it was standing, so it joins the run
          // rather than appearing in it.
          const t = options.reducedMotion
            ? 1
            : Math.min(1, (now - joinedAt) / JOIN_MS);
          const x = follow.home.x + (point.x - follow.home.x) * t;
          const y = follow.home.y + (point.y - follow.home.y) * t;
          const ahead = path.getPointAtLength(Math.min(distance + 4, length));
          const turn = ahead.x < point.x ? " scale(-1 1)" : "";
          followEl.setAttribute(
            "transform",
            `translate(${x.toFixed(2)} ${y.toFixed(2)})${turn}`,
          );
        }
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

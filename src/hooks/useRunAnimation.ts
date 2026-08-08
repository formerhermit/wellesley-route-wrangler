import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Pace } from "../game/pace";
import type { FieldPlace } from "../game/raceField";

/** The club's usual five. A card may bring more out (#10). */
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
  /** How the group's speed varies over the route. Hills cost time. */
  pace: Pace;
  /** How many are out today: the usual five, plus whatever a card brought. */
  runnerCount: number;
  runnersRef: RefObject<(SVGGElement | null)[]>;
  /** The rest of the field, where the level is a race. Empty where it is not. */
  field: FieldPlace[];
  fieldRef: RefObject<(SVGGElement | null)[]>;
  reducedMotion: boolean;
  /** Points along the route that should make pigeons react. */
  milestones: Milestone[];
  /** Whatever is waiting by the road, in whatever order the level lists them. */
  followers: Follower[];
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
  pace,
  runnerCount,
  runnersRef,
  field,
  fieldRef,
  reducedMotion,
  milestones,
  followers,
  onReachHotspot,
  onFinish,
}: Options) {
  const frameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  // Callbacks are read through a ref so a re-render mid-run cannot restart it.
  const latest = useRef({
    milestones,
    followers,
    field,
    pace,
    runnerCount,
    onReachHotspot,
    onFinish,
    reducedMotion,
  });
  latest.current = {
    milestones,
    followers,
    field,
    pace,
    runnerCount,
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
    for (const runner of fieldRef.current ?? []) {
      runner?.setAttribute("opacity", "0");
    }
    // Followers stay on the map between runs, so they go home rather than
    // being hidden wherever the group happened to leave them.
    for (const back of latest.current.followers) {
      back.ref.current?.setAttribute("transform", homeTransform(back));
    }
  }, [runnersRef, fieldRef]);

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
    const running = options.runnerCount;
    const lag = options.reducedMotion ? 0 : Math.min(20, length * 0.02);
    const travel = length + lag * (running - 1);
    const hotspots = [...options.milestones].sort(
      (a, b) => a.fraction - b.fraction,
    );
    let nextHotspot = 0;
    // Whoever is picked up first tacks onto the back of the group, and the
    // next one in behind them — so the queue is ordered by where on the route
    // each was standing, not by the order the level happens to list them.
    const queue = options.followers
      .filter((one) => one.joinFraction !== null)
      .sort((a, b) => (a.joinFraction ?? 0) - (b.joinFraction ?? 0));
    // When each first drew level with the group, so the hop across can be
    // eased rather than teleported.
    const joinedAt = new Map<Follower, number>();
    const startedAt = performance.now();

    for (const runner of runnersRef.current ?? []) {
      runner?.setAttribute("opacity", "1");
    }
    for (const runner of fieldRef.current ?? []) {
      runner?.setAttribute("opacity", "1");
    }

    /*
     * Which way the road is going at a given point, and the right angle to it.
     * The field is placed off the racing line rather than on it, and "off the
     * line" only means anything relative to the line's own direction: the same
     * runner has to sit above the road on a westbound leg and below it on an
     * eastbound one, or the pack turns itself inside out at every corner.
     */
    const sideStep = (distance: number, across: number) => {
      const point = path.getPointAtLength(distance);
      if (across === 0) return point;
      const ahead = path.getPointAtLength(Math.min(distance + 3, length));
      let dx = ahead.x - point.x;
      let dy = ahead.y - point.y;
      // At the very end there is nothing ahead to measure against, so measure
      // backwards instead. A zero-length tangent would put the whole field on
      // the finish line in a heap.
      if (Math.hypot(dx, dy) < 0.01) {
        const behind = path.getPointAtLength(Math.max(distance - 3, 0));
        dx = point.x - behind.x;
        dy = point.y - behind.y;
      }
      const span = Math.hypot(dx, dy) || 1;
      return {
        x: point.x + (-dy / span) * across,
        y: point.y + (dx / span) * across,
      };
    };

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / duration);
      // Time runs evenly; the group does not. On a hill it drops to a little
      // over half pace and makes it up on the flat.
      const lead = options.pace.fractionAt(progress) * travel;

      for (let i = 0; i < running; i += 1) {
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

      // Everybody else in the race, placed off the club rather than off the
      // clock: the field runs at the group's pace because it is the group's
      // pace that the hills are already in.
      options.field.forEach((place, index) => {
        const runner = fieldRef.current?.[index];
        if (!runner) return;
        const distance = Math.min(Math.max(lead - place.along, 0), length);
        const point = sideStep(distance, place.across);
        const bounce = options.reducedMotion
          ? 0
          : Math.sin(elapsed / 80 + index * 0.7) * 2.2;
        runner.setAttribute(
          "transform",
          `translate(${point.x.toFixed(2)} ${(point.y + bounce).toFixed(2)})`,
        );
      });

      // Each follower runs one place further back than the last, behind the
      // group, and only once the back of it has actually reached them.
      queue.forEach((follow, place) => {
        const followEl = follow.ref.current;
        if (!followEl || follow.joinFraction === null) return;
        const joinAt = follow.joinFraction * length;
        const back = lead - (running + place) * lag;
        if (back <= joinAt) {
          followEl.setAttribute("transform", homeTransform(follow));
          joinedAt.delete(follow);
          return;
        }
        if (!joinedAt.has(follow)) joinedAt.set(follow, now);
        const distance = Math.min(back, length);
        const point = path.getPointAtLength(distance);
        // Eased across from where it was standing, so it joins the run
        // rather than appearing in it.
        const t = options.reducedMotion
          ? 1
          : Math.min(1, (now - (joinedAt.get(follow) ?? now)) / JOIN_MS);
        const x = follow.home.x + (point.x - follow.home.x) * t;
        const y = follow.home.y + (point.y - follow.home.y) * t;
        const ahead = path.getPointAtLength(Math.min(distance + 4, length));
        const turn = ahead.x < point.x ? " scale(-1 1)" : "";
        followEl.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)})${turn}`,
        );
      });

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
  }, [cancel, pathRef, runnersRef, fieldRef]);

  useEffect(() => cancel, [cancel]);

  return { start, cancel };
}

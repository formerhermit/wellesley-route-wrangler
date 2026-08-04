import { useEffect, useMemo, useRef } from "react";
import { Runner } from "./MapSprites";
import { RIVAL_LAPS, rivalCircuit, trackPlace } from "../game/eggs";
import { routePathData } from "../game/routeGraph";
import type { Level } from "../game/types";

/**
 * Somebody else's club, in red, white and emerald green, going considerably
 * faster than you and making sure you notice.
 */
const RIVAL_VESTS = ["vest-red", "vest-white", "vest-emerald"];

/** One lap. The club's own eight-second run covers a whole route in that. */
const LAP_MS = 2400;
const REDUCED_LAP_MS = 800;

/** How far apart they run. A group, not a queue. */
const GAP = 13;

/**
 * Where the shout goes, relative to the track itself: up and a little left,
 * which is the one corner beside it that the lane down from the Back Passage
 * to the Hockey Loop does not cut through.
 */
const SHOUT_DX = -22;
const SHOUT_DY = -44;

interface Props {
  level: Level;
  /** True from the moment the track is pressed until the last lap is done. */
  running: boolean;
  reducedMotion: boolean;
  onFinish: () => void;
}

/**
 * The running track easter egg (#104): three much faster runners appear and go
 * round the Hockey Loop circuit three times.
 *
 * They are drawn on a path of their own rather than on the player's route, and
 * they touch nothing — no state, no scoring, no run book. The whole component
 * unmounts when they are done and the map is exactly as it was.
 *
 * Positions are written straight to the DOM through refs, the way the club's
 * own runners are, so three laps do not push a hundred and eighty renders
 * through React.
 */
export function RivalRunners({ level, running, reducedMotion, onFinish }: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const runnersRef = useRef<(SVGGElement | null)[]>(
    RIVAL_VESTS.map(() => null),
  );
  const frameRef = useRef<number | null>(null);
  // Read through a ref so a re-render mid-lap cannot restart them.
  const latest = useRef({ reducedMotion, onFinish });
  latest.current = { reducedMotion, onFinish };

  const circuit = useMemo(() => rivalCircuit(level), [level]);
  const shout = useMemo(() => trackPlace(level), [level]);
  /*
   * The shout is one CSS animation timed to the whole run, so it pops in, sits
   * there while they lap, and swells away exactly as they finish. Handing the
   * duration to CSS as a custom property is what keeps the two in step —
   * writing 7200ms into the stylesheet would come apart the first time anybody
   * changed the lap.
   */
  const runMs = (reducedMotion ? REDUCED_LAP_MS : LAP_MS) * RIVAL_LAPS;
  const pathData = useMemo(
    () => (circuit ? routePathData(level, circuit) : ""),
    [level, circuit],
  );

  useEffect(() => {
    if (!running) return;
    // Captured here rather than read in the cleanup: the array itself never
    // changes identity, but the rule is right that reading `.current` late is
    // a habit worth not having.
    const runners = runnersRef.current;
    const path = pathRef.current;
    const options = latest.current;
    const length = path?.getTotalLength() ?? 0;
    if (!path || length === 0) {
      options.onFinish();
      return;
    }

    const lap = options.reducedMotion ? REDUCED_LAP_MS : LAP_MS;
    const duration = lap * RIVAL_LAPS;
    const total = length * RIVAL_LAPS;
    const startedAt = performance.now();

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const lead = Math.min(total, (elapsed / duration) * total);

      RIVAL_VESTS.forEach((_, index) => {
        const runner = runners[index];
        if (!runner) return;
        const travelled = lead - index * GAP;
        // The ones behind wait at the line until the leader has gone far
        // enough that they are not standing on top of each other.
        if (travelled < 0) {
          runner.setAttribute("opacity", "0");
          return;
        }
        runner.setAttribute("opacity", "1");
        // Round the loop and round again: the circuit is closed, so the only
        // thing separating lap one from lap three is how far they have run.
        const at = travelled % length;
        const point = path.getPointAtLength(at);
        const bounce = options.reducedMotion
          ? 0
          : Math.sin(elapsed / 65 + index * 1.6) * 2;
        // Turned to face the way they are going, as the followers are.
        const ahead = path.getPointAtLength((at + 5) % length);
        const turn = ahead.x < point.x ? " scale(-1 1)" : "";
        runner.setAttribute(
          "transform",
          `translate(${point.x.toFixed(2)} ${(point.y + bounce).toFixed(2)})${turn}`,
        );
      });

      if (lead >= total) {
        frameRef.current = null;
        for (const runner of runners) {
          runner?.setAttribute("opacity", "0");
        }
        options.onFinish();
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      for (const runner of runners) {
        runner?.setAttribute("opacity", "0");
      }
    };
  }, [running]);

  if (!pathData) return null;

  return (
    <g aria-hidden="true">
      {/* Geometry only. The circuit is the map's own roads and is already
          drawn; this is here to be measured, not seen. */}
      <path ref={pathRef} d={pathData} fill="none" stroke="none" />
      {RIVAL_VESTS.map((vest, index) => (
        <g
          key={vest}
          opacity={0}
          ref={(element) => {
            runnersRef.current[index] = element;
          }}
        >
          <Runner index={index} vest={vest} />
        </g>
      ))}

      {/* Mounted only while they are out, so it arrives with them and goes
          when they go. */}
      {running && shout && (
        <g transform={`translate(${shout.x + SHOUT_DX} ${shout.y + SHOUT_DY})`}>
          <g
            className="egg-shout"
            style={{ "--shout-duration": `${runMs}ms` } as React.CSSProperties}
          >
            {/* The wobble is on the word and the swell is on the group: two
                animations, two elements, so they are not both writing
                `transform` over the top of each other. */}
            <text className="egg-shout__word">AFD!</text>
          </g>
        </g>
      )}
    </g>
  );
}

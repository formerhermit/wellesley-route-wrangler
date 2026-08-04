import type { RefObject } from "react";
import { Runner } from "./MapSprites";
import { RUNNER_COUNT } from "../hooks/useRunAnimation";
import type { Level } from "../game/types";

interface Props {
  runnersRef: RefObject<(SVGGElement | null)[]>;
  /** What they are wearing over the club vest, if the level says anything. */
  kit?: Level["kit"];
  /**
   * One vest for all five instead of the usual blue, green and white. For a
   * race, where the group has to be picked out of a field of strangers and
   * three shades of club colour cannot do it.
   */
  vest?: string;
}

/**
 * Five runners parked at the origin until the animation moves them. Positions
 * are written straight to these nodes, never through React state.
 */
export function RunnerGroup({ runnersRef, kit, vest }: Props) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: RUNNER_COUNT }, (_, index) => (
        <g
          key={index}
          opacity={0}
          ref={(element) => {
            if (runnersRef.current) runnersRef.current[index] = element;
          }}
        >
          <Runner index={index} kit={kit} vest={vest} />
        </g>
      ))}
    </g>
  );
}

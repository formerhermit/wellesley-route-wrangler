import type { RefObject } from "react";
import { Runner } from "./MapSprites";
import { RUNNER_COUNT } from "../hooks/useRunAnimation";
import type { Level } from "../game/types";

interface Props {
  runnersRef: RefObject<(SVGGElement | null)[]>;
  /** What they are wearing over the club vest, if the level says anything. */
  kit?: Level["kit"];
}

/**
 * Five runners parked at the origin until the animation moves them. Positions
 * are written straight to these nodes, never through React state.
 */
export function RunnerGroup({ runnersRef, kit }: Props) {
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
          <Runner index={index} kit={kit} />
        </g>
      ))}
    </g>
  );
}

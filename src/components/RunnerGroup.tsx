import type { RefObject } from "react";
import { Runner } from "./MapSprites";
import { RUNNER_COUNT } from "../hooks/useRunAnimation";

interface Props {
  runnersRef: RefObject<(SVGGElement | null)[]>;
}

/**
 * Five runners parked at the origin until the animation moves them. Positions
 * are written straight to these nodes, never through React state.
 */
export function RunnerGroup({ runnersRef }: Props) {
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
          <Runner index={index} />
        </g>
      ))}
    </g>
  );
}

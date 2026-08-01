import { Crow, Duck, Pigeon } from "./MapSprites";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  /** The hotspot the runners have just reached, if any. */
  alarmedNodeId: string | null;
  reducedMotion: boolean;
}

/**
 * Where each bird loiters relative to its hotspot, and where it flees to.
 * Three is plenty to read as a flock; a fourth only found labels to sit on.
 */
const FLOCK = [
  { dx: -30, dy: -26, flee: [-24, -30] },
  { dx: 26, dy: -18, flee: [30, -26] },
  { dx: 36, dy: 14, flee: [34, -12] },
];

export function PigeonGroup({ level, alarmedNodeId, reducedMotion }: Props) {
  const hotspots = level.nodes.filter((node) => node.type === "pigeon");
  // Whatever the level keeps. The hotspot type stays "pigeon" because that is
  // the mechanism's name, not the bird's.
  const Bird =
    level.flock === "crow" ? Crow : level.flock === "duck" ? Duck : Pigeon;

  return (
    <g aria-hidden="true">
      {hotspots.map((node) => {
        const alarmed = alarmedNodeId === node.id;
        return (
          <g
            key={node.id}
            className={`flock${alarmed ? " is-alarmed" : ""}${
              reducedMotion ? " is-still" : ""
            }`}
            transform={`translate(${node.x} ${node.y})`}
          >
            {alarmed && (
              <text className="flock-alarm" y={-56}>
                !
              </text>
            )}
            {FLOCK.map((bird, index) => (
              // Outer group holds the position (SVG attribute), inner group is
              // animated by CSS — the two must not fight over `transform`.
              <g key={index} transform={`translate(${bird.dx} ${bird.dy})`}>
                <g
                  className="flock-bird"
                  style={
                    {
                      "--bob-delay": `${index * 0.35}s`,
                      "--flee-x": `${bird.flee[0]}px`,
                      "--flee-y": `${bird.flee[1]}px`,
                    } as React.CSSProperties
                  }
                >
                  <g transform={`scale(${index % 2 === 0 ? 1 : -1} 1)`}>
                    <Bird alarmed={alarmed} />
                  </g>
                </g>
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

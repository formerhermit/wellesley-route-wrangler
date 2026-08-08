import type { MapNode } from "../game/types";

/**
 * Roo's camera going off (#10).
 *
 * Two parts, because a flash is two things: the whole map goes briefly pale,
 * the way a room does, and the light itself comes from where the group is
 * standing. Neither is a junction, neither is pressable, and neither is on
 * the map a moment later.
 *
 * Mounted with a fresh key each time so the CSS animation restarts, and never
 * mounted at all under reduced motion — the caller withholds the milestones,
 * so a single bright pulse is something this can only do when it has been
 * asked for. The group still stops for the photograph either way.
 */
export function PhotoFlash({
  at,
  width,
  height,
}: {
  at: MapNode;
  width: number;
  height: number;
}) {
  return (
    <g className="photo-flash" aria-hidden="true">
      <rect
        className="photo-flash__wash"
        x={0}
        y={0}
        width={width}
        height={height}
      />
      <g transform={`translate(${at.x} ${at.y})`}>
        <circle className="photo-flash__burst" cx={0} cy={0} r={30} />
        <path
          className="photo-flash__rays"
          d="M -46 0 h 14 M 46 0 h -14 M 0 -46 v 14 M 0 46 v -14 M -33 -33 l 10 10 M 33 33 l -10 -10 M -33 33 l 10 -10 M 33 -33 l -10 10"
        />
      </g>
    </g>
  );
}

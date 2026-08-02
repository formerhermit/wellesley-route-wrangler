import { nodeById, roadPathData, routePathData } from "../game/routeGraph";
import type { Level, Route } from "../game/types";

/**
 * One route, drawn small enough to sit in a list.
 *
 * The map's own roads go underneath, faint, because a route without them is a
 * squiggle nobody can place — the shape only means anything against the map it
 * was run on. Everything is drawn in the level's own coordinates and shrunk by
 * the viewBox, so the strokes are set fat here to survive it.
 *
 * No scenery, no labels, no junctions but the start. At this size they would
 * be dirt on the paper.
 */
export function RouteThumb({ level, route }: { level: Level; route: Route }) {
  const start = nodeById(level, level.startNodeId);
  return (
    <svg
      className="route-thumb"
      viewBox={`0 0 ${level.view.width} ${level.view.height}`}
      aria-hidden="true"
      focusable="false"
    >
      {level.roads.map((road) => (
        <path
          key={road.id}
          className="route-thumb__road"
          d={roadPathData(level, road)}
        />
      ))}
      <path className="route-thumb__line" d={routePathData(level, route)} />
      <circle
        className="route-thumb__start"
        cx={start.x}
        cy={start.y}
        r={22}
      />
    </svg>
  );
}

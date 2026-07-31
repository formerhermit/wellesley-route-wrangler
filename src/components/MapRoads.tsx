import { RoadClosedMarker } from "./MapSprites";
import { nodeById } from "../game/routeGraph";
import type { Level, Route } from "../game/types";

interface Props {
  level: Level;
  route: Route;
}

/** Every road, plus the closure marker. The selected route is drawn on top. */
export function MapRoads({ level, route }: Props) {
  const used = new Set(route.roadIds);

  return (
    <g aria-hidden="true">
      {level.roads.map((road) => {
        const from = nodeById(level, road.from);
        const to = nodeById(level, road.to);
        const classes = [
          "road",
          road.closed ? "road--closed" : "",
          road.hill ? "road--hill" : "",
          road.surface === "trail" ? "road--trail" : "",
          used.has(road.id) ? "road--used" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <line
            key={road.id}
            className={classes}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        );
      })}

      {level.roads
        .filter((road) => road.closed)
        .map((road) => {
          const from = nodeById(level, road.from);
          const to = nodeById(level, road.to);
          return (
            <g
              key={`${road.id}-marker`}
              transform={`translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2})`}
            >
              <RoadClosedMarker />
            </g>
          );
        })}
    </g>
  );
}

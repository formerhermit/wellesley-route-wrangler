import { RoadClosedMarker } from "./MapSprites";
import { acrossRoadAngle, nodeById, roadPathData } from "../game/routeGraph";
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
        const classes = [
          "road",
          road.closed ? "road--closed" : "",
          road.hill ? "road--hill" : "",
          road.surface === "trail" ? "road--trail" : "",
          used.has(road.id) ? "road--used" : "",
        ]
          .filter(Boolean)
          .join(" ");

        // A path rather than a line: most roads are straight, but a pair
        // joining the same two junctions has to go round the building.
        return (
          <path key={road.id} className={classes} d={roadPathData(level, road)} />
        );
      })}

      {level.roads
        .filter((road) => road.closed)
        .map((road) => {
          const from = nodeById(level, road.from);
          const to = nodeById(level, road.to);
          // Barred across the road, whichever way the road happens to run.
          const angle = acrossRoadAngle(from, to);
          return (
            <g
              key={`${road.id}-marker`}
              transform={
                `translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2}) ` +
                `rotate(${angle.toFixed(1)})`
              }
            >
              <RoadClosedMarker />
            </g>
          );
        })}
    </g>
  );
}

import { HillRoadMarker, RoadClosedMarker } from "./MapSprites";
import {
  acrossRoadAngle,
  hillMarkerAt,
  nodeById,
  roadPathData,
} from "../game/routeGraph";
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

      {/*
        A triangle beside every climb (#118). Beside rather than on: the route
        line is drawn after this and is fifteen units wide, so a marker on the
        tarmac disappears under the first road you lay — and the moment you
        most want to know which roads are hills is while you are laying them.
      */}
      {level.roads
        .filter((road) => road.hill)
        .map((road) => {
          const spot = hillMarkerAt(level, road);
          return (
            <g
              key={`${road.id}-hill`}
              transform={`translate(${spot.x.toFixed(1)} ${spot.y.toFixed(1)})`}
            >
              <HillRoadMarker />
            </g>
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

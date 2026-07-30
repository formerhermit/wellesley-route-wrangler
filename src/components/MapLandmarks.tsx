import { Bush, Depot, HillMarker, Observatory, Tree } from "./MapSprites";
import { nodeById } from "../game/routeGraph";
import type { Level } from "../game/types";

/** Decoration only: nothing here responds to input. */
export function MapLandmarks({ level }: { level: Level }) {
  const at = (id: string) => nodeById(level, id);
  const observatory = at("observatory");
  const bush = at("private-bush");
  const depot = at("depot");
  const hill = at("hill-top");
  const gardens = at("gardens");
  const canalA = at("canal-bridge");
  const canalB = at("towpath");
  const pond = at("geese-pond");

  return (
    <g aria-hidden="true">
      {/* The canal: a lazy blue ribbon behind the towpath roads. */}
      <path
        className="canal-water"
        d={`M 790 372 Q 742 336 ${canalA.x} ${canalA.y} Q 590 262 ${canalB.x} ${canalB.y} Q 404 302 352 268`}
      />
      <path
        className="canal-shimmer"
        d={`M 790 372 Q 742 336 ${canalA.x} ${canalA.y} Q 590 262 ${canalB.x} ${canalB.y} Q 404 302 352 268`}
      />

      {/* Municipal Gardens */}
      <rect
        className="gardens-ground"
        x={gardens.x - 78}
        y={gardens.y - 62}
        width={150}
        height={124}
        rx={26}
      />
      <g transform={`translate(${gardens.x - 46} ${gardens.y - 26})`}>
        <Tree />
      </g>
      <g transform={`translate(${gardens.x + 40} ${gardens.y + 12})`}>
        <Tree />
      </g>
      <g transform={`translate(${gardens.x - 30} ${gardens.y + 34})`}>
        <Tree />
      </g>

      {/* The geese pond */}
      <ellipse
        className="pond-water"
        cx={pond.x - 40}
        cy={pond.y + 26}
        rx={30}
        ry={15}
      />

      {/* Terraces along the bottom, for townishness */}
      <g className="terrace">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={186 + i * 62}
            y={516}
            width={46}
            height={20 + (i % 3) * 8}
            rx={3}
          />
        ))}
      </g>
      <g className="terrace">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={556 + i * 58}
            y={40}
            width={42}
            height={26 + (i % 2) * 10}
            rx={3}
          />
        ))}
      </g>

      <g transform={`translate(${observatory.x} ${observatory.y - 60})`}>
        <Observatory />
      </g>
      <g transform={`translate(${bush.x + 10} ${bush.y - 46})`}>
        <Bush />
      </g>
      <g transform={`translate(${depot.x + 2} ${depot.y - 52})`}>
        <Depot />
      </g>
      <g transform={`translate(${hill.x - 44} ${hill.y + 4})`}>
        <HillMarker />
      </g>
    </g>
  );
}

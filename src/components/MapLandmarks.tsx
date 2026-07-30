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
  const park = at("memorial-park");
  const canalA = at("canal-bridge");
  const canalB = at("towpath");
  const pond = at("duck-pond");

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

      {/* Memorial Park */}
      <rect
        className="park-ground"
        x={park.x - 78}
        y={park.y - 62}
        width={150}
        height={124}
        rx={26}
      />
      <g transform={`translate(${park.x - 46} ${park.y - 26})`}>
        <Tree />
      </g>
      <g transform={`translate(${park.x + 40} ${park.y + 12})`}>
        <Tree />
      </g>
      <g transform={`translate(${park.x - 30} ${park.y + 34})`}>
        <Tree />
      </g>

      {/* Duck pond */}
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

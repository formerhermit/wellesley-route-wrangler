import {
  Bush,
  CarPark,
  Cow,
  Hangar,
  HillMarker,
  Observatory,
  Superstore,
  Tree,
} from "./MapSprites";
import type { Level, MapNode, MapNodeType } from "../game/types";

/** Sprites drawn above their junction, keyed by what the junction is. */
const ABOVE_NODE: Partial<Record<MapNodeType, { render: () => React.ReactNode; dy: number; dx: number }>> = {
  // Both sit off to one side of their junction: landmarks are drawn under the
  // roads, so anything left sitting on one is simply lost beneath it. The
  // Observatory needs the wider berth because of its telescope.
  observatory: { render: () => <Observatory />, dy: -60, dx: -38 },
  bush: { render: () => <Bush />, dy: -46, dx: 45 },
  shop: { render: () => <Superstore />, dy: -50, dx: 0 },
  carpark: { render: () => <CarPark />, dy: -50, dx: 0 },
  // Well clear to the side: the trail out of Cow Field runs north through the
  // junction, and a cow standing on the path is a cow you cannot see.
  cow: { render: () => <Cow />, dy: -32, dx: 60 },
  hill: { render: () => <HillMarker />, dy: 4, dx: -44 },
  hangar: { render: () => <Hangar />, dy: -46, dx: 2 },
};

/** Trees scattered around a park, relative to its junction. */
const PARK_TREES = [
  { dx: -46, dy: -26 },
  { dx: 40, dy: 12 },
  { dx: -30, dy: 34 },
];

function nodesOfType(level: Level, type: MapNodeType): MapNode[] {
  return level.nodes.filter((node) => node.type === type);
}

/**
 * Decoration only: nothing here responds to input. Everything is placed from
 * the junction types in the level data, so a new level gets its scenery
 * without touching this file.
 */
export function MapLandmarks({ level }: { level: Level }) {
  const canal = nodesOfType(level, "canal");
  const canalPath =
    canal.length >= 2
      ? `M ${level.view.width - 10} ${canal[0].y + 72} ` +
        canal.map((node) => `L ${node.x} ${node.y}`).join(" ") +
        ` L ${Math.max(canal[canal.length - 1].x - 120, 20)} ${
          canal[canal.length - 1].y + 15
        }`
      : "";

  return (
    <g aria-hidden="true">
      {canalPath && (
        <>
          <path className="canal-water" d={canalPath} />
          <path className="canal-shimmer" d={canalPath} />
        </>
      )}

      {nodesOfType(level, "park").map((park) => (
        <g key={park.id}>
          <rect
            className="gardens-ground"
            x={park.x - 78}
            y={park.y - 62}
            width={150}
            height={124}
            rx={26}
          />
          {PARK_TREES.map((tree, index) => (
            <g
              key={index}
              transform={`translate(${park.x + tree.dx} ${park.y + tree.dy})`}
            >
              <Tree />
            </g>
          ))}
        </g>
      ))}

      {nodesOfType(level, "pond").map((pond) => (
        <ellipse
          key={pond.id}
          className="pond-water"
          cx={pond.x - 40}
          cy={pond.y + 26}
          rx={30}
          ry={15}
        />
      ))}

      {level.theme === "town" ? (
        <>
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
        </>
      ) : (
        // Open country: a scatter of trees instead of terraced houses.
        <g>
          {[
            [90, 90],
            [250, 60],
            [610, 70],
            [740, 200],
            [60, 210],
            [400, 520],
            [700, 505],
            [180, 520],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <Tree />
            </g>
          ))}
        </g>
      )}

      {level.nodes.map((node) => {
        const kind = node.sprite ?? node.type;
        const sprite = kind ? ABOVE_NODE[kind] : undefined;
        if (!sprite) return null;
        return (
          <g
            key={`sprite-${node.id}`}
            transform={`translate(${node.x + sprite.dx} ${node.y + sprite.dy})`}
          >
            {sprite.render()}
          </g>
        );
      })}
    </g>
  );
}

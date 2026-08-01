import {
  Aeroplane,
  Bin,
  Bridge,
  Bush,
  CarPark,
  Cemetery,
  Church,
  CoffeeVan,
  Cow,
  CricketStumps,
  Ducks,
  FootballPitch,
  Ghost,
  GolfFlag,
  Hangar,
  HillMarker,
  Mosque,
  Observatory,
  Portaloo,
  Pub,
  Railway,
  Rock,
  Soldier,
  SportsCentre,
  Statue,
  Superstore,
  TownCentre,
  Treaters,
  Tree,
  Woods,
} from "./MapSprites";
import type { Level, MapNode, MapNodeType } from "../game/types";

/** Sprites drawn above their junction, keyed by what the junction is. */
const ABOVE_NODE: Partial<Record<MapNodeType, { render: () => React.ReactNode; dy: number; dx: number }>> = {
  // Both sit below and to one side of their junction. Landmarks are drawn
  // under the roads, so anything left on one is lost beneath it, and both of
  // these junctions label upwards, so above is where the writing goes. The
  // Observatory needs the wider berth: its telescope juts out to the right,
  // and the road down to the Polo Fields runs past that shoulder.
  observatory: { render: () => <Observatory />, dy: 42, dx: -52 },
  bush: { render: () => <Bush />, dy: 30, dx: 45 },
  shop: { render: () => <Superstore />, dy: -50, dx: 0 },
  carpark: { render: () => <CarPark />, dy: -50, dx: 0 },
  // Well clear to the side: the trail out of Cow Field runs north through the
  // junction, and a cow standing on the path is a cow you cannot see.
  cow: { render: () => <Cow />, dy: -32, dx: 60 },
  hill: { render: () => <HillMarker />, dy: 4, dx: -44 },
  hangar: { render: () => <Hangar />, dy: -46, dx: 2 },
  statue: { render: () => <Statue />, dy: -48, dx: 0 },
  towncentre: { render: () => <TownCentre />, dy: -52, dx: 0 },
  cemetery: { render: () => <Cemetery />, dy: -34, dx: 0 },
  woods: { render: () => <Woods />, dy: -46, dx: 0 },
  coffee: { render: () => <CoffeeVan />, dy: -44, dx: 0 },
  railway: { render: () => <Railway />, dy: -42, dx: 0 },
  // Both are pushed off to one side: the path down to the pitches and the one
  // up to the Woods each ran straight through the middle of them.
  football: { render: () => <FootballPitch />, dy: -48, dx: 40 },
  golf: { render: () => <GolfFlag />, dy: -26, dx: -48 },
  sportscentre: { render: () => <SportsCentre />, dy: -52, dx: 0 },
  bin: { render: () => <Bin />, dy: -34, dx: 0 },
  church: { render: () => <Church />, dy: -52, dx: 0 },
  // Beside its junction and dropped clear: the name goes above, and a
  // portaloo is tall enough to reach it.
  portaloo: { render: () => <Portaloo />, dy: 4, dx: -48 },
  ghost: { render: () => <Ghost />, dy: -42, dx: 0 },
  treaters: { render: () => <Treaters />, dy: -44, dx: 0 },
  // Beside the junction rather than over it: an aeroplane sitting on top of
  // the stop reads as a flypast, which Hecking Airport has never managed.
  airport: { render: () => <Aeroplane />, dy: 2, dx: -92 },
  // Clear of the label underneath it: the pub's sign stands proud of the roof.
  pub: { render: () => <Pub />, dy: -60, dx: 0 },
  // Higher than the rest: the stumps stand up, and the label goes underneath.
  cricket: { render: () => <CricketStumps />, dy: -58, dx: 0 },
  mosque: { render: () => <Mosque />, dy: -48, dx: 0 },
  // Both stand in the river rather than beside it: the bridge sits on its own
  // junction, and the ducks just off it, on the water.
  bridge: { render: () => <Bridge />, dy: 0, dx: 0 },
  ducks: { render: () => <Ducks />, dy: 12, dx: -40 },
};

/**
 * A closed shape through a ring of junctions, curving through the midpoint of
 * each side and pulled towards each junction. The result sits inside the ring,
 * so the bank junctions and the track between them stay on dry land.
 */
function waterThrough(bank: MapNode[]): string {
  const mid = (a: MapNode, b: MapNode) => [(a.x + b.x) / 2, (a.y + b.y) / 2];
  const [sx, sy] = mid(bank[bank.length - 1], bank[0]);
  let d = `M ${sx} ${sy}`;
  for (let i = 0; i < bank.length; i += 1) {
    const here = bank[i];
    const [mx, my] = mid(here, bank[(i + 1) % bank.length]);
    d += ` Q ${here.x} ${here.y} ${mx} ${my}`;
  }
  return `${d} Z`;
}

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
  // One canal junction is enough to draw a stretch of water through: the
  // Loopy map has a single towpath where the Thursday map has a bridge too.
  const canal = nodesOfType(level, "canal");
  const last = canal[canal.length - 1];
  // Where the water goes after the last towpath: off the map if the level says
  // so, otherwise tapering away past it.
  const tail = level.canalTail ?? [
    { x: Math.max((last?.x ?? 0) - 120, 20), y: (last?.y ?? 0) + 15 },
  ];
  const canalPath =
    canal.length >= 1
      ? [
          `M ${level.view.width - 10} ${canal[0].y + 72}`,
          ...canal.map((node) => `L ${node.x} ${node.y}`),
          ...tail.map((point) => `L ${point.x} ${point.y}`),
        ].join(" ")
      : "";

  // Three or more bank junctions mean they surround something.
  const bank = nodesOfType(level, "shore");
  const pondPath = bank.length >= 3 ? waterThrough(bank) : "";

  return (
    <g aria-hidden="true">
      {pondPath && (
        <>
          <path className="pond-body" d={pondPath} />
          <path className="pond-shimmer" d={pondPath} />
        </>
      )}

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

      {/* Placed by hand, where the theme's own scatter leaves a map looking
          empty. Drawn with the scenery, under the roads, like everything
          else here. */}
      {(level.scatter ?? []).map((item) => (
        <g
          key={`${item.kind}-${item.x}-${item.y}`}
          transform={`translate(${item.x} ${item.y})`}
        >
          {item.kind === "soldier" ? (
            <Soldier index={item.variant ?? 0} flip={item.flip} />
          ) : item.kind === "cow" ? (
            <Cow flip={item.flip} />
          ) : item.kind === "rock" ? (
            <Rock />
          ) : (
            <Tree />
          )}
        </g>
      ))}

      {level.nodes.map((node) => {
        const kind = node.sprite ?? node.type;
        const sprite = kind ? ABOVE_NODE[kind] : undefined;
        if (!sprite) return null;
        // A junction may put its landmark somewhere other than where the type
        // puts every other one, for the roads that happen to run past it.
        const dx = node.spriteDx ?? sprite.dx;
        const dy = node.spriteDy ?? sprite.dy;
        return (
          <g
            key={`sprite-${node.id}`}
            transform={`translate(${node.x + dx} ${node.y + dy})`}
          >
            {sprite.render()}
          </g>
        );
      })}
    </g>
  );
}

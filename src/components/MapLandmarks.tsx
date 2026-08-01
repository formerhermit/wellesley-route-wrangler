import {
  Aeroplane,
  AlpineTree,
  Bat,
  Bench,
  Bin,
  BmxTrack,
  Bridge,
  Bush,
  Butterfly,
  CarPark,
  Cat,
  Cemetery,
  Church,
  CoffeeVan,
  Cow,
  CricketStumps,
  DeadTree,
  Dog,
  DogWalker,
  Flowers,
  FootballPitch,
  Ghost,
  Gnome,
  GolfFlag,
  Gorse,
  Gravestone,
  Hangar,
  Heather,
  HillMarker,
  IceCreamVan,
  Island,
  MinleyManor,
  Moon,
  Mosque,
  Mud,
  Observatory,
  Portaloo,
  Pub,
  Pumpkin,
  Railway,
  Rock,
  SailingBoat,
  SandPatch,
  Signpost,
  Soldier,
  SportsCentre,
  Statue,
  Superstore,
  SuspiciousCar,
  TownCentre,
  TrafficLight,
  Treaters,
  Tree,
  WarningSign,
  Wellingtonia,
  Woods,
  Youths,
} from "./MapSprites";
import { LANDMARK_OFFSET, TRAIL_TREES } from "../game/landmarks";
import type { Level, MapNode, MapNodeType } from "../game/types";

/** What each kind of junction draws. Where it goes is in `landmarks.ts`. */
const LANDMARK: Partial<Record<MapNodeType, () => React.ReactNode>> = {
  observatory: () => <Observatory />,
  bush: () => <Bush />,
  shop: () => <Superstore />,
  carpark: () => <CarPark />,
  cow: () => <Cow />,
  hill: () => <HillMarker />,
  hangar: () => <Hangar />,
  statue: () => <Statue />,
  towncentre: () => <TownCentre />,
  cemetery: () => <Cemetery />,
  woods: () => <Woods />,
  coffee: () => <CoffeeVan />,
  railway: () => <Railway />,
  football: () => <FootballPitch />,
  golf: () => <GolfFlag />,
  sportscentre: () => <SportsCentre />,
  bin: () => <Bin />,
  church: () => <Church />,
  portaloo: () => <Portaloo />,
  car: () => <SuspiciousCar />,
  ghost: () => <Ghost />,
  treaters: () => <Treaters />,
  airport: () => <Aeroplane />,
  pub: () => <Pub />,
  cricket: () => <CricketStumps />,
  mosque: () => <Mosque />,
  bridge: () => <Bridge />,
  manor: () => <MinleyManor />,
  sailing: () => <SailingBoat />,
  sand: () => <SandPatch />,
  mud: () => <Mud />,
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

type ScatterItem = NonNullable<Level["scatter"]>[number];

/** What each hand-placed scenery kind draws. */
const SCATTER: Record<ScatterItem["kind"], (item: ScatterItem) => React.ReactNode> = {
  tree: () => <Tree />,
  rock: () => <Rock />,
  soldier: (item) => <Soldier index={item.variant ?? 0} flip={item.flip} />,
  cow: (item) => <Cow flip={item.flip} />,
  signpost: () => <Signpost />,
  pumpkin: () => <Pumpkin />,
  gravestone: () => <Gravestone />,
  bat: () => <Bat />,
  moon: () => <Moon />,
  cat: () => <Cat />,
  lights: () => <TrafficLight />,
  car: (item) => <SuspiciousCar variant={item.variant ?? 0} />,
  bin: () => <Bin />,
  dog: (item) => <Dog flip={item.flip} />,
  bench: () => <Bench />,
  gnome: () => <Gnome />,
  youths: () => <Youths />,
  flowers: () => <Flowers />,
  butterfly: () => <Butterfly />,
  icecream: () => <IceCreamVan />,
  alpine: () => <AlpineTree />,
  wellingtonia: () => <Wellingtonia />,
  heather: () => <Heather />,
  gorse: () => <Gorse />,
  boat: () => <SailingBoat />,
  island: () => <Island />,
  warning: () => <WarningSign />,
  walker: () => <DogWalker />,
  bmx: () => <BmxTrack />,
};

/**
 * Fog, drifting along the bottom of a map that has gone dark. Three banks at
 * different speeds, because one moving at one speed reads as a mistake.
 */
const FOG = [
  { cx: 210, cy: 527, rx: 240, ry: 26, className: "fog-bank" },
  { cx: 560, cy: 543, rx: 290, ry: 22, className: "fog-bank fog-bank--slow" },
  { cx: 390, cy: 508, rx: 170, ry: 16, className: "fog-bank fog-bank--fast" },
];

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
export function MapLandmarks({
  level,
  onTop = false,
}: {
  level: Level;
  /** The second pass, drawn after the roads: only the junctions that ask. */
  onTop?: boolean;
}) {
  if (onTop) {
    return (
      <g aria-hidden="true">
        {level.nodes
          .filter((node) => node.spriteOnTop)
          .map((node) => {
            const kind = node.sprite ?? node.type;
            const draw = kind ? LANDMARK[kind] : undefined;
            const place = kind ? LANDMARK_OFFSET[kind] : undefined;
            if (!draw || !place) return null;
            const dx = node.spriteDx ?? place.dx;
            const dy = node.spriteDy ?? place.dy;
            return (
              <g
                key={`over-${node.id}`}
                transform={`translate(${node.x + dx} ${node.y + dy})`}
              >
                {draw()}
              </g>
            );
          })}
      </g>
    );
  }

  return <MapLandmarksUnderRoads level={level} />;
}

function MapLandmarksUnderRoads({ level }: { level: Level }) {
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
              {level.mood === "dusk" ? <DeadTree /> : <Tree />}
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
          {TRAIL_TREES.map((tree) => (
            <g
              key={`${tree.x}-${tree.y}`}
              transform={`translate(${tree.x} ${tree.y})`}
            >
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
          {SCATTER[item.kind](item)}
        </g>
      ))}

      {level.mood === "dusk" && (
        <g className="fog">
          {FOG.map((bank) => (
            <ellipse
              key={bank.className + bank.cx}
              className={bank.className}
              cx={bank.cx}
              cy={bank.cy}
              rx={bank.rx}
              ry={bank.ry}
            />
          ))}
        </g>
      )}

      {level.nodes.map((node) => {
        if (node.spriteOnTop) return null;
        const kind = node.sprite ?? node.type;
        const draw = kind ? LANDMARK[kind] : undefined;
        const place = kind ? LANDMARK_OFFSET[kind] : undefined;
        if (!draw || !place) return null;
        // A junction may put its landmark somewhere other than where the type
        // puts every other one, for the roads that happen to run past it.
        const dx = node.spriteDx ?? place.dx;
        const dy = node.spriteDy ?? place.dy;
        return (
          <g
            key={`sprite-${node.id}`}
            transform={`translate(${node.x + dx} ${node.y + dy})`}
          >
            {draw()}
          </g>
        );
      })}
    </g>
  );
}

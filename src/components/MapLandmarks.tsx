import {
  Aeroplane,
  AlpineTree,
  AtlanticWall,
  Barrow,
  Bat,
  Bench,
  Bin,
  Bridge,
  Bush,
  Butterfly,
  CandyCane,
  CarPark,
  Cat,
  Cemetery,
  ChristmasTree,
  Church,
  Clapperboard,
  CoffeeVan,
  Cave,
  Cow,
  CricketStumps,
  DeadTree,
  DirectorChair,
  Dog,
  FestiveHouse,
  FilmCamera,
  Flowers,
  FootballPitch,
  Ghost,
  Gnome,
  GolfFlag,
  Gorse,
  Gravestone,
  Hangar,
  HillMarker,
  Holly,
  IceCreamVan,
  Island,
  MinleyManor,
  Moon,
  Mosque,
  Mud,
  MulledWineStall,
  Observatory,
  Penguin,
  Portaloo,
  Presents,
  Pub,
  Pumpkin,
  Railway,
  Rock,
  RunningTrack,
  SailingBoat,
  SandPatch,
  Searchlight,
  Signpost,
  Snowman,
  Soldier,
  StartLine,
  Supporters,
  SportsCentre,
  Statue,
  Superstore,
  SuspiciousCar,
  Toilet,
  TownCentre,
  TrafficLight,
  Treaters,
  Tree,
  UnitTruck,
  WarningSign,
  Wellingtonia,
  Woods,
  Youths,
} from "./MapSprites";
import {
  EGG_LANDMARKS,
  EGG_SCATTER,
  eggResponds,
  landmarkEggId,
  scatterEggId,
} from "../game/eggs";
import {
  LANDMARK_OFFSET,
  PARK_TREES,
  TRAIL_TREES,
  lightsAt,
} from "../game/landmarks";
import type { CardWeather } from "../game/cards";
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
  toilet: () => <Toilet />,
  wall: () => <AtlanticWall />,
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
  cottage: () => <FestiveHouse />,
  christmastree: () => <ChristmasTree />,
  mulledwine: () => <MulledWineStall />,
  filmset: () => <FilmCamera />,
  filmunit: () => <UnitTruck />,
  barrow: () => <Barrow />,
  cave: () => <Cave />,
  searchlight: () => <Searchlight />,
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
  track: () => <RunningTrack />,
  startline: () => <StartLine />,
  supporters: () => <Supporters />,
  penguin: () => <Penguin />,
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
  gorse: (item) => <Gorse purple={item.variant === 1} />,
  unittruck: () => <UnitTruck />,
  clapperboard: () => <Clapperboard />,
  directorchair: () => <DirectorChair />,
  boat: () => <SailingBoat />,
  island: () => <Island />,
  warning: () => <WarningSign />,
  snowman: () => <Snowman />,
  candycane: () => <CandyCane />,
  present: () => <Presents />,
  holly: () => <Holly />,
  // The town tree drawn small, the way the ones in front gardens are: same
  // drawing, so a map's trees all read as the same council delivery.
  xmastree: () => (
    <g transform="scale(0.6)">
      <ChristmasTree />
    </g>
  ),
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

/**
 * Snow, as circles that fall and repeat. Laid out from the golden ratio rather
 * than from a table, so it never reshuffles between renders and never needs
 * forty hand-written coordinates — and spaced by it rather than at random,
 * because random snow clumps and reads as spots on the paper.
 */
function snowflakes(width: number, height: number) {
  return Array.from({ length: 48 }, (_, i) => ({
    x: Math.round(((i * 0.618033988749895) % 1) * width * 10) / 10,
    y: Math.round(((i * 0.754877666247) % 1) * height * 10) / 10,
    r: 1.6 + (i % 3) * 0.8,
    // Staggered, so they do not all cross the map in step.
    delay: -((i % 9) * 1.4),
    duration: 11 + (i % 5) * 2.6,
  }));
}

/**
 * Rain (#10), laid out the same way as the snow and falling a good deal
 * faster: more of it, steeper, and in lines rather than circles, because a
 * round raindrop is a snowflake.
 */
function raindrops(width: number, height: number) {
  return Array.from({ length: 70 }, (_, i) => ({
    x: Math.round(((i * 0.618033988749895) % 1) * width * 10) / 10,
    y: Math.round(((i * 0.754877666247) % 1) * height * 10) / 10,
    delay: -((i % 11) * 0.13),
    duration: 0.9 + (i % 4) * 0.18,
  }));
}

/**
 * Frost, creeping in from each corner. One fern, drawn once and turned four
 * ways: ice does the same thing at every corner of a window.
 */
const FROST_FERN =
  "M 0 0 L 62 62 M 16 16 l 12 -4 M 16 16 l -4 12 M 30 30 l 16 -6 M 30 30 l -6 16 M 44 44 l 12 -5 M 44 44 l -5 12";

/**
 * The two rows of terraced houses a town map draws along its edges — one below
 * the map, one above it, neither of them anywhere near a road.
 */
const TERRACES = [
  { count: 6, x: 186, step: 62, y: 516, width: 46, height: (i: number) => 20 + (i % 3) * 8 },
  { count: 4, x: 556, step: 58, y: 40, width: 42, height: (i: number) => 26 + (i % 2) * 10 },
];

function nodesOfType(level: Level, type: MapNodeType): MapNode[] {
  return level.nodes.filter((node) => node.type === type);
}

/** What the map hands back when something is pressed. */
export interface EggHandlers {
  /** How many presses this egg has already had on this level. */
  pressed: (id: string) => number;
  press: (id: string, kind: string) => void;
}

/**
 * The wrapper that makes one piece of scenery pressable.
 *
 * Everything an egg needs is here and nothing else has to know: whether it can
 * still be pressed, how many presses it has had, and the `is-hatched` class the
 * stylesheet hangs each animation off. The sprite inside is untouched — a cat
 * is the same cat whether or not this map lets you press it.
 *
 * `data-pressed` carries the count for the one egg that answers more than once.
 * The `key` on the inner group is what makes a repeated press replay rather
 * than sit there already finished: a CSS animation does not restart because a
 * class it already has was set again.
 */
function EggShell({
  id,
  kind,
  eggs,
  egg,
  children,
}: {
  id: string;
  kind: string;
  eggs?: EggHandlers;
  egg: boolean;
  children: React.ReactNode;
}) {
  if (!egg || !eggs) return <>{children}</>;
  const pressed = eggs.pressed(id);
  const live = eggResponds(kind, pressed);
  return (
    <g
      className={`egg${pressed > 0 ? " is-hatched" : ""}`}
      data-pressed={pressed}
      onClick={live ? () => eggs.press(id, kind) : undefined}
      style={live ? undefined : { cursor: "default" }}
    >
      <g key={pressed}>{children}</g>
    </g>
  );
}

/**
 * Placed from the junction types in the level data, so a new level gets its
 * scenery without touching this file.
 *
 * Almost all of it is decoration that ignores input. The exception is the
 * easter eggs, which take a press and hand it to `eggs.press` — and even those
 * are still `aria-hidden`, still score nothing, and still leave the map exactly
 * as they found it.
 */
export function MapLandmarks({
  level,
  onTop = false,
  eggs,
  weather,
}: {
  level: Level;
  /** The second pass, drawn after the roads: only the junctions that ask. */
  onTop?: boolean;
  /** Absent on a map with nothing to press, which is most of the furniture. */
  eggs?: EggHandlers;
  /** What a briefing card has done to the sky (#10). Never the level's mood. */
  weather?: CardWeather;
}) {
  if (onTop) {
    const { width, height } = level.view;
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

        {/* Weather comes down in front of the map and behind the writing: it
            should fall past the houses without ever making a name harder to
            read. */}
        {level.mood === "frost" && (
          <>
            <g className="frost">
              <rect
                className="frost-edge"
                x={0}
                y={0}
                width={width}
                height={height}
              />
              <path className="frost-fern" d={FROST_FERN} />
              <path
                className="frost-fern"
                d={FROST_FERN}
                transform={`translate(${width} 0) scale(-1 1)`}
              />
              <path
                className="frost-fern"
                d={FROST_FERN}
                transform={`translate(0 ${height}) scale(1 -1)`}
              />
              <path
                className="frost-fern"
                d={FROST_FERN}
                transform={`translate(${width} ${height}) scale(-1 -1)`}
              />
            </g>

            <g className="snow">
              {snowflakes(width, height).map((flake, index) => (
                <circle
                  key={index}
                  className="snowflake"
                  cx={flake.x}
                  cy={flake.y}
                  r={flake.r}
                  style={
                    {
                      "--fall-delay": `${flake.delay}s`,
                      "--fall-duration": `${flake.duration}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </g>
          </>
        )}
        {/* A card's weather falls in the same place the season's does, and
            for the same reason: in front of the map, behind the writing. */}
        {/* Snow from a card is the flakes and not the frost: the ferns
            creeping in from the corners are December, and a card must never
            make an ordinary Thursday read as an occasion. */}
        {weather === "snow" && (
          <g className="snow">
            {snowflakes(width, height).map((flake, index) => (
              <circle
                key={index}
                className="snowflake"
                cx={flake.x}
                cy={flake.y}
                r={flake.r}
                style={
                  {
                    "--fall-delay": `${flake.delay}s`,
                    "--fall-duration": `${flake.duration}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        )}
        {weather === "clear" && (
          <rect
            className="sunlight"
            x={0}
            y={0}
            width={width}
            height={height}
          />
        )}
        {weather === "rain" && (
          <g className="rain">
            {raindrops(width, height).map((drop, index) => (
              <line
                key={index}
                className="raindrop"
                x1={drop.x}
                y1={drop.y}
                x2={drop.x - 3}
                y2={drop.y + 11}
                style={
                  {
                    "--fall-delay": `${drop.delay}s`,
                    "--fall-duration": `${drop.duration}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        )}
      </g>
    );
  }

  return <MapLandmarksUnderRoads level={level} eggs={eggs} weather={weather} />;
}

function MapLandmarksUnderRoads({
  level,
  eggs,
  weather,
}: {
  level: Level;
  eggs?: EggHandlers;
  /** Only fog is read here; the rest of the sky is drawn over the top. */
  weather?: CardWeather;
}) {
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
      {/* First of everything, because it is the ground (#101): the water, the
          gardens, the roads and the whole map are laid on top of it. */}
      {(level.ground ?? []).map((patch, index) => (
        <rect
          key={index}
          className={`ground-patch ground-patch--${level.theme}`}
          x={patch.x}
          y={patch.y}
          width={patch.width}
          height={patch.height}
          rx={patch.rx ?? 22}
        />
      ))}

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
          {(park.noTrees ? [] : PARK_TREES).map((tree, index) => (
            <g
              key={index}
              transform={`translate(${park.x + tree.dx} ${park.y + tree.dy})`}
            >
              {/* Bare in any weather that is not daylight: October took the
                  leaves and December has not given them back. */}
              {level.mood ? <DeadTree /> : <Tree />}
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
        TERRACES.map((row, index) => (
          <g className="terrace" key={index}>
            {Array.from({ length: row.count }, (_, i) => (
              <rect
                key={i}
                x={row.x + i * row.step}
                y={row.y}
                width={row.width}
                height={row.height(i)}
                rx={3}
              />
            ))}
          </g>
        ))
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
      {(level.scatter ?? []).map((item) => {
        const id = scatterEggId(item);
        return (
          <EggShell key={id} id={id} kind={item.kind} eggs={eggs} egg={EGG_SCATTER.has(item.kind)}>
            <g transform={`translate(${item.x} ${item.y})`}>{SCATTER[item.kind](item)}</g>
          </EggShell>
        );
      })}

      {/* Fog: the level's own after dark, or a briefing card's on any
          ordinary evening (#10). Drawn under the roads either way, because
          fog is something the map is in rather than something on top of it. */}
      {(level.mood === "dusk" || weather === "fog") && (
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

      {/* Traffic lights, beside the junctions that have them (#10). Street
          furniture: the junction keeps its own landmark, and these stand to
          one side of it. */}
      {level.nodes
        .filter((node) => node.lights)
        .map((node) => {
          const spot = lightsAt(node);
          return (
            <g key={`lights-${node.id}`} transform={`translate(${spot.x} ${spot.y})`}>
              <TrafficLight />
            </g>
          );
        })}

      {level.nodes.map((node) => {
        if (node.spriteOnTop) return null;
        const kind = node.sprite ?? node.type;
        const draw = kind ? LANDMARK[kind] : undefined;
        const place = kind ? LANDMARK_OFFSET[kind] : undefined;
        if (!kind || !draw || !place) return null;
        // A junction may put its landmark somewhere other than where the type
        // puts every other one, for the roads that happen to run past it.
        const dx = node.spriteDx ?? place.dx;
        const dy = node.spriteDy ?? place.dy;
        return (
          <EggShell
            key={`sprite-${node.id}`}
            id={landmarkEggId(node)}
            kind={kind}
            eggs={eggs}
            egg={EGG_LANDMARKS.has(kind)}
          >
            <g transform={`translate(${node.x + dx} ${node.y + dy})`}>{draw()}</g>
          </EggShell>
        );
      })}
    </g>
  );
}

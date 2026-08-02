import { nodeById, roadById, totalDistanceKm } from "./routeGraph";
import { routeFromRoads } from "./records";
import { scoreRun, winningRouteCount } from "./scoring";
import type { Records } from "./records";
import type { Level, MapNodeType, Route } from "./types";

/**
 * Badges, earned by running. Pure, like the rest of `src/game/`, and derived
 * from the routes in the book rather than stored anywhere — the same rule the
 * scoring follows, so retuning a badge re-awards everybody's history instead
 * of stranding it. Nothing here is written down but the routes.
 *
 * That rule is also the constraint. `recordRun` is idempotent: running a route
 * you have already found records nothing, so the book is a set of discoveries
 * and not a diary. A badge can therefore ask "what has this club been down"
 * but never "what did it do last Thursday, and the Thursday before".
 */

/** How much of a locked badge the cabinet gives away. */
export type Reveal =
  /** Name and hint on show, so there is something to go after. */
  | "teased"
  /** The drawing only. Enough to be intriguing, not enough to be a list. */
  | "shape"
  /** Nothing at all. For the ones whose whole worth is the surprise. */
  | "secret";

export interface Achievement {
  id: string;
  name: string;
  /** What it was for, in the club's own voice. Shown once it is won. */
  blurb: string;
  reveal: Reveal;
  /** Shown while it is still locked. Only ever read for a "teased" badge. */
  hint?: string;
}

/** One route in the book, with the figures a badge might want. */
interface Run {
  level: Level;
  route: Route;
  won: boolean;
  distanceKm: number;
}

function nodeTypes(run: Run): MapNodeType[] {
  return run.route.nodeIds
    .map((id) => nodeById(run.level, id).type)
    .filter((type): type is MapNodeType => type !== undefined);
}

function countType(run: Run, type: MapNodeType): number {
  return new Set(
    run.route.nodeIds.filter((id) => nodeById(run.level, id).type === type),
  ).size;
}

function roads(run: Run) {
  return run.route.roadIds.map((id) => roadById(run.level, id));
}

/** The shortest the level will accept, where it says. */
function minimumKm(level: Level): number | undefined {
  for (const objective of level.objectives) {
    if (objective.kind === "distance") return objective.minKm;
  }
  return undefined;
}

/**
 * Somewhere to stop. Both kinds count: the Medical Centre Toilet is a real one
 * with a door that locks, and the Random Portaloos are what the heath has, and
 * a club that has been to one of each has been toilet to toilet.
 */
const LOOS: MapNodeType[] = ["toilet", "portaloo"];

/** Where the goose is standing on this map, if it has one. */
function gooseNodeId(level: Level): string | undefined {
  return level.followers?.find((f) => f.kind === "goose")?.nodeId;
}

/**
 * Every badge is a question asked of the whole book at once. Most only need
 * the runs; Local Legend is about what is *missing*, so it needs the roster
 * too, and it is not worth a second kind of badge to spare it an argument it
 * ignores.
 */
type Test = (runs: Run[], levels: Level[]) => boolean;

const some =
  (predicate: (run: Run) => boolean): Test =>
  (runs) =>
    runs.some(predicate);

const atLeast =
  (n: number, predicate: (run: Run) => boolean): Test =>
  (runs) =>
    runs.filter(predicate).length >= n;

/**
 * Every badge, in the order the cabinet hangs them.
 *
 * The numbers were picked against what the maps can actually produce rather
 * than what sounds good: a half marathon is 21.1 km and the longest loop on
 * the roster is 17.8 km, and every road is measured to one decimal place, so
 * a total of 4.99 km cannot happen on any map however it is run.
 */
const ACHIEVEMENTS: (Achievement & { test: Test })[] = [
  {
    id: "exactly-five",
    name: "Exactly Five Means Exactly Five",
    blurb: "Five kilometres. Not five point one. The club noticed.",
    hint: "Five kilometres. To the metre.",
    reveal: "teased",
    // Six routes across the whole roster manage it, on three maps.
    test: some((run) => run.distanceKm === 5),
  },
  {
    id: "strava-tax",
    name: "Strava Tax",
    blurb:
      "A hundred metres short of the brief. Somebody's watch will be arguing about this all week.",
    reveal: "secret",
    test: some((run) => {
      const min = minimumKm(run.level);
      return min !== undefined && Math.abs(run.distanceKm - (min - 0.1)) < 0.001;
    }),
  },
  {
    id: "no-hills",
    name: "No Hills, No Problems",
    blurb: "A whole run that met the brief without going up anything.",
    hint: "Meet a brief without a single climb.",
    reveal: "teased",
    test: some((run) => run.won && !roads(run).some((road) => road.hill)),
  },
  {
    id: "pigeon-diplomat",
    name: "Pigeon Diplomat",
    blurb: "Round the map, brief met, and not one bird troubled.",
    reveal: "shape",
    test: some((run) => run.won && !nodeTypes(run).includes("pigeon")),
  },
  {
    id: "didnt-even-try",
    name: "You Didn't Even Try, Did You",
    blurb: "Under four kilometres. The kettle had not finished boiling.",
    reveal: "secret",
    test: some((run) => run.distanceKm < 4),
  },
  {
    id: "hills-pay-the-bills",
    name: "Hills Pay The Bills",
    blurb: "Twenty-five hill roads in the book. Nobody made you do this.",
    hint: "Twenty-five hill roads, across everything you have run.",
    reveal: "teased",
    test: (runs) =>
      runs.reduce(
        (total, run) => total + roads(run).filter((road) => road.hill).length,
        0,
      ) >= 25,
  },
  {
    id: "closed-means-closed",
    name: "Closed Means Closed",
    blurb: "It was closed. You went down it anyway.",
    reveal: "shape",
    test: some((run) => roads(run).some((road) => road.closed)),
  },
  {
    id: "reading-isnt-your-thing",
    name: "Reading Isn't Your Thing",
    blurb: "Five separate routes down a road with a sign on it.",
    reveal: "secret",
    test: atLeast(5, (run) => roads(run).some((road) => road.closed)),
  },
  {
    id: "unexpected-long-run",
    name: "The Unexpected Long Run",
    blurb:
      "Thirteen kilometres on a run advertised as five. Two people have gone home in a car.",
    hint: "Thirteen kilometres in one go.",
    reveal: "teased",
    test: some((run) => run.distanceKm >= 13),
  },
  {
    id: "local-legend",
    name: "Local Legend",
    blurb: "Every route on the first five maps. There is nothing left to find.",
    hint: "Find every route on the first five maps.",
    reveal: "teased",
    test: (runs, levels) => isLocalLegend(runs, levels),
  },
  {
    id: "obsessed-with-cows",
    name: "Obsessed With Cows",
    blurb: "Ten routes by way of the cows. They have started to expect it.",
    reveal: "shape",
    test: atLeast(10, (run) => countType(run, "cow") > 0),
  },
  {
    id: "spooker",
    name: "Spooker",
    blurb: "The Spooky Run, run and survived.",
    reveal: "shape",
    test: some((run) => run.won && run.level.id === "spooky-run"),
  },
  {
    id: "is-someone-jingling",
    name: "Is Someone Jingling?",
    blurb: "The Christmas Run, in the hats, in the cold.",
    reveal: "shape",
    test: some((run) => run.won && run.level.id === "christmas-run"),
  },
  {
    id: "brave-little-soldier",
    name: "Brave Little Soldier",
    blurb: "You used the portaloos. Nobody is judging. Everybody is judging.",
    reveal: "secret",
    test: some((run) => countType(run, "portaloo") > 0),
  },
  {
    id: "toilet-to-toilet",
    name: "Toilet to Toilet",
    blurb:
      "Stops on two different maps. The club knows where every one of them is, and always has.",
    reveal: "shape",
    /*
     * Two *maps*, not two on one route, which cannot happen: every map on the
     * roster has at most one place to stop, so the brief as first written —
     * more than one stop in a single route — was a badge nobody could ever
     * have won. Going from a toilet on one map to a toilet on another is the
     * nearest thing that is both earnable and still the same joke.
     */
    test: (runs) =>
      new Set(
        runs
          .filter((run) => LOOS.some((type) => countType(run, type) > 0))
          .map((run) => run.level.id),
      ).size >= 2,
  },
  {
    id: "goose-botherer",
    name: "Goose Botherer",
    blurb: "Twice now the goose has joined in. That is a pattern, not an accident.",
    reveal: "shape",
    test: atLeast(2, (run) => {
      const goose = gooseNodeId(run.level);
      return goose !== undefined && run.route.nodeIds.includes(goose);
    }),
  },
];

/** How many maps deep "the first five" goes, for Local Legend. */
const LOCAL_LEVELS = 5;

/** Rebuild the book as runs, dropping anything the map has outgrown. */
function runsFrom(records: Records, levels: Level[]): Run[] {
  const runs: Run[] = [];
  for (const level of levels) {
    for (const record of Object.values(records[level.id] ?? {})) {
      const route = routeFromRoads(level, record.roads);
      if (!route) continue;
      runs.push({
        level,
        route,
        won: scoreRun(level, route).won,
        distanceKm: totalDistanceKm(level, route),
      });
    }
  }
  return runs;
}

/**
 * Local Legend is the one badge that is about what is *missing* rather than
 * what was run, so it needs the roster to know what a full map looks like.
 */
function isLocalLegend(runs: Run[], levels: Level[]): boolean {
  const local = levels.slice(0, LOCAL_LEVELS);
  if (local.length < LOCAL_LEVELS) return false;
  return local.every((level) => {
    const won = runs.filter((run) => run.level.id === level.id && run.won);
    // Against the level's own count of what there is to find, which is the
    // same number the objective panel shows. Walked once per level and
    // remembered by `scoring`, so asking here costs nothing.
    return won.length >= winningRouteCount(level);
  });
}

export interface CabinetEntry extends Achievement {
  earned: boolean;
}

/** Every badge, in hanging order, with whether this club has it. */
export function cabinetFor(records: Records, levels: Level[]): CabinetEntry[] {
  const runs = runsFrom(records, levels);
  return ACHIEVEMENTS.map(({ test, ...achievement }) => ({
    ...achievement,
    earned: test(runs, levels),
  }));
}

export function earnedCount(entries: CabinetEntry[]): number {
  return entries.filter((entry) => entry.earned).length;
}

/**
 * Which badges this route accounts for: the ones the cabinet would not hold if
 * this route were not in the book.
 *
 * Worked out by asking the book what it would say without it, which is exact
 * and needs nothing remembered between renders.
 *
 * This is *not* the same question as "what did the run just win", and the
 * difference matters. Running a route already in the book records nothing, so
 * the book reads the same before and afterwards and this function would still
 * hand back the badges that route earned — weeks ago. A caller announcing a
 * win has to know the run was a fresh discovery as well; `recordRun` says so,
 * and `App` has it in hand.
 */
export function earnedBy(
  records: Records,
  levels: Level[],
  level: Level,
  routeKeyOfRun: string,
): CabinetEntry[] {
  const before: Records = {
    ...records,
    [level.id]: Object.fromEntries(
      Object.entries(records[level.id] ?? {}).filter(
        ([key]) => key !== routeKeyOfRun,
      ),
    ),
  };
  const had = new Set(
    cabinetFor(before, levels)
      .filter((entry) => entry.earned)
      .map((entry) => entry.id),
  );
  return cabinetFor(records, levels).filter(
    (entry) => entry.earned && !had.has(entry.id),
  );
}

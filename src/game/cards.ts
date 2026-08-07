import { hasWinningRoute } from "./scoring";
import type { Completed } from "./progression";
import type { Level, LevelObjective, MapNodeType } from "./types";

/**
 * The briefing (#10): what the club has turned up with this week.
 *
 * A card changes the run and never the scoring. Everything here is applied to
 * a *derived* level — a copy with extra objectives on it — which is what the
 * player plans and runs against. `scoreRun` and `logRun` keep the level the
 * roster declared, so the book, the points, the badges, the routes-to-find
 * count and the server's own rescoring all carry on describing the same
 * fifteen maps they always did.
 *
 * That is not a limitation dressed up as a principle. Every total in this game
 * is rebuilt from stored road ids under the current rules, so a card that
 * moved the goalposts would re-judge history: a loop that won under Rain is a
 * failure again the moment anything replays the book, and Show Off — a whole
 * map found without one bad run in it — would be revoked by a run that was
 * legal when it happened. The eggs settled this once already. A card is worth
 * nothing, and that is what keeps it free.
 */

export type Suit = "leader" | "runner" | "weather";

/**
 * What the sky is doing, for the cards that change how the map looks rather
 * than what it asks. Declared here so the drawing has one thing to switch on
 * and never has to know a card by name.
 *
 * Deliberately *not* the level's own `mood`. Mood and music are the seasonal
 * kit — a card borrowing "frost" would make an ordinary Thursday read as an
 * occasion, which is the mistake `nightLevel.test.ts` exists to forbid.
 */
export type CardWeather = "rain" | "clear";

/** Dealt one of each, and the player keeps two. */
export const SUITS: readonly Suit[] = ["leader", "runner", "weather"];

export interface CardEffect {
  /** Added to the level's own brief. */
  objectives?: LevelObjective[];
  /**
   * Junctions the group stands still at, handed to `paceOf`. Ones the route
   * never reaches cost nothing, so a card can name a place hopefully.
   */
  stops?: string[];
  /**
   * Moves the whole distance window down. 1 leaves it alone.
   *
   * Both ends, deliberately. Dropping the ceiling alone reads like the right
   * way to say "keep it short" and is not: on a brief as tight as Tilford's
   * 7.5 to 8 it puts the ceiling under the floor and asks for a run that
   * cannot exist. A shorter run is a shorter target, not a narrower one.
   */
  shortenBy?: number;
  /** Throw out the level's own waypoints. Only ever makes a level easier. */
  dropVisits?: boolean;
  /** What the weather looks like. Changes nothing the rules can see. */
  weather?: CardWeather;
}

export interface Card {
  id: string;
  suit: Suit;
  name: string;
  /** One line. The joke. */
  blurb: string;
  /**
   * One line. The rule: what taking this card does to the brief, stated flat
   * so the player knows what they are agreeing to before they agree to it.
   * The joke stays in the blurb; a card whose effect hides behind its humour
   * reads as nothing happening. A function of the level because the
   * honest answer can depend on the map — Rain names the window it leaves.
   */
  rule: (level: Level) => string;
  /** Whether this card means anything on this map at all. */
  fits: (level: Level) => boolean;
  effect: (level: Level) => CardEffect;
}

function nodesOfType(level: Level, ...types: MapNodeType[]): string[] {
  const wanted = new Set<MapNodeType>(types);
  return level.nodes
    .filter((node) => node.type !== undefined && wanted.has(node.type))
    .map((node) => node.id);
}

/**
 * Where the goose is. Read off `followers` rather than a junction type,
 * because it loiters at a pond on one map, a jetty on another and a beach on
 * a third, and those share nothing but the bird.
 */
function geesePonds(level: Level): string[] {
  return (level.followers ?? [])
    .filter((waiting) => waiting.kind === "goose")
    .map((waiting) => waiting.nodeId);
}

function hillRoads(level: Level): number {
  return level.roads.filter((road) => road.hill && !road.closed).length;
}

function alreadyAsks(level: Level, kind: LevelObjective["kind"]): boolean {
  return level.objectives.some((objective) => objective.kind === kind);
}

/** How much of the run Rain takes off. Both ends of the window, deliberately. */
const RAIN_SHORTEN = 0.85;

/**
 * Every road is measured to one decimal place, so a shortened window is too —
 * a ceiling of 8.4499 km would be a number no route could ever equal. Shared
 * with Rain's own rule line, so the card promises the window it delivers.
 */
function shortenKm(km: number, factor: number): number {
  return Math.round(km * factor * 10) / 10;
}

/** "the canal", or "the cows and the canal": listed the way a person would. */
function listed(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * The deck. Deliberately small to start with: two of each suit is enough to
 * prove a hand can be dealt and to make the pairs collide in ways worth
 * catching. It grows a card at a time, each with its own `fits` and its own
 * line in the test.
 */
export const CARDS: readonly Card[] = [
  {
    id: "leader-ben",
    suit: "leader",
    name: "Run leader Ben",
    blurb: "Ben has found some hills. Ben is delighted.",
    rule: () => "Adds: climb at least 2 hills.",
    // Only where the level is not already counting climbs, so the brief never
    // ends up asking for hills twice in two different numbers.
    fits: (level) => !alreadyAsks(level, "climb") && hillRoads(level) >= 2,
    effect: () => ({
      objectives: [
        {
          kind: "climb",
          minHills: 2,
          fail: {
            title: "Ben Is Disappointed",
            message:
              "He had a route in mind and it went upwards. This one went round the flat bit.",
          },
        },
      ],
    }),
  },
  {
    id: "leader-dan",
    suit: "leader",
    name: "Run leader Dan",
    blurb: "Dan is not going home until he has said hello to the cows.",
    rule: () => "Adds: visit the cows.",
    fits: (level) => nodesOfType(level, "cow").length > 0,
    effect: (level) => {
      const cows = nodesOfType(level, "cow");
      return {
        stops: cows,
        objectives: [
          {
            kind: "visit",
            nodeIds: cows,
            what: "the cows",
            reportLabel: "Cows greeted",
            done: "Cows greeted, at length.",
            pending: "The cows have not been greeted.",
            missed: {
              title: "The Cows Were Not Greeted",
              message:
                "Dan has gone back for them. Nobody knows how long he will be.",
            },
          },
        ],
      };
    },
  },
  {
    id: "leader-nobody",
    suit: "leader",
    name: "Nobody volunteered to lead",
    blurb: "No plan. The group will go wherever the first person turns.",
    // Removal is the change nobody spots on the panel — a vanished line is
    // invisible by nature — so the card is the one place it gets said.
    rule: (level) =>
      `Drops: visit ${listed(
        level.objectives
          .filter((one) => one.kind === "visit")
          .map((one) => one.what),
      )}.`,
    fits: (level) => level.objectives.some((one) => one.kind === "visit"),
    // Takes the waypoints off the brief, so it can only ever add winning
    // routes. The one card that cannot make a level impossible.
    effect: () => ({ dropVisits: true }),
  },
  {
    id: "runner-geese",
    suit: "runner",
    name: "Somebody is frightened of geese",
    blurb: "Not a phobia, they say. Just a very strong preference.",
    rule: () => "Adds: keep away from the geese.",
    fits: (level) => geesePonds(level).length > 0,
    effect: (level) => ({
      objectives: [
        {
          kind: "avoid-nodes",
          nodeIds: geesePonds(level),
          what: "the geese",
          fail: {
            title: "The Geese Were Waiting",
            message:
              "They were on the path, they knew, and they were not moving. One of us is still in the car.",
          },
        },
      ],
    }),
  },
  {
    id: "runner-new-shoes",
    suit: "runner",
    name: "Somebody has new shoes",
    blurb: "They are white. They are staying white.",
    rule: () => "Adds: keep off the mud.",
    /*
     * Mud is marked per road rather than read off the surface, which cannot
     * express it: a town map has no trail on it at all, and a trail map is
     * trail nearly end to end.
     */
    fits: (level) => level.roads.some((road) => road.muddy && !road.closed),
    effect: () => ({
      objectives: [
        {
          kind: "avoid-roads",
          trait: "muddy",
          what: "the mud",
          fail: {
            title: "The Shoes Are Ruined",
            message:
              "Two hundred metres of bog, and a silence that lasted the rest of the week.",
          },
        },
      ],
    }),
  },
  {
    id: "runner-watch",
    suit: "runner",
    name: "Somebody's watch did not start",
    blurb: "As far as the internet is concerned, this run never happened.",
    rule: () => "Adds nothing.",
    /*
     * Asks nothing of the route, which is the point of it. Every suit needs
     * one card that cannot fail to fit, or whether a briefing happens at all
     * comes down to whether the map has a cow on it.
     */
    fits: () => true,
    effect: () => ({}),
  },
  {
    id: "runner-big-coffee",
    suit: "runner",
    name: "Somebody had a large coffee",
    blurb: "There is a stop coming, whether the route plans for one or not.",
    rule: () => "Adds: visit somewhere to stop.",
    fits: (level) => nodesOfType(level, "toilet", "portaloo", "bush").length > 0,
    effect: (level) => {
      const stops = nodesOfType(level, "toilet", "portaloo", "bush");
      return {
        stops,
        objectives: [
          {
            kind: "visit",
            nodeIds: stops,
            what: "somewhere to stop",
            reportLabel: "Facilities located",
            done: "A stop was made. Nobody commented.",
            pending: "Nothing suitable on the route yet.",
            missed: {
              title: "Nothing Was Passed In Time",
              message:
                "Eight kilometres and not one bush. The group ran the last mile in silence.",
            },
          },
        ],
      };
    },
  },
  {
    id: "weather-rain",
    suit: "weather",
    name: "Rain",
    blurb: "Nobody wants to be out in this. Keep it short.",
    // The window it names is the window it delivers: same factor, same
    // rounding. "Shortens the run" alone would leave the player to find the
    // new numbers two digits deep in a line that already existed.
    rule: (level) => {
      const window = level.objectives.find((one) => one.kind === "distance");
      if (window?.kind !== "distance") return "Shortens the run.";
      return `Shortens the run to ${shortenKm(window.minKm, RAIN_SHORTEN)}–${shortenKm(window.maxKm, RAIN_SHORTEN)} km.`;
    },
    fits: (level) => alreadyAsks(level, "distance"),
    effect: () => ({ shortenBy: RAIN_SHORTEN, weather: "rain" }),
  },
  {
    id: "weather-perfect",
    suit: "weather",
    name: "A perfect evening",
    blurb: "Still, golden, and warm. Nobody can think of a single complaint.",
    rule: () => "Adds nothing.",
    // The deck needs one card that only makes the run nicer, or picking is
    // nothing but damage limitation.
    fits: () => true,
    effect: () => ({ weather: "clear" }),
  },
];

/**
 * The level as the cards leave it: same map, same roads, a longer brief.
 *
 * Memoised per level and hand because `hasWinningRoute` remembers its answer
 * against the level *object*, and a fresh copy every call would throw that
 * away — which is the difference between a briefing dealing instantly and it
 * walking Tilford's eleven hundred loops again for every question asked.
 */
const derived = new WeakMap<Level, Map<string, Level>>();

export function applyCards(level: Level, cards: readonly Card[]): Level {
  if (cards.length === 0) return level;

  // Keyed on the level object rather than its id: two levels can share an id
  // and differ — a roster level and a copy of it with a road changed — and
  // handing back the wrong one would be a lie nothing downstream could catch.
  let forLevel = derived.get(level);
  if (!forLevel) {
    forLevel = new Map();
    derived.set(level, forLevel);
  }
  const key = cards.map((card) => card.id).sort().join(",");
  const cached = forLevel.get(key);
  if (cached) return cached;

  const effects = cards.map((card) => card.effect(level));
  const shorten = effects.reduce(
    (factor, effect) => factor * (effect.shortenBy ?? 1),
    1,
  );

  let objectives = level.objectives;

  if (shorten !== 1) {
    objectives = objectives.map((objective) =>
      objective.kind === "distance"
        ? {
            ...objective,
            minKm: shortenKm(objective.minKm, shorten),
            maxKm: shortenKm(objective.maxKm, shorten),
          }
        : objective,
    );
  }

  if (effects.some((effect) => effect.dropVisits)) {
    objectives = objectives.filter((objective) => objective.kind !== "visit");
  }

  // The cards' own objectives go on last, so a card that clears the brief
  // does not then clear its own contribution to it.
  objectives = [
    ...objectives,
    ...effects.flatMap((effect) => effect.objectives ?? []),
  ];

  const carded: Level = { ...level, objectives };
  forLevel.set(key, carded);
  return carded;
}

/**
 * How the cards touched one line of the carded brief: brought it, or rewrote
 * it. `was` is what the level's own brief asked before the cards got to it.
 */
export interface BriefingMark {
  kind: "added" | "changed";
  was?: string;
}

/**
 * Which lines of the carded brief the cards put there, by index against
 * `applyCards(level, cards).objectives` — which is the order `evaluateRoute`
 * keeps, so the panel can line the two up without a join.
 *
 * Worked out by identity rather than by flag: `applyCards` carries the
 * level's own objectives through by reference and builds new objects for
 * everything it touches, so "not the level's object" is exactly "the cards
 * did this". A rewritten window still holds its place in the list, which is
 * why it is marked rather than counted off the end.
 */
export function briefingMarks(
  level: Level,
  brief: Level,
): (BriefingMark | undefined)[] {
  return brief.objectives.map((objective) => {
    if (level.objectives.includes(objective)) return undefined;
    if (objective.kind === "distance") {
      const own = level.objectives.find((one) => one.kind === "distance");
      if (own?.kind === "distance") {
        return { kind: "changed", was: `${own.minKm}–${own.maxKm} km` };
      }
    }
    return { kind: "added" };
  });
}

/** What the sky is doing, for the map. Undefined on a hand that says nothing. */
export function weatherFor(
  level: Level,
  cards: readonly Card[],
): CardWeather | undefined {
  for (const card of cards) {
    const weather = card.effect(level).weather;
    if (weather) return weather;
  }
  return undefined;
}

/** Where the group stands still, for `paceOf`. */
export function stopsFor(level: Level, cards: readonly Card[]): string[] {
  return cards.flatMap((card) => card.effect(level).stops ?? []);
}

/**
 * Whether this level is one a briefing happens on at all.
 *
 * Never on a race. A race has been measured, coned and marshalled, and
 * nobody is dealing it a card — every run gets a moment before it starts,
 * and on a race that moment is the start pen and the gun (#116).
 *
 * Never on a special edition either (#124). A level with a `mood` has already
 * decided what the weather is doing and built the whole occasion on top of it:
 * the Spooky Run is that map after dark and the Christmas Run is the lights
 * being on, and a card that turns up with its own rain is arguing with the
 * one thing the level exists to be. Rather than teach the weather suit which
 * evenings it is allowed out on, the editions keep themselves — they are
 * Halloween and Christmas, and they are run as advertised.
 *
 * Otherwise, once the level has been completed. Cards are replay content and
 * the replay loop opens the moment a map is beaten, so gating them behind the
 * end of the roster would put them where almost nobody would find them. The
 * first run of a map is the brief with nothing in the way of it; every run
 * after that can have the club turn up in whatever state it likes.
 */
export function briefingAvailable(level: Level, completed: Completed): boolean {
  if (level.field || level.mood) return false;
  return completed.has(level.id);
}

/** One of each suit, in suit order. The player keeps two of the three. */
export type Hand = readonly [Card, Card, Card];

function pairsOf(hand: Hand): [Card, Card][] {
  return [
    [hand[0], hand[1]],
    [hand[0], hand[2]],
    [hand[1], hand[2]],
  ];
}

/**
 * Whether a hand is safe to put in front of somebody: every pair they could
 * keep still leaves the level winnable.
 *
 * Checked at the deal rather than at the pick, so there is no such thing as a
 * card that greys out when you reach for it. A hand nobody could play is the
 * dealer's problem, and it is solved by dealing a different one.
 */
export function handIsPlayable(level: Level, hand: Hand): boolean {
  return pairsOf(hand).every((pair) =>
    hasWinningRoute(applyCards(level, pair)),
  );
}

/**
 * Deal a briefing: one leader, one runner, one weather, all of which fit this
 * map and none of which can be combined into something impossible.
 *
 * Takes the roll rather than calling `Math.random`, the same way the gnome
 * does, so the test can say exactly what gets dealt. Undefined where there is
 * no briefing to be had — a race, a level not yet completed, or a map no suit
 * has a card for.
 */
export function dealBriefing(
  level: Level,
  completed: Completed,
  roll: number,
): Hand | undefined {
  if (!briefingAvailable(level, completed)) return undefined;

  const bySuit = SUITS.map((suit) =>
    CARDS.filter(
      (card) =>
        card.suit === suit &&
        card.fits(level) &&
        /*
         * And that it leaves something to run, on its own, before anything is
         * paired with it. A card can be a perfectly sensible idea about a map
         * and still forbid every road on it — new shoes on a level that
         * already insists you stay off the tarmac leaves nowhere at all to
         * put your feet.
         */
        hasWinningRoute(applyCards(level, [card])),
    ),
  );
  if (bySuit.some((cards) => cards.length === 0)) return undefined;

  const hands: Hand[] = [];
  for (const leader of bySuit[0]) {
    for (const runner of bySuit[1]) {
      for (const weather of bySuit[2]) {
        hands.push([leader, runner, weather]);
      }
    }
  }

  // Rotated by the roll and taken in order, so the search is deterministic
  // and usually stops at the first hand it looks at.
  const clamped = Math.min(Math.max(roll, 0), 0.999999);
  const start = Math.floor(clamped * hands.length);
  for (let i = 0; i < hands.length; i += 1) {
    const hand = hands[(start + i) % hands.length];
    if (handIsPlayable(level, hand)) return hand;
  }
  return undefined;
}

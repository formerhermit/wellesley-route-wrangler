import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { caesarsCamp } from "../data/caesarsCamp";
import { farnboroughHalf } from "../data/farnboroughHalf";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import {
  CARDS,
  SUITS,
  applyCards,
  briefingAvailable,
  briefingMarks,
  dealBriefing,
  extraRunners,
  handIsPlayable,
  photoStopsFor,
  stopsFor,
  unrecordedRun,
  wandersOff,
} from "./cards";
import type { Card } from "./cards";
import type { Level } from "./types";
import { hasWinningRoute, winningRouteCount } from "./scoring";

/** Everything beaten, which is when a briefing is on offer. */
const allDone = new Set(levels.map((level) => level.id));

/**
 * The levels a briefing happens on: not a race, not a special edition. Both
 * are runs that have already decided what they are.
 */
const ordinary = levels.filter((level) => !level.field && !level.mood);

/** Enough rolls to reach every hand the rotation can start from. */
const ROLLS = [0, 0.13, 0.29, 0.41, 0.58, 0.66, 0.77, 0.91];

/** Where the goose is standing on this map, if it has one at all. */
function geeseOn(level: Level): string[] {
  return (level.followers ?? [])
    .filter((waiting) => waiting.kind === "goose")
    .map((waiting) => waiting.nodeId);
}

function hasGoose(level: Level): boolean {
  return geeseOn(level).length > 0;
}

function cardById(id: string): Card {
  const card = CARDS.find((one) => one.id === id);
  if (!card) throw new Error(`No card ${id}`);
  return card;
}

describe("when a briefing is on offer", () => {
  it("never on a race", () => {
    // A race has been measured and coned. It gets the gun instead (#116).
    expect(farnboroughHalf.field).toBeGreaterThan(0);
    expect(briefingAvailable(farnboroughHalf, allDone)).toBe(false);
    expect(dealBriefing(farnboroughHalf, allDone, 0)).toBeUndefined();
  });

  it("not until the level has been run properly once", () => {
    expect(briefingAvailable(thursdaySocialRun, new Set())).toBe(false);
    expect(dealBriefing(thursdaySocialRun, new Set(), 0)).toBeUndefined();
  });

  it("never on a special edition", () => {
    // Halloween and Christmas are the map with the occasion built on top of
    // it (#124). A card turning up with its own weather argues with the one
    // thing the level exists to be.
    const editions = levels.filter((level) => level.mood && !level.field);
    expect(editions.map((level) => level.title)).toContain("Spooky Run");
    expect(editions.map((level) => level.title)).toContain("Christmas Run");
    for (const level of editions) {
      expect(briefingAvailable(level, allDone), level.title).toBe(false);
      expect(dealBriefing(level, allDone, 0)).toBeUndefined();
    }
  });

  it("on every other level, once it is behind you", () => {
    for (const level of ordinary) {
      expect(briefingAvailable(level, allDone), level.title).toBe(true);
    }
  });
});

describe("dealing a briefing", () => {
  it("deals one of each suit", () => {
    const hand = dealBriefing(thursdaySocialRun, allDone, 0);
    expect(hand).toBeDefined();
    expect(hand?.map((card) => card.suit)).toEqual([...SUITS]);
  });

  it("only deals cards that mean something on the map", () => {
    for (const level of ordinary) {
      for (const roll of ROLLS) {
        const hand = dealBriefing(level, allDone, roll);
        for (const card of hand ?? []) {
          expect(card.fits(level)).toBe(true);
        }
      }
    }
  });

  it("gives the same hand for the same roll", () => {
    const once = dealBriefing(thursdaySocialRun, allDone, 0.42);
    const twice = dealBriefing(thursdaySocialRun, allDone, 0.42);
    expect(once?.map((card) => card.id)).toEqual(twice?.map((card) => card.id));
  });

  it("does not deal the same hand whatever the roll", () => {
    const dealt = new Set(
      ordinary
        .flatMap((level) =>
          ROLLS.map((roll) =>
            dealBriefing(level, allDone, roll)
              ?.map((card) => card.id)
              .join("+"),
          ),
        )
        .filter((hand): hand is string => hand !== undefined),
    );
    expect(dealt.size).toBeGreaterThan(1);
  });

  /*
   * The one that makes the deck safe to grow.
   *
   * A card that leaves a level unwinnable is the same bug as a badge nobody
   * can earn: it reads as broken to the player and as content to whoever
   * wrote it. The player keeps two of the three dealt, so it is the *pairs*
   * that have to survive — and the check belongs at the deal, because a hand
   * nobody could play is the dealer's problem to avoid rather than the
   * player's to discover.
   */
  it("never deals a hand that cannot be played", () => {
    for (const level of ordinary) {
      for (const roll of ROLLS) {
        const hand = dealBriefing(level, allDone, roll);
        expect(hand, `${level.title} dealt nothing at roll ${roll}`).toBeDefined();
        if (hand) {
          expect(
            handIsPlayable(level, hand),
            `${level.title}: ${hand.map((card) => card.name).join(", ")}`,
          ).toBe(true);
        }
      }
    }
  });

  /*
   * A card can be a perfectly sensible idea about a map and still forbid
   * every road on it, which the pairs alone would not catch — so each one is
   * asked to stand up on its own before it is ever put in a hand.
   */
  it("never deals a card that leaves nothing to run by itself", () => {
    for (const level of ordinary) {
      for (const roll of ROLLS) {
        for (const card of dealBriefing(level, allDone, roll) ?? []) {
          expect(
            hasWinningRoute(applyCards(level, [card])),
            `${card.name} on ${level.title}`,
          ).toBe(true);
        }
      }
    }
  });

  /*
   * The mirror of the test below, and the one that catches dead content.
   *
   * `fits` is a claim about a map, not about whether the card can actually be
   * played on it — the dealer quietly drops any card that leaves the level
   * unwinnable, so a card can look perfectly reasonable, fit nine levels and
   * still never once be offered. A head torch died here: every map with
   * trails worth staying off is a map that is trails nearly end to end.
   *
   * This is the deck's version of "a badge nobody can win is worse than no
   * badge", and it fails the same way — silently, and only for the player.
   */
  it("has no card that never gets dealt", () => {
    const undealt = CARDS.filter(
      (card) =>
        !ordinary.some(
          (level) => card.fits(level) && hasWinningRoute(applyCards(level, [card])),
        ),
    ).map((card) => card.name);
    expect(undealt).toEqual([]);
  });

  /*
   * Every level the club can go back to can be dealt something. The deck is
   * young and one or two maps are served only by the cards that ask nothing —
   * Crooksbury has a single hand to its name — so this is the number to watch
   * as cards are added, not a ceiling anybody should be pleased with.
   */
  it("has something for every level worth replaying", () => {
    const unserved = ordinary
      .filter((level) => dealBriefing(level, allDone, 0) === undefined)
      .map((level) => level.title);
    expect(unserved).toEqual([]);
  });
});

describe("what the cards do to the brief", () => {
  it("leaves the level the roster declared alone", () => {
    const before = thursdaySocialRun.objectives.length;
    applyCards(thursdaySocialRun, [cardById("weather-rain")]);
    expect(thursdaySocialRun.objectives).toHaveLength(before);
  });

  it("hands back the level itself when nothing was picked", () => {
    expect(applyCards(thursdaySocialRun, [])).toBe(thursdaySocialRun);
  });

  it("adds the card's own objective to the brief", () => {
    const carded = applyCards(caesarsCamp, [cardById("leader-dan")]);
    expect(carded.objectives.length).toBe(caesarsCamp.objectives.length + 1);
    expect(carded.objectives.some((one) => one.kind === "visit")).toBe(true);
  });

  it("moves both ends of the window when it is raining", () => {
    const dry = thursdaySocialRun.objectives.find(
      (one) => one.kind === "distance",
    );
    const wet = applyCards(thursdaySocialRun, [
      cardById("weather-rain"),
    ]).objectives.find((one) => one.kind === "distance");
    if (dry?.kind !== "distance" || wet?.kind !== "distance") {
      throw new Error("expected a distance objective at both ends");
    }
    expect(wet.maxKm).toBeLessThan(dry.maxKm);
    /*
     * The floor comes down with the ceiling. Dropping the ceiling alone is
     * the obvious reading of "keep it short" and it is wrong: on a brief as
     * tight as Tilford's 7.5 to 8 it puts the ceiling under the floor and
     * asks for a run that cannot exist.
     */
    expect(wet.minKm).toBeLessThan(dry.minKm);
    expect(wet.minKm).toBeLessThan(wet.maxKm);
    // Every road is measured to a tenth, so a ceiling of 5.9499 would be a
    // number no route could ever reach.
    expect(wet.maxKm * 10).toBeCloseTo(Math.round(wet.maxKm * 10), 9);
  });

  it("takes the waypoints off the brief when nobody is leading", () => {
    const carded = applyCards(thursdaySocialRun, [cardById("leader-nobody")]);
    expect(
      thursdaySocialRun.objectives.some((one) => one.kind === "visit"),
    ).toBe(true);
    expect(carded.objectives.some((one) => one.kind === "visit")).toBe(false);
  });

  it("only fears the geese where there are geese", () => {
    const geese = cardById("runner-geese");
    for (const level of levels) {
      const hasGoose = (level.followers ?? []).some(
        (one) => one.kind === "goose",
      );
      expect(geese.fits(level), level.title).toBe(hasGoose);
    }
    expect(levels.filter((one) => geese.fits(one)).length).toBeGreaterThan(0);
  });

  it("keeps the group away from wherever the goose is", () => {
    const geese = cardById("runner-geese");
    expect(geese.fits(thursdaySocialRun)).toBe(true);
    const carded = applyCards(thursdaySocialRun, [geese]);
    const avoid = carded.objectives.find((one) => one.kind === "avoid-nodes");
    if (avoid?.kind !== "avoid-nodes") {
      throw new Error("expected an avoid-nodes objective");
    }
    // The goose's own junction, whatever the map happens to call it.
    const perch = (thursdaySocialRun.followers ?? [])
      .filter((one) => one.kind === "goose")
      .map((one) => one.nodeId);
    expect(avoid.nodeIds).toEqual(perch);
  });

  it("asks the group to stand still where the card says so", () => {
    const dan = cardById("leader-dan");
    expect(dan.fits(caesarsCamp)).toBe(true);
    const stops = stopsFor(caesarsCamp, [dan]);
    expect(stops.length).toBeGreaterThan(0);
    for (const nodeId of stops) {
      expect(caesarsCamp.nodes.find((node) => node.id === nodeId)?.type).toBe(
        "cow",
      );
    }
  });

  it("asks for no stops from a card that is only weather", () => {
    expect(stopsFor(thursdaySocialRun, [cardById("weather-rain")])).toEqual([]);
  });

  it("only puts new shoes on a map that has mud on it", () => {
    const shoes = cardById("runner-new-shoes");
    for (const level of levels) {
      const muddy = level.roads.some((road) => road.muddy && !road.closed);
      expect(shoes.fits(level), level.title).toBe(muddy);
    }
    // And somewhere does, or the card is in the deck for nothing.
    expect(levels.filter((level) => shoes.fits(level)).length).toBeGreaterThan(0);
  });

  /*
   * Mud has to bite without biting through. A map where avoiding it changes
   * nothing has not been marked up; a map where avoiding it leaves no route
   * at all has been marked up on a chokepoint — which is what happened first
   * time on both Tilford and Bourne Wood, where the only way to the abbey and
   * the only way out of the pub were the roads that got the mud.
   */
  it("leaves a harder puzzle rather than a dead end", () => {
    const shoes = cardById("runner-new-shoes");
    for (const level of levels.filter((one) => shoes.fits(one))) {
      const before = winningRouteCount(level);
      const after = winningRouteCount(applyCards(level, [shoes]));
      expect(after, `${level.title} has no way round the mud`).toBeGreaterThan(0);
      expect(after, `${level.title}'s mud costs nothing`).toBeLessThan(before);
    }
  });

  it("does not confuse two levels that happen to share an id", () => {
    // The cache used to key on the id alone, which quietly hands back the
    // wrong brief for a level that has been copied and changed.
    const dry = levels.find((one) => one.roads.some((road) => road.muddy));
    if (!dry) throw new Error("expected a level with mud on it");
    const soaked = {
      ...dry,
      roads: dry.roads.map((road) => ({ ...road, muddy: true })),
    };
    const shoes = cardById("runner-new-shoes");
    expect(applyCards(dry, [shoes])).not.toBe(applyCards(soaked, [shoes]));
    expect(winningRouteCount(applyCards(soaked, [shoes]))).toBe(0);
  });

  /*
   * The rule line is the card owning up to its mechanics: the blurb is the
   * joke, and a card whose effect hides behind its humour reads as nothing
   * having happened. Every card that can be dealt on a map must have one.
   */
  it("states its rule on every map it fits", () => {
    for (const level of ordinary) {
      for (const card of CARDS.filter((one) => one.fits(level))) {
        const rule = card.rule(level);
        expect(rule.length, `${card.name} on ${level.title}`).toBeGreaterThan(0);
        expect(rule.endsWith("."), `${card.name} on ${level.title}`).toBe(true);
      }
    }
  });

  it("has Rain promise exactly the window it delivers", () => {
    const rain = cardById("weather-rain");
    for (const level of ordinary.filter((one) => rain.fits(one))) {
      const wet = applyCards(level, [rain]).objectives.find(
        (one) => one.kind === "distance",
      );
      if (wet?.kind !== "distance") throw new Error("expected a window");
      expect(rain.rule(level), level.title).toContain(
        `${wet.minKm}–${wet.maxKm} km`,
      );
    }
  });

  it("has the leaderless card name what it drops", () => {
    // "Visit the canal" is the objective it takes off level 1's brief.
    expect(cardById("leader-nobody").rule(thursdaySocialRun)).toContain(
      "the canal",
    );
  });

  /*
   * The dead watch asks nothing of the route on purpose: one broken watch in
   * a group of five changes nothing about where the club goes. The
   * consequence is on the paperwork, which is also why it can still be the
   * runner suit's card that fits everywhere.
   */
  it("loses the distance without touching the route", () => {
    const watch = cardById("runner-watch");
    for (const level of ordinary) {
      expect(watch.fits(level), level.title).toBe(true);
      expect(unrecordedRun(level, [watch]), level.title).toBe(true);
      // Same brief, same map: only the report hears about it.
      expect(applyCards(level, [watch]).objectives).toEqual(level.objectives);
      expect(stopsFor(level, [watch])).toEqual([]);
    }
    expect(unrecordedRun(thursdaySocialRun, [cardById("weather-rain")])).toBe(
      false,
    );
  });

  it("brings the whole club out on a perfect evening", () => {
    const perfect = cardById("weather-perfect");
    const level = levels.find((one) => perfect.fits(one));
    if (!level) throw new Error("expected a level with a viewpoint");
    expect(extraRunners(level, [perfect])).toBeGreaterThan(0);
    // Nobody else brings anybody: the turnout is this card's alone.
    expect(extraRunners(level, [cardById("runner-watch")])).toBe(0);
  });

  it("sends the group somewhere worth watching the sunset from", () => {
    const perfect = cardById("weather-perfect");
    for (const level of ordinary.filter((one) => perfect.fits(one))) {
      const carded = applyCards(level, [perfect]);
      const view = carded.objectives.at(-1);
      if (view?.kind !== "visit") throw new Error("expected a visit");
      expect(view.nodeIds.length, level.title).toBeGreaterThan(0);
      // It stands still there too, so the sunset is watched rather than run past.
      expect(stopsFor(level, [perfect])).toEqual(view.nodeIds);
    }
  });

  /*
   * The wind is the deck's only-nicer card, and "nicer" has to be provable:
   * the ceiling goes up, the floor stays, so no route that won before can
   * lose and the count can only rise.
   */
  it("raises the ceiling and leaves the floor alone", () => {
    const wind = cardById("weather-wind");
    for (const level of ordinary.filter((one) => wind.fits(one))) {
      const own = level.objectives.find((one) => one.kind === "distance");
      const blown = applyCards(level, [wind]).objectives.find(
        (one) => one.kind === "distance",
      );
      if (own?.kind !== "distance" || blown?.kind !== "distance") {
        throw new Error("expected a window at both ends");
      }
      expect(blown.minKm, level.title).toBe(own.minKm);
      expect(blown.maxKm, level.title).toBeGreaterThan(own.maxKm);
      expect(
        winningRouteCount(applyCards(level, [wind])),
        level.title,
      ).toBeGreaterThanOrEqual(winningRouteCount(level));
    }
  });

  it("keeps a window a window when the wind blows through the rain", () => {
    // Rain takes both ends down and the wind lifts only the ceiling, so the
    // two together must still describe a run somebody could do.
    const both = applyCards(thursdaySocialRun, [
      cardById("weather-rain"),
      cardById("weather-wind"),
    ]).objectives.find((one) => one.kind === "distance");
    if (both?.kind !== "distance") throw new Error("expected a window");
    expect(both.minKm).toBeLessThan(both.maxKm);
  });

  /*
   * The lost leader is the one card whose whole effect is the drawing. That
   * makes it the easiest kind to get wrong: a card that quietly moved the
   * goalposts while claiming to be decoration would be exactly the bug the
   * rule lines exist to prevent.
   */
  it("changes where the group goes and nothing else", () => {
    const lost = cardById("leader-lost");
    for (const level of ordinary) {
      expect(lost.fits(level), level.title).toBe(true);
      expect(wandersOff(level, [lost]), level.title).toBe(true);
      // Same brief, same waypoints, same window, same count.
      expect(applyCards(level, [lost]).objectives).toEqual(level.objectives);
      expect(stopsFor(level, [lost])).toEqual([]);
      expect(extraRunners(level, [lost])).toBe(0);
      expect(unrecordedRun(level, [lost])).toBe(false);
    }
    expect(winningRouteCount(applyCards(thursdaySocialRun, [lost]))).toBe(
      winningRouteCount(thursdaySocialRun),
    );
    expect(wandersOff(thursdaySocialRun, [cardById("leader-ben")])).toBe(false);
  });

  /*
   * Roo's photo stop, and the two things that keep it a real requirement.
   */
  it("stops for a photograph somewhere the brief did not already send you", () => {
    const roo = cardById("leader-roo");
    const served = ordinary.filter((one) => roo.fits(one));
    // She is a character card, not a universal one — but she has to reach
    // more than a token map or the deck has gained nothing.
    expect(served.length).toBeGreaterThan(3);

    for (const level of served) {
      const carded = applyCards(level, [roo]);
      const photo = carded.objectives.at(-1);
      if (photo?.kind !== "visit") throw new Error("expected a visit");
      expect(photo.nodeIds.length, level.title).toBeGreaterThan(0);
      // The group stands still to be in the picture.
      expect(stopsFor(level, [roo])).toEqual(photo.nodeIds);
      expect(photoStopsFor(level, [roo])).toEqual(photo.nodeIds);

      /*
       * And never at a junction the level already makes compulsory. A card
       * that re-asks for something the brief has already asked for is not a
       * second requirement, it is the same one wearing a hat.
       */
      const asked = new Set(
        level.objectives.flatMap((one) =>
          one.kind === "visit" ? one.nodeIds : [],
        ),
      );
      for (const id of photo.nodeIds) {
        expect(asked.has(id), `${level.title} already asks for ${id}`).toBe(
          false,
        );
      }
    }
  });

  /*
   * The photo spots and the sunset's viewpoints have to stay apart. Sharing
   * a junction would let one stop tick two objectives, which is the trick
   * the Frensham chord exists to avoid: two rules that cannot disagree are
   * one rule with two ticks.
   */
  it("photographs somewhere other than where it watches the sun set", () => {
    const roo = cardById("leader-roo");
    const perfect = cardById("weather-perfect");
    for (const level of ordinary) {
      if (!roo.fits(level) || !perfect.fits(level)) continue;
      const photos = new Set(photoStopsFor(level, [roo]));
      const views = stopsFor(level, [perfect]);
      for (const id of views) {
        expect(photos.has(id), `${level.title} shares ${id}`).toBe(false);
      }
    }
  });

  it("takes no photographs when Roo is not out", () => {
    expect(photoStopsFor(thursdaySocialRun, [cardById("leader-ben")])).toEqual(
      [],
    );
    // Dan's cows are a stop and no picture, which is the distinction the
    // separate list exists to make.
    const dan = cardById("leader-dan");
    expect(stopsFor(caesarsCamp, [dan]).length).toBeGreaterThan(0);
    expect(photoStopsFor(caesarsCamp, [dan])).toEqual([]);
  });

  /*
   * The three cards that ask the map for something it already knows how to
   * answer. Each one leans on an objective kind the levels use and no other
   * card did, so what is tested here is the guard rather than the rule.
   */
  it("never forbids the hills on a level that asks for them", () => {
    const tired = cardById("runner-hill-session");
    for (const level of levels) {
      if (!tired.fits(level)) continue;
      expect(
        level.objectives.some((one) => one.kind === "climb"),
        `${level.title} both wants and forbids hills`,
      ).toBe(false);
    }
    expect(levels.filter((one) => tired.fits(one)).length).toBeGreaterThan(0);
  });

  it("calls the birds whatever this map calls them", () => {
    const birds = cardById("runner-birds");
    const named: Record<string, string> = {
      duck: "ducks",
      crow: "crows",
      robin: "robins",
    };
    for (const level of levels) {
      if (!birds.fits(level)) continue;
      // A goose on the map means they are not all pigeons, or all ducks, so
      // the card stops naming the flock and calls them what they are.
      const word = hasGoose(level)
        ? "birds"
        : (named[level.flock ?? ""] ?? "pigeons");
      expect(birds.rule(level), level.title).toContain(word);
    }
  });

  /*
   * The goose is a follower and the flock is a junction type — two mechanisms
   * that share nothing in the code and everything in the mind of somebody who
   * is frightened of birds. The card had to be told.
   */
  it("keeps away from the goose as well as the flock", () => {
    const birds = cardById("runner-birds");
    const withBoth = levels.filter(
      (level) => birds.fits(level) && hasGoose(level),
    );
    expect(withBoth.length, "no level exercises this").toBeGreaterThan(0);

    for (const level of withBoth) {
      const avoid = applyCards(level, [birds]).objectives.at(-1);
      if (avoid?.kind !== "avoid-nodes") throw new Error("expected avoid-nodes");
      for (const perch of geeseOn(level)) {
        expect(avoid.nodeIds, `${level.title} ignores the goose`).toContain(perch);
      }
      for (const hotspot of level.nodes.filter((one) => one.type === "pigeon")) {
        expect(avoid.nodeIds, `${level.title} ignores its flock`).toContain(
          hotspot.id,
        );
      }
    }
  });

  /*
   * And never turns up where the flock is not birds.
   *
   * The naming test above passed happily on "keep away from the dragonflies",
   * because it only ever asked whether the card was *consistent* with the
   * level — never whether the answer made any sense. Thursley's flock is the
   * reason anybody drove an hour, and it is insects.
   */
  it("stays away from the maps whose flock is not birds", () => {
    const birds = cardById("runner-birds");
    const insects = levels.filter((level) => level.flock === "dragonfly");
    expect(insects.map((level) => level.title)).toContain("Thursley Common");
    for (const level of insects) {
      expect(birds.fits(level), level.title).toBe(false);
    }
    // The flock's junctions are still there; it is the card that declines.
    for (const level of insects) {
      expect(level.nodes.some((node) => node.type === "pigeon")).toBe(true);
    }
  });

  it("keeps a weather card for every map, viewpoint or not", () => {
    // Loopy has nowhere to watch a sunset from, which is exactly why the
    // wind exists: without it that map's weather would be Rain every time,
    // and the suit would be nothing but a penalty there.
    for (const level of ordinary) {
      const weather = CARDS.filter(
        (card) => card.suit === "weather" && card.fits(level),
      );
      expect(weather.length, level.title).toBeGreaterThan(0);
      expect(
        weather.some((card) => card.id !== "weather-rain"),
        `${level.title} has only rain`,
      ).toBe(true);
    }
  });

  it("keeps a carded level winnable without touching the real count", () => {
    const before = winningRouteCount(thursdaySocialRun);
    const carded = applyCards(thursdaySocialRun, [cardById("weather-perfect")]);
    expect(hasWinningRoute(carded)).toBe(true);
    // The roster's own denominator is not the carded level's business.
    expect(winningRouteCount(thursdaySocialRun)).toBe(before);
  });
});

/*
 * The marks are what lets the panel point at the cards' work (#10): a rule
 * landing unannounced at the bottom of seven look-alike rows is the change
 * the player agreed to, invisible.
 */
describe("what the panel can point at", () => {
  it("marks nothing when no cards were taken", () => {
    const marks = briefingMarks(
      thursdaySocialRun,
      applyCards(thursdaySocialRun, []),
    );
    expect(marks).toHaveLength(thursdaySocialRun.objectives.length);
    expect(marks.every((mark) => mark === undefined)).toBe(true);
  });

  it("marks a card's own objective as added, and only that one", () => {
    const brief = applyCards(thursdaySocialRun, [cardById("runner-geese")]);
    const marks = briefingMarks(thursdaySocialRun, brief);
    expect(marks).toHaveLength(brief.objectives.length);
    // The cards' objectives go on the end, so the last line is the goose's.
    expect(marks.at(-1)).toEqual({ kind: "added" });
    expect(marks.slice(0, -1).every((mark) => mark === undefined)).toBe(true);
  });

  it("marks a rewritten window as changed, and says what it was", () => {
    const brief = applyCards(thursdaySocialRun, [cardById("weather-rain")]);
    const marks = briefingMarks(thursdaySocialRun, brief);
    const window = brief.objectives.findIndex((one) => one.kind === "distance");
    expect(marks[window]).toEqual({ kind: "changed", was: "5–7 km" });
    // The rewrite is a mark on the line, not an extra line.
    expect(marks.filter((mark) => mark !== undefined)).toHaveLength(1);
  });
});

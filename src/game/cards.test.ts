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
  dealBriefing,
  handIsPlayable,
  stopsFor,
} from "./cards";
import type { Card } from "./cards";
import { hasWinningRoute, winningRouteCount } from "./scoring";

/** Everything beaten, which is when a briefing is on offer. */
const allDone = new Set(levels.map((level) => level.id));

/** Enough rolls to reach every hand the rotation can start from. */
const ROLLS = [0, 0.13, 0.29, 0.41, 0.58, 0.66, 0.77, 0.91];

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

  it("on every other level, once it is behind you", () => {
    for (const level of levels) {
      if (level.field) continue;
      expect(briefingAvailable(level, allDone)).toBe(true);
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
    for (const level of levels) {
      if (level.field) continue;
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
      levels
        .filter((level) => !level.field)
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
    for (const level of levels) {
      if (level.field) continue;
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
    for (const level of levels) {
      if (level.field) continue;
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
   * Every level the club can go back to can be dealt something. The deck is
   * young and one or two maps are served only by the cards that ask nothing —
   * Crooksbury has a single hand to its name — so this is the number to watch
   * as cards are added, not a ceiling anybody should be pleased with.
   */
  it("has something for every level worth replaying", () => {
    const unserved = levels
      .filter((level) => !level.field)
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

  it("replaces the level's own bird cap rather than arguing with it", () => {
    const capped = thursdaySocialRun.objectives.filter(
      (one) => one.kind === "max-node-type" && one.nodeType === "pigeon",
    );
    expect(capped).toHaveLength(1);

    const carded = applyCards(thursdaySocialRun, [cardById("runner-birds")]);
    const now = carded.objectives.filter(
      (one) => one.kind === "max-node-type" && one.nodeType === "pigeon",
    );
    // One rule about the birds, not two in two different numbers.
    expect(now).toHaveLength(1);
    expect(now[0].kind === "max-node-type" && now[0].limit).toBe(0);
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

  it("keeps a carded level winnable without touching the real count", () => {
    const before = winningRouteCount(thursdaySocialRun);
    const carded = applyCards(thursdaySocialRun, [cardById("weather-perfect")]);
    expect(hasWinningRoute(carded)).toBe(true);
    // The roster's own denominator is not the carded level's business.
    expect(winningRouteCount(thursdaySocialRun)).toBe(before);
  });
});

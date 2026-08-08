import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { thursdaySocialRun } from "../data/thursdaySocialRun";
import { emptyRecords, recordRun } from "./records";
import type { Records } from "./records";
import { CARD_BADGES, cabinetFor, earnedBy, earnedCount } from "./achievements";
import { CARDS } from "./cards";
import { evaluateRoute } from "./routeEvaluation";
import { routeKey } from "./scoring";
import {
  currentNodeId,
  graphFor,
  nodeById,
  otherEnd,
  totalDistanceKm,
} from "./routeGraph";
import type { Level, Route } from "./types";

/** Every closed loop on a map, for finding a route that fits a badge. */
function loops(level: Level): Route[] {
  const graph = graphFor(level);
  const out: Route[] = [];
  const walk = (route: Route) => {
    const end = currentNodeId(route);
    if (end === level.finishNodeId && route.roadIds.length > 0) {
      out.push(route);
      return;
    }
    for (const road of graph.roadsByNode.get(end) ?? []) {
      if (route.roadIds.includes(road.id)) continue;
      walk({
        nodeIds: [...route.nodeIds, otherEnd(road, end)],
        roadIds: [...route.roadIds, road.id],
      });
    }
  };
  walk({ nodeIds: [level.startNodeId], roadIds: [] });
  return out;
}

function bookOf(entries: [Level, Route][]): Records {
  let records: Records = emptyRecords;
  entries.forEach(([level, route], index) => {
    records = recordRun(records, level, route, 1000 + index);
  });
  return records;
}

const ids = (records: Records) =>
  cabinetFor(records, levels)
    .filter((entry) => entry.earned)
    .map((entry) => entry.id);

describe("the trophy cabinet", () => {
  it("hangs every badge, unearned, for a club that has run nothing", () => {
    const cabinet = cabinetFor(emptyRecords, levels);
    expect(cabinet.length).toBeGreaterThan(0);
    expect(earnedCount(cabinet)).toBe(0);
    expect(cabinet.every((entry) => entry.name && entry.blurb)).toBe(true);
  });

  it("gives every badge a unique id and a way of being shown", () => {
    const cabinet = cabinetFor(emptyRecords, levels);
    expect(new Set(cabinet.map((e) => e.id)).size).toBe(cabinet.length);
    for (const entry of cabinet) {
      expect(["teased", "shape", "secret"], entry.id).toContain(entry.reveal);
      // A teased badge is the only one whose hint is ever read, so it is the
      // only one that has to have written one.
      if (entry.reveal === "teased") expect(entry.hint, entry.id).toBeTruthy();
    }
  });

  /**
   * The point of this one. A badge nobody can win is worse than no badge: it
   * reads as a bug to the player and as an achievement to the developer. Every
   * one is checked against a route the maps can actually produce.
   */
  it("has no badge that the maps cannot produce", () => {
    const unearnable: string[] = [];
    const cabinet = cabinetFor(emptyRecords, levels);

    for (const entry of cabinet) {
      // Local Legend needs a whole roster's worth and is checked on its own.
      if (entry.id === "local-legend") continue;
      /*
       * The card badges are not about the maps at all — no route can win
       * them, which is the point of them and would otherwise read here as a
       * badge nobody can get. They have their own block below, which asks
       * the same question of them in the only terms that can answer it.
       */
      if (entry.id in CARD_BADGES) continue;

      let won = false;
      for (const level of levels) {
        const all = loops(level);
        // Enough of the book to satisfy the counting badges as well.
        for (let take = 1; take <= all.length && !won; take *= 3) {
          const records = bookOf(all.slice(0, take).map((r) => [level, r]));
          if (ids(records).includes(entry.id)) won = true;
        }
        if (won) break;
      }

      // A book with nothing but winners in it, which is what a player who
      // never put a foot wrong on a map has. Every other shape tried here is
      // built from the walk order and so always carries duds, and a badge
      // about a clean sheet can never be won from one of those.
      if (!won) {
        for (const level of levels) {
          const clean = loops(level)
            .filter((route) => evaluateRoute(level, route).success)
            .map((route) => [level, route] as [Level, Route]);
          if (clean.length > 0 && ids(bookOf(clean)).includes(entry.id)) {
            won = true;
            break;
          }
        }
      }

      // And then a book spread across the roster, because a real one is. No
      // badge needs this today — every one of them can be won on a single map
      // — but a book drawn from one level is a thin thing to judge "nobody can
      // ever win this" against, and a badge about two maps would slip straight
      // past it.
      if (!won) {
        const spread = levels.flatMap((level) =>
          loops(level)
            .slice(0, 4)
            .map((route) => [level, route] as [Level, Route]),
        );
        if (ids(bookOf(spread)).includes(entry.id)) won = true;
      }

      if (!won) unearnable.push(entry.id);
    }

    expect(unearnable).toEqual([]);
  });

  it("awards exactly five for a route of exactly five", () => {
    const level = thursdaySocialRun;
    const five = loops(level).find((r) => totalDistanceKm(level, r) === 5);
    expect(five, "the Thursday map should hold a five").toBeDefined();
    expect(ids(bookOf([[level, five!]]))).toContain("exactly-five");
  });

  it("does not award exactly five for a route that is merely close", () => {
    const level = thursdaySocialRun;
    const near = loops(level).find((r) => {
      const km = totalDistanceKm(level, r);
      return km > 5 && km < 5.6;
    });
    expect(near).toBeDefined();
    expect(ids(bookOf([[level, near!]]))).not.toContain("exactly-five");
  });

  it("awards the closed road badge for going down one, and the second for five", () => {
    const level = thursdaySocialRun;
    // By shape, not by walk: the book keys on the set of roads, so five
    // traversals of two loops would only ever be two entries in it.
    const byShape = new Map<string, Route>();
    for (const route of loops(level)) {
      if (route.roadIds.some((id) => level.roads.find((r) => r.id === id)?.closed)) {
        byShape.set(routeKey(route), route);
      }
    }
    const closed = [...byShape.values()];
    expect(closed.length).toBeGreaterThanOrEqual(5);

    const one = ids(bookOf([[level, closed[0]]]));
    expect(one).toContain("closed-means-closed");
    expect(one).not.toContain("reading-isnt-your-thing");

    const five = ids(bookOf(closed.slice(0, 5).map((r) => [level, r])));
    expect(five).toContain("reading-isnt-your-thing");
  });

  it("credits a badge to the route that accounts for it", () => {
    const level = thursdaySocialRun;
    const short = loops(level).find((r) => totalDistanceKm(level, r) < 4);
    expect(short).toBeDefined();

    const records = bookOf([[level, short!]]);
    expect(ids(records)).toContain("didnt-even-try");
    // Take that route out of the book and the badge goes with it, which is
    // exactly what makes it this route's. Whether the *run* was a first is a
    // separate question, and one the book answers rather than this.
    const credited = earnedBy(records, levels, level, routeKey(short!)).map((e) => e.id);
    expect(credited).toContain("didnt-even-try");
  });

  it("credits nothing to a route the badge does not depend on", () => {
    const level = thursdaySocialRun;
    const short = loops(level).find((r) => totalDistanceKm(level, r) < 4)!;
    const other = loops(level).find(
      (r) => totalDistanceKm(level, r) > 6 && routeKey(r) !== routeKey(short),
    );
    expect(other).toBeDefined();

    const records = bookOf([
      [level, short],
      [level, other!],
    ]);
    const credited = earnedBy(records, levels, level, routeKey(other!)).map((e) => e.id);
    expect(credited).not.toContain("didnt-even-try");
  });

  it("names what a run has just won and nothing it had already", () => {
    const level = thursdaySocialRun;
    const short = loops(level).find((r) => totalDistanceKm(level, r) < 4)!;
    const noHills = loops(level).find(
      (r) =>
        evaluateRoute(level, r).success &&
        !r.roadIds.some((id) => level.roads.find((rd) => rd.id === id)?.hill),
    );
    expect(noHills).toBeDefined();

    const records = bookOf([
      [level, short],
      [level, noHills!],
    ]);
    const fresh = earnedBy(records, levels, level, routeKey(noHills!));
    const freshIds = fresh.map((entry) => entry.id);

    expect(freshIds).toContain("no-hills");
    // Won by the earlier run, so not won again by this one.
    expect(freshIds).not.toContain("didnt-even-try");
  });

  it("wants two stops on one run for toilet to toilet, and counts the bush", () => {
    // A Private Bush is a toilet stop — the joke is entirely in the place name
    // — so the Thursday map, which has it as well as the Medical Centre
    // Toilet, can do this in a single route.
    const level = thursdaySocialRun;
    const stops = (route: Route) =>
      new Set(
        route.nodeIds.filter((id) => {
          const type = nodeById(level, id).type;
          return type === "toilet" || type === "portaloo" || type === "bush";
        }),
      ).size;

    const both = loops(level).find((route) => stops(route) >= 2);
    const one = loops(level).find((route) => stops(route) === 1);
    expect(both, "the Thursday map holds a toilet and a bush").toBeDefined();
    expect(one).toBeDefined();

    expect(ids(bookOf([[level, one!]]))).not.toContain("toilet-to-toilet");
    expect(ids(bookOf([[level, both!]]))).toContain("toilet-to-toilet");
  });

  it("wants a whole map clean for show off, and one dud spoils it", () => {
    // The Town Run has the fewest routes to find on the roster, so it is the
    // map somebody would realistically go for a clean sheet on.
    const level = levels[2];
    const winners = loops(level).filter((route) => evaluateRoute(level, route).success);
    const dud = loops(level).find((route) => !evaluateRoute(level, route).success);
    expect(dud).toBeDefined();

    const clean = bookOf(winners.map((route) => [level, route] as [Level, Route]));
    expect(ids(clean)).toContain("show-off");

    // The same map, found in full, with one failure also in the book.
    const spoiled = bookOf([
      ...winners.map((route) => [level, route] as [Level, Route]),
      [level, dud!],
    ]);
    expect(ids(spoiled)).not.toContain("show-off");
  });

  it("does not call a half-found map a clean sheet", () => {
    const level = levels[2];
    const winners = loops(level).filter((route) => evaluateRoute(level, route).success);
    expect(winners.length).toBeGreaterThan(1);
    // No duds, but not everything found either: that is a start, not a sweep.
    const partial = bookOf([[level, winners[0]] as [Level, Route]]);
    expect(ids(partial)).not.toContain("show-off");
  });

  it("only calls a club a local legend once the first five maps are bare", () => {
    // Everything on level 1 and nothing else: not a legend yet.
    const level = levels[0];
    const records = bookOf(loops(level).map((r) => [level, r]));
    expect(ids(records)).not.toContain("local-legend");
  });

  it("survives a stored route the map has outgrown", () => {
    const records: Records = {
      "thursday-social-run": { stale: { roads: ["not-a-road"], at: 1 } },
    };
    expect(() => cabinetFor(records, levels)).not.toThrow();
    expect(earnedCount(cabinetFor(records, levels))).toBe(0);
  });
});

/**
 * The two badges no route can win (#141, #142).
 *
 * They are the cabinet's only exception to "everything is derived from the
 * book", so they get asked the same three questions the rest are asked, in
 * the only terms that can answer them: can it be won, can it be won by
 * accident, and is the thing it names still there.
 */
describe("the badges for who turned up", () => {
  const everyLoop = levels.flatMap((level) =>
    loops(level)
      .slice(0, 4)
      .map((route) => [level, route] as [Level, Route]),
  );

  it("names a card that is really in the deck", () => {
    // The one way these rot: rename a card and the badge is unwinnable, with
    // nothing anywhere to say so.
    for (const [badgeId, cardId] of Object.entries(CARD_BADGES)) {
      expect(CARDS.map((card) => card.id), badgeId).toContain(cardId);
      expect(
        cabinetFor(emptyRecords, levels).map((entry) => entry.id),
      ).toContain(badgeId);
    }
  });

  it("cannot be won by running, however much of it you do", () => {
    const earned = ids(bookOf(everyLoop));
    for (const badgeId of Object.keys(CARD_BADGES)) {
      expect(earned, badgeId).not.toContain(badgeId);
    }
  });

  it("is won by taking that card out, and only that card", () => {
    for (const [badgeId, cardId] of Object.entries(CARD_BADGES)) {
      const withIt = cabinetFor(emptyRecords, levels, new Set([cardId]));
      expect(
        withIt.find((entry) => entry.id === badgeId)?.earned,
        badgeId,
      ).toBe(true);

      // And is not handed out by some other card being run.
      const others = CARDS.map((card) => card.id).filter((id) => id !== cardId);
      const withoutIt = cabinetFor(emptyRecords, levels, new Set(others));
      expect(
        withoutIt.find((entry) => entry.id === badgeId)?.earned,
        badgeId,
      ).toBe(false);
    }
  });

  /*
   * The announcement, which is where the second way of being a first run
   * matters: an old loop taken out with a new card changes nothing in the
   * book, so the route half of this has to stay quiet while the card half
   * speaks up.
   */
  it("is announced by the run that first takes the card out", () => {
    const level = thursdaySocialRun;
    const route = loops(level)[0];
    const records = bookOf([[level, route]]);
    const cardId = CARD_BADGES["new-shoes"];

    const credited = earnedBy(records, levels, level, routeKey(route), {
      cardsRun: new Set([cardId]),
      freshCards: [cardId],
      // The loop was already in the book: only the card is new tonight.
      freshRoute: false,
    }).map((entry) => entry.id);

    expect(credited).toContain("new-shoes");
    // And nothing the route had already won weeks ago comes with it.
    expect(credited).toEqual(["new-shoes"]);
  });

  it("stays quiet on a later run with the same card", () => {
    const level = thursdaySocialRun;
    const route = loops(level)[0];
    const records = bookOf([[level, route]]);
    const cardId = CARD_BADGES["new-shoes"];

    const credited = earnedBy(records, levels, level, routeKey(route), {
      cardsRun: new Set([cardId]),
      freshCards: [],
      freshRoute: false,
    });
    expect(credited).toEqual([]);
  });
});


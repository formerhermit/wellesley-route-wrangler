import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { routeFromRoads } from "../game/records";
import { scoreRun, SCORE_VERSION, winningRouteCount } from "../game/scoring";
import { levelById } from "./gameSurface";
import type { Level, Route } from "../game/types";

/**
 * The server scores submitted runs with a bundle generated from this source
 * (`npm run build:club`). The bundle is committed, so it can fall behind — and
 * if it did, the club table would quietly disagree with the game about what a
 * run was worth, with neither side obviously wrong.
 *
 * So compare behaviour rather than bytes. Byte-comparing the bundle here would
 * fail on any cosmetic difference between one machine's bundler and another's,
 * and would say nothing about whether the scoring had actually changed. CI does
 * run the byte check — see `deploy.yml` — but it does it by regenerating on the
 * spot, which is a different question from "do these two agree".
 *
 * The level data is deep-compared rather than sampled. An earlier version of
 * this file checked road counts and one route's points per level, which is a
 * proxy, and the bundle drifted straight past it: a batch of label and
 * coordinate changes never crossed over and nothing went red, because labels
 * do not score. Nothing here scores either. It is still drift, and the next
 * one may not be so harmless.
 */
const bundlePath = new URL(
  "../../supabase/functions/_shared/game.bundle.js",
  import.meta.url,
).href;

interface GameSurface {
  levels: Level[];
  levelById: (id: string) => Level | undefined;
  routeFromRoads: (level: Level, roadIds: readonly string[]) => Route | undefined;
  scoreRun: typeof scoreRun;
  SCORE_VERSION: number;
}

async function loadBundle(): Promise<GameSurface> {
  return (await import(/* @vite-ignore */ bundlePath)) as GameSurface;
}

/** One winning route per level, found the same way the fixture lists are. */
function aWinnerFor(level: Level): Route | undefined {
  const found: Route[] = [];
  const walk = (route: Route) => {
    if (found.length > 0) return;
    const end = route.nodeIds[route.nodeIds.length - 1];
    if (end === level.finishNodeId && route.roadIds.length > 0) {
      if (scoreRun(level, route).won) found.push(route);
      return;
    }
    if (route.roadIds.length > 12) return;
    for (const road of level.roads) {
      if (route.roadIds.includes(road.id)) continue;
      if (road.from !== end && road.to !== end) continue;
      walk({
        nodeIds: [...route.nodeIds, road.from === end ? road.to : road.from],
        roadIds: [...route.roadIds, road.id],
      });
    }
  };
  walk({ nodeIds: [level.startNodeId], roadIds: [] });
  return found[0];
}

describe("the bundle the server scores with", () => {
  it("is in step with the source it was generated from", async () => {
    const bundle = await loadBundle();

    expect(bundle.SCORE_VERSION).toBe(SCORE_VERSION);
    expect(bundle.levels.map((level) => level.id)).toEqual(
      levels.map((level) => level.id),
    );

    for (const level of levels) {
      expect(bundle.levelById(level.id)?.id, level.id).toBe(levelById(level.id)?.id);

      const winner = aWinnerFor(level);
      expect(winner, `no winning route found on ${level.id}`).toBeDefined();

      // The route has to rebuild identically from road ids alone...
      const mine = routeFromRoads(level, winner!.roadIds);
      const theirs = bundle.routeFromRoads(bundle.levelById(level.id)!, winner!.roadIds);
      expect(theirs?.nodeIds, level.id).toEqual(mine?.nodeIds);

      // ...and be worth exactly the same on both sides.
      expect(
        bundle.scoreRun(bundle.levelById(level.id)!, theirs!).points,
        `${level.id} scores differently in the bundle — run npm run build:club`,
      ).toBe(scoreRun(level, mine!).points);
    }
  });

  it("carries the same level data, down to the last label", async () => {
    const bundle = await loadBundle();
    for (const level of levels) {
      // Deep, not sampled. Levels are plain data — no functions, no dates — so
      // this is the whole of what the server knows about the map, and the
      // failure names the level that has moved.
      expect(bundle.levelById(level.id), `${level.id} has drifted`).toEqual(
        level,
      );
    }
  });

  it("agrees about how much there is to find on every level", async () => {
    const bundle = await loadBundle();
    for (const level of levels) {
      expect(
        bundle.levelById(level.id)?.roads.length,
        level.id,
      ).toBe(level.roads.length);
      expect(winningRouteCount(level)).toBeGreaterThan(0);
    }
  });
});

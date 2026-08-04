import { describe, expect, it } from "vitest";
import { levels } from "../data/levels";
import { raceField } from "./raceField";

/*
 * Tested at the size actually shipped, not at a round number. Half of what is
 * checked here — that nobody is drawn inside anybody else, above all — depends
 * on how many runners are being fitted into the same stretch of road, so a
 * suite that passes at 28 and ships 30 has tested the wrong field.
 */
const SIZE = levels.find((level) => level.field)?.field ?? 0;

describe("the rest of the field", () => {
  it("puts out as many runners as it was asked for", () => {
    expect(raceField(0)).toEqual([]);
    expect(raceField(1).length).toBe(1);
    expect(raceField(SIZE).length).toBe(SIZE);
  });

  it("comes out the same every time", () => {
    expect(raceField(SIZE)).toEqual(raceField(SIZE));
  });

  it("hands the drawing a vest it can pick a colour with", () => {
    for (const place of raceField(SIZE)) {
      expect(place.vest).toBeGreaterThanOrEqual(0);
      expect(place.vest).toBeLessThan(1);
    }
  });

  /* Half the point of the thing: a field in one colour is a club outing. */
  it("does not put the whole field in one vest", () => {
    const worn = new Set(
      // As the drawing does it, so that "eight colours" is eight colours and
      // not eight fractions that happen to round into three of them.
      raceField(SIZE).map((place) => Math.floor(place.vest * 8)),
    );
    expect(worn.size).toBeGreaterThan(4);
  });

  /*
   * The club's five are strung out over about eighty units, so a field that
   * only ran behind them would never be anything to overtake. Somebody has to
   * be up the road and somebody has to be losing touch.
   */
  it("puts runners both ahead of the club and behind it", () => {
    const field = raceField(SIZE);
    expect(field.some((place) => place.along < 0)).toBe(true);
    expect(field.some((place) => place.along > 150)).toBe(true);
  });

  /*
   * Two abreast, not nose to tail — and nobody on the racing line at all. The
   * club runs the line, so anybody within a runner's width of it is standing
   * in the only place the group could be picked out of the crowd.
   */
  it("leaves the racing line to the club", () => {
    const field = raceField(SIZE);
    expect(field.some((place) => place.across < 0)).toBe(true);
    expect(field.some((place) => place.across > 0)).toBe(true);
    for (const place of field) {
      expect(Math.abs(place.across)).toBeGreaterThanOrEqual(9);
      expect(Math.abs(place.across)).toBeLessThanOrEqual(16);
    }
  });

  /*
   * No two in the same stride. Spread-then-jitter is chosen over pure noise
   * for exactly this, so it is worth pinning: an overlap here is two runners
   * drawn as one and a gap in the field beside them.
   */
  it("leaves nobody standing inside anybody else", () => {
    const field = raceField(SIZE);
    const touching: string[] = [];
    field.forEach((one, index) => {
      for (const other of field.slice(index + 1)) {
        const gap = Math.hypot(one.along - other.along, one.across - other.across);
        if (gap < 5) touching.push(`${one.along.toFixed(1)} / ${other.along.toFixed(1)}`);
      }
    });
    expect(touching).toEqual([]);
  });

  /*
   * A field is what makes a level a race, and only one level is. This is here
   * so that adding `field` to a Thursday night by accident is a failing test
   * rather than a hundred strangers on the towpath.
   */
  it("is only turned out for the race", () => {
    const racing = levels.filter((level) => level.field);
    expect(racing.map((level) => level.id)).toEqual(["farnborough-half"]);
    expect(racing[0].field).toBeGreaterThan(20);
  });
});

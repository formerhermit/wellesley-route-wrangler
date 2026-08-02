import { describe, expect, it } from "vitest";
import { nextTipIndex, tips } from "./tips";

describe("the tips themselves", () => {
  it("has some, and none of them is blank", () => {
    expect(tips.length).toBeGreaterThan(1);
    for (const tip of tips) expect(tip.trim()).not.toBe("");
  });

  it("says each one once", () => {
    expect(new Set(tips).size).toBe(tips.length);
  });
});

describe("nextTipIndex", () => {
  it("starts wherever the roll lands", () => {
    expect(nextTipIndex(null, 0)).toBe(0);
    expect(nextTipIndex(null, 0.999)).toBe(tips.length - 1);
  });

  it("stays in range on a roll of exactly one", () => {
    expect(nextTipIndex(null, 1)).toBe(tips.length - 1);
  });

  it("steps on by one after that, whatever the roll", () => {
    expect(nextTipIndex(0, 0.5)).toBe(1);
    expect(nextTipIndex(1, 0)).toBe(2);
  });

  it("comes round to the beginning off the end", () => {
    expect(nextTipIndex(tips.length - 1, 0.5)).toBe(0);
  });

  it("never shows the same tip twice running, all the way round", () => {
    let previous = nextTipIndex(null, 0.42);
    const seen = [previous];
    for (let i = 1; i < tips.length; i += 1) {
      const next = nextTipIndex(previous, Math.random());
      expect(next).not.toBe(previous);
      seen.push(next);
      previous = next;
    }
    // A full turn of the rotation is every tip, once.
    expect(new Set(seen).size).toBe(tips.length);
  });
});

import { describe, expect, it } from "vitest";
import {
  isUnlocked,
  levelAt,
  levelNumber,
  levelStatus,
  nextLevel,
  nextUnlockedLevel,
  resumeLevel,
  unlockedBy,
} from "./progression";
import type { Level } from "./types";

/** Only the roster matters here, so the levels are stubs. */
const levels = [
  { id: "one", title: "One" },
  { id: "two", title: "Two" },
  { id: "three", title: "Three" },
] as Level[];

const none: ReadonlySet<string> = new Set();

describe("levelNumber", () => {
  it("numbers levels from one, in roster order", () => {
    expect(levelNumber(levels, "one")).toBe(1);
    expect(levelNumber(levels, "three")).toBe(3);
  });

  it("returns zero for a level that is not on the roster", () => {
    expect(levelNumber(levels, "nope")).toBe(0);
  });
});

describe("levelAt", () => {
  it("finds a level by its number", () => {
    expect(levelAt(levels, 2)?.id).toBe("two");
  });

  it("has nothing either side of the roster", () => {
    expect(levelAt(levels, 0)).toBeUndefined();
    expect(levelAt(levels, 4)).toBeUndefined();
  });
});

describe("isUnlocked", () => {
  it("opens the first level to everybody", () => {
    expect(isUnlocked(levels, none, "one")).toBe(true);
  });

  it("keeps later levels shut until the one before is completed", () => {
    expect(isUnlocked(levels, none, "two")).toBe(false);
    expect(isUnlocked(levels, new Set(["one"]), "two")).toBe(true);
  });

  it("does not open a level two places ahead", () => {
    expect(isUnlocked(levels, new Set(["one"]), "three")).toBe(false);
  });

  it("keeps a completed level open however the roster is reordered", () => {
    // "three" completed but "two" not: only possible if the roster changed
    // under a saved game. The run already done stays available.
    expect(isUnlocked(levels, new Set(["three"]), "three")).toBe(true);
  });

  it("locks a level that is not on the roster at all", () => {
    expect(isUnlocked(levels, new Set(["one"]), "nope")).toBe(false);
  });
});

describe("nextLevel", () => {
  it("is the next on the roster, locked or not", () => {
    expect(nextLevel(levels, "one")?.id).toBe("two");
  });

  it("runs out at the end of the roster", () => {
    expect(nextLevel(levels, "three")).toBeUndefined();
  });
});

describe("nextUnlockedLevel", () => {
  it("offers the next level once it has been earned", () => {
    expect(nextUnlockedLevel(levels, new Set(["one"]), "one")?.id).toBe("two");
  });

  it("offers nothing while the next level is still shut", () => {
    expect(nextUnlockedLevel(levels, none, "one")).toBeUndefined();
  });

  it("offers nothing at the end of the roster", () => {
    const all = new Set(["one", "two", "three"]);
    expect(nextUnlockedLevel(levels, all, "three")).toBeUndefined();
  });
});

describe("resumeLevel", () => {
  it("starts a new player at level one", () => {
    expect(resumeLevel(levels, none).id).toBe("one");
  });

  it("drops a returning player on the run they are up to", () => {
    expect(resumeLevel(levels, new Set(["one"])).id).toBe("two");
    expect(resumeLevel(levels, new Set(["one", "two"])).id).toBe("three");
  });

  it("stays on the last level once the roster is finished", () => {
    expect(resumeLevel(levels, new Set(["one", "two", "three"])).id).toBe(
      "three",
    );
  });

  it("skips a completed level to reach the first one still outstanding", () => {
    // A new level added ahead of runs already completed: that is what they
    // are up to, not the finished ones behind it.
    expect(resumeLevel(levels, new Set(["one", "three"])).id).toBe("two");
  });
});

describe("levelStatus", () => {
  it("separates completed, unlocked and locked", () => {
    const completed = new Set(["one"]);
    expect(levelStatus(levels, completed, "one")).toBe("completed");
    expect(levelStatus(levels, completed, "two")).toBe("unlocked");
    expect(levelStatus(levels, completed, "three")).toBe("locked");
  });
});

describe("unlockedBy", () => {
  it("names the level standing in the way", () => {
    expect(unlockedBy(levels, none, "two")?.id).toBe("one");
  });

  it("names nothing for a level already open", () => {
    expect(unlockedBy(levels, none, "one")).toBeUndefined();
    expect(unlockedBy(levels, new Set(["one"]), "two")).toBeUndefined();
  });
});

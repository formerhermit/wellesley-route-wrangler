import type { Level } from "./types";

/** The ids of levels the player has completed successfully. */
export type Completed = ReadonlySet<string>;

/** 1-based, in the order `levels` declares. 0 for a level not in the list. */
export function levelNumber(levels: Level[], levelId: string): number {
  return levels.findIndex((level) => level.id === levelId) + 1;
}

export function levelAt(levels: Level[], number: number): Level | undefined {
  return levels[number - 1];
}

/**
 * The first level is always open. After that, finishing a level opens the one
 * behind it. A level the player has already completed stays open whatever
 * happens in front of it, so reordering the roster can never take back a run
 * somebody has already done.
 */
export function isUnlocked(
  levels: Level[],
  completed: Completed,
  levelId: string,
): boolean {
  const number = levelNumber(levels, levelId);
  if (number === 0) return false;
  if (number === 1) return true;
  if (completed.has(levelId)) return true;

  const previous = levelAt(levels, number - 1);
  return previous !== undefined && completed.has(previous.id);
}

/** The level that opens up next, whether or not it is unlocked yet. */
export function nextLevel(levels: Level[], levelId: string): Level | undefined {
  const number = levelNumber(levels, levelId);
  return number === 0 ? undefined : levelAt(levels, number + 1);
}

/**
 * Where to send the player after a winning run: the next level, but only once
 * it is actually open to them. Undefined at the end of the roster.
 */
export function nextUnlockedLevel(
  levels: Level[],
  completed: Completed,
  levelId: string,
): Level | undefined {
  const next = nextLevel(levels, levelId);
  if (!next) return undefined;
  return isUnlocked(levels, completed, next.id) ? next : undefined;
}

export type LevelStatus = "completed" | "unlocked" | "locked";

export function levelStatus(
  levels: Level[],
  completed: Completed,
  levelId: string,
): LevelStatus {
  if (completed.has(levelId)) return "completed";
  return isUnlocked(levels, completed, levelId) ? "unlocked" : "locked";
}

/**
 * What the player has to do to open a locked level: finish the one before it.
 * Undefined when the level is not locked, or has no predecessor to blame.
 */
export function unlockedBy(
  levels: Level[],
  completed: Completed,
  levelId: string,
): Level | undefined {
  if (isUnlocked(levels, completed, levelId)) return undefined;
  return levelAt(levels, levelNumber(levels, levelId) - 1);
}

import { useCallback, useState } from "react";
import type { Completed } from "../game/progression";

/** Which levels the player has finished, across visits. */
const COMPLETED_KEY = "route-wrangler:completed";

function readCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    // Anything else in there is somebody else's data, or a botched write.
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    // Storage blocked or the value is not JSON. Start the player at level one
    // rather than refusing to load the game.
    return new Set();
  }
}

function writeCompleted(completed: Set<string>): void {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]));
  } catch {
    // Storage blocked; progress lasts as long as the tab does.
  }
}

export interface Progress {
  completed: Completed;
  /** Idempotent: recording the same level twice changes nothing. */
  complete: (levelId: string) => void;
}

export function useProgress(): Progress {
  const [completed, setCompleted] = useState<Set<string>>(readCompleted);

  const complete = useCallback((levelId: string) => {
    setCompleted((current) => {
      if (current.has(levelId)) return current;
      const next = new Set(current).add(levelId);
      writeCompleted(next);
      return next;
    });
  }, []);

  return { completed, complete };
}

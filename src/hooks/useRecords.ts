import { useCallback, useRef, useState } from "react";
import { emptyRecords, hasRun, recordRun } from "../game/records";
import type { Records } from "../game/records";
import type { Level, Route } from "../game/types";

/**
 * Every route the player has run, by level. Routes, not scores: see
 * `records.ts` for why that distinction is the whole point.
 */
const RECORDS_KEY = "route-wrangler:runs";

function readRecords(): Records {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return emptyRecords;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyRecords;
    }
    // Trust nothing in here: it is a file on somebody else's machine.
    const clean: Record<string, Record<string, { roads: string[]; at: number }>> = {};
    for (const [levelId, runs] of Object.entries(parsed as object)) {
      if (!runs || typeof runs !== "object") continue;
      const kept: Record<string, { roads: string[]; at: number }> = {};
      for (const [key, run] of Object.entries(runs as object)) {
        const roads = (run as { roads?: unknown })?.roads;
        if (!Array.isArray(roads)) continue;
        if (!roads.every((road): road is string => typeof road === "string")) {
          continue;
        }
        const at = (run as { at?: unknown })?.at;
        kept[key] = { roads, at: typeof at === "number" ? at : 0 };
      }
      if (Object.keys(kept).length > 0) clean[levelId] = kept;
    }
    return clean;
  } catch {
    // Storage blocked or the value is not JSON. The club starts a fresh book.
    return emptyRecords;
  }
}

function writeRecords(records: Records): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Storage blocked, or full. The runs last as long as the tab does.
  }
}

export interface RunBook {
  records: Records;
  /**
   * Idempotent: the same route logged twice is one discovery. Returns whether
   * this was the first time, which the result panel needs before the state
   * update lands.
   */
  log: (level: Level, route: Route) => boolean;
}

export function useRecords(): RunBook {
  const [records, setRecords] = useState<Records>(readRecords);
  // Read through a ref so "was this new?" is answered against what is stored
  // now, not against the render that asked.
  const latest = useRef(records);
  latest.current = records;

  const log = useCallback((level: Level, route: Route) => {
    const isNew = !hasRun(latest.current, level, route);
    setRecords((current) => {
      const next = recordRun(current, level, route);
      if (next === current) return current;
      writeRecords(next);
      return next;
    });
    return isNew;
  }, []);

  return { records, log };
}

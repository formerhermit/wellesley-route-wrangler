import { useCallback, useRef, useState } from "react";
import type { CardHistory } from "../game/achievements";

/**
 * What this club has done with its briefing cards (#141, #142, #152).
 *
 * Kept here rather than in the run book, and that is the whole point of the
 * file. The book holds routes and nothing else, so that every score and every
 * badge can be rebuilt from it under the current rules — but a card leaves no
 * mark on a route. Two runs of the same loop, one of them in somebody's new
 * white shoes, are the same entry in the book, and the book is right to say
 * so: it is a set of discoveries, not a diary.
 *
 * So a badge about cards needs its own small store, and this is it. It still
 * does not let a card move anything: no score, no route count and no
 * route-derived badge reads this, and a loop that won on Tuesday wins on
 * Wednesday whatever was dealt. All this remembers is who turned up, and
 * whether the run they turned up for came off.
 */
const CARDS_RUN_KEY = "route-wrangler:cards-run";

function idsIn(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((id): id is string => typeof id === "string"));
}

function readHistory(): CardHistory {
  try {
    const raw = localStorage.getItem(CARDS_RUN_KEY);
    if (!raw) return { ran: new Set(), won: new Set() };
    const parsed: unknown = JSON.parse(raw);
    /*
     * A bare array is the shape this held before it knew about winning, and
     * every card in one was taken out on a run that may or may not have come
     * off. Read as "ran, and we cannot say" rather than thrown away: nobody
     * loses New Shoes because the store learned a second thing.
     */
    if (Array.isArray(parsed)) return { ran: idsIn(parsed), won: new Set() };
    if (parsed && typeof parsed === "object") {
      const held = parsed as { ran?: unknown; won?: unknown };
      return { ran: idsIn(held.ran), won: idsIn(held.won) };
    }
    return { ran: new Set(), won: new Set() };
  } catch {
    // Storage blocked or the value is not JSON. The club simply has no
    // history of who it has run with, rather than the game refusing to load.
    return { ran: new Set(), won: new Set() };
  }
}

function writeHistory(history: CardHistory): void {
  try {
    localStorage.setItem(
      CARDS_RUN_KEY,
      JSON.stringify({ ran: [...history.ran], won: [...history.won] }),
    );
  } catch {
    // Storage blocked; it lasts as long as the tab does.
  }
}

export interface CardsRun {
  history: CardHistory;
  /**
   * Records a finished run: every card that was out, and the ones that both
   * met the brief and actually happened. Hands back the history as it stood
   * *before* it, which is what a badge announcement needs — "what is new
   * tonight" is the difference between the two.
   */
  record: (ran: readonly string[], won: readonly string[]) => CardHistory;
}

export function useCardsRun(): CardsRun {
  const [history, setHistory] = useState<CardHistory>(readHistory);
  /*
   * The history as it stands, read through a ref for two reasons that pull
   * the same way: `record` has to hand back the previous state
   * *synchronously*, which a state updater cannot do because it has not run
   * yet, and it has to keep a stable identity, because the effect that calls
   * it lists it as a dependency and would otherwise re-run itself every time
   * it fired.
   */
  const latest = useRef(history);
  latest.current = history;

  const record = useCallback((ran: readonly string[], won: readonly string[]) => {
    const before = latest.current;
    const isNew =
      ran.some((id) => !before.ran.has(id)) ||
      won.some((id) => !before.won.has(id));
    if (!isNew) return before;

    const next: CardHistory = {
      ran: new Set([...before.ran, ...ran]),
      won: new Set([...before.won, ...won]),
    };
    latest.current = next;
    writeHistory(next);
    setHistory(next);
    return before;
  }, []);

  return { history, record };
}

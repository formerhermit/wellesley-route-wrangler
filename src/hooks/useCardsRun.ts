import { useCallback, useRef, useState } from "react";

/**
 * Which briefing cards this club has actually taken out and run (#141, #142).
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
 * Wednesday whatever was dealt. All this remembers is who turned up.
 */
const CARDS_RUN_KEY = "route-wrangler:cards-run";

function readCardsRun(): Set<string> {
  try {
    const raw = localStorage.getItem(CARDS_RUN_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    // Anything else in there is somebody else's data, or a botched write.
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    // Storage blocked or the value is not JSON. The club simply has no
    // history of who it has run with, rather than the game refusing to load.
    return new Set();
  }
}

function writeCardsRun(ran: Set<string>): void {
  try {
    localStorage.setItem(CARDS_RUN_KEY, JSON.stringify([...ran]));
  } catch {
    // Storage blocked; it lasts as long as the tab does.
  }
}

export interface CardsRun {
  ran: ReadonlySet<string>;
  /**
   * Records a finished run's cards, and hands back the ones that had never
   * been out before — which is exactly the set a badge announcement needs,
   * and empty on the ordinary case of running cards you have run already.
   */
  record: (cardIds: readonly string[]) => string[];
}

export function useCardsRun(): CardsRun {
  const [ran, setRan] = useState<Set<string>>(readCardsRun);
  /*
   * The set as it stands, read through a ref for two reasons that pull the
   * same way: `record` has to hand back the difference *synchronously*, which
   * a state updater cannot do because it has not run yet, and it has to keep
   * a stable identity, because the effect that calls it lists it as a
   * dependency and would otherwise re-run itself every time it fired.
   */
  const latest = useRef(ran);
  latest.current = ran;

  const record = useCallback((cardIds: readonly string[]) => {
    const added = cardIds.filter((id) => !latest.current.has(id));
    if (added.length === 0) return [];
    const next = new Set(latest.current);
    for (const id of added) next.add(id);
    latest.current = next;
    writeCardsRun(next);
    setRan(next);
    return added;
  }, []);

  return { ran, record };
}

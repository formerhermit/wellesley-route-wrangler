import { flockLabel } from "./incidentReport";
import type { GameResult, Level } from "./types";
import type { IncidentReport } from "./incidentReport";

export const GAME_TITLE = "About Five Kilometres";
export const GAME_URL = "https://runners.sillygame.studio";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

/**
 * Where the club stands, which is the part worth boasting about. Derived from
 * the run book, never stored — see `records.ts`.
 */
export interface ClubStanding {
  /** Points across every level, all time. */
  clubPoints: number;
  /** Winning routes found on this level, and how many there are. */
  found: number;
  toFind: number;
}

/**
 * Lines worth boasting about, in the order the club would read them out. The
 * birds are asked for by the level's own name for them: a hardcoded
 * "Unexpected pigeons" silently matched nothing on every level that keeps
 * crows, ducks or robins, and the shared run simply lost the line.
 */
function boastable(level: Level): string[] {
  return ["Distance", flockLabel(level), "Committee complaints"];
}

export function buildRunShare(
  level: Level,
  result: GameResult,
  report: IncidentReport,
  standing?: ClubStanding,
): SharePayload {
  const highlights = boastable(level)
    .map((label) => report.lines.find((line) => line.label === label))
    .filter((line) => line !== undefined)
    .map((line) =>
      line.label === "Distance"
        ? line.value
        : `${line.value} ${line.label.toLowerCase()}`,
    );

  return {
    title: `${GAME_TITLE} — ${result.title}`,
    text: [
      `${result.title} on the ${level.title}.`,
      highlights.join(" · "),
      report.verdict,
      standing ? standingLine(standing) : undefined,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n"),
    url: GAME_URL,
  };
}

/** "142 club points · 3 of 7 routes found here". */
function standingLine({ clubPoints, found, toFind }: ClubStanding): string {
  const routes = `${found} of ${toFind} route${toFind === 1 ? "" : "s"} found here`;
  return `${clubPoints} club point${clubPoints === 1 ? "" : "s"} · ${routes}`;
}

export function buildGameShare(): SharePayload {
  return {
    title: GAME_TITLE,
    text: `${GAME_TITLE} — plan a running club route, dodge the pigeons, and try not to upset the committee.`,
    url: GAME_URL,
  };
}

/** What lands on the clipboard when the device has no share sheet. */
export function payloadToClipboard(payload: SharePayload): string {
  return `${payload.text}\n${payload.url}`;
}

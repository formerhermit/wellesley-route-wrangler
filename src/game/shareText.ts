import type { GameResult, Level } from "./types";
import type { IncidentReport } from "./incidentReport";

export const GAME_TITLE = "About Five Kilometres";
export const GAME_URL = "https://runners.sillygame.studio";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

/** Lines worth boasting about, in the order the club would read them out. */
const BOASTABLE = [
  "Distance",
  "Unexpected pigeons",
  "Committee complaints",
];

export function buildRunShare(
  level: Level,
  result: GameResult,
  report: IncidentReport,
): SharePayload {
  const highlights = BOASTABLE.map((label) =>
    report.lines.find((line) => line.label === label),
  )
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
    ].join("\n"),
    url: GAME_URL,
  };
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

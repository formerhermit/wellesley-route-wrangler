import { flockLabel } from "./incidentReport";
import { nodeById, roadPathData, routePathData } from "./routeGraph";
import { GAME_TITLE, GAME_URL } from "./shareText";
import type { IncidentReport } from "./incidentReport";
import type { GameResult, Level, Route } from "./types";

/**
 * The picture that goes with a shared run (#33).
 *
 * A string of SVG rather than the map on screen, and that is the whole design.
 * The live map is styled by the stylesheet and scattered with bitmap sprites;
 * serialise it and you get a page of unstyled paths with broken image links,
 * because a detached SVG has no stylesheet and a canvas will not fetch what a
 * `<image href>` points at. Worse, a single external reference taints the
 * canvas and `toBlob` throws rather than returning a picture.
 *
 * So this is built from scratch, every colour written out as an attribute, and
 * nothing in it points anywhere. `shareCard.test.ts` holds it to that, because
 * the failure is invisible until somebody actually shares a run.
 *
 * It is also why there is no scenery on it: the cow, the goose and the Duke
 * are all PNGs. The route, the roads it was run on, and what the club made of
 * it are the parts worth looking at anyway — the same call `RouteThumb` makes
 * for the run book.
 */

/** Written out rather than read from CSS: a detached SVG has no stylesheet. */
const INK = "#1d2b36";
const INK_SOFT = "#536371";
const PAPER = "#fffdf7";
const GROUND = "#fbf7ec";
const LINE = "#d9d2c1";
const CLUB = "#286c9f";
const ROUTE = "#e8622c";
const PASS = "#2f7d52";
const FAIL = "#bc4749";

/** Laid out once here so the test can check the picture is the size claimed. */
const WIDTH = 1080;
const PAD = 44;
const TITLE_TOP = 96;
const MAP_TOP = 210;
const MAP_WIDTH = WIDTH - PAD * 2;
/*
 * Room under the map for the figures and then the credit line. The figures sit
 * at +46 and +84 from the bottom of the map, so anything under about 130 puts
 * the credit straight through the numbers — which is exactly what 92 did.
 */
const FOOTER_GAP = 156;

const FONT =
  "'Trebuchet MS', 'Segoe UI', system-ui, -apple-system, sans-serif";

/** XML needs these five out of the way, and a route title is player-facing. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * The figures under the map, in the order the club would read them out — the
 * same three the shared text boasts about, asked for by the level's own name
 * for its birds.
 */
function headlines(level: Level, report: IncidentReport) {
  return ["Distance", flockLabel(level), "Committee complaints"]
    .map((label) => report.lines.find((line) => line.label === label))
    .filter((line) => line !== undefined);
}

/**
 * Break a title across at most two lines at a space, roughly by width. Crude
 * on purpose: SVG cannot measure text, and the alternative is a title running
 * off the side of the picture.
 */
function wrapTitle(title: string, perLine: number): string[] {
  if (title.length <= perLine) return [title];
  const words = title.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && (line + " " + word).length > perLine) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

export interface ShareCard {
  svg: string;
  width: number;
  height: number;
}

export function buildShareCard(
  level: Level,
  route: Route,
  result: GameResult,
  report: IncidentReport,
): ShareCard {
  const scale = MAP_WIDTH / level.view.width;
  const mapHeight = Math.round(level.view.height * scale);
  const figures = headlines(level, report);
  const titleLines = wrapTitle(result.title, 26);
  const height = MAP_TOP + mapHeight + FOOTER_GAP + PAD;
  const accent = result.success ? PASS : FAIL;
  const start = nodeById(level, level.startNodeId);

  const roads = level.roads
    .map(
      (road) =>
        `<path d="${roadPathData(level, road)}" fill="none" stroke="${LINE}" ` +
        `stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");

  const line = routePathData(level, route);
  const drawnRoute = line
    ? `<path d="${line}" fill="none" stroke="${ROUTE}" stroke-width="16" ` +
      `stroke-linecap="round" stroke-linejoin="round"/>`
    : "";

  const titleBlock = titleLines
    .map(
      (text, index) =>
        `<text x="${PAD}" y="${TITLE_TOP + index * 58}" font-family="${FONT}" ` +
        `font-size="52" font-weight="bold" fill="${accent}">${escapeXml(text)}</text>`,
    )
    .join("");

  const figureBlock = figures
    .map((figure, index) => {
      const x = PAD + index * ((WIDTH - PAD * 2) / 3);
      const y = MAP_TOP + mapHeight + 46;
      return (
        `<text x="${x}" y="${y}" font-family="${FONT}" font-size="24" fill="${INK_SOFT}">` +
        `${escapeXml(figure.label)}</text>` +
        `<text x="${x}" y="${y + 38}" font-family="${FONT}" font-size="34" ` +
        `font-weight="bold" fill="${INK}">${escapeXml(String(figure.value))}</text>`
      );
    })
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" ` +
    `viewBox="0 0 ${WIDTH} ${height}">` +
    `<rect width="${WIDTH}" height="${height}" fill="${PAPER}"/>` +
    `<text x="${PAD}" y="46" font-family="${FONT}" font-size="26" font-weight="bold" ` +
    `letter-spacing="3" fill="${CLUB}">${escapeXml(level.title.toUpperCase())}</text>` +
    titleBlock +
    `<g transform="translate(${PAD} ${MAP_TOP}) scale(${scale})">` +
    `<rect x="0" y="0" width="${level.view.width}" height="${level.view.height}" ` +
    `rx="${Math.round(18 / scale)}" fill="${GROUND}"/>` +
    roads +
    drawnRoute +
    `<circle cx="${start.x}" cy="${start.y}" r="18" fill="${PAPER}" stroke="${CLUB}" stroke-width="8"/>` +
    `</g>` +
    figureBlock +
    `<text x="${WIDTH - PAD}" y="${height - PAD}" text-anchor="end" font-family="${FONT}" ` +
    `font-size="24" fill="${INK_SOFT}">${escapeXml(`${GAME_TITLE} · ${GAME_URL.replace("https://", "")}`)}</text>` +
    `</svg>`;

  return { svg, width: WIDTH, height };
}

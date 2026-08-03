import { unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * The picture a link to this game shows when it is pasted anywhere.
 *
 * Not the same job as the share card in `src/game/shareCard.ts`, and worth
 * being clear why there are two. That one is a picture of *your run*, handed
 * to a share sheet from the browser. This one is fetched from the site by
 * somebody else's crawler — Facebook's, Slack's, iMessage's — long after the
 * run is over, so it cannot know anything about it. It is the game's cover.
 *
 * It is also why this is a committed PNG rather than something generated on
 * request: the site is static, so there is nowhere to generate one, and
 * `og:image` will not take an SVG.
 *
 * Run it when the cover should change:
 *
 *     node scripts/build-og-card.mjs
 *
 * It draws the SVG and hands it to `sips`, which is macOS's own converter and
 * renders it properly. That is a deliberate trade: rasterising SVG otherwise
 * needs a native library or a headless browser, and neither is worth a
 * dependency for a file that changes about once a year. It does mean CI cannot
 * rebuild this — the PNG is committed, like the club bundle, and regenerating
 * it is a thing somebody does on a Mac and commits.
 *
 * `qlmanage` is the more obvious macOS shortcut and is not fit for it: it drops
 * every `<text>` element on the floor, which on a picture that is mostly the
 * game's name is not a small defect. If this ever needs to run elsewhere, that
 * is the thing to know.
 */

/* Straight out of the palette in styles.css. Written out because this file is
   not the app and has no stylesheet to read. */
const INK = "#1d2b36";
const INK_SOFT = "#536371";
const PAPER = "#fffdf7";
const GROUND = "#fbf7ec";
const LINE = "#d9d2c1";
const CLUB = "#286c9f";
const ROUTE = "#e8622c";
const GRASS = "#5db571";

/* 1200×630 is the shape every crawler crops to. The share card is portrait,
   which is right for a phone and wrong for a link preview, so this is its own
   drawing rather than a squashed one. */
const WIDTH = 1200;
const HEIGHT = 630;

const FONT = "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif";

/*
 * The Thursday map, roughly: enough of it to read as a route-planning game at
 * thumbnail size. Deliberately not imported from `src/data` — the cover is a
 * picture, and a level edit should not silently redraw it.
 */
const NODES = {
  observatory: [120, 300],
  rumble: [230, 150],
  medical: [400, 120],
  tesco: [620, 180],
  towpath: [560, 320],
  bush: [660, 430],
  hanger: [420, 460],
  polo: [200, 440],
};
const ROADS = [
  ["observatory", "rumble"],
  ["rumble", "medical"],
  ["medical", "tesco"],
  ["tesco", "towpath"],
  ["towpath", "bush"],
  ["bush", "hanger"],
  ["hanger", "polo"],
  ["polo", "observatory"],
  ["rumble", "towpath"],
  ["medical", "towpath"],
  ["hanger", "towpath"],
  ["polo", "hanger"],
];
/** A loop that looks like somebody thought about it. */
const RUN = [
  "observatory",
  "rumble",
  "medical",
  "tesco",
  "towpath",
  "bush",
  "hanger",
  "polo",
  "observatory",
];

const at = (id) => NODES[id];
const path = (ids) =>
  ids.map((id, i) => `${i ? "L" : "M"} ${at(id)[0]} ${at(id)[1]}`).join(" ");

const roads = ROADS.map(
  ([a, b]) =>
    `<path d="${path([a, b])}" fill="none" stroke="${LINE}" stroke-width="13" ` +
    `stroke-linecap="round"/>`,
).join("");

const dots = Object.entries(NODES)
  .map(
    ([, [x, y]]) =>
      `<circle cx="${x}" cy="${y}" r="11" fill="${PAPER}" stroke="${LINE}" stroke-width="5"/>`,
  )
  .join("");

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" ` +
  `viewBox="0 0 ${WIDTH} ${HEIGHT}">` +
  `<rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}"/>` +
  // The map, filling the left two-thirds.
  `<rect x="40" y="40" width="700" height="550" rx="26" fill="${GROUND}"/>` +
  `<g transform="translate(40 40)">` +
  `<rect x="70" y="330" width="200" height="150" rx="30" fill="${GRASS}" opacity="0.18"/>` +
  roads +
  `<path d="${path(RUN)}" fill="none" stroke="${ROUTE}" stroke-width="16" ` +
  `stroke-linecap="round" stroke-linejoin="round"/>` +
  dots +
  `<circle cx="${at("observatory")[0]}" cy="${at("observatory")[1]}" r="17" ` +
  `fill="${PAPER}" stroke="${CLUB}" stroke-width="8"/>` +
  `</g>` +
  // The words, down the right.
  `<text x="786" y="214" font-family="${FONT}" font-size="60" font-weight="bold" fill="${CLUB}">About</text>` +
  `<text x="786" y="282" font-family="${FONT}" font-size="60" font-weight="bold" fill="${CLUB}">Five</text>` +
  `<text x="786" y="350" font-family="${FONT}" font-size="60" font-weight="bold" fill="${CLUB}">Kilometres</text>` +
  `<text x="786" y="410" font-family="${FONT}" font-size="27" fill="${INK}">Plan the route.</text>` +
  `<text x="786" y="446" font-family="${FONT}" font-size="27" fill="${INK}">Dodge the pigeons.</text>` +
  `<text x="786" y="482" font-family="${FONT}" font-size="27" fill="${INK}">Take the blame.</text>` +
  `<text x="786" y="556" font-family="${FONT}" font-size="22" fill="${INK_SOFT}">A running club puzzle</text>` +
  `</svg>`;

const scratch = "og-card.svg";
writeFileSync(scratch, svg);

try {
  execFileSync("sips", [
    "-s", "format", "png",
    "--resampleHeightWidthMax", String(WIDTH),
    scratch,
    "--out", "public/og-card.png",
  ]);
  unlinkSync(scratch);
  console.log(`public/og-card.png — ${WIDTH}×${HEIGHT}`);
} catch (error) {
  console.error(
    `Drew ${scratch} but could not convert it: ${error.message}\n` +
      "sips is macOS only. Export it to public/og-card.png by hand.",
  );
}

import { readFileSync, writeFileSync } from "node:fs";

/**
 * A proof sheet of every badge: the drawing, at three sizes, beside what it is
 * meant to be a picture of.
 *
 * Built from `BadgeSprites.tsx` and the whole of `styles.css`, so what it shows
 * is what the game draws. That matters more than it sounds — an earlier version
 * inlined only the badge rules, and the badges that borrow the map's own
 * classes came out solid black, which is a proof sheet lying about the one
 * thing it exists to prove.
 *
 * Run it when a badge is added or redrawn:
 *
 *     node scripts/badge-proof-sheet.mjs && open badge-proof-sheet.html
 *
 * The output is gitignored. It is a thing to look at, not a thing to keep.
 */


const src = readFileSync("src/components/BadgeSprites.tsx", "utf8");
const css = readFileSync("src/styles.css", "utf8");

// Every exported badge component, with its doc comment and its JSX body.
const re = /\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*export function (\w+)\(\)\s*\{\s*return \(\s*<Frame>([\s\S]*?)<\/Frame>/g;
const badges = [];
let m;
while ((m = re.exec(src))) {
  const doc = m[1].replace(/^\s*\*\s?/gm, "").trim();
  badges.push({ doc, fn: m[2], jsx: m[3] });
}

// JSX -> HTML. The markup here is only shapes and numeric attributes.
const toHtml = (jsx) =>
  jsx
    // The bitmap badges build their path from Vite's BASE_URL, which means
    // nothing in a plain HTML file. Resolve it to the served path.
    .replace(/href=\{`\$\{import\.meta\.env\.BASE_URL\}([^`]+)`\}/g, 'href="/$1"')
    .replace(/className=/g, "class=")
    .replace(/(\w[\w-]*)=\{(-?[\d.]+)\}/g, '$1="$2"')
    .trim();

// The whole stylesheet, not a slice of it. Several badges borrow the map's
// own classes — hill-body, loo-roof, car-window — and a sheet that inlined
// only the badge rules drew those in the browser's default black, which is a
// proof sheet lying about the one thing it exists to prove.
const vars = css;

/** Badge name and what the drawing is meant to be, by component. */
const meta = {
  NoHillsBadge: ["No Hills, No Problems", "The map's own hill marker, struck through in red.", "teased"],
  PigeonBadge: ["Pigeon Diplomat", "A pigeon — body, head, beak — with a green line running past it, unbothered.", "shape"],
  ExactlyFiveBadge: ["Exactly Five Means Exactly Five", "A figure 5 inside a hi-vis ring.", "teased"],
  ClosedRoadBadge: ["Closed Means Closed", "A red-and-white barrier on a post, across the road.", "shape"],
  StravaTaxBadge: ["Strava Tax", "A watch: rounded case, pale face, two hands.", "secret"],
  ShortRunBadge: ["You Didn't Even Try, Did You", "A mug of tea, still steaming — the kettle from the badge's own line.", "secret"],
  HillsBadge: ["Hills Pay The Bills", "A green mountain range with a red flag on the summit.", "teased"],
  IgnoredSignBadge: ["Reading Isn't Your Thing", "A red no-entry sign on a post.", "secret"],
  LongRunBadge: ["The Unexpected Long Run", "The map's own car — the one two of them went home in.", "teased"],
  ShowOffBadge: ["Show Off", "A prize rosette: pleated disc, hi-vis centre, two ribbons hanging behind.", "teased"],
  LocalLegendBadge: ["Local Legend", "A five-pointed star, filled hi-vis.", "teased"],
  CowBadge: ["Obsessed With Cows", "The map's cow bitmap, the same file the maps use.", "shape"],
  SpookyBadge: ["Spooker", "A ghost with a scalloped hem and two eyes.", "shape"],
  ChristmasBadge: ["Is Someone Jingling?", "A Christmas tree: two green tiers, brown trunk, star on top.", "shape"],
  PortalooBadge: ["Brave Little Soldier", "The map's own loo cabin: body, angled roof, door, three vents, handle.", "secret"],
  GooseBadge: ["Goose Botherer", "The map's goose bitmap, the same file the maps use.", "shape"],
  MysteryBadge: ["(locked, secret)", "The placeholder shown for a badge giving nothing away.", "—"],
};

const cards = badges.map(({ fn, doc, jsx }) => {
  const html = toHtml(jsx);
  const [name, means, reveal] = meta[fn] ?? [fn, "—", "—"];
  return `<figure class="proof">
  <div class="proof__row">
    <span class="badge__patch badge__patch--won big"><svg class="badge__art" viewBox="-30 -30 60 60">${html}</svg></span>
    <span class="badge__patch big"><svg class="badge__art" viewBox="-30 -30 60 60">${html}</svg></span>
    <span class="badge__patch badge__patch--won small"><svg class="badge__art" viewBox="-30 -30 60 60">${html}</svg></span>
  </div>
  <figcaption>
    <p class="proof__name">${name}</p>
    <p class="proof__means"><strong>Meant to be:</strong> ${means}</p>
    <p class="proof__doc">${doc}</p>
    <p class="proof__meta"><code>${fn}</code> · locked style: <b>${reveal}</b></p>
  </figcaption>
</figure>`;
}).join("\n");

writeFileSync("badge-proof-sheet.html", `<title>Badge proof sheet — About Five Kilometres</title>
<style>
${vars}
body { font-family: "Trebuchet MS", "Segoe UI", system-ui, sans-serif; color: var(--ink);
  background: var(--paper); margin: 0; padding: 1.5rem; }
h1 { font-size: 1.5rem; margin: 0 0 .2rem; color: var(--club); }
.lede { margin: 0 0 1.4rem; color: var(--ink-soft); max-width: 60ch; line-height: 1.5; }
.sheet { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 27rem), 1fr)); }
.proof { margin: 0; padding: .9rem; background: var(--card); border: 2px solid var(--line);
  border-radius: 14px; display: flex; gap: .9rem; align-items: flex-start; }
.proof__row { display: flex; gap: .5rem; align-items: center; flex: 0 0 auto; }
.badge__patch.big { width: 5.2rem; }
.badge__patch.small { width: 2.6rem; }
figcaption { flex: 1 1 auto; min-width: 0; }
.proof__name { margin: 0 0 .3rem; font-weight: 800; font-size: 1rem; line-height: 1.2; }
.proof__means { margin: 0 0 .3rem; font-size: .84rem; line-height: 1.4; }
.proof__doc { margin: 0 0 .3rem; font-size: .82rem; color: var(--ink-soft); font-style: italic; line-height: 1.4; }
.proof__meta { margin: 0; font-size: .72rem; color: var(--ink-soft); }
code { font-size: .72rem; }
@media (prefers-color-scheme: dark) { body { background: #1d2b36; color: #f3efe4; }
  .proof { background: #24333f; border-color: #3a4a57; } h1 { color: #8fc2df; }
  .lede, .proof__doc, .proof__meta { color: #b6c2cc; } }
</style>
<h1>Badge proof sheet</h1>
<p class="lede">Every badge drawing, taken straight from <code>BadgeSprites.tsx</code> and styled with the
game's own CSS, so what is below is exactly what ships. Each row shows the earned patch, the locked
patch, and the size it is actually drawn at in the cabinet on a phone.</p>
<div class="sheet">
${cards}
</div>`);
console.log("Wrote badge-proof-sheet.html");

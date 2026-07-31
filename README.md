# About Five Kilometres

A browser route-planning puzzle for Wellesley Runners, a club that takes its
Thursday social run far too seriously. Plan a loop through town, keep everyone away from
the pigeons, and get the group back to the Observatory in one piece.

Built with React, TypeScript, Vite and hand-drawn inline SVG. No game engine
and no canvas. Almost every sprite is vector drawn in `MapSprites.tsx`; the
handful of bitmaps (the cow, the Duke) live in `public/sprites/`, cropped to
their content and sized to a few times the space they are ever drawn in.

## The levels

**Level 1 — Thursday Social Run** — twelve junctions, twenty roads, and one
closed shortcut of questionable legality. A loop, in which a successful route
must:

- start at The Observatory
- finish back at The Observatory
- cover between 5 km and 7 km
- visit the canal (Canal Bridge or the Grubby Towpath)
- avoid the closed road
- pass through no more than one pigeon hotspot

**Level 2 — Sunday Trail Run** — a loop out from the Overpriced Car Park and
back: reach 10 km, greet the cows, stay off the tarmac, avoid the pigeon barn,
and mind the path closed for lambing.

**Level 3 — Thursday Town Run** — the Observatory and its four northern
neighbours from level 1, and then everything above them that the social run
never bothers with. Deliberately the hardest of the three: 7 to 8 km, taking in
both Aldershot Town Centre and the Wellington Statue at opposite ends of the
map, past no more than one of the two massive hills, and not down the road
they have had fenced off since March. Six routes satisfy all of it, against
twenty-four on level 1.

Objectives are declared per level as data, with their own failure copy, so the
rules in `src/game/` know nothing about canals, cows or pigeons. Scenery is
placed from junction types for the same reason. A new level really is a new
object in `src/data/` plus a line in `levels.ts` — the numbering, the unlock
gate and the fixture list all follow from the order of that array.

Note that an objective has to be *failable* to be worth declaring. "Never use
the same road twice" used to be on every level and could never fail, because
`selectNode` refuses a road already in the route; it sat there reading "Passed"
for the whole game. The rule is still enforced, it is just not scored.

## Progression

Levels run in the order `src/data/levels.ts` declares them. Level 1 is open to
everybody; every level after that opens when the one before it has been run
successfully, and once opened it stays open — the **Level _n_** button in the
header brings up the fixture list to run an old favourite again.

A returning player opens on the run they are up to — the first one open to
them that they have not completed — rather than back at level 1. Once the whole
roster is behind them they land on the last level.

Losing does not cost anything. You can attempt an unlocked run as often as you
like, and plan a deliberately terrible route without being sent back anywhere;
you simply do not bank the level until a run meets its brief.

Progress is a list of completed level ids in `localStorage`. `src/game/`
holds the rules — what is unlocked, what comes next, what is standing in the
way — as pure functions over the roster, so they are tested without a browser.
A level completed under an older roster stays unlocked even if the levels are
later reordered.

The objective checklist updates as you build. Objectives that cannot yet be
decided — finishing the loop, reaching the canal — stay at "Not yet" rather
than showing a premature failure.

You can knowingly plan a losing route and run it anyway. That is most of the
fun.

## Playing

- Select a junction joined to the end of your route to add a road.
- Select the junction you just came from to undo that step.
- Roads cannot be reused.
- **Run Route** unlocks once the route has at least one road and closes the
  loop back at the Observatory.
- **Reset Route** clears everything.
- **Level _n_** in the header opens the fixture list: completed runs, the one
  you are on, and what it takes to open the rest.

Everything is keyboard reachable: the junctions are real HTML buttons laid over
the map, so `Tab` and `Enter` work as you would expect, and each announces
whether it is currently selectable. `prefers-reduced-motion` shortens playback
and stops the bouncing and flapping.

## Music

The main theme loops behind the game, off until the speaker button in the
header is pressed. That choice is remembered, but browsers will not autoplay
audio on a fresh page load, so a returning player's music starts on their next
click or key press rather than failing silently.

`useMusic` takes the track as an argument, so a level that wants its own theme
is a different string, not a different mechanism.

## Development

```bash
npm install
npm run dev      # local dev server
npm run test     # Vitest — pure route logic
npm run build    # type-check and production build
npm run lint     # oxlint, as shipped by the Vite template
```

## Project layout

```text
src/
  components/    presentation: map, sprites, panels, controls
  data/          level content only, no behaviour
  game/          pure rules: graph, evaluation, result selection, progression
  hooks/         reduced motion, playback, music, saved progress
public/
  audio/         music, served as-is
  sprites/       the few bitmap landmarks
```

The rules in `src/game/` know nothing about React. Route playback writes
positions straight to the DOM through refs, so the animation does not push
sixty renders a second through React. Level content is declarative enough that
a second level is a new object in `src/data/`, not a rewrite.

## Tests

`src/game/routeLogic.test.ts` covers distance totals, bidirectional roads,
canal detection, the closed road, pigeon exposure, repeated roads, undo, the
Run Route gate, and deterministic result selection — with fixtures for a
perfect route, one too short, one too long, one through the closure, and one
overrun by pigeons.

`src/game/progression.test.ts` covers the unlock rules against a stub roster:
the first level always open, later ones shut until their predecessor is done,
no skipping ahead, and a completed level staying open through a reorder.

## Deployment

Hosted on GitHub Pages at **https://runners.sillygame.studio**.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Tests, lint and the type-checked build all run first, so a red test stops the
deploy rather than shipping.

The custom domain lives in `public/CNAME`, which Vite copies into `dist` on
every build — without it Pages drops the domain each time it republishes.
Because the site is served from the root of its own domain, Vite's `base`
stays `/`.

# About Five Kilometres

A browser route-planning puzzle for Wellesley Runners, a club that takes its
Thursday social run far too seriously. Plan a loop through town, keep everyone away from
the pigeons, and get the group back to the Observatory in one piece.

Built with React, TypeScript, Vite and hand-drawn inline SVG. No game engine,
no canvas, no external image dependencies in the playable map.

## The levels

**Thursday Social Run** — twelve junctions, twenty roads, and one closed
shortcut of questionable legality. A loop, in which a successful route must:

- start at The Observatory
- finish back at The Observatory
- cover between 5 km and 7 km
- visit the canal (Canal Bridge or the Grubby Towpath)
- avoid the closed road
- pass through no more than one pigeon hotspot
- never use the same road twice

**Sunday Trail Run** — a loop out from the Overpriced Car Park and back:
reach 10 km, greet the cows, stay off the tarmac, avoid the pigeon barn, and
mind the path closed for lambing.

Objectives are declared per level as data, with their own failure copy, so the
rules in `src/game/` know nothing about canals, cows or pigeons. Scenery is
placed from junction types for the same reason. Adding a third level really is
a new object in `src/data/`.

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
  game/          pure rules: graph, evaluation, result selection
  hooks/         reduced motion, requestAnimationFrame playback, music
public/
  audio/         music, served as-is
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

## Deployment

Hosted on GitHub Pages at **https://runners.sillygame.studio**.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Tests, lint and the type-checked build all run first, so a red test stops the
deploy rather than shipping.

The custom domain lives in `public/CNAME`, which Vite copies into `dist` on
every build — without it Pages drops the domain each time it republishes.
Because the site is served from the root of its own domain, Vite's `base`
stays `/`.

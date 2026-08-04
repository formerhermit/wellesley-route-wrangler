/**
 * Where everybody else is (#111).
 *
 * A club run is five people and an empty road. A race is five people in the
 * middle of two thousand, and a level that says it is a race has to look like
 * one the moment the gun goes — otherwise it is the Thursday map with a
 * different strapline on it.
 *
 * The field runs the player's own route, because that is the only line the map
 * has. Each runner is placed by two numbers: how far up or down the road they
 * are from the club's lead runner, and how far off the racing line. The second
 * one is what stops it reading as a queue: without it, thirty runners on one
 * path are thirty runners in single file, which is not a race, it is a conga.
 *
 * Pure and deterministic, so the same field comes out every run and the whole
 * thing can be checked without a browser.
 */

export interface FieldPlace {
  /** Path units behind the club's lead runner. Negative is up the road. */
  along: number;
  /** Path units off the line, at right angles to it. Either sign. */
  across: number;
  /**
   * Which vest, 0 to 1, for the drawing to turn into a colour. A fraction and
   * not an index on purpose: this file has no business knowing how many vests
   * exist or what any of them is called, and a shared count in two files is a
   * shared count that goes out of step.
   */
  vest: number;
}

/** How far up the road the front of the field is, and how far back the tail. */
const AHEAD = 110;
const BEHIND = 330;
/**
 * And how wide the road is, as far as a race is concerned. Nobody runs the
 * line itself, because the club does: at four units off it the field was
 * elbow to elbow with the group and five blue vests could not be found in
 * thirty, which is the one thing the field exists to make possible. Nine is
 * most of a runner's width, and the club is drawn over the top of them.
 */
const ACROSS_MIN = 9;
const ACROSS_MAX = 16;
/**
 * How far a runner may drift from their slot, as a fraction of the slot. Under
 * a half by some margin, because at a half the two either side of a gap can
 * meet in the middle of it and be drawn as one runner.
 */
const JITTER = 0.4;

/**
 * The usual sine hash. Not random and not trying to be: it wants to be
 * scattered and it wants to be the same scatter every time.
 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

export function raceField(count: number): FieldPlace[] {
  const slot = count > 1 ? (AHEAD + BEHIND) / (count - 1) : 0;
  return Array.from({ length: count }, (_, index) => {
    /*
     * Spread evenly down the road first and jittered afterwards, rather than
     * scattered from nothing. Pure noise clumps — it leaves gaps you can see
     * the tarmac through and knots of four runners in one stride — and a field
     * with a hole in it looks like a bug rather than like a race.
     */
    const spread = count === 1 ? 0.5 : index / (count - 1);
    return {
      along:
        -AHEAD +
        spread * (AHEAD + BEHIND) +
        (noise(index + 1) - 0.5) * 2 * JITTER * slot,
      /*
       * Two files, odds one side of the line and evens the other. Scattering
       * both the length and the width independently reads better on paper than
       * it draws: two runners a stride apart can land on the same side of the
       * road as well, and then they are one runner with four legs. Alternating
       * puts a road's width between anybody close enough to overlap, and has
       * the side effect of looking like what a road race looks like.
       */
      across:
        (index % 2 === 0 ? -1 : 1) *
        (ACROSS_MIN + noise(index + 7.3) * (ACROSS_MAX - ACROSS_MIN)),
      vest: noise(index + 19.7),
    };
  });
}

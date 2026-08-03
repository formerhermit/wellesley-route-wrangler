/**
 * What the megaphone shouts at the bottom of the how-to-play screen.
 *
 * Not advice, and not a rule: the rules are the list above it, and they are
 * the only thing on that screen a player has to believe. A tip is the club
 * talking, so it is allowed to be as wrong as the club usually is.
 *
 * It turns every few seconds while the screen is up, so the list wants to be
 * long enough that somebody reading the rules properly does not watch it come
 * round. Each one is a joke that lands on its own — they are seen in an order
 * nobody controls, so none of them may set up another.
 *
 * Keep them short. `tips.test.ts` holds them to sixty characters, which is
 * the two lines the megaphone's box has on a phone before the strip starts
 * growing into the rules above it.
 */
export const tips = [
  "Nobody has ever agreed on what counts as a hill",
  "It's not a hill, it's a reverse decline",
  "The hill was not there last week",
  "Downhill is just uphill you have already paid for",
  "Hydration is important. So is cake",
  "The post-run pint is part of the training plan",
  "Geese can smell fear",
  "The goose remembers what you said",
  "Never use another runner's foam roller",
  "Nobody has ever needed that many gels",
  "Pigeons are government drones",
  "Don't pet the cows, they don't appreciate it",
  "The cows have seen worse form than yours",
  "A bush is a toilet if you believe in yourself",
  "The watch is wrong. The route is right",
  "The first kilometre is a lie",
  "Every route is a loop if you keep going",
  "Somebody always knows a shortcut. Ignore them",
  "The run leader is never lost, only exploring",
  "Nobody is last. Somebody is always last",
  "Nobody warms up. Everybody says they did",
  "It is never as cold as the car park suggests",
  "The committee has views on this",
  "The social run is neither",
];

/**
 * The tip after the last one.
 *
 * A rotation rather than a draw, which is worth the extra thought: a random
 * pick would show the same line twice running often enough to look broken —
 * and the whole point of changing it is that somebody notices it changed.
 * Stepping on by one never repeats, and a full turn is every tip once.
 *
 * The roll is only for where the rotation starts, so two people do not get the
 * same first joke; once it is turning, there is nothing left to decide. It is
 * passed in rather than taken so this stays pure.
 */
export function nextTipIndex(previous: number | null, roll = 0): number {
  if (previous === null) {
    // Clamped rather than trusted: a roll of exactly 1 would index past the end.
    return Math.min(Math.floor(roll * tips.length), tips.length - 1);
  }
  return (previous + 1) % tips.length;
}

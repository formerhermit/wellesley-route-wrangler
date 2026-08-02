/**
 * What the megaphone shouts at the bottom of the how-to-play screen.
 *
 * Not advice, and not a rule: the rules are the list above it, and they are
 * the only thing on that screen a player has to believe. A tip is the club
 * talking, so it is allowed to be as wrong as the club usually is.
 */
export const tips = [
  "Nobody has ever agreed on what counts as a hill",
  "It's not a hill, it's a reverse decline",
  "Hydration is important. So is cake",
  "Geese can smell fear",
  "Never use another runner's foam roller",
  "Pigeons are government drones",
  "Don't pet the cows, they don't appreciate it",
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

/**
 * Whether there is a club table to talk to — and deliberately nothing else.
 *
 * This file imports no Supabase code, which is the entire point of it. It is
 * the one thing the game's main bundle is allowed to know about the club
 * table, so that everything else — the client library, the sign-in, the
 * standings — can be fetched only when somebody actually opens it.
 *
 * With nothing configured this folds to `false` at build time and no
 * leaderboard appears at all.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Both values are checked for shape, not merely for presence.
 *
 * "Present" is too weak a test for something set by hand in a deployment
 * secret. A value that is non-empty but wrong — a placeholder, a description
 * of the key rather than the key — passes a truthiness check, turns the
 * leaderboard on, and then fails every request it makes. That is far worse
 * than no leaderboard: the player is offered a club table that cannot work.
 *
 * So a misconfigured deploy degrades exactly like an unconfigured one.
 */
function looksLikeProjectUrl(value: string | undefined): boolean {
  return typeof value === "string" && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(value);
}

function looksLikeKey(value: string | undefined): boolean {
  if (typeof value !== "string") return false;
  // Either the current publishable key, or the legacy anon JWT.
  return /^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(value) || /^eyJ[A-Za-z0-9_-]{20,}\./.test(value);
}

export const clubTableEnabled = looksLikeProjectUrl(url) && looksLikeKey(key);

// Said once, and only when somebody has clearly tried: a build with neither
// value set is the normal case and deserves no noise, but a build with two
// values that do not work deserves to say so somewhere findable.
if (!clubTableEnabled && (url || key)) {
  console.warn(
    "[club table] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is set but does not look right, so the club table is off. Expected a https://<ref>.supabase.co URL and an sb_publishable_… key.",
  );
}

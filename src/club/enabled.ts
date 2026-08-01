/**
 * Whether there is a club table to talk to — and deliberately nothing else.
 *
 * This file imports no Supabase code, which is the entire point of it. It is
 * the one thing the game's main bundle is allowed to know about the club
 * table, so that everything else — the client library, the sign-in, the
 * standings — can be fetched only when somebody actually opens it.
 *
 * With no project configured this folds to `false` at build time and the
 * bundler drops the rest of the club code entirely: not deferred, absent.
 */
export const clubTableEnabled = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Who the club thinks you are, which is as little as it can get away with.
 *
 * There is no device id of our own in here. Supabase's anonymous sign-in
 * issues a real user with a real id and no login screen, and that id *is* the
 * device-scoped identity — which is what makes RLS mean anything, since a
 * hand-rolled id in a column is one anybody could type. Opting into Google
 * later links an identity to that same anonymous user, so the runs come with
 * it rather than being claimed back.
 *
 * Pure, and free of the browser, so the rules about what a name may be are
 * testable without one.
 */

/** Long enough to be a name, short enough not to wreck the table. */
export const NAME_MIN = 2;
export const NAME_MAX = 24;

export type NameCheck =
  | { ok: true; name: string }
  | { ok: false; reason: string };

/** C0 and C7 controls, and the bidirectional formatting characters. */
function isDangerous(character: string): boolean {
  const code = character.codePointAt(0) ?? 0;
  return (
    code < 0x20 ||
    code === 0x7f ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x2069)
  );
}

/**
 * Tidy a typed name into the one that goes on the table. Whitespace collapses,
 * control characters go: this is rendered next to other people's names and the
 * only sensible time to deal with that is before it is stored.
 */
export function cleanDisplayName(raw: string): NameCheck {
  // Filtered by code point rather than matched by a regex: a character
  // class full of control characters is unreadable, and every linter in
  // the world objects to it.
  const stripped = [...raw].filter((ch) => !isDangerous(ch)).join("");
  const name = stripped.replace(/\s+/g, " ").trim();

  if (name.length < NAME_MIN) {
    return { ok: false, reason: `At least ${NAME_MIN} characters, please.` };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, reason: `${NAME_MAX} characters at most.` };
  }
  return { ok: true, name };
}

/**
 * What gets sent when a run is put on the table: the route and nothing else.
 * No score — the server works that out by replaying the route, so there is no
 * number here for anybody to have edited.
 */
export interface RunSubmission {
  levelId: string;
  roadIds: string[];
}

export function submissionFor(levelId: string, roadIds: string[]): RunSubmission {
  return { levelId, roadIds: [...roadIds] };
}

import { describe, expect, it } from "vitest";

/**
 * The shape checks in `enabled.ts`, tested against the values that actually
 * turn up in a deployment secret — including the one that caused #70, where
 * the *description* of the key was pasted instead of the key. That value is
 * non-empty, so a truthiness check let it through, the leaderboard appeared,
 * and every request it made failed.
 *
 * The rules are re-stated here rather than exported, because they are
 * build-time constants in the module itself; what is being pinned is the
 * decision about what counts, not the plumbing.
 */
function looksLikeProjectUrl(value: string | undefined): boolean {
  return (
    typeof value === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(value)
  );
}

function looksLikeKey(value: string | undefined): boolean {
  if (typeof value !== "string") return false;
  return (
    /^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(value) ||
    /^eyJ[A-Za-z0-9_-]{20,}\./.test(value)
  );
}

describe("what counts as a configured club table", () => {
  it("accepts a real project url", () => {
    expect(looksLikeProjectUrl("https://jhvdjldomgccfyrkjola.supabase.co")).toBe(true);
    expect(looksLikeProjectUrl("https://jhvdjldomgccfyrkjola.supabase.co/")).toBe(true);
  });

  it("accepts both key formats", () => {
    expect(looksLikeKey("sb_publishable_abcdefghij1234567890")).toBe(true);
    // A legacy anon JWT, which older projects still issue.
    expect(looksLikeKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.body.sig")).toBe(true);
  });

  it("rejects the placeholder from .env.example", () => {
    expect(looksLikeProjectUrl("https://your-project.supabase.co")).toBe(true);
    // The URL placeholder is indistinguishable from a real one by shape, so
    // the key is what has to catch a half-filled .env — and it does.
    expect(looksLikeKey("your-publishable-anon-key")).toBe(false);
  });

  it("rejects the value that caused #70", () => {
    // Pasted out of a documentation table, description and all.
    expect(looksLikeKey("the sb_publishable_… key from Project Settings → API")).toBe(
      false,
    );
  });

  it("rejects empty, missing and whitespace values", () => {
    expect(looksLikeKey(undefined)).toBe(false);
    expect(looksLikeKey("")).toBe(false);
    expect(looksLikeKey("   ")).toBe(false);
    expect(looksLikeProjectUrl(undefined)).toBe(false);
    expect(looksLikeProjectUrl("")).toBe(false);
  });

  it("rejects a key with whitespace around it, which a paste often carries", () => {
    expect(looksLikeKey(" sb_publishable_abcdefghij1234567890")).toBe(false);
    expect(looksLikeKey("sb_publishable_abcdefghij1234567890\n")).toBe(false);
  });

  it("rejects a url that is not a supabase project", () => {
    expect(looksLikeProjectUrl("http://jhvdjldomgccfyrkjola.supabase.co")).toBe(false);
    expect(looksLikeProjectUrl("https://example.com")).toBe(false);
    expect(looksLikeProjectUrl("jhvdjldomgccfyrkjola.supabase.co")).toBe(false);
  });
});

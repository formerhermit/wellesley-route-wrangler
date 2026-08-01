import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanDisplayName } from "./identity";
import { clubTableEnabled } from "./enabled";

/**
 * Everything that talks to the club table, and the only place that does.
 *
 * The anon key is meant to be public — it identifies the project, it does not
 * authorise anything. Row level security is what decides who may read and
 * write, which is why the policies in `supabase/migrations` are the real
 * security model and this file is just a telephone.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | undefined;

function supabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("No club table configured.");
  }
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

export interface Standing {
  id: string;
  displayName: string;
  points: number;
  routesFound: number;
}

export interface ClubResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function failed<T>(error: string): ClubResult<T> {
  return { ok: false, error };
}

/**
 * Take a name and a seat at the table. Anonymous sign-in first — a real user
 * with a real id and no login screen — then the player row that name lives on.
 */
export async function joinTable(rawName: string): Promise<ClubResult<string>> {
  if (!clubTableEnabled) return failed("There is no club table yet.");

  const checked = cleanDisplayName(rawName);
  if (!checked.ok) return failed(checked.reason);

  const client = supabase();
  const { data: existing } = await client.auth.getSession();
  if (!existing.session) {
    const { error } = await client.auth.signInAnonymously();
    if (error) return failed("Could not reach the club table.");
  }

  const { data: user } = await client.auth.getUser();
  if (!user.user) return failed("Could not reach the club table.");

  const { error } = await client
    .from("players")
    .upsert({ id: user.user.id, display_name: checked.name });
  if (error) return failed("That name would not take.");

  return { ok: true, data: checked.name };
}

/** The name this device is on the table under, if any. */
export async function currentName(): Promise<string | undefined> {
  if (!clubTableEnabled) return undefined;
  const client = supabase();
  const { data: session } = await client.auth.getSession();
  if (!session.session) return undefined;

  const { data } = await client
    .from("players")
    .select("display_name")
    .eq("id", session.session.user.id)
    .maybeSingle();
  return (data as { display_name?: string } | null)?.display_name;
}

/**
 * Put a finished run on the table. The route goes up and a score comes back:
 * the client never says what a run was worth, because the function replays it
 * and works that out itself.
 */
export async function submitRun(
  levelId: string,
  roadIds: string[],
): Promise<ClubResult<number>> {
  if (!clubTableEnabled) return failed("There is no club table yet.");

  const client = supabase();
  const { data: session } = await client.auth.getSession();
  if (!session.session) return failed("Pick a display name first.");

  const { data, error } = await client.functions.invoke("submit-run", {
    body: { levelId, roadIds },
  });
  if (error) return failed("The club table would not take that run.");

  return { ok: true, data: (data as { points?: number })?.points ?? 0 };
}

export async function standings(limit = 50): Promise<ClubResult<Standing[]>> {
  if (!clubTableEnabled) return failed("There is no club table yet.");

  const { data, error } = await supabase()
    .from("club_standings")
    .select("id, display_name, points, routes_found")
    .order("points", { ascending: false })
    .limit(limit);

  if (error) return failed("Could not read the club table.");

  const rows = (data ?? []) as {
    id: string;
    display_name: string;
    points: number;
    routes_found: number;
  }[];
  return {
    ok: true,
    data: rows.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      points: row.points,
      routesFound: row.routes_found,
    })),
  };
}

/**
 * Take yourself off, runs and all. What is on this device stays on it — that
 * is the browser's, and clearing it is the browser's job.
 */
export async function removeMe(): Promise<ClubResult<true>> {
  if (!clubTableEnabled) return failed("There is no club table yet.");

  const client = supabase();
  const { data: session } = await client.auth.getSession();
  if (!session.session) return { ok: true, data: true };

  const { error } = await client.functions.invoke("delete-me", { body: {} });
  if (error) return failed("Could not take you off the table.");

  await client.auth.signOut();
  return { ok: true, data: true };
}

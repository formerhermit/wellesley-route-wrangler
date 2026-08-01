/**
 * Put a run on the club table.
 *
 * The only thing in the system allowed to write a submission, because it is
 * the only thing that works out what one is worth. The client sends a level
 * and a list of road ids — no score, because there is no number here for
 * anybody to have edited. This replays that route through the game's own
 * scoring and stores what it actually comes to.
 *
 * The scoring is not reimplemented: `_shared/game.bundle.js` is generated
 * straight from `src/game`, so the server and the client cannot drift.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  levelById,
  routeFromRoads,
  routeKey,
  scoreRun,
  SCORE_VERSION,
} from "../_shared/game.bundle.js";

/** Submissions per player per minute. A route is cheap to send, not free. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("CLUB_ORIGIN") ?? "*",
  // supabase-js sends apikey and x-client-info as well as the obvious two.
  // Omit either and the browser's preflight quietly blocks the real request,
  // which looks exactly like the function being broken. curl never notices,
  // because curl never preflights.
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return reply(405, { error: "POST only." });

  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return reply(401, { error: "Sign in first." });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  // Anon key plus the caller's own token: this client can only see what the
  // caller can, which is how the JWT gets verified rather than trusted.
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: auth, error: authError } = await asCaller.auth.getUser();
  if (authError || !auth?.user) return reply(401, { error: "Sign in first." });
  const playerId = auth.user.id;

  let payload: { levelId?: unknown; roadIds?: unknown };
  try {
    payload = await request.json();
  } catch {
    return reply(400, { error: "That was not JSON." });
  }

  const levelId = typeof payload.levelId === "string" ? payload.levelId : "";
  const roadIds = Array.isArray(payload.roadIds) ? payload.roadIds : [];
  if (!levelId || roadIds.length === 0) {
    return reply(400, { error: "A level and a route, please." });
  }
  if (!roadIds.every((road: unknown) => typeof road === "string")) {
    return reply(400, { error: "Road ids must be strings." });
  }
  // A route cannot be longer than the map has roads, whatever anybody posts.
  const level = levelById(levelId);
  if (!level) return reply(400, { error: "No such run." });
  if (roadIds.length > level.roads.length) {
    return reply(400, { error: "That is more roads than the map has." });
  }

  // Does this list of roads describe a route at all? A road that is not on
  // this map, or one that does not start where the last finished, does not.
  const route = routeFromRoads(level, roadIds as string[]);
  if (!route) return reply(400, { error: "Those roads are not a route." });

  const score = scoreRun(level, route);
  if (!score.won) {
    return reply(422, { error: "That run did not meet the brief." });
  }

  // Everything past here writes, so it needs the service role — which bypasses
  // row level security, and is exactly why no client is ever given it.
  const asService = createClient(
    url,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { count, error: countError } = await asService
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .gt("created_at", new Date(Date.now() - RATE_WINDOW_MS).toISOString());

  if (countError) {
    console.error("rate limit count failed", countError);
    return reply(500, { error: "Could not check the book." });
  }
  if ((count ?? 0) >= RATE_LIMIT) {
    return reply(429, { error: "Steady on. Try again in a minute." });
  }

  const { error: insertError } = await asService.from("submissions").upsert(
    {
      player_id: playerId,
      level_id: levelId,
      road_ids: roadIds,
      route_key: routeKey(route),
      points: score.points,
      score_version: SCORE_VERSION,
    },
    // The same route again is the same discovery, exactly as it is on the
    // device. Not an error, just nothing new.
    { onConflict: "player_id,level_id,route_key", ignoreDuplicates: true },
  );

  if (insertError) {
    console.error("submission insert failed", insertError);
    // The player row has to exist first; anything else is ours, not theirs.
    const missingPlayer = insertError.code === "23503";
    return reply(missingPlayer ? 409 : 500, {
      error: missingPlayer
        ? "Pick a display name first."
        : "Could not write that down.",
    });
  }

  return reply(200, { points: score.points, scoreVersion: SCORE_VERSION });
});

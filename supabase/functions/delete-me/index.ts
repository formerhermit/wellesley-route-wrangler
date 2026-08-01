/**
 * Take yourself off the club table, entirely, without asking anybody.
 *
 * Deleting the player row would be enough for the runs — submissions cascade
 * from it, and row level security already lets a player delete their own row.
 * What that leaves behind is the anonymous auth user, and *that* is the
 * device-scoped id the privacy policy promises to remove. Removing it needs
 * the admin API, which needs the service role, which is why this is a function
 * and not a policy.
 *
 * The local run book is the browser's, not ours, so the client clears that
 * itself. This only undoes what left the device.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    return reply(401, { error: "Nothing to delete." });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: auth, error: authError } = await asCaller.auth.getUser();
  if (authError || !auth?.user) return reply(401, { error: "Nothing to delete." });
  const playerId = auth.user.id;

  const asService = createClient(
    url,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // The runs first. Submissions cascade from the player row.
  const { error: playerError } = await asService
    .from("players")
    .delete()
    .eq("id", playerId);
  if (playerError) return reply(500, { error: "Could not remove your runs." });

  // Then the identity itself. Nothing is left tying that device to anything.
  const { error: userError } = await asService.auth.admin.deleteUser(playerId);
  if (userError) return reply(500, { error: "Could not remove your account." });

  return reply(200, { deleted: true });
});

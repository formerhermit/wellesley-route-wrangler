-- The club table.
--
-- Two rules shape the whole of this file:
--
--   1. Nothing stores a score the client sent. Points are worked out by
--      replaying the route through the game's own scoring, in the submit-run
--      function, which is the only thing allowed to write a submission.
--   2. A route is a set of roads. The same loop run backwards is the same
--      route, so it is one row and one discovery, exactly as the client's own
--      run book treats it.
--
-- Players are Supabase anonymous users: a real auth.uid() with no login
-- screen. That is what lets row level security mean something — an id in a
-- column is one anybody could type, an auth.uid() is not.

create table if not exists public.players (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(display_name) between 2 and 24),
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.players (id) on delete cascade,
  level_id text not null,
  -- The route as run, in order, for replaying and for rescoring later.
  road_ids text[] not null check (cardinality(road_ids) > 0),
  -- The same roads sorted and joined: the identity of the route itself.
  route_key text not null,
  -- Written by submit-run, never by a client. See the policies below.
  points integer not null check (points >= 0),
  score_version integer not null,
  created_at timestamptz not null default now(),
  -- One row per route per player. Running a route again is not a discovery.
  unique (player_id, level_id, route_key)
);

create index if not exists submissions_player_idx
  on public.submissions (player_id);
create index if not exists submissions_level_idx
  on public.submissions (level_id);
-- The rate limit counts a player's most recent rows, so it wants this order.
create index if not exists submissions_recent_idx
  on public.submissions (player_id, created_at desc);

alter table public.players enable row level security;
alter table public.submissions enable row level security;

-- Each policy is dropped first so the whole file can be run again after a
-- change, which is how it will actually be used: pasted into a SQL editor,
-- adjusted, pasted again.

-- Anyone may read the table. That is what a leaderboard is.
drop policy if exists "players are readable by everyone" on public.players;
create policy "players are readable by everyone"
  on public.players for select
  using (true);

drop policy if exists "submissions are readable by everyone" on public.submissions;
create policy "submissions are readable by everyone"
  on public.submissions for select
  using (true);

-- You may create and rename yourself, and only yourself.
drop policy if exists "a player writes their own row" on public.players;
create policy "a player writes their own row"
  on public.players for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "a player renames their own row" on public.players;
create policy "a player renames their own row"
  on public.players for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- You may also delete yourself, which takes your runs with it: submissions
-- reference players on delete cascade. This is the whole of the erasure story
-- on the database side, and it is deliberately a policy rather than a favour
-- somebody has to do for you.
drop policy if exists "a player deletes their own row" on public.players;
create policy "a player deletes their own row"
  on public.players for delete
  to authenticated
  using (auth.uid() = id);

-- And nobody may write a submission directly. There is deliberately no insert
-- policy on this table: #60 called for "insert-your-own-rows-only", but a
-- points column cannot be trusted to its own author, and a route cannot be
-- replayed in SQL. So the only writer is the submit-run edge function, which
-- holds the service role, verifies the caller's JWT, and computes the score
-- itself. Everything else gets read access and nothing more.

-- Privileges, granted by hand because the project has "automatically expose
-- new tables" turned off. Worth being clear about why both halves are needed:
-- a policy says which rows a role may touch, a grant says whether it may touch
-- the table at all. Without these, every policy above is moot and every query
-- returns nothing.
grant usage on schema public to anon, authenticated;

grant select on public.players to anon, authenticated;
grant insert, update, delete on public.players to authenticated;

grant select on public.submissions to anon, authenticated;
-- Pointedly no insert, update or delete on submissions for anon or
-- authenticated. Writing one is the function's job alone.

-- And the role that does that job. This is the easy one to forget: the service
-- role bypasses row level security, but it does NOT bypass grants, so with
-- "automatically expose new tables" turned off it arrives at a new table with
-- no privileges at all and every write fails with a bare "permission denied".
-- Nothing is loosened by this — the secret key that assumes this role exists
-- only in the edge functions' own environment, never in a client.
grant select, insert, update, delete on public.players to service_role;
grant select, insert on public.submissions to service_role;

/**
 * The standings. Derived, every time, from the routes — no total is stored
 * anywhere, so rebalancing the scoring is a redeploy and not a migration.
 */
create or replace view public.club_standings
with (security_invoker = on) as
  select
    p.id,
    p.display_name,
    coalesce(sum(s.points), 0)::int as points,
    count(s.id)::int as routes_found,
    max(s.created_at) as last_run
  from public.players p
  left join public.submissions s on s.player_id = p.id
  group by p.id, p.display_name;

-- security_invoker means the view reads with the caller's own permissions
-- rather than the owner's, so the grants and policies above still apply
-- through it. A view is not a way round row level security here.
grant select on public.club_standings to anon, authenticated;

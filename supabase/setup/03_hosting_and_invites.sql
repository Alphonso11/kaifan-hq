-- ============================================================
-- Kaifan HQ — self-serve hosting + 24h invite links
-- Run this AFTER 01_schema.sql (and 02 if restoring users).
--
-- New model:
--   • Any signed-in user can create ONE diwaniya and becomes its host (admin).
--     (Free for now; the payment gate will hook into create_diwaniya later.)
--   • Diwaniyas are invite-only — no public browse. A host shares a link that
--     expires in 24h; opening it (while signed in) grants access to view and
--     request a seat.
-- ============================================================

-- ---------- tables ----------

-- Time-limited invite links a host shares to let guests in.
create table if not exists public.invite_links (
  id          uuid primary key default gen_random_uuid(),
  diwaniya_id uuid not null references public.diwaniyas(id) on delete cascade,
  token       text not null unique,
  created_by  uuid references public.users(id),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists idx_invite_links_token       on public.invite_links (token);
create index if not exists idx_invite_links_diwaniya_id on public.invite_links (diwaniya_id);

-- Who has been granted access to a (private) diwaniya via an invite.
create table if not exists public.diwaniya_access (
  id          uuid primary key default gen_random_uuid(),
  diwaniya_id uuid not null references public.diwaniyas(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (diwaniya_id, user_id)
);
create index if not exists idx_diwaniya_access_user_id     on public.diwaniya_access (user_id);
create index if not exists idx_diwaniya_access_diwaniya_id on public.diwaniya_access (diwaniya_id);

-- ---------- RPCs (SECURITY DEFINER: run as owner, bypass RLS, central logic) ----------

-- Create a diwaniya owned by the caller, and promote a guest to host (admin).
-- NOTE: the future payment check goes right here, before the insert.
create or replace function public.create_diwaniya(
  p_name         text,
  p_slug         text,
  p_location     text default null,
  p_description  text default null,
  p_max_capacity integer default 50
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_slug text := p_slug;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- (payment gate will go here later)

  insert into public.diwaniyas (name, slug, location, description, admin_id, max_capacity, is_open, current_capacity)
  values (p_name, v_slug, nullif(p_location, ''), nullif(p_description, ''), v_uid, coalesce(p_max_capacity, 50), false, 0);

  -- Promote the creator to host. Super-admins keep their role.
  update public.users set role = 'admin'
  where id = v_uid and role = 'guest';

  return v_slug;
end;
$$;

-- Owner generates a fresh 24h invite link for their diwaniya. Returns the token.
create or replace function public.create_invite_link(p_diwaniya_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_token text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.diwaniyas
    where id = p_diwaniya_id and admin_id = v_uid
  ) then
    raise exception 'Not allowed: you do not own this diwaniya';
  end if;

  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  insert into public.invite_links (diwaniya_id, token, created_by, expires_at)
  values (p_diwaniya_id, v_token, v_uid, now() + interval '24 hours');

  return v_token;
end;
$$;

-- A signed-in user opens an invite link. Validates token + expiry, grants
-- access, and returns the diwaniya slug. Returns NULL if invalid/expired.
create or replace function public.use_invite(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_diw  uuid;
  v_slug text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select il.diwaniya_id, d.slug
    into v_diw, v_slug
  from public.invite_links il
  join public.diwaniyas d on d.id = il.diwaniya_id
  where il.token = p_token
    and il.expires_at > now()
  limit 1;

  if v_diw is null then
    return null; -- invalid or expired
  end if;

  insert into public.diwaniya_access (diwaniya_id, user_id)
  values (v_diw, v_uid)
  on conflict (diwaniya_id, user_id) do nothing;

  return v_slug;
end;
$$;

-- ---------- RLS ----------

alter table public.invite_links    enable row level security;
alter table public.diwaniya_access enable row level security;

-- diwaniyas: allow a user to create a diwaniya they own (RPC also covers this).
drop policy if exists "Users can create their own diwaniya" on public.diwaniyas;
create policy "Users can create their own diwaniya" on public.diwaniyas
  for insert with check (admin_id = auth.uid());

-- invite_links: only the owning host manages them.
drop policy if exists "Hosts manage their invite links" on public.invite_links;
create policy "Hosts manage their invite links" on public.invite_links
  for all
  using (exists (select 1 from public.diwaniyas where diwaniyas.id = invite_links.diwaniya_id and diwaniyas.admin_id = auth.uid()))
  with check (exists (select 1 from public.diwaniyas where diwaniyas.id = invite_links.diwaniya_id and diwaniyas.admin_id = auth.uid()));

-- diwaniya_access: a user can see their own access; hosts can see access to their diwaniya.
drop policy if exists "Users see own access" on public.diwaniya_access;
create policy "Users see own access" on public.diwaniya_access
  for select using (user_id = auth.uid());
drop policy if exists "Hosts see access to their diwaniya" on public.diwaniya_access;
create policy "Hosts see access to their diwaniya" on public.diwaniya_access
  for select using (exists (select 1 from public.diwaniyas where diwaniyas.id = diwaniya_access.diwaniya_id and diwaniyas.admin_id = auth.uid()));

-- Let signed-in users execute the RPCs.
grant execute on function public.create_diwaniya(text, text, text, text, integer) to authenticated;
grant execute on function public.create_invite_link(uuid) to authenticated;
grant execute on function public.use_invite(text) to authenticated;

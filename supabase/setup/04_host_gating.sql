-- ============================================================
-- Kaifan HQ — gate hosting behind a flag
-- Run AFTER 03_hosting_and_invites.sql.
--
-- Hosting is no longer open to every account. A user can create a diwaniya
-- only if they are a super_admin OR have users.can_host = true. The flag
-- defaults to false; grant it manually for now, or have the future payment
-- flow flip it to true on success.
-- ============================================================

alter table public.users
  add column if not exists can_host boolean not null default false;

-- create_diwaniya now enforces the hosting gate before creating anything.
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
  v_uid     uuid := auth.uid();
  v_allowed boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Hosting gate: super_admins always allowed; everyone else needs can_host.
  select (role = 'super_admin' or can_host)
    into v_allowed
  from public.users
  where id = v_uid;

  if not coalesce(v_allowed, false) then
    raise exception 'Hosting is not enabled for your account';
  end if;

  insert into public.diwaniyas (name, slug, location, description, admin_id, max_capacity, is_open, current_capacity)
  values (p_name, p_slug, nullif(p_location, ''), nullif(p_description, ''), v_uid, coalesce(p_max_capacity, 50), false, 0);

  -- Promote the creator to host. Super-admins keep their role.
  update public.users set role = 'admin'
  where id = v_uid and role = 'guest';

  return p_slug;
end;
$$;

-- ---------- to grant hosting to a specific user (run as needed) ----------
-- update public.users set can_host = true where email = 'someone@example.com';

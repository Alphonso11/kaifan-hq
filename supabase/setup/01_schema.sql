-- ============================================================
-- Kaifan HQ — public schema (rebuild for a fresh Supabase project)
-- Reconstructed from the cluster backup (post-migration state).
-- Run this FIRST, in the new project's SQL Editor (Database → SQL Editor).
-- Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS.
-- ============================================================

-- ---------- functions ----------

-- Auto-create a public.users profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'guest'
  );
  return new;
end;
$$;

-- Keep diwaniyas.current_capacity in sync with approved registrations.
create or replace function public.update_diwaniya_capacity()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and new.status = 'approved' then
    update diwaniyas set current_capacity = current_capacity + 1 where id = new.diwaniya_id;
  elsif tg_op = 'UPDATE' then
    if old.status != 'approved' and new.status = 'approved' then
      update diwaniyas set current_capacity = current_capacity + 1 where id = new.diwaniya_id;
    elsif old.status = 'approved' and new.status != 'approved' then
      update diwaniyas set current_capacity = current_capacity - 1 where id = new.diwaniya_id;
    end if;
  elsif tg_op = 'DELETE' and old.status = 'approved' then
    update diwaniyas set current_capacity = current_capacity - 1 where id = old.diwaniya_id;
  end if;
  return coalesce(new, old);
end;
$$;

-- Touch updated_at on row update.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- tables ----------

create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       varchar(255) not null unique,
  name        varchar(255) not null,
  phone       varchar(20),
  role        varchar(20) default 'guest'
                check (role in ('guest', 'admin', 'super_admin')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  banned      boolean default false,
  ban_reason  text
);

create table if not exists public.diwaniyas (
  id                uuid primary key default gen_random_uuid(),
  name              varchar(255) not null,
  slug              varchar(255) not null unique,
  location          varchar(255),
  description       text,
  admin_id          uuid references public.users(id) on delete cascade,
  is_open           boolean default false,
  current_capacity  integer default 0,
  max_capacity      integer default 50,
  image_url         text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists public.registrations (
  id            uuid primary key default gen_random_uuid(),
  diwaniya_id   uuid references public.diwaniyas(id) on delete cascade,
  user_id       uuid references public.users(id) on delete cascade,
  status        varchar(20) default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  registered_at timestamptz default now(),
  updated_at    timestamptz default now(),
  notes         text,
  admin_notes   text,
  unique (diwaniya_id, user_id)
);

create table if not exists public.bans (
  id            uuid primary key default gen_random_uuid(),
  diwaniya_id   uuid references public.diwaniyas(id) on delete cascade,
  user_id       uuid references public.users(id) on delete cascade,
  banned_by     uuid references public.users(id),
  reason        text not null,
  banned_at     timestamptz default now(),
  expires_at    timestamptz,
  is_permanent  boolean default false,
  unique (diwaniya_id, user_id)
);

create table if not exists public.activity_logs (
  id           uuid primary key default gen_random_uuid(),
  diwaniya_id  uuid references public.diwaniyas(id) on delete cascade,
  user_id      uuid references public.users(id),
  action       varchar(100) not null,
  details      jsonb,
  ip_address   varchar(45),
  created_at   timestamptz default now()
);

-- ---------- indexes ----------

create index if not exists idx_diwaniyas_admin_id        on public.diwaniyas (admin_id);
create index if not exists idx_diwaniyas_is_open         on public.diwaniyas (is_open);
create index if not exists idx_diwaniyas_slug            on public.diwaniyas (slug);
create index if not exists idx_registrations_diwaniya_id on public.registrations (diwaniya_id);
create index if not exists idx_registrations_user_id     on public.registrations (user_id);
create index if not exists idx_registrations_status      on public.registrations (status);
create index if not exists idx_bans_diwaniya_id          on public.bans (diwaniya_id);
create index if not exists idx_bans_user_id              on public.bans (user_id);
create index if not exists idx_activity_logs_diwaniya_id on public.activity_logs (diwaniya_id);
create index if not exists idx_activity_logs_user_id     on public.activity_logs (user_id);
create index if not exists idx_activity_logs_created_at  on public.activity_logs (created_at);

-- ---------- triggers ----------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists update_capacity_on_registration on public.registrations;
create trigger update_capacity_on_registration
  after insert or delete or update on public.registrations
  for each row execute function public.update_diwaniya_capacity();

drop trigger if exists update_diwaniyas_updated_at on public.diwaniyas;
create trigger update_diwaniyas_updated_at
  before update on public.diwaniyas
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_registrations_updated_at on public.registrations;
create trigger update_registrations_updated_at
  before update on public.registrations
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

-- ---------- row level security ----------

alter table public.users         enable row level security;
alter table public.diwaniyas     enable row level security;
alter table public.registrations enable row level security;
alter table public.bans          enable row level security;
alter table public.activity_logs enable row level security;

-- users
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"   on public.users for select using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- diwaniyas
drop policy if exists "Anyone can view diwaniyas" on public.diwaniyas;
create policy "Anyone can view diwaniyas"        on public.diwaniyas for select using (true);
drop policy if exists "Admins can update their diwaniya" on public.diwaniyas;
create policy "Admins can update their diwaniya"  on public.diwaniyas for update using (admin_id = auth.uid());

-- registrations
drop policy if exists "Users can view own registrations" on public.registrations;
create policy "Users can view own registrations" on public.registrations for select using (user_id = auth.uid());
drop policy if exists "Users can insert own registrations" on public.registrations;
create policy "Users can insert own registrations" on public.registrations for insert with check (user_id = auth.uid());
drop policy if exists "Users can delete own pending registrations" on public.registrations;
create policy "Users can delete own pending registrations" on public.registrations for delete using (user_id = auth.uid() and status = 'pending');
drop policy if exists "Admins can view their diwaniya registrations" on public.registrations;
create policy "Admins can view their diwaniya registrations" on public.registrations for select using (
  exists (select 1 from public.diwaniyas where diwaniyas.id = registrations.diwaniya_id and diwaniyas.admin_id = auth.uid())
);
drop policy if exists "Admins can update their diwaniya registrations" on public.registrations;
create policy "Admins can update their diwaniya registrations" on public.registrations for update using (
  exists (select 1 from public.diwaniyas where diwaniyas.id = registrations.diwaniya_id and diwaniyas.admin_id = auth.uid())
);

-- bans
drop policy if exists "Users can view own bans" on public.bans;
create policy "Users can view own bans" on public.bans for select using (user_id = auth.uid());
drop policy if exists "Admins can view their diwaniya bans" on public.bans;
create policy "Admins can view their diwaniya bans" on public.bans for select using (
  exists (select 1 from public.diwaniyas where diwaniyas.id = bans.diwaniya_id and diwaniyas.admin_id = auth.uid())
);
drop policy if exists "Admins can insert bans for their diwaniya" on public.bans;
create policy "Admins can insert bans for their diwaniya" on public.bans for insert with check (
  exists (select 1 from public.diwaniyas where diwaniyas.id = bans.diwaniya_id and diwaniyas.admin_id = auth.uid())
);
drop policy if exists "Admins can delete bans from their diwaniya" on public.bans;
create policy "Admins can delete bans from their diwaniya" on public.bans for delete using (
  exists (select 1 from public.diwaniyas where diwaniyas.id = bans.diwaniya_id and diwaniyas.admin_id = auth.uid())
);

-- activity_logs
drop policy if exists "Anyone can insert activity logs" on public.activity_logs;
create policy "Anyone can insert activity logs" on public.activity_logs for insert with check (true);
drop policy if exists "Admins can view their diwaniya activity logs" on public.activity_logs;
create policy "Admins can view their diwaniya activity logs" on public.activity_logs for select using (
  exists (select 1 from public.diwaniyas where diwaniyas.id = activity_logs.diwaniya_id and diwaniyas.admin_id = auth.uid())
);

-- NOTE: there is intentionally no "admins/super-admins can view ALL users"
-- policy (it caused RLS recursion). Super-admin screens read users via the
-- service-role key (SUPABASE_SERVICE_ROLE_KEY), which bypasses RLS.

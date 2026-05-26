-- ============================================================
-- 20260101000100_profiles_and_rbac
-- profiles table (1:1 with auth.users), RBAC helper functions,
-- artist_profiles, seller_profiles, handle_new_user trigger.
-- ============================================================

-- ---------- profiles ----------------------------------------------

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            public.app_role not null default 'user',
  username        extensions.citext unique,
  full_name       text,
  avatar_url      text,
  cover_url       text,
  bio             text,
  website         text,
  socials         jsonb not null default '{}'::jsonb,
  location        text,
  interests       text[] not null default '{}',
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_username_idx on public.profiles (username);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- RBAC helper functions ---------------------------------
-- security definer is appropriate here because the function only reads
-- the caller's own row + a single column. We restrict the function to
-- the public schema and grant execute to authenticated.

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select role in ('admin', 'super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select role = 'super_admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.current_role() to authenticated, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- ---------- handle_new_user --------------------------------------
-- Creates a profile row whenever an auth user is created.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Ensure unique username
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_username || floor(random() * 9999)::int;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    v_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- artist_profiles ---------------------------------------

create table public.artist_profiles (
  id              uuid primary key references public.profiles(id) on delete cascade,
  tier            public.artist_tier not null default 'beginner',
  specialty       text,
  styles          text[] not null default '{}',
  mediums         text[] not null default '{}',
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  hourly_rate     numeric(10, 2),
  available_for_commission boolean not null default false,
  stats           jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_artist_profiles_updated
  before update on public.artist_profiles
  for each row execute function public.set_updated_at();

-- ---------- seller_profiles ---------------------------------------

create table public.seller_profiles (
  id              uuid primary key references public.profiles(id) on delete cascade,
  business_name   text not null,
  legal_name      text,
  gst_number      text,
  pan_number      text,
  bank_details    jsonb,
  address         jsonb,
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  rating_avg      numeric(3, 2),
  rating_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_seller_profiles_updated
  before update on public.seller_profiles
  for each row execute function public.set_updated_at();

-- ---------- RLS ---------------------------------------------------

alter table public.profiles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.seller_profiles enable row level security;

-- profiles: anyone reads, only owner (or admin) writes.
create policy "profiles_public_read" on public.profiles
  for select using (true);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- artist_profiles
create policy "artist_profiles_public_read" on public.artist_profiles
  for select using (true);
create policy "artist_profiles_self_write" on public.artist_profiles
  for insert with check (auth.uid() = id);
create policy "artist_profiles_self_update" on public.artist_profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- seller_profiles: sensitive — only owner + admin read.
create policy "seller_profiles_owner_read" on public.seller_profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "seller_profiles_owner_write" on public.seller_profiles
  for insert with check (auth.uid() = id);
create policy "seller_profiles_owner_update" on public.seller_profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

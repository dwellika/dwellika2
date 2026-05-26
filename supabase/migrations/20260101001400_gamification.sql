-- ============================================================
-- 20260101001400_gamification
-- badges, user_badges, user_levels.
-- ============================================================

create table public.badges (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  icon_url      text,
  category      text,
  tier          text,
  created_at    timestamptz not null default now()
);

create table public.user_badges (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  badge_id      uuid not null references public.badges(id) on delete cascade,
  awarded_at    timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges (user_id);

create table public.user_levels (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  level         public.user_level not null default 'explorer',
  xp            integer not null default 0,
  updated_at    timestamptz not null default now()
);

create trigger trg_user_levels_updated
  before update on public.user_levels
  for each row execute function public.set_updated_at();

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_levels enable row level security;

create policy "badges_read" on public.badges for select using (true);
create policy "badges_admin_write" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

create policy "user_badges_read" on public.user_badges for select using (true);
create policy "user_badges_admin_write" on public.user_badges
  for all using (public.is_admin()) with check (public.is_admin());

create policy "user_levels_read" on public.user_levels for select using (true);
create policy "user_levels_admin_write" on public.user_levels
  for all using (public.is_admin()) with check (public.is_admin());

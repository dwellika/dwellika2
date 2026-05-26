-- ============================================================
-- 20260101001500_announcements_testimonials
-- Home page content surfaces.
-- ============================================================

create table public.announcements (
  id            uuid primary key default gen_random_uuid(),
  category      public.announcement_category not null,
  title         text not null,
  body          text,
  cta_label     text,
  cta_url       text,
  image_url     text,
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- NOTE: Cannot use `now()` in a partial-index predicate because Postgres
-- requires predicate functions to be IMMUTABLE. We keep a regular index
-- on (category, starts_at desc) and filter `ends_at` at query time:
--   where ends_at is null or ends_at > now()
create index announcements_active_idx
  on public.announcements (category, starts_at desc);

create index announcements_open_ended_idx
  on public.announcements (category, starts_at desc)
  where ends_at is null;

create trigger trg_announcements_updated
  before update on public.announcements
  for each row execute function public.set_updated_at();

create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  group_name    public.testimonial_group not null,
  author_id     uuid references public.profiles(id) on delete set null,
  author_name   text not null,
  role_label    text,
  avatar_url    text,
  body          text not null,
  rating        integer check (rating between 1 and 5),
  is_featured   boolean not null default true,
  created_at    timestamptz not null default now()
);

create index testimonials_group_idx on public.testimonials (group_name, is_featured);

alter table public.announcements enable row level security;
alter table public.testimonials enable row level security;

create policy "announcements_read" on public.announcements for select using (true);
create policy "announcements_admin_write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonials_read" on public.testimonials for select using (true);
create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

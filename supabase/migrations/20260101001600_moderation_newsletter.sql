-- ============================================================
-- 20260101001600_moderation_newsletter
-- Admin audit log + newsletter subscribers.
-- ============================================================

create table public.moderation_logs (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid not null references public.profiles(id) on delete cascade,
  action        text not null,
  target_kind   text not null,
  target_id     uuid not null,
  notes         text,
  before_state  jsonb,
  after_state   jsonb,
  created_at    timestamptz not null default now()
);

create index moderation_logs_target_idx
  on public.moderation_logs (target_kind, target_id);

alter table public.moderation_logs enable row level security;

create policy "moderation_logs_admin_read" on public.moderation_logs
  for select using (public.is_admin());
create policy "moderation_logs_admin_insert" on public.moderation_logs
  for insert with check (public.is_admin());

-- Newsletter — open insert so the marketing form on the public site works
create table public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         extensions.citext not null unique,
  source        text,
  is_active     boolean not null default true,
  user_id       uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter_anon_insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "newsletter_admin_update" on public.newsletter_subscribers
  for update using (public.is_admin()) with check (public.is_admin());

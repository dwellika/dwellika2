-- ============================================================
-- 20260101001000_notifications
-- Per-user notification feed.
-- ============================================================

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kind          public.notification_kind not null,
  title         text not null,
  body          text,
  payload       jsonb not null default '{}'::jsonb,
  action_url    text,
  actor_id      uuid references public.profiles(id) on delete set null,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index notifications_user_idx
  on public.notifications (user_id, created_at desc);
create index notifications_unread_idx
  on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_owner_read" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());
create policy "notifications_owner_update" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_owner_delete" on public.notifications
  for delete using (user_id = auth.uid() or public.is_admin());
-- Inserts happen via service role from server actions / triggers.

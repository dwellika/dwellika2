-- ============================================================
-- 20260101001300_disputes
-- Order disputes between buyers and sellers, with admin arbitration.
-- ============================================================

create table public.disputes (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  opened_by       uuid not null references public.profiles(id) on delete cascade,
  against_id      uuid not null references public.profiles(id) on delete cascade,
  reason          text not null,
  description     text,
  evidence        jsonb not null default '[]'::jsonb,
  status          public.dispute_status not null default 'open',
  resolution      text,
  resolved_by     uuid references public.profiles(id),
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index disputes_order_idx on public.disputes (order_id);
create index disputes_status_idx on public.disputes (status);

create trigger trg_disputes_updated
  before update on public.disputes
  for each row execute function public.set_updated_at();

create table public.dispute_messages (
  id            uuid primary key default gen_random_uuid(),
  dispute_id    uuid not null references public.disputes(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  body          text not null,
  attachments   jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

create index dispute_messages_dispute_idx
  on public.dispute_messages (dispute_id, created_at);

alter table public.disputes enable row level security;
alter table public.dispute_messages enable row level security;

create policy "disputes_party_read" on public.disputes
  for select using (
    opened_by = auth.uid()
    or against_id = auth.uid()
    or public.is_admin()
  );
create policy "disputes_buyer_insert" on public.disputes
  for insert with check (
    opened_by = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );
create policy "disputes_admin_update" on public.disputes
  for update using (public.is_admin()) with check (public.is_admin());

create policy "dispute_messages_party_read" on public.dispute_messages
  for select using (
    exists (
      select 1 from public.disputes d
      where d.id = dispute_id
        and (d.opened_by = auth.uid() or d.against_id = auth.uid() or public.is_admin())
    )
  );
create policy "dispute_messages_party_insert" on public.dispute_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.disputes d
      where d.id = dispute_id
        and (d.opened_by = auth.uid() or d.against_id = auth.uid() or public.is_admin())
    )
  );

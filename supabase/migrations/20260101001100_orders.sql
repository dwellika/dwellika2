-- ============================================================
-- 20260101001100_orders
-- addresses, orders, order_items, order_tracking_events.
-- ============================================================

create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  label         text,
  full_name     text not null,
  line1         text not null,
  line2         text,
  city          text not null,
  state         text not null,
  postal_code   text not null,
  country       text not null default 'IN',
  phone         text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id);

create trigger trg_addresses_updated
  before update on public.addresses
  for each row execute function public.set_updated_at();

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique default ('DWK-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  buyer_id            uuid not null references public.profiles(id) on delete restrict,
  subtotal            numeric(12, 2) not null,
  shipping            numeric(12, 2) not null default 0,
  tax                 numeric(12, 2) not null default 0,
  discount            numeric(12, 2) not null default 0,
  total               numeric(12, 2) not null,
  currency            text not null default 'INR',
  status              public.order_status not null default 'pending',
  shipping_address    jsonb not null,
  billing_address     jsonb,
  payment_provider    text,
  payment_ref         text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index orders_status_idx on public.orders (status);

create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  target_kind   text not null check (target_kind in ('artwork', 'product')),
  target_id     uuid not null,
  seller_id     uuid references public.profiles(id),
  title         text not null,
  image_url     text,
  unit_price    numeric(12, 2) not null,
  quantity      integer not null check (quantity > 0),
  subtotal      numeric(12, 2) generated always as (unit_price * quantity) stored,
  metadata      jsonb not null default '{}'::jsonb
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_seller_idx on public.order_items (seller_id);

create table public.order_tracking_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  status        public.order_status not null,
  note          text,
  carrier       text,
  tracking_number text,
  occurred_at   timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);

create index order_tracking_events_order_idx
  on public.order_tracking_events (order_id, occurred_at desc);

-- Now that orders exists, complete the chat -> order foreign key
alter table public.chats
  add constraint chats_order_id_fkey
  foreign key (order_id) references public.orders(id) on delete set null;

-- ---------- RLS ---------------------------------------------------

alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_tracking_events enable row level security;

create policy "addresses_owner" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "orders_buyer_or_seller_read" on public.orders
  for select using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = id and oi.seller_id = auth.uid()
    )
    or public.is_admin()
  );
create policy "orders_buyer_insert" on public.orders
  for insert with check (buyer_id = auth.uid());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items_visible_with_order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or order_items.seller_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert_with_order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

create policy "order_tracking_events_read" on public.order_tracking_events
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.buyer_id = auth.uid()
          or exists (
            select 1 from public.order_items oi
            where oi.order_id = o.id and oi.seller_id = auth.uid()
          )
          or public.is_admin()
        )
    )
  );
create policy "order_tracking_events_admin_insert" on public.order_tracking_events
  for insert with check (public.is_admin() or auth.uid() = created_by);

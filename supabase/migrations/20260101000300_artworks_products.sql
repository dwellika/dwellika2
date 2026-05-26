-- ============================================================
-- 20260101000300_artworks_products
-- artworks, artwork_media, products, product_media
-- ============================================================

-- ---------- artworks ----------------------------------------------

create table public.artworks (
  id                     uuid primary key default gen_random_uuid(),
  artist_id              uuid not null references public.profiles(id) on delete cascade,
  title                  text not null,
  slug                   text not null,
  description            text,
  medium                 text,
  style                  text,
  subject                text,
  dimensions             jsonb,
  prints_available       boolean not null default false,
  custom_size_option     boolean not null default false,
  for_sale               boolean not null default false,
  price                  numeric(12, 2),
  currency               text not null default 'INR',
  edition_size           integer,
  status                 public.content_status not null default 'draft',
  ai_tags                jsonb not null default '{}'::jsonb,
  tags                   text[] not null default '{}',
  view_count             integer not null default 0,
  like_count             integer not null default 0,
  save_count             integer not null default 0,
  published_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (artist_id, slug)
);

create index artworks_artist_idx on public.artworks (artist_id);
create index artworks_status_idx on public.artworks (status);
create index artworks_for_sale_idx on public.artworks (for_sale) where status = 'approved';
create index artworks_tags_gin on public.artworks using gin (tags);

create trigger trg_artworks_updated
  before update on public.artworks
  for each row execute function public.set_updated_at();

create table public.artwork_media (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  uuid not null references public.artworks(id) on delete cascade,
  kind        public.media_kind not null,
  url         text not null,
  thumbnail_url text,
  width       integer,
  height      integer,
  position    integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index artwork_media_artwork_idx on public.artwork_media (artwork_id, position);

-- ---------- products (supplies / decor / wearing arts) -----------

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  category      public.product_category not null,
  title         text not null,
  slug          text not null,
  description   text,
  price         numeric(12, 2) not null,
  currency      text not null default 'INR',
  inventory     integer not null default 0,
  sku           text,
  tags          text[] not null default '{}',
  attributes    jsonb not null default '{}'::jsonb,
  status        public.content_status not null default 'draft',
  rating_avg    numeric(3, 2),
  rating_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (seller_id, slug)
);

create index products_seller_idx on public.products (seller_id);
create index products_category_idx on public.products (category, status);
create index products_tags_gin on public.products using gin (tags);

create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_media (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  kind        public.media_kind not null,
  url         text not null,
  thumbnail_url text,
  position    integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index product_media_product_idx on public.product_media (product_id, position);

-- ---------- RLS ---------------------------------------------------

alter table public.artworks enable row level security;
alter table public.artwork_media enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;

-- artworks
create policy "artworks_read_published_or_own" on public.artworks
  for select using (
    status = 'approved'
    or artist_id = auth.uid()
    or public.is_admin()
  );
create policy "artworks_artist_insert" on public.artworks
  for insert with check (artist_id = auth.uid());
create policy "artworks_artist_update" on public.artworks
  for update using (artist_id = auth.uid() or public.is_admin())
  with check (artist_id = auth.uid() or public.is_admin());
create policy "artworks_artist_delete" on public.artworks
  for delete using (artist_id = auth.uid() or public.is_admin());

-- artwork_media — visibility tracks the parent artwork
create policy "artwork_media_read" on public.artwork_media
  for select using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.status = 'approved' or a.artist_id = auth.uid() or public.is_admin())
    )
  );
create policy "artwork_media_write" on public.artwork_media
  for all using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.artist_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.artist_id = auth.uid() or public.is_admin())
    )
  );

-- products
create policy "products_read_published_or_own" on public.products
  for select using (
    status = 'approved'
    or seller_id = auth.uid()
    or public.is_admin()
  );
create policy "products_seller_insert" on public.products
  for insert with check (seller_id = auth.uid());
create policy "products_seller_update" on public.products
  for update using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());
create policy "products_seller_delete" on public.products
  for delete using (seller_id = auth.uid() or public.is_admin());

-- product_media
create policy "product_media_read" on public.product_media
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.status = 'approved' or p.seller_id = auth.uid() or public.is_admin())
    )
  );
create policy "product_media_write" on public.product_media
  for all using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.seller_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.seller_id = auth.uid() or public.is_admin())
    )
  );

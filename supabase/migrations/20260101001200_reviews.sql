-- ============================================================
-- 20260101001200_reviews
-- Reviews across artworks/products/workshops/sellers/artists.
-- ============================================================

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  reviewer_id   uuid not null references public.profiles(id) on delete cascade,
  target_kind   public.review_target not null,
  target_id     uuid not null,
  order_id      uuid references public.orders(id) on delete set null,
  rating        integer not null check (rating between 1 and 5),
  body          text,
  images        text[] not null default '{}',
  is_verified_purchase boolean not null default false,
  is_hidden     boolean not null default false,
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (reviewer_id, target_kind, target_id, order_id)
);

create index reviews_target_idx on public.reviews (target_kind, target_id, rating desc);
create index reviews_reviewer_idx on public.reviews (reviewer_id);

create trigger trg_reviews_updated
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "reviews_read_public" on public.reviews
  for select using (is_hidden = false or reviewer_id = auth.uid() or public.is_admin());
create policy "reviews_self_insert" on public.reviews
  for insert with check (reviewer_id = auth.uid());
create policy "reviews_self_update" on public.reviews
  for update using (reviewer_id = auth.uid() or public.is_admin())
  with check (reviewer_id = auth.uid() or public.is_admin());
create policy "reviews_self_delete" on public.reviews
  for delete using (reviewer_id = auth.uid() or public.is_admin());

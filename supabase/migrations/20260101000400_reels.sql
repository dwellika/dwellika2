-- ============================================================
-- 20260101000400_reels
-- Short-form vertical video posts.
-- ============================================================

create table public.reels (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.profiles(id) on delete cascade,
  video_url       text not null,
  thumbnail_url   text,
  caption         text,
  duration_sec    integer,
  width           integer,
  height          integer,
  artwork_id      uuid references public.artworks(id) on delete set null,
  product_id      uuid references public.products(id) on delete set null,
  tags            text[] not null default '{}',
  status          public.content_status not null default 'pending',
  view_count      integer not null default 0,
  like_count      integer not null default 0,
  comment_count   integer not null default 0,
  share_count     integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index reels_creator_idx on public.reels (creator_id);
create index reels_status_idx on public.reels (status, published_at desc);
create index reels_tags_gin on public.reels using gin (tags);

create trigger trg_reels_updated
  before update on public.reels
  for each row execute function public.set_updated_at();

alter table public.reels enable row level security;

create policy "reels_read_published_or_own" on public.reels
  for select using (
    status = 'approved'
    or creator_id = auth.uid()
    or public.is_admin()
  );
create policy "reels_creator_insert" on public.reels
  for insert with check (creator_id = auth.uid());
create policy "reels_creator_update" on public.reels
  for update using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
create policy "reels_creator_delete" on public.reels
  for delete using (creator_id = auth.uid() or public.is_admin());

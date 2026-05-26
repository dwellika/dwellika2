-- ============================================================
-- 20260101000500_social_graph
-- follows, likes, saves, comments.
-- ============================================================

-- ---------- follows ----------------------------------------------

create table public.follows (
  follower_id   uuid not null references public.profiles(id) on delete cascade,
  following_id  uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "follows_read_all" on public.follows for select using (true);
create policy "follows_self_insert" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "follows_self_delete" on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------- likes ------------------------------------------------

create table public.likes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  target_kind   public.reaction_target not null,
  target_id     uuid not null,
  created_at    timestamptz not null default now(),
  unique (user_id, target_kind, target_id)
);

create index likes_target_idx on public.likes (target_kind, target_id);

alter table public.likes enable row level security;

create policy "likes_read_all" on public.likes for select using (true);
create policy "likes_self_insert" on public.likes
  for insert with check (auth.uid() = user_id);
create policy "likes_self_delete" on public.likes
  for delete using (auth.uid() = user_id);

-- ---------- saves (collections / bookmarks) ----------------------

create table public.saves (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  target_kind   public.reaction_target not null,
  target_id     uuid not null,
  collection    text not null default 'default',
  created_at    timestamptz not null default now(),
  unique (user_id, target_kind, target_id, collection)
);

create index saves_user_idx on public.saves (user_id, collection);
create index saves_target_idx on public.saves (target_kind, target_id);

alter table public.saves enable row level security;

create policy "saves_owner_read" on public.saves
  for select using (auth.uid() = user_id);
create policy "saves_owner_write" on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- comments (thread-style) ------------------------------

create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  target_kind   public.reaction_target not null,
  target_id     uuid not null,
  parent_id     uuid references public.comments(id) on delete cascade,
  body          text not null,
  is_edited     boolean not null default false,
  is_hidden     boolean not null default false,
  like_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index comments_target_idx on public.comments (target_kind, target_id, created_at desc);
create index comments_user_idx on public.comments (user_id);

create trigger trg_comments_updated
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

create policy "comments_read" on public.comments
  for select using (is_hidden = false or user_id = auth.uid() or public.is_admin());
create policy "comments_self_insert" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "comments_self_update" on public.comments
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "comments_self_delete" on public.comments
  for delete using (auth.uid() = user_id or public.is_admin());

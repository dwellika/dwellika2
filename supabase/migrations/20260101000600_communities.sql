-- ============================================================
-- 20260101000600_communities
-- communities, members, posts, polls.
-- ============================================================

create table public.communities (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  description     text,
  cover_url       text,
  category        text,
  is_private      boolean not null default false,
  created_by      uuid references public.profiles(id),
  member_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index communities_category_idx on public.communities (category);

create trigger trg_communities_updated
  before update on public.communities
  for each row execute function public.set_updated_at();

create table public.community_members (
  community_id    uuid not null references public.communities(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            public.community_role not null default 'member',
  joined_at       timestamptz not null default now(),
  primary key (community_id, user_id)
);

create index community_members_user_idx on public.community_members (user_id);

create table public.community_posts (
  id              uuid primary key default gen_random_uuid(),
  community_id    uuid not null references public.communities(id) on delete cascade,
  author_id       uuid not null references public.profiles(id) on delete cascade,
  title           text,
  body            text,
  media           jsonb not null default '[]'::jsonb,
  status          public.content_status not null default 'approved',
  like_count      integer not null default 0,
  comment_count   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index community_posts_community_idx
  on public.community_posts (community_id, created_at desc);

create trigger trg_community_posts_updated
  before update on public.community_posts
  for each row execute function public.set_updated_at();

-- ---------- Polls -------------------------------------------------

create table public.polls (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references public.community_posts(id) on delete cascade,
  question        text not null,
  closes_at       timestamptz,
  created_by      uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now()
);

create table public.poll_options (
  id            uuid primary key default gen_random_uuid(),
  poll_id       uuid not null references public.polls(id) on delete cascade,
  label         text not null,
  position      integer not null default 0
);

create table public.poll_votes (
  poll_id       uuid not null references public.polls(id) on delete cascade,
  option_id     uuid not null references public.poll_options(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (poll_id, user_id)
);

-- ---------- RLS ---------------------------------------------------

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- communities are public for now; private flag for future use.
create policy "communities_read" on public.communities
  for select using (is_private = false or exists (
    select 1 from public.community_members m
    where m.community_id = id and m.user_id = auth.uid()
  ) or public.is_admin());
create policy "communities_admin_write" on public.communities
  for all using (public.is_admin()) with check (public.is_admin());

-- members
create policy "community_members_read" on public.community_members
  for select using (true);
create policy "community_members_self_join" on public.community_members
  for insert with check (auth.uid() = user_id);
create policy "community_members_self_leave" on public.community_members
  for delete using (auth.uid() = user_id or public.is_admin());

-- posts
create policy "community_posts_read" on public.community_posts
  for select using (
    status = 'approved'
    or author_id = auth.uid()
    or public.is_admin()
  );
create policy "community_posts_member_insert" on public.community_posts
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.community_members m
      where m.community_id = community_id and m.user_id = auth.uid()
    )
  );
create policy "community_posts_self_update" on public.community_posts
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "community_posts_self_delete" on public.community_posts
  for delete using (author_id = auth.uid() or public.is_admin());

-- polls + options public read
create policy "polls_read" on public.polls for select using (true);
create policy "polls_creator_write" on public.polls
  for all using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

create policy "poll_options_read" on public.poll_options for select using (true);
create policy "poll_options_creator_write" on public.poll_options
  for all using (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and (p.created_by = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and (p.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "poll_votes_read" on public.poll_votes for select using (true);
create policy "poll_votes_self_insert" on public.poll_votes
  for insert with check (auth.uid() = user_id);
create policy "poll_votes_self_delete" on public.poll_votes
  for delete using (auth.uid() = user_id);

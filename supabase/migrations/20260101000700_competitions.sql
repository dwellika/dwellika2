-- ============================================================
-- 20260101000700_competitions
-- competitions, submissions, votes, winners.
-- ============================================================

create type public.competition_status as enum (
  'draft', 'announced', 'submissions_open', 'voting',
  'jury_review', 'completed', 'cancelled'
);

create table public.competitions (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text,
  banner_url      text,
  rules           text,
  prize_pool      text,
  status          public.competition_status not null default 'draft',
  submissions_open_at  timestamptz,
  submissions_close_at timestamptz,
  voting_open_at  timestamptz,
  voting_close_at timestamptz,
  announces_at    timestamptz,
  category        text,
  created_by      uuid references public.profiles(id),
  submission_count  integer not null default 0,
  vote_count        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index competitions_status_idx on public.competitions (status);
create index competitions_close_idx on public.competitions (voting_close_at);

create trigger trg_competitions_updated
  before update on public.competitions
  for each row execute function public.set_updated_at();

create table public.competition_submissions (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  artist_id       uuid not null references public.profiles(id) on delete cascade,
  artwork_id      uuid references public.artworks(id) on delete set null,
  title           text not null,
  description     text,
  media_url       text not null,
  status          public.content_status not null default 'pending',
  vote_count      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (competition_id, artist_id)
);

create index competition_submissions_comp_idx
  on public.competition_submissions (competition_id, status);

create trigger trg_competition_submissions_updated
  before update on public.competition_submissions
  for each row execute function public.set_updated_at();

create table public.competition_votes (
  submission_id   uuid not null references public.competition_submissions(id) on delete cascade,
  voter_id        uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (submission_id, voter_id)
);

create table public.competition_winners (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  submission_id   uuid not null references public.competition_submissions(id) on delete cascade,
  rank            integer not null,
  prize           text,
  certificate_url text,
  announced_at    timestamptz not null default now(),
  unique (competition_id, rank)
);

-- ---------- RLS ---------------------------------------------------

alter table public.competitions enable row level security;
alter table public.competition_submissions enable row level security;
alter table public.competition_votes enable row level security;
alter table public.competition_winners enable row level security;

create policy "competitions_read" on public.competitions for select using (true);
create policy "competitions_admin_write" on public.competitions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "competition_submissions_read" on public.competition_submissions
  for select using (
    status = 'approved'
    or artist_id = auth.uid()
    or public.is_admin()
  );
create policy "competition_submissions_artist_insert" on public.competition_submissions
  for insert with check (artist_id = auth.uid());
create policy "competition_submissions_artist_update" on public.competition_submissions
  for update using (artist_id = auth.uid() or public.is_admin())
  with check (artist_id = auth.uid() or public.is_admin());
create policy "competition_submissions_admin_delete" on public.competition_submissions
  for delete using (public.is_admin());

create policy "competition_votes_read" on public.competition_votes for select using (true);
create policy "competition_votes_self_insert" on public.competition_votes
  for insert with check (auth.uid() = voter_id);
create policy "competition_votes_self_delete" on public.competition_votes
  for delete using (auth.uid() = voter_id);

create policy "competition_winners_read" on public.competition_winners for select using (true);
create policy "competition_winners_admin_write" on public.competition_winners
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 20260301000000_phase4_ai_certificates
-- pg_vector for semantic search + AI tagging
-- Course/workshop certificates
-- ============================================================

create extension if not exists "vector" with schema extensions;

-- ---------- Embedding columns ------------------------------------
-- 1536-d matches OpenAI text-embedding-3-small.
alter table public.artworks add column if not exists embedding extensions.vector(1536);
alter table public.products add column if not exists embedding extensions.vector(1536);

-- HNSW indexes for fast cosine-distance ANN search
do $$
begin
  if not exists (
    select 1 from pg_indexes where indexname = 'artworks_embedding_hnsw_idx'
  ) then
    execute 'create index artworks_embedding_hnsw_idx on public.artworks
             using hnsw (embedding extensions.vector_cosine_ops)';
  end if;
  if not exists (
    select 1 from pg_indexes where indexname = 'products_embedding_hnsw_idx'
  ) then
    execute 'create index products_embedding_hnsw_idx on public.products
             using hnsw (embedding extensions.vector_cosine_ops)';
  end if;
end$$;

-- ---------- Semantic search RPC ----------------------------------
create or replace function public.search_artworks(
  query_embedding extensions.vector(1536),
  match_count integer default 20,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  title text,
  slug text,
  artist_id uuid,
  medium text,
  price numeric,
  currency text,
  for_sale boolean,
  primary_url text,
  similarity float
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    a.id,
    a.title,
    a.slug,
    a.artist_id,
    a.medium,
    a.price,
    a.currency,
    a.for_sale,
    (
      select url from public.artwork_media m
      where m.artwork_id = a.id
      order by m.is_primary desc, m.position asc
      limit 1
    ) as primary_url,
    1 - (a.embedding <=> query_embedding) as similarity
  from public.artworks a
  where a.status = 'approved'
    and a.embedding is not null
    and (1 - (a.embedding <=> query_embedding)) > match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.search_artworks(extensions.vector(1536), integer, float)
  to authenticated, anon;

create or replace function public.search_products(
  query_embedding extensions.vector(1536),
  match_count integer default 20,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  title text,
  slug text,
  seller_id uuid,
  category public.product_category,
  price numeric,
  currency text,
  primary_url text,
  similarity float
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    p.id,
    p.title,
    p.slug,
    p.seller_id,
    p.category,
    p.price,
    p.currency,
    (
      select url from public.product_media m
      where m.product_id = p.id
      order by m.is_primary desc, m.position asc
      limit 1
    ) as primary_url,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where p.status = 'approved'
    and p.embedding is not null
    and (1 - (p.embedding <=> query_embedding)) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.search_products(extensions.vector(1536), integer, float)
  to authenticated, anon;

-- "More like this" — find artworks similar to a given artwork
create or replace function public.similar_artworks(
  source_id uuid,
  match_count integer default 8
)
returns table (
  id uuid,
  title text,
  slug text,
  artist_id uuid,
  price numeric,
  currency text,
  primary_url text,
  similarity float
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with source as (
    select embedding from public.artworks where id = source_id
  )
  select
    a.id,
    a.title,
    a.slug,
    a.artist_id,
    a.price,
    a.currency,
    (
      select url from public.artwork_media m
      where m.artwork_id = a.id
      order by m.is_primary desc, m.position asc
      limit 1
    ) as primary_url,
    1 - (a.embedding <=> (select embedding from source)) as similarity
  from public.artworks a
  where a.status = 'approved'
    and a.id <> source_id
    and a.embedding is not null
    and (select embedding from source) is not null
  order by a.embedding <=> (select embedding from source)
  limit match_count;
$$;

grant execute on function public.similar_artworks(uuid, integer) to authenticated, anon;

-- ---------- Certificates -----------------------------------------
create table if not exists public.course_certificates (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  issued_at     timestamptz not null default now(),
  certificate_no text not null unique default ('DWK-CERT-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  metadata      jsonb not null default '{}'::jsonb,
  unique (course_id, user_id)
);

alter table public.course_certificates enable row level security;

create policy "course_certificates_self_read" on public.course_certificates
  for select using (user_id = auth.uid() or public.is_admin());
create policy "course_certificates_admin_write" on public.course_certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Lesson progress --------------------------------------
create table if not exists public.lesson_progress (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  lesson_id     uuid not null references public.course_lessons(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  completed     boolean not null default false,
  completed_at  timestamptz,
  watched_sec   integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress_self" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: when all lessons in a course are completed by a user,
-- update enrollment.progress=100, completed_at, and award certificate.
create or replace function public.maybe_complete_course()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total integer;
  v_done integer;
begin
  if new.completed = false then return new; end if;

  select count(*) into v_total
    from public.course_lessons where course_id = new.course_id;

  select count(*) into v_done
    from public.lesson_progress
    where user_id = new.user_id and course_id = new.course_id and completed = true;

  if v_total > 0 then
    update public.course_enrollments
      set progress = least(100, (v_done::numeric / v_total::numeric) * 100),
          completed_at = case when v_done >= v_total then now() else completed_at end
      where user_id = new.user_id and course_id = new.course_id;

    if v_done >= v_total then
      insert into public.course_certificates (course_id, user_id)
      values (new.course_id, new.user_id)
      on conflict (course_id, user_id) do nothing;

      -- XP + completion notification
      perform public.award_xp(new.user_id, 1000, 'course_completed');
      insert into public.notifications (user_id, kind, title, body, action_url)
      values (
        new.user_id,
        'system',
        'You completed a course',
        'Your certificate is ready.',
        '/courses/' || (select slug from public.courses where id = new.course_id)
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_maybe_complete_course on public.lesson_progress;
create trigger trg_maybe_complete_course
  after insert or update on public.lesson_progress
  for each row execute function public.maybe_complete_course();

-- ============================================================
-- 20260301000100_search_with_usernames
-- Extend search RPCs to return artist_username / seller_username
-- so the UI can link directly to /artworks/[username]/[slug].
-- ============================================================

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
  artist_username text,
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
    p.username::text as artist_username,
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
  join public.profiles p on p.id = a.artist_id
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
  seller_username text,
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
    pr.id,
    pr.title,
    pr.slug,
    pr.seller_id,
    p.username::text as seller_username,
    pr.category,
    pr.price,
    pr.currency,
    (
      select url from public.product_media m
      where m.product_id = pr.id
      order by m.is_primary desc, m.position asc
      limit 1
    ) as primary_url,
    1 - (pr.embedding <=> query_embedding) as similarity
  from public.products pr
  join public.profiles p on p.id = pr.seller_id
  where pr.status = 'approved'
    and pr.embedding is not null
    and (1 - (pr.embedding <=> query_embedding)) > match_threshold
  order by pr.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.search_products(extensions.vector(1536), integer, float)
  to authenticated, anon;

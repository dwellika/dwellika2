-- ============================================================
-- 20260101001700_storage_buckets
-- Storage buckets + policies for avatars, covers, artwork media,
-- product media, reels, and verification docs.
-- ============================================================

-- Buckets ----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',  'avatars',  true,  5  * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/avif']),
  ('covers',   'covers',   true,  10 * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/avif']),
  ('artworks', 'artworks', true,  25 * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/avif']),
  ('products', 'products', true,  15 * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/avif']),
  ('reels',    'reels',    true,  100 * 1024 * 1024, array['video/mp4','video/webm','video/quicktime']),
  ('verification', 'verification', false, 10 * 1024 * 1024,
    array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Helper: read uid prefix from path ('<uid>/...')
-- All write policies require the first path segment to equal auth.uid().

-- avatars + covers — public read, owner write
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');
create policy "covers_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "covers_owner_update" on storage.objects
  for update using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "covers_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'covers'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

-- artworks media — public read, owner write
create policy "artworks_public_read" on storage.objects
  for select using (bucket_id = 'artworks');
create policy "artworks_owner_all" on storage.objects
  for all using (
    bucket_id = 'artworks'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  ) with check (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- products media — public read, owner write
create policy "products_public_read" on storage.objects
  for select using (bucket_id = 'products');
create policy "products_owner_all" on storage.objects
  for all using (
    bucket_id = 'products'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  ) with check (
    bucket_id = 'products'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- reels — public read, owner write
create policy "reels_public_read" on storage.objects
  for select using (bucket_id = 'reels');
create policy "reels_owner_all" on storage.objects
  for all using (
    bucket_id = 'reels'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  ) with check (
    bucket_id = 'reels'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- verification — owner + admin read, owner write
-- Storage upsert requires INSERT + SELECT + UPDATE, so we grant all three.
create policy "verification_owner_or_admin_read" on storage.objects
  for select using (
    bucket_id = 'verification'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
create policy "verification_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'verification'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "verification_owner_update" on storage.objects
  for update using (
    bucket_id = 'verification'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'verification'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "verification_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'verification' and public.is_admin()
  );

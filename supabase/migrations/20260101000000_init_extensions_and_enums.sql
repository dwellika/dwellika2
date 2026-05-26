-- ============================================================
-- 20260101000000_init_extensions_and_enums
-- Extensions, enums, and shared helper functions.
-- ============================================================

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "citext" with schema extensions;

-- ---------- Enums --------------------------------------------------
create type public.app_role as enum ('super_admin', 'admin', 'artist', 'seller', 'user');
create type public.artist_tier as enum ('beginner', 'creator', 'professional', 'master', 'legend');
create type public.user_level as enum ('explorer', 'collector', 'patron', 'ambassador');
create type public.content_status as enum ('draft', 'pending', 'approved', 'rejected', 'hidden');
create type public.order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'returned', 'cancelled'
);
create type public.dispute_status as enum ('open', 'reviewing', 'resolved', 'rejected');
create type public.product_category as enum ('home_decor', 'art_supplies', 'wearing_arts');
create type public.reaction_target as enum ('artwork', 'reel', 'post', 'product', 'comment');
create type public.review_target as enum ('artwork', 'product', 'workshop', 'seller', 'artist');
create type public.community_role as enum ('member', 'moderator', 'owner');
create type public.announcement_category as enum ('event', 'workshop', 'course', 'notification');
create type public.testimonial_group as enum ('artist', 'seller', 'buyer');
create type public.media_kind as enum ('image', 'video');
create type public.notification_kind as enum (
  'like', 'comment', 'follow', 'mention',
  'order_update', 'competition_update', 'community_invite', 'system'
);

-- ---------- Shared helpers ----------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- We attach this in later migrations:
-- create trigger trg_set_updated_at before update on <table>
--   for each row execute function public.set_updated_at();

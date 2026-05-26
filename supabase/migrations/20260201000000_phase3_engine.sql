-- ============================================================
-- 20260201000000_phase3_engine
-- Gamification engine: XP / level / badge functions + triggers
-- Chat storage bucket + helper views.
-- ============================================================

-- ---------- chat bucket ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat',
  'chat',
  false,
  20 * 1024 * 1024,
  array[
    'image/png','image/jpeg','image/webp','image/avif',
    'application/pdf',
    'audio/mpeg','audio/webm','audio/ogg','audio/mp4','audio/wav'
  ]
)
on conflict (id) do nothing;

-- Storage policies: participants of a chat can read/write objects
-- under <chat_id>/...
-- We rely on public.is_chat_participant(chat_id) defined in 000900.

create policy "chat_participants_read" on storage.objects
  for select using (
    bucket_id = 'chat'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "chat_participants_insert" on storage.objects
  for insert with check (
    bucket_id = 'chat'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "chat_participants_update" on storage.objects
  for update using (
    bucket_id = 'chat'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  ) with check (
    bucket_id = 'chat'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  );

-- ---------- chat unread counts view ------------------------------

create or replace view public.chat_unread_counts
with (security_invoker = true) as
select
  cp.chat_id,
  cp.user_id,
  count(m.id) as unread
from public.chat_participants cp
left join public.chat_messages m
  on m.chat_id = cp.chat_id
  and m.sender_id <> cp.user_id
  and (cp.last_read_at is null or m.created_at > cp.last_read_at)
  and m.is_deleted = false
group by cp.chat_id, cp.user_id;

grant select on public.chat_unread_counts to authenticated;

-- Trigger to keep chats.last_message_at fresh
create or replace function public.touch_chat_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.chats set last_message_at = new.created_at where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_chat on public.chat_messages;
create trigger trg_touch_chat
  after insert on public.chat_messages
  for each row execute function public.touch_chat_on_message();

-- ---------- award_xp ---------------------------------------------
-- thresholds: 0..999 explorer, 1000..4999 collector,
-- 5000..24999 patron, 25000+ ambassador
create or replace function public.award_xp(
  p_user_id uuid,
  p_delta integer,
  p_reason text default null
)
returns public.user_level
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_xp integer;
  v_level public.user_level;
begin
  insert into public.user_levels (user_id, xp, level)
  values (p_user_id, greatest(p_delta, 0), 'explorer')
  on conflict (user_id) do update
    set xp = public.user_levels.xp + p_delta,
        updated_at = now()
  returning xp, level into v_xp, v_level;

  -- Promote level if a threshold is crossed
  if v_xp >= 25000 and v_level <> 'ambassador' then
    update public.user_levels set level = 'ambassador' where user_id = p_user_id;
    v_level := 'ambassador';
  elsif v_xp >= 5000 and v_level not in ('patron','ambassador') then
    update public.user_levels set level = 'patron' where user_id = p_user_id;
    v_level := 'patron';
  elsif v_xp >= 1000 and v_level = 'explorer' then
    update public.user_levels set level = 'collector' where user_id = p_user_id;
    v_level := 'collector';
  end if;

  return v_level;
end;
$$;

grant execute on function public.award_xp(uuid, integer, text) to authenticated;

-- ---------- award_badge ------------------------------------------
create or replace function public.award_badge(
  p_user_id uuid,
  p_slug text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_badge_id uuid;
  v_already boolean;
begin
  select id into v_badge_id from public.badges where slug = p_slug;
  if v_badge_id is null then
    return false;
  end if;

  select exists(
    select 1 from public.user_badges
    where user_id = p_user_id and badge_id = v_badge_id
  ) into v_already;

  if v_already then
    return false;
  end if;

  insert into public.user_badges (user_id, badge_id)
  values (p_user_id, v_badge_id);

  -- side-effect: notify
  insert into public.notifications (user_id, kind, title, body, payload, actor_id, action_url)
  select
    p_user_id,
    'system'::public.notification_kind,
    'New badge unlocked: ' || b.name,
    b.description,
    jsonb_build_object('badge_slug', b.slug),
    null,
    '/u/' || (select username from public.profiles where id = p_user_id)
  from public.badges b where b.id = v_badge_id;

  return true;
end;
$$;

grant execute on function public.award_badge(uuid, text) to authenticated;

-- ---------- on_review_submitted ----------------------------------
create or replace function public.on_review_submitted()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.award_xp(new.reviewer_id, 50, 'review');
  -- first review badge
  perform public.award_badge(new.reviewer_id, 'first_review');
  return new;
end;
$$;

drop trigger if exists trg_on_review_submitted on public.reviews;
create trigger trg_on_review_submitted
  after insert on public.reviews
  for each row execute function public.on_review_submitted();

-- ---------- on_order_confirmed -----------------------------------
-- Awards XP + first_sale badge to every seller whose item is in
-- the order when the order flips to 'confirmed'.
create or replace function public.on_order_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r record;
begin
  if new.status = 'confirmed' and (old.status is distinct from 'confirmed') then
    -- Buyer XP
    perform public.award_xp(new.buyer_id, 100, 'purchase');
    -- Each unique seller in the order gets XP + maybe first_sale
    for r in
      select distinct seller_id, sum(unit_price * quantity) as gross
      from public.order_items
      where order_id = new.id and seller_id is not null
      group by seller_id
    loop
      perform public.award_xp(r.seller_id, 500 + (r.gross / 100)::int, 'sale');
      perform public.award_badge(r.seller_id, 'first_sale');
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_on_order_confirmed on public.orders;
create trigger trg_on_order_confirmed
  after update on public.orders
  for each row execute function public.on_order_confirmed();

-- ---------- on_follow milestones ---------------------------------
create or replace function public.on_follow_inserted()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count bigint;
begin
  select count(*) into v_count
  from public.follows
  where following_id = new.following_id;

  if v_count = 100 then
    perform public.award_badge(new.following_id, '100_followers');
  elsif v_count = 1000 then
    perform public.award_badge(new.following_id, '1k_followers');
  elsif v_count = 10000 then
    perform public.award_badge(new.following_id, '10k_followers');
  end if;

  -- Notify the followed user
  insert into public.notifications (user_id, kind, title, body, actor_id, action_url)
  values (
    new.following_id,
    'follow',
    'New follower',
    null,
    new.follower_id,
    '/u/' || (select username from public.profiles where id = new.follower_id)
  );

  return new;
end;
$$;

drop trigger if exists trg_on_follow_inserted on public.follows;
create trigger trg_on_follow_inserted
  after insert on public.follows
  for each row execute function public.on_follow_inserted();

-- ---------- on_competition_winner --------------------------------
create or replace function public.on_competition_winner_inserted()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_artist uuid;
begin
  select artist_id into v_artist
  from public.competition_submissions
  where id = new.submission_id;

  if v_artist is not null then
    perform public.award_xp(v_artist, case new.rank
                                       when 1 then 2000
                                       when 2 then 1000
                                       when 3 then 500
                                       else 200 end, 'competition_winner');
    perform public.award_badge(v_artist, 'competition_winner');
    insert into public.notifications (user_id, kind, title, body, action_url, payload)
    values (
      v_artist,
      'competition_update',
      'You won a competition!',
      'Congratulations on placing in the competition.',
      '/competitions/' || (select slug from public.competitions where id = new.competition_id),
      jsonb_build_object('rank', new.rank)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_on_competition_winner_inserted on public.competition_winners;
create trigger trg_on_competition_winner_inserted
  after insert on public.competition_winners
  for each row execute function public.on_competition_winner_inserted();

-- ---------- on_like notification ---------------------------------
-- Inserts a notification to the target's owner when an artwork or
-- reel is liked. Not configured for posts/comments to keep noise low.
create or replace function public.on_like_inserted()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner uuid;
  v_title text;
  v_url text;
begin
  if new.target_kind = 'artwork' then
    select artist_id into v_owner from public.artworks where id = new.target_id;
    v_title := 'Your artwork got a new like';
    v_url := '/artworks/' || new.target_id;
  elsif new.target_kind = 'reel' then
    select creator_id into v_owner from public.reels where id = new.target_id;
    v_title := 'Your reel got a new like';
    v_url := '/reels#' || new.target_id;
  end if;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, kind, title, actor_id, action_url)
    values (v_owner, 'like', v_title, new.user_id, v_url);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_like_inserted on public.likes;
create trigger trg_on_like_inserted
  after insert on public.likes
  for each row execute function public.on_like_inserted();

-- ---------- on_comment notification -----------------------------
create or replace function public.on_comment_inserted()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner uuid;
  v_title text;
  v_url text;
begin
  if new.target_kind = 'artwork' then
    select artist_id into v_owner from public.artworks where id = new.target_id;
    v_title := 'New comment on your artwork';
    v_url := '/artworks/' || new.target_id;
  elsif new.target_kind = 'reel' then
    select creator_id into v_owner from public.reels where id = new.target_id;
    v_title := 'New comment on your reel';
    v_url := '/reels#' || new.target_id;
  elsif new.target_kind = 'post' then
    select author_id into v_owner from public.community_posts where id = new.target_id;
    v_title := 'New comment on your post';
    v_url := '/community-posts/' || new.target_id;
  end if;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, kind, title, body, actor_id, action_url)
    values (v_owner, 'comment', v_title, substring(new.body for 120), new.user_id, v_url);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_comment_inserted on public.comments;
create trigger trg_on_comment_inserted
  after insert on public.comments
  for each row execute function public.on_comment_inserted();

-- ---------- Seed default badges ----------------------------------
insert into public.badges (slug, name, description, category, tier)
values
  ('first_review',       'First Review',          'Shared your first review.',                 'community', 'bronze'),
  ('first_sale',         'First Sale',            'Made your first sale on Dwellika.',         'commerce',  'bronze'),
  ('verified_artist',    'Verified Artist',       'Hand-verified by the Dwellika team.',       'identity',  'silver'),
  ('verified_seller',    'Verified Seller',       'Hand-verified seller, documents on file.',  'identity',  'silver'),
  ('100_followers',      '100 Followers',         'Crossed 100 followers.',                    'growth',    'bronze'),
  ('1k_followers',       '1k Followers',          'Crossed 1,000 followers.',                  'growth',    'silver'),
  ('10k_followers',      '10k Followers',         'Crossed 10,000 followers.',                 'growth',    'gold'),
  ('competition_winner', 'Competition Winner',    'Placed in a Dwellika competition.',         'achievement', 'gold')
on conflict (slug) do nothing;

-- ---------- Realtime publication --------------------------------
-- Add the realtime-relevant tables to the supabase_realtime publication
-- so postgres_changes subscriptions work. (No-op if already added.)
do $$
begin
  begin alter publication supabase_realtime add table public.chat_messages; exception when others then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when others then null; end;
  begin alter publication supabase_realtime add table public.community_posts; exception when others then null; end;
end$$;

-- ============================================================
-- 20260101000900_chat
-- chats, chat_participants, chat_messages.
-- ============================================================

create type public.chat_kind as enum ('direct', 'group', 'order');

create table public.chats (
  id              uuid primary key default gen_random_uuid(),
  kind            public.chat_kind not null default 'direct',
  title           text,
  order_id        uuid, -- foreign key added after orders migration
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

create index chats_last_message_idx on public.chats (last_message_at desc);

create table public.chat_participants (
  chat_id       uuid not null references public.chats(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  last_read_at  timestamptz,
  primary key (chat_id, user_id)
);

create index chat_participants_user_idx on public.chat_participants (user_id);

create table public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  chat_id       uuid not null references public.chats(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  body          text,
  attachments   jsonb not null default '[]'::jsonb,
  voice_url     text,
  is_edited     boolean not null default false,
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index chat_messages_chat_idx on public.chat_messages (chat_id, created_at desc);

-- helper: am I a participant of this chat?
create or replace function public.is_chat_participant(p_chat_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.chat_participants
    where chat_id = p_chat_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_chat_participant(uuid) to authenticated;

-- ---------- RLS ---------------------------------------------------

alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;

create policy "chats_participant_read" on public.chats
  for select using (public.is_chat_participant(id) or public.is_admin());
create policy "chats_authenticated_insert" on public.chats
  for insert with check (auth.uid() is not null);

create policy "chat_participants_self_read" on public.chat_participants
  for select using (public.is_chat_participant(chat_id) or public.is_admin());
create policy "chat_participants_self_join" on public.chat_participants
  for insert with check (auth.uid() = user_id);
create policy "chat_participants_self_leave" on public.chat_participants
  for delete using (auth.uid() = user_id or public.is_admin());

create policy "chat_messages_participant_read" on public.chat_messages
  for select using (public.is_chat_participant(chat_id) or public.is_admin());
create policy "chat_messages_participant_insert" on public.chat_messages
  for insert with check (
    auth.uid() = sender_id
    and public.is_chat_participant(chat_id)
  );
create policy "chat_messages_sender_update" on public.chat_messages
  for update using (sender_id = auth.uid()) with check (sender_id = auth.uid());
create policy "chat_messages_sender_delete" on public.chat_messages
  for delete using (sender_id = auth.uid() or public.is_admin());

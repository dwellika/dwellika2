-- ============================================================
-- 20260101000200_seller_verification
-- Verification documents queue for seller onboarding.
-- ============================================================

create type public.verification_doc_kind as enum (
  'pan', 'aadhaar', 'gst', 'address_proof', 'bank_details', 'other'
);

create type public.verification_status as enum (
  'pending', 'approved', 'rejected', 'resubmit'
);

create table public.seller_verification_docs (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  doc_kind      public.verification_doc_kind not null,
  storage_path  text not null,
  status        public.verification_status not null default 'pending',
  notes         text,
  reviewed_by   uuid references public.profiles(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index seller_verification_docs_seller_idx
  on public.seller_verification_docs (seller_id);
create index seller_verification_docs_status_idx
  on public.seller_verification_docs (status);

create trigger trg_seller_verification_docs_updated
  before update on public.seller_verification_docs
  for each row execute function public.set_updated_at();

alter table public.seller_verification_docs enable row level security;

create policy "verification_owner_read" on public.seller_verification_docs
  for select using (auth.uid() = seller_id or public.is_admin());
create policy "verification_owner_insert" on public.seller_verification_docs
  for insert with check (auth.uid() = seller_id);
create policy "verification_admin_update" on public.seller_verification_docs
  for update using (public.is_admin()) with check (public.is_admin());
create policy "verification_owner_delete" on public.seller_verification_docs
  for delete using (auth.uid() = seller_id or public.is_admin());

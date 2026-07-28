-- ============================================================
-- 057: System photo before/after comparison pairs
-- Backs the Systems Profile > Gallery view. A pair links two image
-- documents (from property_system_documents) for the same system as a
-- "before" and "after", rendered as an interactive comparison slider.
-- This migration is idempotent — safe to re-run.
-- ============================================================

create table if not exists public.system_photo_pairs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  system_id uuid not null references public.property_systems(id) on delete cascade,
  before_doc_id uuid not null references public.property_system_documents(id) on delete cascade,
  after_doc_id uuid not null references public.property_system_documents(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  constraint system_photo_pairs_pkey primary key (id)
);

create index if not exists system_photo_pairs_user_idx on public.system_photo_pairs (user_id);
create index if not exists system_photo_pairs_system_idx on public.system_photo_pairs (system_id);

-- ============================================================
-- Row Level Security — owner-scoped (auth.uid() = user_id)
-- ============================================================
alter table public.system_photo_pairs enable row level security;

drop policy if exists "Users can view own photo pairs" on public.system_photo_pairs;
create policy "Users can view own photo pairs"
  on public.system_photo_pairs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own photo pairs" on public.system_photo_pairs;
create policy "Users can insert own photo pairs"
  on public.system_photo_pairs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own photo pairs" on public.system_photo_pairs;
create policy "Users can update own photo pairs"
  on public.system_photo_pairs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own photo pairs" on public.system_photo_pairs;
create policy "Users can delete own photo pairs"
  on public.system_photo_pairs for delete
  using (auth.uid() = user_id);

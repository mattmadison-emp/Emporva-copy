-- ============================================================
-- 059: General home photos gallery (Overview tab)
--
-- Backs the new "Home Photos" gallery on the homeowner dashboard
-- Overview tab — general photos of the home (exterior, rooms, yard),
-- separate from per-system photos. Images live in the existing
-- 'property-photos' bucket under {user_id}/home/{file} (created in
-- migration 056), served via signed URLs.
--
--   home_photos        — one row per uploaded general home photo
--   home_photo_pairs   — links two home_photos as before / after,
--                        rendered as an interactive comparison slider
--
-- Idempotent — safe to re-run. Run in the Supabase SQL editor.
-- ============================================================

create table if not exists public.home_photos (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  name text,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint home_photos_pkey primary key (id)
);

create index if not exists home_photos_user_idx on public.home_photos (user_id);

create table if not exists public.home_photo_pairs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  before_photo_id uuid not null references public.home_photos(id) on delete cascade,
  after_photo_id uuid not null references public.home_photos(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  constraint home_photo_pairs_pkey primary key (id)
);

create index if not exists home_photo_pairs_user_idx on public.home_photo_pairs (user_id);

-- ============================================================
-- Row Level Security — owner-scoped (auth.uid() = user_id)
-- ============================================================
alter table public.home_photos enable row level security;

drop policy if exists "Users can view own home photos" on public.home_photos;
create policy "Users can view own home photos"
  on public.home_photos for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own home photos" on public.home_photos;
create policy "Users can insert own home photos"
  on public.home_photos for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own home photos" on public.home_photos;
create policy "Users can update own home photos"
  on public.home_photos for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own home photos" on public.home_photos;
create policy "Users can delete own home photos"
  on public.home_photos for delete
  using (auth.uid() = user_id);

alter table public.home_photo_pairs enable row level security;

drop policy if exists "Users can view own home photo pairs" on public.home_photo_pairs;
create policy "Users can view own home photo pairs"
  on public.home_photo_pairs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own home photo pairs" on public.home_photo_pairs;
create policy "Users can insert own home photo pairs"
  on public.home_photo_pairs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own home photo pairs" on public.home_photo_pairs;
create policy "Users can update own home photo pairs"
  on public.home_photo_pairs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own home photo pairs" on public.home_photo_pairs;
create policy "Users can delete own home photo pairs"
  on public.home_photo_pairs for delete
  using (auth.uid() = user_id);

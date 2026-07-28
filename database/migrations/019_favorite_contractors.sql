-- ============================================================
-- Favorite contractors - tracks which contractors a user has saved
-- ============================================================
create table public.favorite_contractors (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contractor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorite_contractors_pkey primary key (id),
  constraint favorite_contractors_unique unique (user_id, contractor_id)
);

create index favorite_contractors_user_idx on public.favorite_contractors (user_id);
create index favorite_contractors_contractor_idx on public.favorite_contractors (contractor_id);

-- RLS
alter table public.favorite_contractors enable row level security;

create policy "Users can view own favorites"
  on public.favorite_contractors for select
  using (auth.uid() = user_id);

create policy "Users can add favorites"
  on public.favorite_contractors for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove favorites"
  on public.favorite_contractors for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Activity log (scoped to property/profile, not global)
-- ============================================================
create table public.activity_log (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  homeowner_profile_id uuid references public.homeowner_profiles(id) on delete cascade,
  multi_unit_profile_id uuid references public.multi_unit_profiles(id) on delete cascade,
  contractor_profile_id uuid references public.contractor_profiles(id) on delete cascade,
  action text not null,
  description text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  constraint activity_log_pkey primary key (id)
);

-- Index for fast lookups by property
create index activity_log_homeowner_idx on public.activity_log (homeowner_profile_id, created_at desc);
create index activity_log_multi_unit_idx on public.activity_log (multi_unit_profile_id, created_at desc);
create index activity_log_contractor_idx on public.activity_log (contractor_profile_id, created_at desc);

-- RLS
alter table public.activity_log enable row level security;

create policy "Users can view own activity"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

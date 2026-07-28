-- ============================================================
-- 022: Seasonal task completions
-- Tracks each time a homeowner completes a seasonal maintenance
-- task. Multiple completions per task are expected (yearly).
-- ============================================================

create table public.seasonal_task_completions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,

  -- Task identification
  task_id text not null,           -- e.g. 'sp-hvac1'
  task_title text not null,        -- denormalized for history readability
  season text not null check (season in ('spring', 'summer', 'fall', 'winter')),
  year integer not null,           -- e.g. 2026

  -- Completion details
  completed_at timestamptz not null default now(),
  notes text,

  created_at timestamptz not null default now(),
  constraint seasonal_task_completions_pkey primary key (id)
);

-- ============================================================
-- Indexes
-- ============================================================
create index stc_user_idx on public.seasonal_task_completions (user_id);
create index stc_property_idx on public.seasonal_task_completions (property_id);
create index stc_task_season_year_idx on public.seasonal_task_completions (user_id, task_id, season, year);
create index stc_completed_at_idx on public.seasonal_task_completions (completed_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.seasonal_task_completions enable row level security;

create policy "Users can view own completions"
  on public.seasonal_task_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.seasonal_task_completions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own completions"
  on public.seasonal_task_completions for delete
  using (auth.uid() = user_id);

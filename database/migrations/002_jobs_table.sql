-- ============================================================
-- Jobs table
-- ============================================================
create table public.jobs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  homeowner_profile_id uuid references public.homeowner_profiles(id) on delete set null,
  multi_unit_profile_id uuid references public.multi_unit_profiles(id) on delete set null,

  -- Job details
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  budget_range text,
  timeline text,
  photos text[] not null default '{}',

  -- Status tracking
  status text not null default 'open' check (status in ('open', 'in-progress', 'completed', 'cancelled')),
  quotes_received integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_pkey primary key (id)
);

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.jobs enable row level security;

-- Job owners can manage their own jobs
create policy "Users can view own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Contractors can view open jobs (for marketplace)
create policy "Contractors can view open jobs"
  on public.jobs for select
  using (status = 'open');

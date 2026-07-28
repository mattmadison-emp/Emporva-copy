-- ============================================================
-- 025: Home Valuation tables
-- Tracks property value, mortgage details, value history,
-- and home improvements with ROI tracking.
-- ============================================================

-- 1:1 with property — purchase/mortgage/current value
create table public.property_valuations (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Purchase info
  purchase_price numeric(12,2),
  purchase_date date,

  -- Current value
  current_value numeric(12,2),
  value_last_updated timestamptz,

  -- Mortgage details
  mortgage_original_amount numeric(12,2),
  mortgage_current_balance numeric(12,2),
  mortgage_interest_rate numeric(5,3),
  mortgage_term_years integer,
  mortgage_monthly_payment numeric(10,2),
  mortgage_start_date date,
  mortgage_extra_payment numeric(10,2) default 0,
  mortgage_lender text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_valuations_pkey primary key (id),
  constraint property_valuations_property_unique unique (property_id)
);

create trigger property_valuations_updated_at
  before update on public.property_valuations
  for each row execute function public.update_updated_at();

-- Value snapshots over time (for the chart)
create table public.property_value_history (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  recorded_date date not null,
  value numeric(12,2) not null,
  label text,
  source text default 'manual' check (source in ('manual', 'appraisal', 'system')),

  created_at timestamptz not null default now(),
  constraint property_value_history_pkey primary key (id)
);

-- Home improvements with cost/value tracking
create table public.property_improvements (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id),

  name text not null,
  description text,
  completed_date date,
  cost numeric(10,2),
  estimated_value_add numeric(10,2),
  category text check (category in ('Major Renovation', 'Minor Update', 'Exterior', 'Systems', 'Outdoor', 'Interior', 'Other')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_improvements_pkey primary key (id)
);

create trigger property_improvements_updated_at
  before update on public.property_improvements
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index pv_property_idx on public.property_valuations (property_id);
create index pv_user_idx on public.property_valuations (user_id);

create index pvh_property_idx on public.property_value_history (property_id);
create index pvh_user_idx on public.property_value_history (user_id);
create index pvh_date_idx on public.property_value_history (recorded_date);

create index pi_property_idx on public.property_improvements (property_id);
create index pi_user_idx on public.property_improvements (user_id);
create index pi_date_idx on public.property_improvements (completed_date);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.property_valuations enable row level security;
alter table public.property_value_history enable row level security;
alter table public.property_improvements enable row level security;

-- property_valuations
create policy "Users can view own valuations"
  on public.property_valuations for select using (auth.uid() = user_id);
create policy "Users can insert own valuations"
  on public.property_valuations for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own valuations"
  on public.property_valuations for update using (auth.uid() = user_id);

-- property_value_history
create policy "Users can view own value history"
  on public.property_value_history for select using (auth.uid() = user_id);
create policy "Users can insert own value history"
  on public.property_value_history for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own value history"
  on public.property_value_history for delete using (auth.uid() = user_id);

-- property_improvements
create policy "Users can view own improvements"
  on public.property_improvements for select using (auth.uid() = user_id);
create policy "Users can insert own improvements"
  on public.property_improvements for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own improvements"
  on public.property_improvements for update using (auth.uid() = user_id);
create policy "Users can delete own improvements"
  on public.property_improvements for delete using (auth.uid() = user_id);

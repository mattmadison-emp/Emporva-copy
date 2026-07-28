-- ============================================================
-- Utility Bills & Readings
-- ============================================================
-- Stores uploaded utility bills (with AI-extracted data) and
-- manual meter readings entered by homeowners.
-- ============================================================

-- ----- Utility Bills (uploaded documents) --------------------
create table if not exists public.utility_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,

  -- File metadata
  file_name text not null,
  file_path text not null,          -- storage path in 'utility-bills' bucket
  file_type text,                   -- mime type e.g. image/jpeg, application/pdf

  -- AI-extracted fields (nullable until analysis completes)
  utility_type text,                -- 'electric', 'gas', 'water', 'sewer', 'trash', 'internet', 'other'
  provider text,                    -- utility company name
  account_number text,              -- masked or full account #
  billing_period_start date,
  billing_period_end date,
  usage_amount numeric,             -- usage quantity
  usage_unit text,                  -- 'kWh', 'therms', 'gallons', 'ccf', etc.
  total_cost numeric,               -- total bill amount in dollars
  previous_usage numeric,           -- prior period usage if shown on bill
  previous_cost numeric,            -- prior period cost if shown on bill
  rate_per_unit numeric,            -- cost per unit if extractable
  taxes_and_fees numeric,           -- taxes/surcharges if extractable
  due_date date,
  ai_summary text,                  -- AI-generated one-line summary
  ai_tips text,                     -- AI-generated savings/efficiency tips
  raw_extraction jsonb,             -- full raw AI response for debugging

  -- Processing status
  status text not null default 'pending' check (status in ('pending', 'processing', 'complete', 'error')),
  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- Utility Readings (manual entries) ---------------------
create table if not exists public.utility_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,

  utility_type text not null check (utility_type in ('electric', 'gas', 'water', 'sewer', 'trash', 'internet', 'other')),
  provider text,
  billing_period text not null,     -- 'YYYY-MM' format
  usage_amount numeric not null,
  usage_unit text not null,         -- 'kWh', 'therms', 'gallons', etc.
  total_cost numeric not null,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- Indexes -----------------------------------------------
create index if not exists idx_utility_bills_user_id on public.utility_bills(user_id);
create index if not exists idx_utility_bills_property_id on public.utility_bills(property_id);
create index if not exists idx_utility_bills_utility_type on public.utility_bills(utility_type);
create index if not exists idx_utility_bills_billing_period on public.utility_bills(billing_period_start, billing_period_end);
create index if not exists idx_utility_readings_user_id on public.utility_readings(user_id);
create index if not exists idx_utility_readings_property_id on public.utility_readings(property_id);
create index if not exists idx_utility_readings_period on public.utility_readings(billing_period);

-- ----- Row Level Security ------------------------------------
alter table public.utility_bills enable row level security;
alter table public.utility_readings enable row level security;

-- Users can CRUD their own bills
create policy "Users can view own utility bills"
  on public.utility_bills for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own utility bills"
  on public.utility_bills for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own utility bills"
  on public.utility_bills for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own utility bills"
  on public.utility_bills for delete
  to authenticated
  using (user_id = auth.uid());

-- Users can CRUD their own readings
create policy "Users can view own utility readings"
  on public.utility_readings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own utility readings"
  on public.utility_readings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own utility readings"
  on public.utility_readings for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own utility readings"
  on public.utility_readings for delete
  to authenticated
  using (user_id = auth.uid());

-- ----- Service role policy for API endpoints ------------------
create policy "Service role full access utility bills"
  on public.utility_bills for all
  to service_role
  using (true)
  with check (true);

create policy "Service role full access utility readings"
  on public.utility_readings for all
  to service_role
  using (true)
  with check (true);

-- ----- Storage bucket for utility bill uploads ----------------
insert into storage.buckets (id, name, public)
values ('utility-bills', 'utility-bills', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload utility bills"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'utility-bills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own utility bills"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'utility-bills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own utility bills"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'utility-bills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----- Updated_at trigger ------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger utility_bills_updated_at
  before update on public.utility_bills
  for each row execute function public.update_updated_at_column();

create trigger utility_readings_updated_at
  before update on public.utility_readings
  for each row execute function public.update_updated_at_column();

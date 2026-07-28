-- ============================================================
-- 014: Work Items table + credit balance on contractor_profiles
-- A job (parent) can have multiple work items, each assigned
-- to a specific trade and optionally to a contractor.
-- ============================================================

create table public.work_items (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  contractor_id uuid references public.profiles(id) on delete set null,

  -- Work item details
  title text not null,
  description text,
  trade text not null,
  status text not null default 'open' check (status in ('open', 'quoted', 'assigned', 'in-progress', 'completed', 'cancelled')),

  -- Budget
  estimated_budget text,
  agreed_price numeric(10,2),

  -- Timeline
  start_date date,
  end_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_pkey primary key (id)
);

create trigger work_items_updated_at
  before update on public.work_items
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index work_items_job_idx
  on public.work_items (job_id);

create index work_items_contractor_idx
  on public.work_items (contractor_id);

create index work_items_trade_idx
  on public.work_items (trade);

create index work_items_status_idx
  on public.work_items (status);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.work_items enable row level security;

-- Homeowners can manage work items on their own jobs
create policy "Job owners can view work items"
  on public.work_items for select
  using (
    job_id in (select id from public.jobs where user_id = auth.uid())
  );

create policy "Job owners can insert work items"
  on public.work_items for insert
  to authenticated
  with check (
    job_id in (select id from public.jobs where user_id = auth.uid())
  );

create policy "Job owners can update work items"
  on public.work_items for update
  using (
    job_id in (select id from public.jobs where user_id = auth.uid())
  );

create policy "Job owners can delete work items"
  on public.work_items for delete
  using (
    job_id in (select id from public.jobs where user_id = auth.uid())
  );

-- Contractors can view open work items (marketplace)
create policy "Contractors can view open work items"
  on public.work_items for select
  using (status = 'open');

-- Contractors can view work items assigned to them
create policy "Contractors can view assigned work items"
  on public.work_items for select
  using (auth.uid() = contractor_id);

-- ============================================================
-- Credit balance on contractor_profiles
-- ============================================================
alter table public.contractor_profiles
  add column if not exists credit_balance integer not null default 0;

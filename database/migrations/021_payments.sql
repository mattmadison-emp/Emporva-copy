-- ============================================================
-- 021: Payments table
-- Tracks payments for jobs and work items.
-- A payment always references a job. If the job is simple
-- (single trade), work_item_id can be null. For complex jobs
-- with multiple trades, each payment ties to a specific
-- work item.
-- ============================================================

create table public.payments (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  work_item_id uuid references public.work_items(id) on delete set null,

  -- Parties
  payer_id uuid not null references public.profiles(id),
  payee_id uuid not null references public.profiles(id),

  -- Payment details
  amount numeric(10,2) not null check (amount > 0),
  description text not null,
  payment_type text not null check (payment_type in ('deposit', 'milestone', 'final', 'full')),
  payment_method text check (payment_method in ('card', 'bank_transfer', 'cash', 'other')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  confirmation_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_pkey primary key (id)
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index payments_job_idx on public.payments (job_id);
create index payments_work_item_idx on public.payments (work_item_id);
create index payments_payer_idx on public.payments (payer_id);
create index payments_payee_idx on public.payments (payee_id);
create index payments_status_idx on public.payments (status);
create index payments_created_at_idx on public.payments (created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.payments enable row level security;

-- Payers (homeowners) can view their own payments
create policy "Payers can view own payments"
  on public.payments for select
  using (auth.uid() = payer_id);

-- Payees (contractors) can view payments made to them
create policy "Payees can view own payments"
  on public.payments for select
  using (auth.uid() = payee_id);

-- Only payers can create payments (homeowner initiates)
create policy "Payers can create payments"
  on public.payments for insert
  to authenticated
  with check (auth.uid() = payer_id);

-- Payers can update their own payments (e.g. status changes)
create policy "Payers can update own payments"
  on public.payments for update
  using (auth.uid() = payer_id);

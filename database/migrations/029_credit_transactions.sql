-- ============================================================
-- 029: Credit transactions table
-- Tracks credit purchases and usage for contractors.
-- Balance is stored on contractor_profiles.credit_balance.
-- ============================================================

create table public.credit_transactions (
  id uuid not null default gen_random_uuid(),
  contractor_profile_id uuid not null references public.contractor_profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  type text not null check (type in ('purchase', 'usage', 'refund', 'bonus')),
  credits integer not null,              -- positive for purchase/refund/bonus, negative for usage
  description text not null,
  job_id uuid references public.jobs(id) on delete set null,  -- which job the credit was used on

  created_at timestamptz not null default now(),
  constraint credit_transactions_pkey primary key (id)
);

create index ct_contractor_idx on public.credit_transactions (contractor_profile_id);
create index ct_user_idx on public.credit_transactions (user_id);
create index ct_type_idx on public.credit_transactions (type);
create index ct_created_at_idx on public.credit_transactions (created_at desc);

alter table public.credit_transactions enable row level security;

create policy "Users can view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own credit transactions"
  on public.credit_transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

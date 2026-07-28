-- ============================================================
-- 011: Contractor Credentials Table
-- Stores credential metadata (title, file URL, status, etc.)
-- linked to contractor_profiles
-- ============================================================

create table public.contractor_credentials (
  id uuid not null default gen_random_uuid(),
  contractor_profile_id uuid not null references public.contractor_profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Credential details
  title text not null,
  file_url text not null,
  file_name text not null,
  file_size text,
  status text not null default 'active' check (status in ('active', 'pending', 'verified', 'expired', 'rejected')),

  -- Optional metadata
  credential_number text,
  expiry_date date,
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contractor_credentials_pkey primary key (id)
);

create trigger contractor_credentials_updated_at
  before update on public.contractor_credentials
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index contractor_credentials_contractor_idx
  on public.contractor_credentials (contractor_profile_id);

create index contractor_credentials_user_idx
  on public.contractor_credentials (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.contractor_credentials enable row level security;

create policy "Users can view own credentials"
  on public.contractor_credentials for select
  using (auth.uid() = user_id);

create policy "Users can insert own credentials"
  on public.contractor_credentials for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own credentials"
  on public.contractor_credentials for update
  using (auth.uid() = user_id);

create policy "Users can delete own credentials"
  on public.contractor_credentials for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Profiles table (shared across all roles)
-- id mirrors auth.users.id (1:1 relationship)
-- ============================================================
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  role text check (role in ('homeowner', 'multi-unit', 'contractor')),
  tier text not null default 'core' check (tier in ('core', 'premium')),
  preferred_contact text check (preferred_contact in ('phone', 'text', 'email', 'any')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_pkey primary key (id)
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Homeowner profiles (link record — property data lives in properties table)
-- ============================================================
create table public.homeowner_profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homeowner_profiles_pkey primary key (id),
  constraint homeowner_profiles_user_id_key unique (user_id)
);

create trigger homeowner_profiles_updated_at
  before update on public.homeowner_profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Multi-unit profiles (portfolio details)
-- ============================================================
create table public.multi_unit_profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  multi_unit_role text not null check (multi_unit_role in ('owner', 'property-manager', 'facilities-manager', 'asset-manager', 'other')),
  portfolio_name text not null,
  portfolio_type text not null check (portfolio_type in ('multi-family', 'small-apartments', 'mixed-residential', 'rental-properties', 'other')),
  total_properties integer not null,
  total_units integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint multi_unit_profiles_pkey primary key (id),
  constraint multi_unit_profiles_user_id_key unique (user_id)
);

create trigger multi_unit_profiles_updated_at
  before update on public.multi_unit_profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Contractor profiles (business, service area, credentials, plan)
-- ============================================================
create table public.contractor_profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Business information
  business_name text not null,
  company_type text not null check (company_type in ('solo', 'small-team', 'multi-crew')),
  primary_trade text not null,
  secondary_trades text[] not null default '{}',
  years_in_business integer not null,

  -- Service area
  service_zips text not null,
  travel_radius text not null check (travel_radius in ('10', '25', '50', '100', 'unlimited')),
  emergency_available boolean not null default false,

  -- Credentials (all optional)
  licensing_status text check (licensing_status in ('licensed', 'not-required', 'in-progress', 'not-licensed')),
  insurance_status text check (insurance_status in ('general-liability', 'full-coverage', 'not-insured')),
  certifications text,

  -- Plan selection
  selected_plan text not null default 'core' check (selected_plan in ('core', 'premium')),
  starter_pack integer check (starter_pack in (5, 10, 25, 50)),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contractor_profiles_pkey primary key (id),
  constraint contractor_profiles_user_id_key unique (user_id)
);

create trigger contractor_profiles_updated_at
  before update on public.contractor_profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.homeowner_profiles enable row level security;
alter table public.multi_unit_profiles enable row level security;
alter table public.contractor_profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Homeowner profiles: users can manage their own
create policy "Users can view own homeowner profile"
  on public.homeowner_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own homeowner profile"
  on public.homeowner_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own homeowner profile"
  on public.homeowner_profiles for update
  using (auth.uid() = user_id);

-- Multi-unit profiles: users can manage their own
create policy "Users can view own multi-unit profile"
  on public.multi_unit_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own multi-unit profile"
  on public.multi_unit_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own multi-unit profile"
  on public.multi_unit_profiles for update
  using (auth.uid() = user_id);

-- Contractor profiles: users can manage their own
create policy "Users can view own contractor profile"
  on public.contractor_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own contractor profile"
  on public.contractor_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contractor profile"
  on public.contractor_profiles for update
  using (auth.uid() = user_id);

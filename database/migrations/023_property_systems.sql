-- ============================================================
-- 023: Property systems table
-- Tracks all registered systems/equipment for a property.
-- Replaces the limited hvac_type/water_heater_type/roofing_type
-- columns on properties with a flexible many-to-one table.
-- ============================================================

create table public.property_systems (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- System details
  name text not null,                   -- e.g. "Central AC Unit", "In-Ground Pool"
  category text not null,               -- e.g. HVAC, Plumbing, Electrical, Roofing, Pool, Irrigation, Garage, Exterior
  type text,                            -- model/spec e.g. "Carrier 24ACC6", "Gunite 18x36"
  install_year integer,
  last_service_date date,
  condition text check (condition in ('excellent', 'good', 'fair', 'poor')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_systems_pkey primary key (id)
);

create trigger property_systems_updated_at
  before update on public.property_systems
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index property_systems_property_idx on public.property_systems (property_id);
create index property_systems_user_idx on public.property_systems (user_id);
create index property_systems_category_idx on public.property_systems (category);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.property_systems enable row level security;

create policy "Users can view own systems"
  on public.property_systems for select
  using (auth.uid() = user_id);

create policy "Users can insert own systems"
  on public.property_systems for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own systems"
  on public.property_systems for update
  using (auth.uid() = user_id);

create policy "Users can delete own systems"
  on public.property_systems for delete
  using (auth.uid() = user_id);

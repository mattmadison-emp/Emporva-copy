-- ============================================================
-- Properties table (shared across roles)
-- Can belong to a homeowner, multi-unit profile, or stand alone
-- ============================================================
create table public.properties (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  homeowner_profile_id uuid references public.homeowner_profiles(id) on delete cascade,
  multi_unit_profile_id uuid references public.multi_unit_profiles(id) on delete cascade,

  address text not null,
  property_type text not null check (property_type in ('single-family', 'townhouse', 'condo', 'multi-unit', 'other')),
  year_built integer,
  square_footage integer,
  floors text not null check (floors in ('1', '2', '3', '4+')),
  unit_count integer not null default 1,

  -- Home systems (optional, typically used by homeowners)
  hvac_type text check (hvac_type in ('central-ac', 'heat-pump', 'furnace', 'mini-split', 'other')),
  hvac_age integer,
  water_heater_type text check (water_heater_type in ('tank', 'tankless', 'heat-pump', 'solar')),
  water_heater_age integer,
  roofing_type text check (roofing_type in ('asphalt-shingles', 'metal', 'tile', 'slate', 'flat')),
  roofing_age integer,
  photos text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint properties_pkey primary key (id)
);

create index properties_user_idx
  on public.properties (user_id);

create index properties_homeowner_idx
  on public.properties (homeowner_profile_id);

create index properties_multi_unit_idx
  on public.properties (multi_unit_profile_id);

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.update_updated_at();

-- RLS
alter table public.properties enable row level security;

create policy "Users can view own properties"
  on public.properties for select
  using (auth.uid() = user_id);

create policy "Users can insert own properties"
  on public.properties for insert
  with check (auth.uid() = user_id);

create policy "Users can update own properties"
  on public.properties for update
  using (auth.uid() = user_id);

create policy "Users can delete own properties"
  on public.properties for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Migrate existing homeowner_profiles data into properties table
-- then slim homeowner_profiles down to a link record
-- ============================================================

-- Step 1: Add systems columns to properties if they don't exist yet
alter table public.properties
  add column if not exists hvac_type text check (hvac_type in ('central-ac', 'heat-pump', 'furnace', 'mini-split', 'other')),
  add column if not exists hvac_age integer,
  add column if not exists water_heater_type text check (water_heater_type in ('tank', 'tankless', 'heat-pump', 'solar')),
  add column if not exists water_heater_age integer,
  add column if not exists roofing_type text check (roofing_type in ('asphalt-shingles', 'metal', 'tile', 'slate', 'flat')),
  add column if not exists roofing_age integer,
  add column if not exists photos text[] not null default '{}';

-- Step 2: Add photos column to homeowner_profiles if it doesn't exist (so the insert works)
alter table public.homeowner_profiles
  add column if not exists photos text[] not null default '{}';

-- Step 3: Copy existing property + systems data into the properties table
insert into public.properties (
  user_id,
  homeowner_profile_id,
  address,
  property_type,
  year_built,
  square_footage,
  floors,
  unit_count,
  hvac_type,
  hvac_age,
  water_heater_type,
  water_heater_age,
  roofing_type,
  roofing_age,
  photos
)
select
  hp.user_id,
  hp.id,
  hp.address,
  hp.property_type,
  hp.year_built,
  hp.square_footage,
  hp.floors,
  1,
  hp.hvac_type,
  hp.hvac_age,
  hp.water_heater_type,
  hp.water_heater_age,
  hp.roofing_type,
  hp.roofing_age,
  hp.photos
from public.homeowner_profiles hp
where not exists (
  select 1 from public.properties p
  where p.homeowner_profile_id = hp.id
);

-- Step 4: Drop property/systems columns from homeowner_profiles
alter table public.homeowner_profiles
  drop column if exists address,
  drop column if exists property_type,
  drop column if exists year_built,
  drop column if exists square_footage,
  drop column if exists floors,
  drop column if exists hvac_type,
  drop column if exists hvac_age,
  drop column if exists water_heater_type,
  drop column if exists water_heater_age,
  drop column if exists roofing_type,
  drop column if exists roofing_age,
  drop column if exists photos;

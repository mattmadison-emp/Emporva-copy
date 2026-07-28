-- Early-access homeowner signups captured from the /early-access-homeowners landing page.
-- Written only by the serverless endpoint (service role); no public read/write.

create table if not exists public.early_access_homeowners (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  email       text not null,
  zip_code    text,
  ownership   text,
  source      text not null default 'early-access-homeowners',
  created_at  timestamptz not null default now()
);

create index if not exists idx_early_access_homeowners_email
  on public.early_access_homeowners (email);

create index if not exists idx_early_access_homeowners_created_at
  on public.early_access_homeowners (created_at desc);

-- Lock the table down: RLS on, no policies → only the service-role key (used by the
-- API function) can read/write. The anon/authenticated clients get nothing.
alter table public.early_access_homeowners enable row level security;

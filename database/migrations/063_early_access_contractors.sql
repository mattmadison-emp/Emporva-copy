-- Early-access contractor signups captured from the /early-access-contractors landing page.
-- Written only by the serverless endpoint (service role); no public read/write.

create table if not exists public.early_access_contractors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  company_name  text,
  primary_trade text,
  location      text,
  source        text not null default 'early-access-contractors',
  created_at    timestamptz not null default now()
);

create index if not exists idx_early_access_contractors_email
  on public.early_access_contractors (email);

create index if not exists idx_early_access_contractors_created_at
  on public.early_access_contractors (created_at desc);

-- Lock the table down: RLS on, no policies → only the service-role key (used by the
-- API function) can read/write. The anon/authenticated clients get nothing.
alter table public.early_access_contractors enable row level security;

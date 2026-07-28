-- Newsletter / "Stay Updated" email captures from public pages (blog sidebar, etc.).
-- Written only by the serverless endpoint (service role); no public read/write.

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'blog',
  created_at timestamptz not null default now()
);

-- One row per email (email is stored lowercased by the API); lets repeat submits
-- resolve as a no-op instead of piling up duplicates.
create unique index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

-- Lock the table down: RLS on, no policies → only the service-role key (used by the
-- API function) can read/write. The anon/authenticated clients get nothing.
alter table public.newsletter_subscribers enable row level security;

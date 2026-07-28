-- ============================================================
-- 013: Reviews Table
-- Stores reviews left by homeowners for contractors,
-- including ratings, comments, responses, and platform source
-- ============================================================

create table public.reviews (
  id uuid not null default gen_random_uuid(),
  contractor_profile_id uuid not null references public.contractor_profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,

  -- Review content
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  job_title text,

  -- Platform source (Emporva only for now)
  platform text not null default 'emporva' check (platform in ('emporva')),

  -- Sentiment (can be auto-calculated or manually set)
  sentiment text not null default 'neutral' check (sentiment in ('positive', 'neutral', 'negative')),

  -- Engagement
  helpful_count int not null default 0,
  verified boolean not null default false,

  -- Contractor response
  response text,
  response_date timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_pkey primary key (id)
);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index reviews_contractor_idx
  on public.reviews (contractor_profile_id);

create index reviews_reviewer_idx
  on public.reviews (reviewer_id);

create index reviews_job_idx
  on public.reviews (job_id);

create index reviews_rating_idx
  on public.reviews (contractor_profile_id, rating);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.reviews enable row level security;

-- Anyone can view reviews (public)
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

-- Authenticated users can create reviews
create policy "Authenticated users can create reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

-- Reviewers can update their own reviews
create policy "Reviewers can update own reviews"
  on public.reviews for update
  using (auth.uid() = reviewer_id);

-- Contractors can update response fields on their own reviews
create policy "Contractors can respond to their reviews"
  on public.reviews for update
  using (
    contractor_profile_id in (
      select id from public.contractor_profiles where user_id = auth.uid()
    )
  );

-- Reviewers can delete their own reviews
create policy "Reviewers can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

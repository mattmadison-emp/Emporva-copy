-- ============================================================
-- Project features: extend jobs table, add milestones, Q&A,
-- approvals, and project photos tables.
-- ============================================================

-- 1. Extend jobs table with project-specific columns
alter table public.jobs
  add column if not exists is_project boolean not null default false,
  add column if not exists estimated_budget numeric(12,2),
  add column if not exists actual_spend numeric(12,2) default 0,
  add column if not exists progress smallint default 0 check (progress >= 0 and progress <= 100),
  add column if not exists start_date date,
  add column if not exists estimated_completion date;

-- ============================================================
-- 2. Project milestones
-- ============================================================
create table public.project_milestones (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in-progress', 'completed', 'skipped')),
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_milestones_pkey primary key (id)
);

create index project_milestones_job_idx on public.project_milestones (job_id);

-- ============================================================
-- 3. Project Q&A threads
-- ============================================================
create table public.project_qa_threads (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  approval_id uuid,  -- optional link to an approval
  question text not null,
  category text not null default 'other'
    check (category in ('scope', 'timeline', 'budget', 'materials', 'quality', 'access', 'other')),
  asked_by uuid not null references public.profiles(id) on delete cascade,
  response text,
  responded_by uuid references public.profiles(id),
  responded_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'answered')),
  created_at timestamptz not null default now(),
  constraint project_qa_threads_pkey primary key (id)
);

create index project_qa_threads_job_idx on public.project_qa_threads (job_id);
create index project_qa_threads_asked_by_idx on public.project_qa_threads (asked_by);

-- ============================================================
-- 4. Project approvals (change orders, milestone sign-offs, estimates)
-- ============================================================
create table public.project_approvals (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  type text not null
    check (type in ('estimate', 'change_order', 'milestone', 'completion')),
  title text not null,
  description text,
  amount numeric(12,2),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  documents text[],
  photos text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_approvals_pkey primary key (id)
);

create index project_approvals_job_idx on public.project_approvals (job_id);

-- Add FK from qa_threads to approvals now that approval table exists
alter table public.project_qa_threads
  add constraint project_qa_threads_approval_fk
  foreign key (approval_id) references public.project_approvals(id) on delete set null;

-- ============================================================
-- 5. Project photos
-- ============================================================
create table public.project_photos (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  caption text,
  category text not null default 'progress'
    check (category in ('before', 'progress', 'after', 'issue', 'other')),
  created_at timestamptz not null default now(),
  constraint project_photos_pkey primary key (id)
);

create index project_photos_job_idx on public.project_photos (job_id);

-- ============================================================
-- RLS policies
-- ============================================================

-- Milestones: job owner + assigned contractors can view; job owner can manage
alter table public.project_milestones enable row level security;

create policy "Job owner can manage milestones"
  on public.project_milestones for all
  using (
    exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
  );

create policy "Assigned contractors can view milestones"
  on public.project_milestones for select
  using (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_milestones.job_id
        and wi.contractor_id = auth.uid()
    )
  );

-- Q&A threads: job owner + participants can view; job owner + assigned contractors can insert/update
alter table public.project_qa_threads enable row level security;

create policy "Job owner can manage QA threads"
  on public.project_qa_threads for all
  using (
    exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
  );

create policy "Assigned contractors can view QA threads"
  on public.project_qa_threads for select
  using (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_qa_threads.job_id
        and wi.contractor_id = auth.uid()
    )
  );

create policy "Assigned contractors can insert QA threads"
  on public.project_qa_threads for insert
  to authenticated
  with check (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_qa_threads.job_id
        and wi.contractor_id = auth.uid()
    )
  );

create policy "QA participants can update their responses"
  on public.project_qa_threads for update
  using (
    asked_by = auth.uid()
    or exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
    or exists (
      select 1 from public.work_items wi
      where wi.job_id = project_qa_threads.job_id
        and wi.contractor_id = auth.uid()
    )
  );

-- Approvals: job owner + submitter can view; contractors submit, homeowner reviews
alter table public.project_approvals enable row level security;

create policy "Job owner can manage approvals"
  on public.project_approvals for all
  using (
    exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
  );

create policy "Assigned contractors can view approvals"
  on public.project_approvals for select
  using (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_approvals.job_id
        and wi.contractor_id = auth.uid()
    )
  );

create policy "Assigned contractors can submit approvals"
  on public.project_approvals for insert
  to authenticated
  with check (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_approvals.job_id
        and wi.contractor_id = auth.uid()
    )
  );

-- Photos: job owner + assigned contractors can view and upload
alter table public.project_photos enable row level security;

create policy "Job owner can manage photos"
  on public.project_photos for all
  using (
    exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
  );

create policy "Assigned contractors can view photos"
  on public.project_photos for select
  using (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_photos.job_id
        and wi.contractor_id = auth.uid()
    )
  );

create policy "Assigned contractors can upload photos"
  on public.project_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_photos.job_id
        and wi.contractor_id = auth.uid()
    )
  );

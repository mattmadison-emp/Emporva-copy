-- ============================================================
-- 028: Project documents table
-- Stores documents attached to a project (contracts, permits,
-- change orders, specs, inspection reports, etc.)
-- ============================================================

create table public.project_documents (
  id uuid not null default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  file_url text not null,
  file_name text not null,
  file_size text,
  doc_type text not null default 'other' check (doc_type in ('contract', 'change-order', 'permit', 'inspection', 'specs', 'invoice', 'other')),

  created_at timestamptz not null default now(),
  constraint project_documents_pkey primary key (id)
);

create index project_documents_job_idx on public.project_documents (job_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.project_documents enable row level security;

create policy "Job owner can manage documents"
  on public.project_documents for all
  using (
    exists (select 1 from public.jobs where jobs.id = job_id and jobs.user_id = auth.uid())
  );

create policy "Assigned contractors can view documents"
  on public.project_documents for select
  using (
    exists (
      select 1 from public.work_items wi
      where wi.job_id = project_documents.job_id
        and wi.contractor_id = auth.uid()
    )
  );

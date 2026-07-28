-- ============================================================
-- 027: DIY Projects table
-- Tracks homeowner DIY projects with embedded materials,
-- tasks, and resources stored as JSONB arrays.
-- ============================================================

create table public.diy_projects (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,

  name text not null,
  category text not null,
  description text not null default '',
  status text not null default 'Not started' check (status in ('Not started', 'In progress', 'Paused', 'Completed')),
  complexity text check (complexity in ('Easy', 'Moderate', 'Advanced')),
  estimated_time text,
  start_date date,
  target_date date,
  total_cost numeric(10,2) not null default 0,

  -- Embedded arrays as JSONB
  materials jsonb not null default '[]',   -- [{id, name, quantity, estimatedCost}]
  tasks jsonb not null default '[]',       -- [{id, description, completed}]
  resources jsonb not null default '[]',   -- [{id, title, description, url, type}]
  photos text[] not null default '{}',

  ai_suggested boolean not null default false,
  handed_off_to_contractor boolean not null default false,
  contractor_job_id uuid references public.jobs(id) on delete set null,
  important_for_resale boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diy_projects_pkey primary key (id)
);

create trigger diy_projects_updated_at
  before update on public.diy_projects
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index diy_projects_user_idx on public.diy_projects (user_id);
create index diy_projects_property_idx on public.diy_projects (property_id);
create index diy_projects_status_idx on public.diy_projects (status);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.diy_projects enable row level security;

create policy "Users can view own DIY projects"
  on public.diy_projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own DIY projects"
  on public.diy_projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own DIY projects"
  on public.diy_projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own DIY projects"
  on public.diy_projects for delete
  using (auth.uid() = user_id);

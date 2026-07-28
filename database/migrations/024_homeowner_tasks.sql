-- ============================================================
-- 024: Homeowner tasks table
-- Personal to-do list for homeowners to track property tasks.
-- ============================================================

create table public.homeowner_tasks (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,

  title text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  category text not null default 'Maintenance',
  completed boolean not null default false,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homeowner_tasks_pkey primary key (id)
);

create trigger homeowner_tasks_updated_at
  before update on public.homeowner_tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index homeowner_tasks_user_idx on public.homeowner_tasks (user_id);
create index homeowner_tasks_property_idx on public.homeowner_tasks (property_id);
create index homeowner_tasks_completed_idx on public.homeowner_tasks (user_id, completed);
create index homeowner_tasks_due_date_idx on public.homeowner_tasks (due_date);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.homeowner_tasks enable row level security;

create policy "Users can view own tasks"
  on public.homeowner_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.homeowner_tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.homeowner_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.homeowner_tasks for delete
  using (auth.uid() = user_id);

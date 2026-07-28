-- ============================================================
-- 026: Property maintenance logs
-- For off-platform maintenance events (DIY work, contractors
-- not on the platform, etc.) used in Property Memory timeline.
-- ============================================================

create table public.property_maintenance_logs (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  category text not null,
  contractor_name text,
  cost numeric(10,2),
  completed_date date,
  status text default 'completed',
  notes text,
  photos text[] default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_maintenance_logs_pkey primary key (id)
);

create trigger property_maintenance_logs_updated_at
  before update on public.property_maintenance_logs
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index pml_property_idx on public.property_maintenance_logs (property_id);
create index pml_user_idx on public.property_maintenance_logs (user_id);
create index pml_date_idx on public.property_maintenance_logs (completed_date desc);
create index pml_category_idx on public.property_maintenance_logs (category);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.property_maintenance_logs enable row level security;

create policy "Users can view own logs"
  on public.property_maintenance_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs"
  on public.property_maintenance_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own logs"
  on public.property_maintenance_logs for update using (auth.uid() = user_id);
create policy "Users can delete own logs"
  on public.property_maintenance_logs for delete using (auth.uid() = user_id);

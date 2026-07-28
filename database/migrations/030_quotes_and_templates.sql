-- ============================================================
-- 030: Quotes and quote templates tables
-- Quotes sent by contractors to homeowners, with line items,
-- work steps, and materials stored as JSONB.
-- Templates are reusable quote skeletons.
-- ============================================================

create table public.quote_templates (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  category text not null,
  description text,
  scope_summary text,
  work_steps jsonb not null default '[]',
  line_items jsonb not null default '[]',
  materials jsonb not null default '[]',
  assumptions text,
  exclusions text,
  estimated_duration text,
  payment_terms text,
  validity_days integer default 30,
  usage_count integer not null default 0,
  last_used timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_templates_pkey primary key (id)
);

create trigger quote_templates_updated_at
  before update on public.quote_templates
  for each row execute function public.update_updated_at();

create table public.quotes (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  template_id uuid references public.quote_templates(id) on delete set null,

  -- Client info
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,

  -- Quote content
  job_title text not null,
  scope_summary text,
  work_steps jsonb not null default '[]',
  line_items jsonb not null default '[]',
  materials jsonb not null default '[]',
  assumptions text,
  exclusions text,
  estimated_duration text,
  payment_terms text,
  validity_days integer default 30,
  total numeric(10,2) not null default 0,
  contractor_notes text,

  -- Status tracking
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  sent_at timestamptz,
  responded_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_pkey primary key (id)
);

create trigger quotes_updated_at
  before update on public.quotes
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index quotes_user_idx on public.quotes (user_id);
create index quotes_job_idx on public.quotes (job_id);
create index quotes_status_idx on public.quotes (status);
create index quotes_created_idx on public.quotes (created_at desc);
create index qt_user_idx on public.quote_templates (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.quote_templates enable row level security;
alter table public.quotes enable row level security;

create policy "Users can manage own templates"
  on public.quote_templates for all using (auth.uid() = user_id);

create policy "Users can manage own quotes"
  on public.quotes for all using (auth.uid() = user_id);

-- Homeowners can view quotes sent to them (by job)
create policy "Homeowners can view quotes on their jobs"
  on public.quotes for select
  using (
    job_id in (select id from public.jobs where user_id = auth.uid())
  );

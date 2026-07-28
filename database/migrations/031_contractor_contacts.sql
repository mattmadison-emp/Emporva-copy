-- ============================================================
-- 031: Contractor contacts (CRM)
-- Contractors can manage their client contacts with tags,
-- notes, and contact history.
-- ============================================================

create table public.contractor_contacts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  homeowner_id uuid references public.profiles(id) on delete set null,

  name text not null,
  email text,
  phone text,
  address text,
  tags jsonb not null default '[]',
  notes text,
  source text default 'manual' check (source in ('manual', 'job', 'marketplace', 'referral')),
  last_contacted timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contractor_contacts_pkey primary key (id)
);

create trigger contractor_contacts_updated_at
  before update on public.contractor_contacts
  for each row execute function public.update_updated_at();

create index cc_user_idx on public.contractor_contacts (user_id);
create index cc_homeowner_idx on public.contractor_contacts (homeowner_id);

alter table public.contractor_contacts enable row level security;

create policy "Users can manage own contacts"
  on public.contractor_contacts for all using (auth.uid() = user_id);

-- ============================================================
-- User settings (notification preferences, privacy, security)
-- One row per user, auto-created on signup
-- ============================================================
create table public.user_settings (
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Email notifications
  email_project_updates boolean not null default true,
  email_messages boolean not null default true,
  email_maintenance_reminders boolean not null default true,
  email_seasonal_tips boolean not null default false,
  email_marketing boolean not null default false,

  -- Push notifications
  push_project_updates boolean not null default true,
  push_messages boolean not null default true,
  push_maintenance_reminders boolean not null default true,
  push_emergency_alerts boolean not null default true,

  -- SMS notifications
  sms_project_updates boolean not null default false,
  sms_messages boolean not null default true,
  sms_maintenance_reminders boolean not null default false,
  sms_emergency_alerts boolean not null default true,

  -- Privacy
  profile_visibility text not null default 'private' check (profile_visibility in ('private', 'limited', 'public')),
  show_email boolean not null default false,
  show_phone boolean not null default false,
  allow_contractor_contact boolean not null default true,

  -- Security
  two_factor_enabled boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_settings_pkey primary key (user_id)
);

-- Auto-update updated_at
create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.update_updated_at();

-- Auto-create settings row when a profile is created
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_settings
  after insert on public.profiles
  for each row execute function public.handle_new_user_settings();

-- RLS
alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

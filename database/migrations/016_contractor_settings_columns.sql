-- ============================================================
-- Add contractor-specific columns to user_settings
-- These are ignored for homeowner users; the existing shared
-- columns (email_messages, push_messages, sms_messages,
-- show_email, show_phone, profile_visibility, two_factor_enabled)
-- work for both roles.
-- ============================================================

-- Contractor notification preferences
alter table public.user_settings
  add column if not exists email_new_leads boolean not null default true,
  add column if not exists email_job_updates boolean not null default true,
  add column if not exists push_new_leads boolean not null default true,
  add column if not exists push_job_updates boolean not null default true,
  add column if not exists sms_new_leads boolean not null default false,
  add column if not exists sms_job_updates boolean not null default false;

-- Contractor business preferences
alter table public.user_settings
  add column if not exists available_for_work boolean not null default true,
  add column if not exists auto_quote_enabled boolean not null default false;

-- ============================================================
-- 012: Add 'active' status to contractor_credentials
-- and set it as the default
-- ============================================================

-- Drop the existing check constraint and add updated one with 'active'
alter table public.contractor_credentials
  drop constraint if exists contractor_credentials_status_check;

alter table public.contractor_credentials
  add constraint contractor_credentials_status_check
  check (status in ('active', 'pending', 'verified', 'expired', 'rejected'));

-- Change the default to 'active'
alter table public.contractor_credentials
  alter column status set default 'active';

-- Update any existing credentials from 'pending' to 'active'
update public.contractor_credentials
  set status = 'active'
  where status = 'pending';

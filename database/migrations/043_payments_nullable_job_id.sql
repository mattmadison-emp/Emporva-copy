-- Allow job_id to be null for manually logged revenue entries
alter table public.payments alter column job_id drop not null;

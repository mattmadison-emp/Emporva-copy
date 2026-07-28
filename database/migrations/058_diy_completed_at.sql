-- ============================================================
-- 058: diy_projects.completed_at
-- The DIY status selector (homeowner-dashboard-core ActiveJobs) writes
-- completed_at when a project is marked Completed, but the column never
-- existed. Because that write was bundled into the same UPDATE as the
-- status change, the whole UPDATE was rejected — so marking a DIY project
-- "Completed" silently failed to persist (the UI updated optimistically
-- but reverted on reload). Add the column and backfill existing Completed
-- rows from updated_at as a sensible timestamp.
-- This migration is idempotent — safe to re-run.
-- ============================================================

alter table public.diy_projects
  add column if not exists completed_at timestamptz;

update public.diy_projects
  set completed_at = updated_at
  where status = 'Completed' and completed_at is null;

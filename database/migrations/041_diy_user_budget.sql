-- Add user_budget column to diy_projects to preserve the homeowner's original estimate
-- separate from the AI-calculated total_cost
alter table public.diy_projects
  add column if not exists user_budget numeric(10,2) default 0;

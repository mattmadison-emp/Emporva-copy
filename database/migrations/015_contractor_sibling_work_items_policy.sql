-- ============================================================
-- 015: Allow contractors to view sibling work items
-- If a contractor has a work item on a job, they can see
-- all other work items on that same job (for coordination)
-- ============================================================

create policy "Contractors can view sibling work items"
  on public.work_items for select
  using (
    job_id in (
      select job_id from public.work_items where contractor_id = auth.uid()
    )
  );

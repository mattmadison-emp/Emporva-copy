-- ============================================================
-- Allow authenticated users to view contractor credentials
-- and reviews for the public contractor profile page.
-- ============================================================

create policy "Authenticated users can view contractor credentials"
  on public.contractor_credentials for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can view reviews"
  on public.reviews for select
  using (auth.role() = 'authenticated');

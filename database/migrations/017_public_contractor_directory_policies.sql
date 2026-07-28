-- ============================================================
-- Allow authenticated users to view contractor profiles and
-- basic profile info for the public provider directory.
-- ============================================================

-- Allow any authenticated user to read contractor profiles
create policy "Authenticated users can view contractor profiles"
  on public.contractor_profiles for select
  using (auth.role() = 'authenticated');

-- Allow any authenticated user to read basic profile info
-- (needed to display contractor name/avatar on provider cards, reviews, etc.)
create policy "Authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

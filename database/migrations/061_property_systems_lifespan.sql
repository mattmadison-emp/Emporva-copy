-- ============================================================
-- 061: Property systems — estimated lifespan
--
-- The Systems Profile shows a "Lifespan" progress bar (age vs. expected
-- service life) and the Add/Edit forms have an "Estimated Lifespan (years)"
-- input, but there was no column to store it — so the value was silently
-- dropped on save and the bar fell back to a flat 15 years for every system.
--
-- This adds the column. The app prefills it from a built-in lifespan lookup
-- (utils/systemLifespans.ts) based on the system type, and the user can
-- override it. Nullable; when null the UI falls back to the same lookup.
--
-- Idempotent — safe to re-run. Run in the Supabase SQL editor.
-- ============================================================

alter table public.property_systems
  add column if not exists estimated_lifespan_years integer;

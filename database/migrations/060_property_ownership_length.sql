-- ============================================================
-- 060: Property ownership length
--
-- The Quick Setup questionnaire (Step 1) asks "How long have you owned
-- the property?" as a bucket (<1, 1-5, 5-10, 10+ years). This adds the
-- column to store that answer. Nullable; no enum constraint so the
-- buckets can evolve without a schema change.
--
-- Idempotent — safe to re-run. Run in the Supabase SQL editor.
-- ============================================================

alter table public.properties
  add column if not exists ownership_length text;

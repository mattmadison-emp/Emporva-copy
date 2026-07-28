-- ============================================================
-- 062: Stripe subscription state on profiles  (RE-ISSUE of 055)
--
-- IMPORTANT: there are two different migrations both numbered 055 —
--   055_fix_upload_storage_rls.sql      (was run)
--   055_stripe_subscription_columns.sql (was SHADOWED and never run)
-- Because the number collided, the Stripe columns below were never
-- applied. Their absence made the webhook's profile update fail wholesale
-- (Postgres rejects an UPDATE that references non-existent columns), so a
-- homeowner could pay but never get upgraded to premium.
--
-- This re-issues those columns at a clean, un-collided number. Idempotent —
-- safe to re-run, and safe even if 055_stripe_subscription_columns somehow
-- already ran. Run in the Supabase SQL editor.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
  ON public.profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

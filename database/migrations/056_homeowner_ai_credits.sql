-- Migration: Homeowner AI diagnostic credits (DB-backed)
-- Replaces the localStorage-based useCreditGate for homeowners. Core tier gets
-- 3 AI Diagnostic credits per calendar month with lazy reset; Premium bypasses
-- the gate entirely and is not decremented.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS monthly_ai_credits_remaining integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS ai_credits_period_start timestamptz NOT NULL DEFAULT date_trunc('month', now());

-- Lazy monthly reset + decrement, performed server-side so a user can't
-- forge their balance by editing localStorage or skipping the client call.
-- Returns the post-call remaining balance, or -1 when the user is out of
-- credits. Premium users always return 999999 (sentinel for "unlimited") and
-- are never decremented.
CREATE OR REPLACE FUNCTION public.consume_homeowner_ai_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tier text;
  v_remaining integer;
  v_period_start timestamptz;
  v_current_period_start timestamptz := date_trunc('month', now());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tier, monthly_ai_credits_remaining, ai_credits_period_start
    INTO v_tier, v_remaining, v_period_start
    FROM public.profiles
   WHERE id = v_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', v_user_id;
  END IF;

  IF v_tier = 'premium' THEN
    RETURN 999999;
  END IF;

  -- Lazy monthly reset
  IF v_period_start < v_current_period_start THEN
    v_remaining := 3;
    v_period_start := v_current_period_start;
  END IF;

  IF v_remaining <= 0 THEN
    UPDATE public.profiles
       SET monthly_ai_credits_remaining = 0,
           ai_credits_period_start = v_period_start
     WHERE id = v_user_id;
    RETURN -1;
  END IF;

  v_remaining := v_remaining - 1;

  UPDATE public.profiles
     SET monthly_ai_credits_remaining = v_remaining,
         ai_credits_period_start = v_period_start
   WHERE id = v_user_id;

  RETURN v_remaining;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_homeowner_ai_credit() TO authenticated;

-- Read-only helper: returns the current remaining balance, applying a lazy
-- monthly reset if needed so the UI never displays a stale figure on the
-- first day of a new month. Premium returns 999999.
CREATE OR REPLACE FUNCTION public.get_homeowner_ai_credits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tier text;
  v_remaining integer;
  v_period_start timestamptz;
  v_current_period_start timestamptz := date_trunc('month', now());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tier, monthly_ai_credits_remaining, ai_credits_period_start
    INTO v_tier, v_remaining, v_period_start
    FROM public.profiles
   WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', v_user_id;
  END IF;

  IF v_tier = 'premium' THEN
    RETURN 999999;
  END IF;

  IF v_period_start < v_current_period_start THEN
    UPDATE public.profiles
       SET monthly_ai_credits_remaining = 3,
           ai_credits_period_start = v_current_period_start
     WHERE id = v_user_id;
    RETURN 3;
  END IF;

  RETURN v_remaining;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_homeowner_ai_credits() TO authenticated;

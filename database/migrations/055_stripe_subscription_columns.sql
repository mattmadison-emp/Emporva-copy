-- Migration: Store Stripe subscription state on profiles
-- Lets the webhook track upgrade/downgrade/dunning events beyond just
-- checkout.session.completed and customer.subscription.deleted, and gives
-- the UI fields to render "renews on X" / "past due" / etc.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
  ON public.profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

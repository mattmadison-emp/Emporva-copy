-- Migration: Add Stripe integration columns
-- Links Emporva users/payments to Stripe objects

-- Link user profiles to Stripe customers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Link payment records to Stripe payment intents
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Link credit purchases to Stripe payment intents
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

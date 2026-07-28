import type Stripe from 'stripe';
import { supabase } from './auth.js';

// Subscription statuses that should grant Premium access.
// past_due / incomplete are intentionally left as "no change" — Stripe Smart
// Retries will either recover them (→ active) or terminate them
// (→ customer.subscription.deleted), so we keep the user's existing tier
// during the dunning window rather than yanking access on first failure.
export const PREMIUM_STATUSES = new Set(['active', 'trialing']);
export const DOWNGRADE_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

export function periodEndIso(sub: Stripe.Subscription): string | null {
  // Stripe API 2024-06-20+ moved current_period_end onto subscription items.
  const ts = sub.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

/**
 * Reconcile a Stripe subscription onto the user's profile: stores the
 * subscription id/status/period-end and flips `tier` premium↔core based on
 * status. Used by both the webhook (async, out-of-band) and the checkout
 * success page's verify call (sync, on redirect) so the result is identical
 * regardless of which lands first.
 *
 * Returns the resolved tier so callers can report it to the client.
 */
export async function syncSubscriptionToProfile(
  sub: Stripe.Subscription,
): Promise<'premium' | 'core' | null> {
  const userId = sub.metadata?.emporva_user_id;
  if (!userId) return null;

  const update: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: periodEndIso(sub),
  };

  let resolvedTier: 'premium' | 'core' | null = null;
  if (PREMIUM_STATUSES.has(sub.status)) {
    resolvedTier = 'premium';
    update.tier = 'premium';
  } else if (DOWNGRADE_STATUSES.has(sub.status)) {
    resolvedTier = 'core';
    update.tier = 'core';
  }
  // past_due / incomplete / paused: leave tier alone

  await supabase.from('profiles').update(update).eq('id', userId);

  const planType = sub.metadata?.plan_type;
  if (planType?.startsWith('contractor')) {
    await supabase
      .from('contractor_profiles')
      .update({ selected_plan: resolvedTier ?? (PREMIUM_STATUSES.has(sub.status) ? 'premium' : 'core') })
      .eq('user_id', userId);
  }

  return resolvedTier;
}

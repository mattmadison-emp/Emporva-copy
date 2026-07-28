import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, supabase } from '../_lib/auth.js';
import { syncSubscriptionToProfile } from '../_lib/stripeSync.js';
import type Stripe from 'stripe';

// Called by the checkout success page after Stripe redirects back. The webhook
// also reconciles the subscription, but it's async and may not have landed yet
// (or may be misconfigured) — so this confirms the upgrade synchronously from
// Stripe's own record, making the account reflect the new plan immediately and
// without depending on webhook delivery.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { sessionId } = req.body;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Only act on the session that belongs to this user.
    if (session.metadata?.emporva_user_id !== user.id) {
      return res.status(403).json({ error: 'Session does not belong to this user' });
    }

    // Persist the customer id up-front (mirrors the webhook), so Manage Billing
    // works even if the webhook never arrives.
    if (session.customer) {
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', user.id);
    }

    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    let tier: 'premium' | 'core' | null = null;

    if (session.subscription && typeof session.subscription !== 'string') {
      tier = await syncSubscriptionToProfile(session.subscription as Stripe.Subscription);
    }

    return res.status(200).json({
      paid,
      status: session.status,
      paymentStatus: session.payment_status,
      tier,
    });
  } catch (err) {
    console.error('Verify checkout session error:', err);
    return res.status(500).json({ error: 'Failed to verify checkout session' });
  }
}

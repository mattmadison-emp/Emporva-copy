import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, supabase } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { action } = req.body; // 'cancel' | 'reactivate'

  if (!['cancel', 'reactivate'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use "cancel" or "reactivate".' });
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found.' });
    }

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Also check for cancel_at_period_end subscriptions
      const cancellingSubscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 1,
      });

      if (cancellingSubscriptions.data.length === 0) {
        return res.status(400).json({ error: 'No subscription found.' });
      }

      const sub = cancellingSubscriptions.data[0];

      if (action === 'reactivate' && sub.cancel_at_period_end) {
        const updated = await stripe.subscriptions.update(sub.id, {
          cancel_at_period_end: false,
        });
        return res.status(200).json({ status: updated.status, cancelAtPeriodEnd: false });
      }

      return res.status(400).json({ error: 'No active subscription to manage.' });
    }

    const subscription = subscriptions.data[0];

    if (action === 'cancel') {
      const updated = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      return res.status(200).json({
        status: updated.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
      });
    }

    if (action === 'reactivate') {
      const updated = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      });
      return res.status(200).json({ status: updated.status, cancelAtPeriodEnd: false });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Subscription management error:', err);
    return res.status(500).json({ error: 'Failed to manage subscription' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, supabase } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found. Subscribe to a plan first.' });
    }

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}${req.body.returnUrl || '/'}`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('Customer portal error:', err);
    return res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}

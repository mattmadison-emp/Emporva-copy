import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, ensureStripeCustomer } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { amount, description, metadata } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const customerId = await ensureStripeCustomer(user.id, (params) =>
      stripe.customers.create(params)
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: 'usd',
      customer: customerId,
      description: description || 'Emporva Payment',
      metadata: {
        emporva_user_id: user.id,
        ...(metadata || {}),
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Payment intent error:', err);
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

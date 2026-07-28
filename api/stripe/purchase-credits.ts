import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, ensureStripeCustomer } from '../_lib/auth.js';

// Pricing: $15 per credit, with bulk discounts
const CREDIT_PRICING: Record<number, number> = {
  5: 75,      // $75 ($15 each)
  10: 150,    // $150 ($15 each)
  25: 356.25, // $356.25 ($14.25 each, 5% off)
  50: 675,    // $675 ($13.50 each, 10% off)
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { credits } = req.body;

  const expectedAmount = CREDIT_PRICING[credits];
  if (!expectedAmount) {
    return res.status(400).json({ error: `Invalid credit amount: ${credits}. Choose 5, 10, 25, or 50.` });
  }

  try {
    const customerId = await ensureStripeCustomer(user.id, (params) =>
      stripe.customers.create(params)
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(expectedAmount * 100), // cents
      currency: 'usd',
      customer: customerId,
      description: `${credits} lead credits`,
      metadata: {
        emporva_user_id: user.id,
        type: 'credit_purchase',
        credits: String(credits),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: expectedAmount,
    });
  } catch (err) {
    console.error('Credit purchase error:', err);
    return res.status(500).json({ error: 'Failed to create payment for credits' });
  }
}

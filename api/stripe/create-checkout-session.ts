import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { getAuthUser, ensureStripeCustomer } from '../_lib/auth.js';

const PRICE_MAP: Record<string, string | undefined> = {
  'homeowner-premium-monthly': process.env.STRIPE_PRICE_HOMEOWNER_PREMIUM_MONTHLY,
  'homeowner-premium-annual': process.env.STRIPE_PRICE_HOMEOWNER_PREMIUM_ANNUAL,
  'homeowner-premium': process.env.STRIPE_PRICE_HOMEOWNER_PREMIUM_MONTHLY, // default to monthly
  'contractor-premium': process.env.STRIPE_PRICE_CONTRACTOR_PREMIUM,
  'contractor-pro': process.env.STRIPE_PRICE_CONTRACTOR_PREMIUM,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { planType, billingInterval } = req.body;

  // Support explicit billing interval for homeowner plans
  let lookupKey = planType;
  if (planType === 'homeowner-premium' && billingInterval === 'annual') {
    lookupKey = 'homeowner-premium-annual';
  } else if (planType === 'homeowner-premium' && billingInterval === 'monthly') {
    lookupKey = 'homeowner-premium-monthly';
  }

  const priceId = PRICE_MAP[lookupKey];

  if (!priceId) {
    return res.status(400).json({ error: `Invalid plan type: ${planType}` });
  }

  try {
    const customerId = await ensureStripeCustomer(user.id, (params) =>
      stripe.customers.create(params)
    );

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?type=${planType}&cancelled=true`,
      metadata: {
        emporva_user_id: user.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          emporva_user_id: user.id,
          plan_type: planType,
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

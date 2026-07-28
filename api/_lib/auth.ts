import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export { supabase };

export async function getAuthUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization header' };
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }

  return { user, error: null };
}

/**
 * Get or create a Stripe customer for a user.
 * Returns the stripe_customer_id.
 */
export async function ensureStripeCustomer(
  userId: string,
  stripeCreateFn: (params: { email: string; name: string; metadata: Record<string, string> }) => Promise<{ id: string }>
): Promise<string> {
  // Check if user already has a stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, first_name, last_name')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create Stripe customer
  const customer = await stripeCreateFn({
    email: profile?.email || '',
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
    metadata: { emporva_user_id: userId },
  });

  // Store in DB
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

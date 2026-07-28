import { supabase } from './supabase';

/**
 * Make an authenticated request to a Stripe API endpoint.
 */
export async function stripeApi<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { data: null, error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`/api/stripe/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error || `Request failed (${res.status})` };
    }

    return { data: json as T, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Redirect to Stripe Checkout for subscription.
 */
export async function redirectToCheckout(planType: string, billingInterval?: 'monthly' | 'annual'): Promise<string | null> {
  const { data, error } = await stripeApi<{ url: string }>('create-checkout-session', { planType, billingInterval });
  if (error || !data?.url) return error || 'Failed to create checkout session';
  window.location.href = data.url;
  return null;
}

/**
 * Confirm a completed Checkout session and sync the subscription onto the
 * profile synchronously (belt-and-suspenders alongside the async webhook).
 */
export async function verifyCheckoutSession(sessionId: string) {
  return stripeApi<{
    paid: boolean;
    status: string;
    paymentStatus: string;
    tier: 'premium' | 'core' | null;
  }>('verify-checkout-session', { sessionId });
}

/**
 * Redirect to Stripe Customer Portal for billing management.
 */
export async function redirectToCustomerPortal(returnUrl: string): Promise<string | null> {
  const { data, error } = await stripeApi<{ url: string }>('customer-portal', { returnUrl });
  if (error || !data?.url) return error || 'Failed to open billing portal';
  window.location.href = data.url;
  return null;
}

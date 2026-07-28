import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe.js';
import { supabase } from '../_lib/auth.js';
import { sgMail, FROM_EMAIL } from '../_lib/sendgrid.js';
import { paymentReceivedEmail, paymentSentEmail } from '../_lib/emailTemplates.js';
import { syncSubscriptionToProfile } from '../_lib/stripeSync.js';
import type Stripe from 'stripe';

// Disable body parsing — Stripe requires raw body for signature verification
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      // ── Subscription activated via Checkout ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.emporva_user_id;
        const planType = session.metadata?.plan_type;
        if (!userId) break;

        // Save the Stripe customer ID up-front — the subscription handler
        // doesn't have the customer field handy.
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: session.customer as string })
          .eq('id', userId);

        // Fetch the subscription so we capture id/status/period_end alongside
        // the tier upgrade in a single write via the shared helper.
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscriptionToProfile(sub);
        }

        console.log(`[Stripe] Subscription activated for user ${userId}, plan: ${planType}`);
        break;
      }

      // ── Subscription state changed (status flip, plan swap, renewal) ──
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToProfile(sub);
        console.log(`[Stripe] Subscription ${event.type} synced: ${sub.id} (${sub.status})`);
        break;
      }

      // ── One-time payment succeeded ──
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const userId = pi.metadata?.emporva_user_id;
        if (!userId) break;

        const paymentType = pi.metadata?.type;

        // Credit purchase
        if (paymentType === 'credit_purchase') {
          const credits = parseInt(pi.metadata?.credits || '0', 10);
          if (credits > 0) {
            // Check idempotency — don't double-credit
            const { data: existing } = await supabase
              .from('credit_transactions')
              .select('id')
              .eq('stripe_payment_intent_id', pi.id)
              .limit(1);

            if (!existing || existing.length === 0) {
              // Get contractor profile
              const { data: cp } = await supabase
                .from('contractor_profiles')
                .select('id, credit_balance')
                .eq('user_id', userId)
                .single();

              if (cp) {
                // Update balance
                await supabase
                  .from('contractor_profiles')
                  .update({ credit_balance: cp.credit_balance + credits })
                  .eq('id', cp.id);

                // Record transaction
                await supabase
                  .from('credit_transactions')
                  .insert({
                    contractor_profile_id: cp.id,
                    user_id: userId,
                    type: 'purchase',
                    credits,
                    description: `Purchased ${credits} lead credits`,
                    stripe_payment_intent_id: pi.id,
                  });

                console.log(`[Stripe] ${credits} credits added for user ${userId}`);
              }
            }
          }
          break;
        }

        // Job payment
        if (pi.metadata?.job_id) {
          // Check idempotency
          const { data: existing } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_payment_intent_id', pi.id)
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase
              .from('payments')
              .insert({
                job_id: pi.metadata.job_id,
                work_item_id: pi.metadata.work_item_id || null,
                payer_id: userId,
                payee_id: pi.metadata.payee_id || userId,
                amount: pi.amount / 100, // cents to dollars
                description: pi.description || 'Payment',
                payment_type: pi.metadata.payment_type || 'full',
                payment_method: 'card',
                status: 'completed',
                stripe_payment_intent_id: pi.id,
                confirmation_id: pi.id,
              });

            console.log(`[Stripe] Job payment recorded for job ${pi.metadata.job_id}`);

            // Send payment confirmation emails (fire-and-forget)
            try {
              const [payerProfile, payeeProfile, job] = await Promise.all([
                supabase.from('profiles').select('email, first_name, last_name').eq('id', userId).single(),
                supabase.from('profiles').select('email, first_name, last_name').eq('id', pi.metadata.payee_id).single(),
                supabase.from('jobs').select('title').eq('id', pi.metadata.job_id).single(),
              ]);

              const amount = `$${(pi.amount / 100).toFixed(2)}`;
              const jobTitle = job.data?.title || 'Job';
              const paymentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              // Email to payer (homeowner) — payment sent confirmation
              if (payerProfile.data?.email) {
                const tpl = paymentSentEmail({
                  recipientName: payerProfile.data.first_name || 'there',
                  amount,
                  jobTitle,
                  contractorName: `${payeeProfile.data?.first_name || ''} ${payeeProfile.data?.last_name || ''}`.trim() || 'Contractor',
                  paymentDate,
                });
                await sgMail.send({ to: payerProfile.data.email, from: { email: FROM_EMAIL, name: 'Emporva' }, subject: tpl.subject, html: tpl.html });
              }

              // Email to payee (contractor) — payment received confirmation
              if (payeeProfile.data?.email) {
                const tpl = paymentReceivedEmail({
                  recipientName: payeeProfile.data.first_name || 'there',
                  amount,
                  jobTitle,
                  payerName: `${payerProfile.data?.first_name || ''} ${payerProfile.data?.last_name || ''}`.trim() || 'Homeowner',
                  paymentDate,
                });
                await sgMail.send({ to: payeeProfile.data.email, from: { email: FROM_EMAIL, name: 'Emporva' }, subject: tpl.subject, html: tpl.html });
              }

              console.log(`[Stripe] Payment confirmation emails sent for job ${pi.metadata.job_id}`);
            } catch (emailErr) {
              console.error('[Stripe] Failed to send payment emails:', emailErr);
            }
          }
          break;
        }

        break;
      }

      // ── Payment failed ──
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.error(`[Stripe] Payment failed: ${pi.id}, reason: ${pi.last_payment_error?.message}`);

        // Update any pending payment records
        if (pi.metadata?.job_id) {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', pi.id);
        }
        break;
      }

      // ── Subscription cancelled (final, post-period-end) ──
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.emporva_user_id;
        if (!userId) break;

        await supabase
          .from('profiles')
          .update({
            tier: 'core',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            subscription_current_period_end: null,
          })
          .eq('id', userId);

        await supabase
          .from('contractor_profiles')
          .update({ selected_plan: 'core' })
          .eq('user_id', userId);

        console.log(`[Stripe] Subscription cancelled for user ${userId}, downgraded to core`);
        break;
      }

      // ── Invoice paid (logging) ──
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Invoice paid: ${invoice.id}, amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
        break;
      }

      // ── Renewal payment failed — mark past_due, keep tier during retry window ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Subscription-related invoices have a parent.subscription_details link in
        // newer API versions; fall back to the legacy top-level `subscription` field.
        const subId =
          (invoice.parent as { subscription_details?: { subscription?: string } } | null)
            ?.subscription_details?.subscription
          ?? (invoice as unknown as { subscription?: string }).subscription
          ?? null;
        if (!subId) break;

        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subId);

        console.log(`[Stripe] Invoice payment failed for subscription ${subId}, marked past_due`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe] Webhook handler error for ${event.type}:`, err);
    // Still return 200 to acknowledge receipt — don't make Stripe retry
  }

  return res.status(200).json({ received: true });
}

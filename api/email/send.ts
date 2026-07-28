import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser, supabase } from '../_lib/auth.js';
import { sgMail, FROM_EMAIL } from '../_lib/sendgrid.js';
import { jobAssignedEmail, newMessageEmail, quoteSentEmail, quoteAcceptedEmail, quoteDeclinedEmail } from '../_lib/emailTemplates.js';

// Simple in-memory rate limiter (resets on cold start — acceptable for v1)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  if (isRateLimited(user.id)) return res.status(429).json({ error: 'Too many requests' });

  const { type, data } = req.body || {};
  if (!type || !data) return res.status(400).json({ error: 'Missing type or data' });

  try {
    switch (type) {
      case 'job_assigned': {
        await handleJobAssigned(data);
        break;
      }
      case 'new_message': {
        await handleNewMessage(user.id, data);
        break;
      }
      case 'quote_sent': {
        await handleQuoteSent(data);
        break;
      }
      case 'quote_accepted': {
        await handleQuoteAccepted(data);
        break;
      }
      case 'quote_declined': {
        await handleQuoteDeclined(data);
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

// ── Job Assignment Email ──

async function handleJobAssigned(data: { workItemId?: string }) {
  if (!data.workItemId) throw new Error('Missing workItemId');

  // Fetch work item with job and contractor info
  const { data: wi } = await supabase
    .from('work_items')
    .select('id, job_id, contractor_id, title, trade')
    .eq('id', data.workItemId)
    .single();

  if (!wi || !wi.contractor_id) throw new Error('Work item not found or no contractor assigned');

  // Fetch job details and profiles in parallel
  const [jobRes, contractorRes] = await Promise.all([
    supabase.from('jobs').select('title, location, user_id').eq('id', wi.job_id).single(),
    supabase.from('profiles').select('email, first_name, last_name').eq('id', wi.contractor_id).single(),
  ]);

  const job = jobRes.data;
  const contractor = contractorRes.data;
  if (!job || !contractor?.email) return;

  // Fetch homeowner name
  const { data: homeowner } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', job.user_id)
    .single();

  const tpl = jobAssignedEmail({
    contractorName: contractor.first_name || 'there',
    jobTitle: job.title,
    clientName: homeowner ? `${homeowner.first_name} ${homeowner.last_name}` : 'Homeowner',
    propertyAddress: job.location || 'See dashboard for details',
    trade: wi.trade || 'General',
  });

  await sgMail.send({
    to: contractor.email,
    from: { email: FROM_EMAIL, name: 'Emporva' },
    subject: tpl.subject,
    html: tpl.html,
  });

  console.log(`[Email] Job assigned notification sent to ${contractor.email} for work item ${wi.id}`);
}

// ── New Message Email ──

async function handleNewMessage(senderId: string, data: { conversationId?: string; messagePreview?: string }) {
  if (!data.conversationId) throw new Error('Missing conversationId');

  // Get all participants except the sender
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', data.conversationId)
    .neq('user_id', senderId);

  if (!participants || participants.length === 0) return;

  // Get conversation title
  const { data: conversation } = await supabase
    .from('conversations')
    .select('title')
    .eq('id', data.conversationId)
    .single();

  // Get sender name
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', senderId)
    .single();

  const senderName = senderProfile
    ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim()
    : 'Someone';

  // Fetch recipient profiles and their notification settings
  const recipientIds = participants.map(p => p.user_id);
  const [profilesRes, settingsRes] = await Promise.all([
    supabase.from('profiles').select('id, email, first_name').in('id', recipientIds),
    supabase.from('user_settings').select('user_id, email_messages').in('user_id', recipientIds),
  ]);

  const profiles = profilesRes.data || [];
  const settingsMap = new Map((settingsRes.data || []).map(s => [s.user_id, s]));

  // Send to each recipient who has email_messages enabled (or no settings = default on)
  for (const profile of profiles) {
    if (!profile.email) continue;

    const settings = settingsMap.get(profile.id);
    if (settings && settings.email_messages === false) continue;

    const tpl = newMessageEmail({
      recipientName: profile.first_name || 'there',
      senderName,
      messagePreview: data.messagePreview || 'You have a new message.',
      conversationTitle: conversation?.title || undefined,
    });

    await sgMail.send({
      to: profile.email,
      from: { email: FROM_EMAIL, name: 'Emporva' },
      subject: tpl.subject,
      html: tpl.html,
    });

    console.log(`[Email] New message notification sent to ${profile.email}`);
  }
}

// ── Quote Sent Email (to homeowner) ──

function formatTotal(value: number | string | null | undefined): string {
  const n = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

async function handleQuoteSent(data: { quoteId?: string }) {
  if (!data.quoteId) throw new Error('Missing quoteId');

  const { data: quote } = await supabase
    .from('quotes')
    .select('id, user_id, job_id, job_title, total, estimated_duration, validity_days')
    .eq('id', data.quoteId)
    .single();
  if (!quote || !quote.job_id) return;

  const { data: job } = await supabase
    .from('jobs')
    .select('user_id')
    .eq('id', quote.job_id)
    .single();
  if (!job) return;

  const [{ data: homeowner }, { data: contractor }, { data: contractorBiz }] = await Promise.all([
    supabase.from('profiles').select('email, first_name').eq('id', job.user_id).single(),
    supabase.from('profiles').select('first_name, last_name').eq('id', quote.user_id).single(),
    supabase.from('contractor_profiles').select('business_name').eq('user_id', quote.user_id).maybeSingle(),
  ]);
  if (!homeowner?.email) return;

  const tpl = quoteSentEmail({
    homeownerName: homeowner.first_name || 'there',
    contractorName: [contractor?.first_name, contractor?.last_name].filter(Boolean).join(' ') || 'Your contractor',
    contractorBusiness: contractorBiz?.business_name || null,
    jobTitle: quote.job_title || 'your job',
    total: formatTotal(quote.total),
    estimatedDuration: quote.estimated_duration || null,
    validityDays: quote.validity_days || null,
  });

  await sgMail.send({
    to: homeowner.email,
    from: { email: FROM_EMAIL, name: 'Emporva' },
    subject: tpl.subject,
    html: tpl.html,
  });

  console.log(`[Email] Quote sent notification delivered to ${homeowner.email} for quote ${quote.id}`);
}

// ── Quote Accepted / Declined Emails (to contractor) ──

async function handleQuoteAccepted(data: { quoteId?: string }) {
  if (!data.quoteId) throw new Error('Missing quoteId');
  const { quote, contractor, homeowner } = await loadQuoteParties(data.quoteId);
  if (!quote || !contractor?.email || !homeowner) return;

  const tpl = quoteAcceptedEmail({
    contractorName: contractor.first_name || 'there',
    homeownerName: [homeowner.first_name, homeowner.last_name].filter(Boolean).join(' ') || 'The homeowner',
    jobTitle: quote.job_title || 'their job',
    total: formatTotal(quote.total),
  });

  await sgMail.send({
    to: contractor.email,
    from: { email: FROM_EMAIL, name: 'Emporva' },
    subject: tpl.subject,
    html: tpl.html,
  });

  console.log(`[Email] Quote accepted notification delivered to ${contractor.email} for quote ${quote.id}`);
}

async function handleQuoteDeclined(data: { quoteId?: string; reason?: string }) {
  if (!data.quoteId) throw new Error('Missing quoteId');
  const { quote, contractor, homeowner } = await loadQuoteParties(data.quoteId);
  if (!quote || !contractor?.email || !homeowner) return;

  const tpl = quoteDeclinedEmail({
    contractorName: contractor.first_name || 'there',
    homeownerName: [homeowner.first_name, homeowner.last_name].filter(Boolean).join(' ') || 'The homeowner',
    jobTitle: quote.job_title || 'their job',
    reason: data.reason || null,
  });

  await sgMail.send({
    to: contractor.email,
    from: { email: FROM_EMAIL, name: 'Emporva' },
    subject: tpl.subject,
    html: tpl.html,
  });

  console.log(`[Email] Quote declined notification delivered to ${contractor.email} for quote ${quote.id}`);
}

async function loadQuoteParties(quoteId: string) {
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, user_id, job_id, job_title, total')
    .eq('id', quoteId)
    .single();
  if (!quote) return { quote: null, contractor: null, homeowner: null };

  const [{ data: contractor }, jobRes] = await Promise.all([
    supabase.from('profiles').select('email, first_name').eq('id', quote.user_id).single(),
    quote.job_id ? supabase.from('jobs').select('user_id').eq('id', quote.job_id).single() : Promise.resolve({ data: null }),
  ]);
  const homeownerUserId = jobRes.data?.user_id;
  const { data: homeowner } = homeownerUserId
    ? await supabase.from('profiles').select('first_name, last_name').eq('id', homeownerUserId).single()
    : { data: null };

  return { quote, contractor, homeowner };
}

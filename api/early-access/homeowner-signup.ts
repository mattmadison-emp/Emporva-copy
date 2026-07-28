import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/auth.js';
import { sgMail, FROM_EMAIL } from '../_lib/sendgrid.js';
import { homeownerSignupNotificationEmail } from '../_lib/emailTemplates.js';

// Where the internal signup notification goes. Overridable via env.
const NOTIFY_EMAIL = process.env.EARLY_ACCESS_NOTIFY_EMAIL || 'matt@emporva.com';

// Lightweight per-IP rate limit to blunt spam (resets on cold start — fine for v1).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip =
    (req.headers['x-forwarded-for'] as string || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  const firstName = clean(req.body?.firstName, 100);
  const email = clean(req.body?.email);
  const zipCode = clean(req.body?.zipCode, 20);
  const ownership = clean(req.body?.ownership, 100);

  if (!firstName || !email) return res.status(400).json({ error: 'First name and email are required.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide a valid email address.' });

  let captured = false;
  let notified = false;

  // 1) Capture the signup in the database.
  try {
    const { error } = await supabase.from('early_access_homeowners').insert({
      first_name: firstName,
      email,
      zip_code: zipCode || null,
      ownership: ownership || null,
      source: 'early-access-homeowners',
    });
    if (error) throw error;
    captured = true;
  } catch (err) {
    console.error('[EarlyAccess] Homeowner DB insert failed:', err);
  }

  // 2) Notify the team (best-effort — never lose a lead over a bounced email).
  try {
    const tpl = homeownerSignupNotificationEmail({
      firstName,
      email,
      zipCode,
      ownership,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    });
    await sgMail.send({
      to: NOTIFY_EMAIL,
      from: { email: FROM_EMAIL, name: 'Emporva' },
      replyTo: email,
      subject: tpl.subject,
      html: tpl.html,
    });
    notified = true;
  } catch (err) {
    console.error('[EarlyAccess] Homeowner notification email failed:', err);
  }

  if (!captured && !notified) {
    return res.status(500).json({ error: 'Could not process signup. Please try again.' });
  }

  console.log(`[EarlyAccess] Homeowner signup — captured:${captured} notified:${notified} email:${email}`);
  return res.status(200).json({ success: true });
}

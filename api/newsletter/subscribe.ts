import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/auth.js';

// Lightweight per-IP rate limit to blunt spam (resets on cold start — fine for v1).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip =
    (req.headers['x-forwarded-for'] as string || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const email = rawEmail.trim().toLowerCase().slice(0, 200);
  const source =
    typeof req.body?.source === 'string' ? req.body.source.trim().slice(0, 60) || 'blog' : 'blog';

  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please provide a valid email address.' });

  try {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email, source });
    // 23505 = unique violation → already subscribed. Treat as success (idempotent).
    if (error && error.code !== '23505') throw error;
  } catch (err) {
    console.error('[Newsletter] Subscribe failed:', err);
    return res.status(500).json({ error: 'Could not subscribe right now. Please try again.' });
  }

  console.log(`[Newsletter] Subscribed ${email} (source: ${source})`);
  return res.status(200).json({ success: true });
}

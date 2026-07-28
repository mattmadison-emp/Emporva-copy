import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Simple in-memory rate limiter (per Vercel function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Allowed MIME types for image analysis
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Max base64 payload size (~10MB image = ~13.3MB base64)
const MAX_BASE64_LENGTH = 14_000_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth: optional — use user ID for rate limiting if available, else IP ---
  let rateLimitKey = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'anonymous';

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) rateLimitKey = user.id;
  }

  if (isRateLimited(rateLimitKey)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // --- Input validation ---
  const { image_base64, mime_type } = req.body as {
    image_base64?: string;
    mime_type?: string;
  };

  if (!image_base64 || !mime_type) {
    return res.status(400).json({ error: 'image_base64 and mime_type are required' });
  }

  if (!ALLOWED_MIME_TYPES.includes(mime_type)) {
    return res.status(400).json({ error: 'Unsupported image type. Use JPEG, PNG, GIF, or WebP.' });
  }

  if (image_base64.length > MAX_BASE64_LENGTH) {
    return res.status(400).json({ error: 'Image too large. Maximum size is 10MB.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      // Force valid JSON so parsing can't fail on prose/markdown wrappers.
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an image classifier for a home services platform. Analyze this image and determine if it relates to a home, property, building, yard, or household item (e.g. plumbing, electrical, HVAC, roofing, appliances, structural damage, landscaping, pools, decks, fences, driveways, interior/exterior of a home, etc.).

Be permissive: close-up or ambiguous photos (a stain, a crack, mold vs. dirt, a component) are typically home-related. Set "isHomeRelated" to false ONLY when the image is CLEARLY unrelated to any home or property (e.g. a person's face, a pet, food, a screenshot, a document). When in doubt, set it to true.

Respond in JSON with exactly two fields:
- "isHomeRelated": true or false
- "analysis": a brief one-sentence description of what the image shows`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mime_type};base64,${image_base64}`,
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '';
    const content = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

    // Fail open: if the model returns unparseable output, let the image
    // through rather than blocking a legitimate home photo. The AI agent
    // performs its own home-relatedness check downstream.
    let parsed: { isHomeRelated?: unknown; analysis?: unknown };
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(200).json({
        isHomeRelated: true,
        analysis: '',
      });
    }

    return res.status(200).json({
      isHomeRelated: parsed.isHomeRelated !== false,
      analysis: parsed.analysis != null ? String(parsed.analysis) : '',
    });
  } catch {
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
}

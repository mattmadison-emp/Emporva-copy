import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 300_000 }); // 5 min window
    return false;
  }
  entry.count++;
  return entry.count > 5; // 5 per 5 minutes
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (isRateLimited(user.id)) return res.status(429).json({ error: 'Rate limit exceeded. Try again in a few minutes.' });

  const { sourcePhotoUrl, projectTitle, projectCategory, styleName, propertyType, squareFootage } = req.body;

  if (!styleName || !projectTitle) {
    return res.status(400).json({ error: 'Missing required fields: styleName, projectTitle' });
  }

  try {
    // Step 1: Use GPT-4o to generate scenario details (cost, timeline, ROI, description)
    const analysisPrompt = `You are a home renovation cost estimator. Generate a renovation scenario for:

Project: ${projectTitle}
Style: ${styleName}
Property Type: ${propertyType || 'residential home'}
${squareFootage ? `Square Footage: ${squareFootage} sq ft` : ''}
Category: ${projectCategory || 'General'}

Provide a JSON response with exactly these fields:
{
  "styleDescription": "2-3 sentence description of this renovation style and what it includes",
  "estimatedCostLow": <number, USD>,
  "estimatedCostHigh": <number, USD>,
  "estimatedTimeline": "<X-Y weeks>",
  "roiEstimate": "+<X-Y>%",
  "keyFeatures": ["feature1", "feature2", "feature3", "feature4"]
}

Be realistic with costs based on 2024-2025 market rates. ROI should reflect actual home value impact.`;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const analysisText = analysisResponse.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisText);

    // Step 2: Generate a visualization image using DALL-E
    let generatedImageUrl = '';
    try {
      const imagePrompt = `Professional interior design photo of a ${styleName.toLowerCase()} style ${projectCategory?.toLowerCase() || 'room'} renovation. ${analysis.styleDescription || ''}. Bright, well-lit, high-end residential photography, 4K quality, realistic.`;

      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt.slice(0, 4000),
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      });

      const dalleUrl = imageResponse.data[0]?.url || '';

      // DALL-E image URLs expire after ~1 hour. Re-host the image to our own
      // storage so it persists; fall back to the transient URL if that fails.
      if (dalleUrl) {
        try {
          const imgRes = await fetch(dalleUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const path = `${user.id}/generated/${Date.now()}.png`;
            const { error: upErr } = await supabase.storage
              .from('renovation-photos')
              .upload(path, buffer, { contentType: 'image/png', upsert: false });
            if (upErr) {
              console.error('Re-host upload failed, using transient URL:', upErr);
              generatedImageUrl = dalleUrl;
            } else {
              const { data: pub } = supabase.storage.from('renovation-photos').getPublicUrl(path);
              generatedImageUrl = pub?.publicUrl || dalleUrl;
            }
          } else {
            generatedImageUrl = dalleUrl;
          }
        } catch (rehostErr) {
          console.error('Re-host failed, using transient URL:', rehostErr);
          generatedImageUrl = dalleUrl;
        }
      }
    } catch (imgErr) {
      console.error('Image generation failed:', imgErr);
      // Continue without image — component will show placeholder
    }

    return res.status(200).json({
      name: styleName,
      styleDescription: analysis.styleDescription || '',
      estimatedCostLow: analysis.estimatedCostLow || 0,
      estimatedCostHigh: analysis.estimatedCostHigh || 0,
      estimatedTimeline: analysis.estimatedTimeline || '',
      roiEstimate: analysis.roiEstimate || '',
      keyFeatures: analysis.keyFeatures || [],
      generatedImageUrl,
    });
  } catch (err) {
    console.error('Renovation generation error:', err);
    return res.status(500).json({ error: 'Failed to generate renovation scenario' });
  }
}

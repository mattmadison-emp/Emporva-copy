import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { projectName, category, description } = req.body;

  if (!projectName || !category) {
    return res.status(400).json({ error: 'projectName and category are required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert DIY home improvement advisor. Generate a detailed, practical plan for a homeowner DIY project. Return a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "complexity": "Easy" | "Moderate" | "Advanced",
  "estimatedTime": "string (e.g., '2-4 hours')",
  "safetyWarnings": ["string"],
  "tasks": [
    { "description": "string", "estimatedMinutes": number }
  ],
  "materials": [
    { "name": "string", "quantity": number, "estimatedCost": number }
  ],
  "resources": [
    { "title": "string", "description": "string", "url": "string", "type": "guide" | "article" }
  ],
  "proTips": ["string"],
  "totalCost": number
}

Rules:
- Tasks should be specific, actionable steps in order (5-10 steps)
- Materials should include realistic prices in USD
- totalCost should equal the sum of (quantity * estimatedCost) for all materials
- Resources should be real, helpful URLs from sites like familyhandyman.com, homedepot.com, lowes.com, thisoldhouse.com
- Complexity should reflect actual difficulty for an average homeowner
- Include relevant safety warnings for the category
- Pro tips should be practical insider knowledge`
        },
        {
          role: 'user',
          content: `Generate a DIY plan for this project:
Project: ${projectName}
Category: ${category}
${description ? `Description: ${description}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const plan = JSON.parse(content.replace(/```json?\n?/g, '').replace(/```/g, '').trim());

    // Validate and ensure required fields
    const result = {
      complexity: plan.complexity || 'Moderate',
      estimatedTime: plan.estimatedTime || '2-4 hours',
      safetyWarnings: plan.safetyWarnings || [],
      tasks: (plan.tasks || []).map((t: { description: string; estimatedMinutes?: number }, i: number) => ({
        id: `task-${i + 1}`,
        description: t.description,
        completed: false,
        estimatedMinutes: t.estimatedMinutes || 15,
      })),
      materials: (plan.materials || []).map((m: { name: string; quantity?: number; estimatedCost?: number }, i: number) => ({
        id: `mat-${i + 1}`,
        name: m.name,
        quantity: m.quantity || 1,
        estimatedCost: m.estimatedCost || 0,
      })),
      resources: (plan.resources || []).map((r: { title: string; description?: string; url?: string; type?: string }, i: number) => ({
        id: `res-${i + 1}`,
        title: r.title,
        description: r.description || '',
        url: r.url || '#',
        type: r.type === 'article' ? 'article' : 'guide',
      })),
      proTips: plan.proTips || [],
      totalCost: plan.totalCost || (plan.materials || []).reduce((sum: number, m: { quantity?: number; estimatedCost?: number }) => sum + (m.quantity || 1) * (m.estimatedCost || 0), 0),
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('DIY plan generation error:', err);
    return res.status(500).json({ error: 'Failed to generate plan' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
);

const MAX_CONTEXT_CHARS = 12_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Auth ---
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  const systemId = req.body?.systemId;
  const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 800) : '';
  if (!systemId || typeof systemId !== 'string') return res.status(400).json({ error: 'systemId is required' });
  if (!question) return res.status(400).json({ error: 'question is required' });

  // --- Load the system (enforce ownership) ---
  const { data: system } = await supabase
    .from('property_systems')
    .select('id, user_id, name, category, type, install_year, last_service_date, condition, estimated_lifespan_years')
    .eq('id', systemId)
    .single();
  if (!system || system.user_id !== user.id) return res.status(404).json({ error: 'System not found' });

  // --- Gather processed document context ---
  const { data: docs } = await supabase
    .from('property_system_documents')
    .select('name, type, extracted_text, ai_insights')
    .eq('system_id', systemId)
    .eq('user_id', user.id)
    .eq('ai_processed', true);

  const docContexts: string[] = [];
  let used = 0;
  for (const d of docs || []) {
    const text: string = typeof d.extracted_text === 'string' ? d.extracted_text : '';
    const insights: string[] = Array.isArray(d.ai_insights) ? d.ai_insights : [];
    const body = text || insights.map((i) => `- ${i}`).join('\n');
    if (!body) continue;
    const block = `### ${d.type.toUpperCase()}: ${d.name}\n${body}`;
    if (used + block.length > MAX_CONTEXT_CHARS) break;
    docContexts.push(block);
    used += block.length;
  }

  const systemFacts = [
    `Name: ${system.name}`,
    `Category: ${system.category}`,
    system.type ? `Type: ${system.type}` : '',
    system.install_year ? `Installed: ${system.install_year}` : '',
    system.last_service_date ? `Last service: ${system.last_service_date}` : '',
    system.condition ? `Condition: ${system.condition}` : '',
    system.estimated_lifespan_years ? `Estimated lifespan: ${system.estimated_lifespan_years} years` : '',
  ].filter(Boolean).join('\n');

  const hasDocs = docContexts.length > 0;
  const systemPrompt =
    `You are Emporva's home-systems assistant, helping a homeowner understand their ${system.name}. ` +
    `Answer their question using ONLY the system details and the content extracted from their uploaded documents below. ` +
    `Be concise, practical, and specific — cite concrete numbers (intervals, part numbers, sizes, dates) when the documents contain them. ` +
    `If the answer is not in the documents or system details, say so plainly and suggest what document they could upload (e.g. the owner's manual or warranty) to get a precise answer. ` +
    `Never invent specifications or warranty terms.\n\n` +
    `=== SYSTEM DETAILS ===\n${systemFacts}\n\n` +
    (hasDocs
      ? `=== UPLOADED DOCUMENTS ===\n${docContexts.join('\n\n')}`
      : `=== UPLOADED DOCUMENTS ===\n(No readable documents have been uploaded for this system yet.)`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });

    const answer = response.choices[0]?.message?.content?.trim() || "I couldn't generate an answer. Please try again.";
    return res.status(200).json({ answer, usedDocuments: docContexts.length });
  } catch (err) {
    console.error('[ask-document] failed:', err);
    return res.status(500).json({ error: 'Failed to answer question' });
  }
}

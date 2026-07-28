import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Give large-PDF analysis room to finish (default serverless timeout is short).
export const maxDuration = 60;

// OpenAI rejects PDF file inputs above ~32MB — fail cleanly before the call.
const MAX_PDF_BYTES = 32 * 1024 * 1024;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
);

const MAX_EXTRACTED_CHARS = 6000;

function mimeFromName(name: string): string {
  const ext = name.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (['txt', 'text', 'md', 'csv', 'log'].includes(ext)) return 'text/plain';
  return '';
}

const PROMPT = (systemLabel: string, docType: string) =>
  `You are analyzing a homeowner's "${docType}" document for their ${systemLabel}. ` +
  `Read the document carefully and return a JSON object with exactly two fields:\n` +
  `- "extracted_text": a thorough, plain-text digest of the document's useful content — ` +
  `model/part numbers, specifications, maintenance schedules and intervals, filter sizes, ` +
  `warranty terms and dates, troubleshooting steps, error codes, and safety warnings. ` +
  `Preserve concrete facts and numbers. Do NOT invent anything not in the document. ` +
  `Keep it under ${MAX_EXTRACTED_CHARS} characters.\n` +
  `- "insights": an array of 3 to 6 short, specific bullet strings summarizing the most ` +
  `useful takeaways for the homeowner (e.g. "Replace 16x25x1 filter every 90 days", ` +
  `"Warranty covers parts for 10 years from install"). If the document is unreadable or ` +
  `irrelevant, return an empty insights array and say so in extracted_text.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Auth ---
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  const documentId = req.body?.documentId;
  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json({ error: 'documentId is required' });
  }

  // --- Load the document + its system, enforce ownership ---
  const { data: doc } = await supabase
    .from('property_system_documents')
    .select('id, user_id, system_id, name, type, file_name, storage_path')
    .eq('id', documentId)
    .single();

  if (!doc || doc.user_id !== user.id) return res.status(404).json({ error: 'Document not found' });

  const { data: system } = await supabase
    .from('property_systems')
    .select('name, type, category')
    .eq('id', doc.system_id)
    .maybeSingle();

  const systemLabel = [system?.name, system?.type, system?.category]
    .filter(Boolean)
    .join(' ') || 'home system';

  const mime = mimeFromName(doc.file_name || doc.storage_path || '');
  const isPdf = mime === 'application/pdf';
  const isImage = mime.startsWith('image/');
  const isText = mime === 'text/plain';

  try {
    // --- Download the binary from private storage (service role) ---
    const { data: blob, error: dlErr } = await supabase.storage
      .from('system-documents')
      .download(doc.storage_path);
    if (dlErr || !blob) throw new Error(`download failed: ${dlErr?.message || 'no data'}`);
    const buffer = Buffer.from(await blob.arrayBuffer());

    if (isPdf && buffer.length > MAX_PDF_BYTES) {
      await supabase
        .from('property_system_documents')
        .update({
          ai_processed: true,
          ai_insights: [],
          ai_error: 'PDF is too large for AI analysis (over 32MB). The file is stored, but not analyzed.',
        })
        .eq('id', doc.id);
      return res.status(200).json({
        insights: [],
        unsupported: true,
        message: 'This PDF is too large to analyze (over 32MB). It has been saved, but AI could not read it.',
      });
    }

    // --- Build the model input based on file type ---
    const promptText = PROMPT(systemLabel, doc.type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: any[];

    if (isPdf) {
      content = [
        { type: 'text', text: promptText },
        {
          type: 'file',
          file: {
            filename: doc.file_name || 'document.pdf',
            file_data: `data:application/pdf;base64,${buffer.toString('base64')}`,
          },
        },
      ];
    } else if (isImage) {
      content = [
        { type: 'text', text: promptText },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${buffer.toString('base64')}` } },
      ];
    } else if (isText) {
      const text = buffer.toString('utf8').slice(0, 24_000);
      content = [{ type: 'text', text: `${promptText}\n\n--- DOCUMENT CONTENT ---\n${text}` }];
    } else {
      // Unsupported (docx/xlsx/etc.) — record honestly instead of faking insights.
      await supabase
        .from('property_system_documents')
        .update({
          ai_processed: true,
          ai_insights: [],
          extracted_text: null,
          ai_error: 'Automatic reading is not yet supported for this file type.',
        })
        .eq('id', doc.id);
      return res.status(200).json({
        insights: [],
        unsupported: true,
        message: 'This file type can be stored but not yet read by AI. Upload a PDF, image, or text file for analysis.',
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let parsed: { extracted_text?: unknown; insights?: unknown } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const extractedText = typeof parsed.extracted_text === 'string'
      ? parsed.extracted_text.slice(0, MAX_EXTRACTED_CHARS)
      : '';
    const insights = Array.isArray(parsed.insights)
      ? parsed.insights.filter((i): i is string => typeof i === 'string' && i.trim().length > 0).slice(0, 6)
      : [];

    await supabase
      .from('property_system_documents')
      .update({
        ai_processed: true,
        ai_insights: insights,
        extracted_text: extractedText || null,
        ai_error: null,
      })
      .eq('id', doc.id);

    return res.status(200).json({ insights, extractedTextLength: extractedText.length });
  } catch (err) {
    console.error('[analyze-document] failed:', err);
    await supabase
      .from('property_system_documents')
      .update({ ai_processed: false, ai_error: 'AI analysis failed. Please try again.' })
      .eq('id', doc.id);
    return res.status(500).json({ error: 'Failed to analyze document' });
  }
}

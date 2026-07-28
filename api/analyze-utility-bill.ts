import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function getAuthUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization header' };
  }
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }
  return { user, error: null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth required
  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { bill_id } = req.body as { bill_id?: string };

  if (!bill_id) {
    return res.status(400).json({ error: 'bill_id is required' });
  }

  // Fetch the bill record to get file_path and file_type
  const { data: bill, error: billError } = await supabase
    .from('utility_bills')
    .select('id, file_path, file_type, user_id')
    .eq('id', bill_id)
    .single();

  if (billError || !bill) {
    return res.status(404).json({
      error: 'Bill not found',
      detail: billError?.message,
      bill_id,
      auth_user_id: user.id,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }

  // Verify ownership
  if (bill.user_id !== user.id) {
    return res.status(403).json({
      error: 'Not authorized',
      bill_user_id: bill.user_id,
      auth_user_id: user.id,
    });
  }

  // Mark bill as processing
  await supabase
    .from('utility_bills')
    .update({ status: 'processing' })
    .eq('id', bill_id);

  try {
    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('utility-bills')
      .download(bill.file_path);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file from storage');
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = bill.file_type || 'application/octet-stream';

    const extractionPrompt = `You are a utility bill data extractor. Analyze this utility bill and extract all relevant data.

Respond ONLY with a JSON object containing these fields (use null for any field you cannot determine):

{
  "utility_type": "electric" | "gas" | "water" | "sewer" | "trash" | "internet" | "other",
  "provider": "company name",
  "account_number": "account number (mask middle digits for security)",
  "billing_period_start": "YYYY-MM-DD",
  "billing_period_end": "YYYY-MM-DD",
  "usage_amount": number,
  "usage_unit": "kWh" | "therms" | "gallons" | "ccf" | "cubic feet" | other unit string,
  "total_cost": number (dollars, no $ sign),
  "previous_usage": number or null,
  "previous_cost": number or null,
  "rate_per_unit": number or null,
  "taxes_and_fees": number or null,
  "due_date": "YYYY-MM-DD" or null,
  "summary": "One sentence summary of the bill",
  "tips": "One or two actionable tips to reduce this utility cost based on the usage pattern"
}

Be precise with numbers. Extract exactly what the bill shows. Respond ONLY with the JSON object.`;

    // Build content array — PDFs use file type, images use image_url
    const isPdf = mimeType === 'application/pdf';

    const contentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: extractionPrompt },
    ];

    if (isPdf) {
      contentParts.push({
        type: 'file',
        file: {
          filename: 'utility_bill.pdf',
          file_data: `data:application/pdf;base64,${base64}`,
        },
      } as unknown as OpenAI.Chat.Completions.ChatCompletionContentPart);
    } else {
      contentParts.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` },
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{ role: 'user', content: contentParts }],
    });

    const raw = response.choices[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const extracted = JSON.parse(cleaned);

    // Update the bill record with extracted data
    const { error: updateError } = await supabase
      .from('utility_bills')
      .update({
        utility_type: extracted.utility_type,
        provider: extracted.provider,
        account_number: extracted.account_number,
        billing_period_start: extracted.billing_period_start,
        billing_period_end: extracted.billing_period_end,
        usage_amount: extracted.usage_amount,
        usage_unit: extracted.usage_unit,
        total_cost: extracted.total_cost,
        previous_usage: extracted.previous_usage,
        previous_cost: extracted.previous_cost,
        rate_per_unit: extracted.rate_per_unit,
        taxes_and_fees: extracted.taxes_and_fees,
        due_date: extracted.due_date,
        ai_summary: extracted.summary,
        ai_tips: extracted.tips,
        raw_extraction: extracted,
        status: 'complete',
        error_message: null,
      })
      .eq('id', bill_id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to save extraction results' });
    }

    return res.status(200).json({ success: true, data: extracted });
  } catch (err) {
    // Mark as error
    await supabase
      .from('utility_bills')
      .update({
        status: 'error',
        error_message: err instanceof Error ? err.message : 'AI analysis failed',
      })
      .eq('id', bill_id);

    return res.status(500).json({ error: 'Failed to analyze utility bill' });
  }
}

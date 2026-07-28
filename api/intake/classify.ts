import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { getAuthUser, supabase } from '../_lib/auth.js';
import {
  STAGING_BUCKET,
  SYSTEM_DOC_TYPES,
  VAULT_CATEGORIES,
  SYSTEM_CATEGORIES,
  MAX_EXTRACTED_CHARS,
  mimeFromName,
  isValidStagingPath,
  sanitizeInsights,
  sanitizeExtractedText,
} from '../_lib/intake.js';

// Give large-PDF analysis room to finish (default serverless timeout is short).
export const maxDuration = 60;

// OpenAI rejects PDF file inputs above ~32MB — fail cleanly before the call.
const MAX_PDF_BYTES = 32 * 1024 * 1024;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserSystem {
  id: string;
  name: string | null;
  type: string | null;
  category: string | null;
}

const PROMPT = (systems: UserSystem[]) =>
  `You are the intake assistant for a homeowner's property records. The homeowner uploaded a ` +
  `document and you must decide where it belongs, then extract its useful content.\n\n` +
  `The homeowner's registered home systems (JSON array of {id, name, type, category}):\n` +
  `${JSON.stringify(systems.map(s => ({ id: s.id, name: s.name, type: s.type, category: s.category })))}\n\n` +
  `Return a JSON object with exactly these fields:\n` +
  `- "destination": "system" if the document is about ONE specific installed system or appliance ` +
  `(product manual, product warranty, purchase/service receipt for a specific unit, spec sheet); ` +
  `"property" if it concerns the property as a whole (insurance policy, deed, appraisal, permit, ` +
  `tax document, inspection report, contract, utility agreement) or no single system fits.\n` +
  `- "title": a short human-friendly document name, e.g. "Rheem Water Heater Manual".\n` +
  `- "system_doc_type": when destination is "system", one of ${JSON.stringify(SYSTEM_DOC_TYPES)}; otherwise null.\n` +
  `- "vault_category": when destination is "property", one of ${JSON.stringify(VAULT_CATEGORIES)}; otherwise null.\n` +
  `- "matched_system_id": the "id" of the registered system this document belongs to, or null if none matches. ` +
  `Only use ids from the list above. Match on what the system IS (e.g. a furnace manual matches an HVAC furnace), ` +
  `not on loose keyword overlap.\n` +
  `- "suggested_new_system": when destination is "system" but no registered system matches, propose one as ` +
  `{"name": string, "category": one of ${JSON.stringify(SYSTEM_CATEGORIES)}, "type": string, "brand_model": string or null, ` +
  `"install_year": 4-digit year or null}. Otherwise null. Take install_year from an install/purchase/service date in the ` +
  `document (a receipt or warranty registration date is a good proxy; a manual's print date is NOT). ` +
  `Example: {"name": "Water Heater", "category": "Plumbing", "type": "Tank water heater", "brand_model": "Rheem XE50M06ST45U1", "install_year": 2021}.\n` +
  `- "extracted_text": a thorough plain-text digest of the document's useful content — model/part numbers, ` +
  `specifications, maintenance schedules and intervals, warranty terms and dates, coverage amounts, policy numbers, ` +
  `dates, dollar figures, safety warnings. Preserve concrete facts and numbers. Do NOT invent anything not in the ` +
  `document. Keep it under ${MAX_EXTRACTED_CHARS} characters.\n` +
  `- "insights": an array of 3 to 6 short, specific bullet strings with the most useful takeaways ` +
  `(e.g. "Replace 16x25x1 filter every 90 days", "Policy renews March 12, 2027").\n` +
  `- "reason": one short sentence, addressed to the homeowner, saying what the document looks like and why it goes ` +
  `where you put it, e.g. "This looks like a furnace manual, so I'd file it under your HVAC system."\n\n` +
  `If the document is unreadable or irrelevant to a home, use destination "property", vault_category "Other", ` +
  `an empty insights array, and say so in extracted_text and reason.`;

// Unsupported binaries (docx/xlsx/…) can't be read by the model, but we can still
// take a cheap guess at routing from the file name alone so the confirm UI is
// prefilled sensibly.
const NAME_ONLY_PROMPT = (fileName: string, systems: UserSystem[]) =>
  `A homeowner uploaded a file we cannot read automatically, named "${fileName}". Based only on the file name, ` +
  `guess where it belongs among their property records.\n\n` +
  `Their registered home systems (JSON array of {id, name, type, category}):\n` +
  `${JSON.stringify(systems.map(s => ({ id: s.id, name: s.name, type: s.type, category: s.category })))}\n\n` +
  `Return a JSON object with fields "destination" ("system" or "property"), "title" (cleaned-up name), ` +
  `"system_doc_type" (one of ${JSON.stringify(SYSTEM_DOC_TYPES)} or null), ` +
  `"vault_category" (one of ${JSON.stringify(VAULT_CATEGORIES)} or null), ` +
  `"matched_system_id" (an id from the list or null), "suggested_new_system" (null), ` +
  `"extracted_text" (null), "insights" (empty array), and "reason" (one short sentence for the homeowner, ` +
  `mentioning the file itself couldn't be read). When unsure, use destination "property" and vault_category "Other".`;

interface RawClassification {
  destination?: unknown;
  title?: unknown;
  system_doc_type?: unknown;
  vault_category?: unknown;
  matched_system_id?: unknown;
  suggested_new_system?: unknown;
  extracted_text?: unknown;
  insights?: unknown;
  reason?: unknown;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const { stagingPath, fileName } = req.body || {};
  if (!isValidStagingPath(stagingPath, user.id)) {
    return res.status(400).json({ error: 'A valid stagingPath is required' });
  }
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ error: 'fileName is required' });
  }

  const { data: systems } = await supabase
    .from('property_systems')
    .select('id, name, type, category')
    .eq('user_id', user.id);
  const userSystems: UserSystem[] = systems || [];

  const mime = mimeFromName(fileName);
  const isPdf = mime === 'application/pdf';
  const isImage = mime.startsWith('image/');
  const isText = mime === 'text/plain';
  const readable = isPdf || isImage || isText;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: any[];

    if (readable) {
      const { data: blob, error: dlErr } = await supabase.storage
        .from(STAGING_BUCKET)
        .download(stagingPath);
      if (dlErr || !blob) throw new Error(`staging download failed: ${dlErr?.message || 'no data'}`);
      const buffer = Buffer.from(await blob.arrayBuffer());

      if (isPdf && buffer.length > MAX_PDF_BYTES) {
        return res.status(200).json({
          unsupported: true,
          message: 'This PDF is too large to read (over 32MB). You can still file it manually.',
          classification: fallbackClassification(fileName),
        });
      }

      const promptText = PROMPT(userSystems);
      if (isPdf) {
        content = [
          { type: 'text', text: promptText },
          {
            type: 'file',
            file: {
              filename: fileName,
              file_data: `data:application/pdf;base64,${buffer.toString('base64')}`,
            },
          },
        ];
      } else if (isImage) {
        content = [
          { type: 'text', text: promptText },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${buffer.toString('base64')}` } },
        ];
      } else {
        const text = buffer.toString('utf8').slice(0, 24_000);
        content = [{ type: 'text', text: `${promptText}\n\n--- DOCUMENT CONTENT ---\n${text}` }];
      }
    } else {
      content = [{ type: 'text', text: NAME_ONLY_PROMPT(fileName, userSystems) }];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let parsed: RawClassification = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const classification = validateClassification(parsed, fileName, userSystems);
    return res.status(200).json({
      classification,
      ...(readable ? {} : {
        unsupported: true,
        message: 'This file type can be stored but not read by AI — the suggestion below is based on the file name.',
      }),
    });
  } catch (err) {
    console.error('[intake/classify] failed:', err);
    return res.status(500).json({ error: 'Could not analyze the document. Please try again.' });
  }
}

function fallbackClassification(fileName: string) {
  return {
    destination: 'property' as const,
    title: fileName.replace(/\.[^/.]+$/, ''),
    systemDocType: null,
    vaultCategory: 'Other',
    matchedSystemId: null,
    suggestedNewSystem: null,
    extractedText: null,
    insights: [] as string[],
    reason: 'We could not read this file automatically — please confirm where it should be filed.',
  };
}

function validateClassification(
  parsed: RawClassification,
  fileName: string,
  userSystems: UserSystem[],
) {
  const destination = parsed.destination === 'system' ? 'system' : 'property';

  const title =
    typeof parsed.title === 'string' && parsed.title.trim()
      ? parsed.title.trim().slice(0, 120)
      : fileName.replace(/\.[^/.]+$/, '');

  const systemDocType = SYSTEM_DOC_TYPES.includes(parsed.system_doc_type as never)
    ? (parsed.system_doc_type as (typeof SYSTEM_DOC_TYPES)[number])
    : destination === 'system' ? 'other' : null;

  const vaultCategory = VAULT_CATEGORIES.includes(parsed.vault_category as never)
    ? (parsed.vault_category as (typeof VAULT_CATEGORIES)[number])
    : destination === 'property' ? 'Other' : null;

  const matchedSystemId =
    typeof parsed.matched_system_id === 'string' &&
    userSystems.some(s => s.id === parsed.matched_system_id)
      ? parsed.matched_system_id
      : null;

  let suggestedNewSystem: {
    name: string;
    category: string;
    type: string;
    brandModel: string | null;
    installYear: number | null;
  } | null = null;
  const sns = parsed.suggested_new_system as Record<string, unknown> | null | undefined;
  if (destination === 'system' && !matchedSystemId && sns && typeof sns === 'object') {
    const name = typeof sns.name === 'string' ? sns.name.trim().slice(0, 80) : '';
    const category = SYSTEM_CATEGORIES.includes(sns.category as never) ? (sns.category as string) : '';
    const year = Number(sns.install_year);
    if (name && category) {
      suggestedNewSystem = {
        name,
        category,
        type: typeof sns.type === 'string' ? sns.type.trim().slice(0, 80) : name,
        brandModel: typeof sns.brand_model === 'string' ? sns.brand_model.trim().slice(0, 120) : null,
        installYear:
          Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() ? year : null,
      };
    }
  }

  return {
    destination,
    title,
    systemDocType,
    vaultCategory,
    matchedSystemId,
    suggestedNewSystem,
    extractedText: sanitizeExtractedText(parsed.extracted_text),
    insights: sanitizeInsights(parsed.insights),
    reason:
      typeof parsed.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim().slice(0, 300)
        : 'Here is where we suggest filing this document.',
  };
}

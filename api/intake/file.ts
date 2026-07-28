import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { getAuthUser, supabase } from '../_lib/auth.js';
import {
  STAGING_BUCKET,
  SYSTEM_DOCS_BUCKET,
  SYSTEM_DOC_TYPES,
  VAULT_CATEGORIES,
  mimeFromName,
  isValidStagingPath,
  sanitizeInsights,
  sanitizeExtractedText,
} from '../_lib/intake.js';

// Files a confirmed Smart Intake upload: moves the staged binary to its final
// bucket/folder and inserts the matching row, with the AI reading (from
// /api/intake/classify) persisted alongside so we never re-read the file.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const {
    stagingPath,
    fileName,
    fileSizeBytes,
    destination,
    title,
    systemDocType,
    vaultCategory,
    systemId,
    notes,
    extractedText,
    insights,
  } = req.body || {};

  if (!isValidStagingPath(stagingPath, user.id)) {
    return res.status(400).json({ error: 'A valid stagingPath is required' });
  }
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ error: 'fileName is required' });
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (destination !== 'system' && destination !== 'property') {
    return res.status(400).json({ error: "destination must be 'system' or 'property'" });
  }

  const cleanTitle = title.trim().slice(0, 120);
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 500) : null;
  const cleanText = sanitizeExtractedText(extractedText);
  const cleanInsights = sanitizeInsights(insights);
  const aiProcessed = Boolean(cleanText || cleanInsights.length);
  const sizeBytes = Number(fileSizeBytes) > 0 ? Math.floor(Number(fileSizeBytes)) : 0;
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
  const fileId = randomUUID();

  try {
    if (destination === 'system') {
      if (!systemId || typeof systemId !== 'string') {
        return res.status(400).json({ error: 'systemId is required for a system document' });
      }
      const docType = SYSTEM_DOC_TYPES.includes(systemDocType as never) ? systemDocType : 'other';

      const { data: system } = await supabase
        .from('property_systems')
        .select('id')
        .eq('id', systemId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!system) return res.status(404).json({ error: 'System not found' });

      // Cross-bucket move: download the staged binary, re-upload into the
      // system-documents bucket, then drop the staging copy.
      const { data: blob, error: dlErr } = await supabase.storage
        .from(STAGING_BUCKET)
        .download(stagingPath);
      if (dlErr || !blob) throw new Error(`staging download failed: ${dlErr?.message || 'no data'}`);
      const buffer = Buffer.from(await blob.arrayBuffer());

      const finalPath = `${user.id}/${systemId}/${fileId}${ext}`;
      const { error: upErr } = await supabase.storage
        .from(SYSTEM_DOCS_BUCKET)
        .upload(finalPath, buffer, { contentType: mimeFromName(fileName) || undefined, upsert: false });
      if (upErr) throw new Error(`upload failed: ${upErr.message}`);

      const { data: row, error: insErr } = await supabase
        .from('property_system_documents')
        .insert({
          system_id: systemId,
          user_id: user.id,
          name: cleanTitle,
          type: docType,
          file_name: fileName,
          file_size_bytes: sizeBytes || buffer.length,
          storage_path: finalPath,
          ai_processed: aiProcessed,
          ai_insights: cleanInsights,
          extracted_text: cleanText,
        })
        .select('*')
        .single();
      if (insErr || !row) {
        await supabase.storage.from(SYSTEM_DOCS_BUCKET).remove([finalPath]);
        throw new Error(`insert failed: ${insErr?.message || 'no row'}`);
      }

      await supabase.storage.from(STAGING_BUCKET).remove([stagingPath]);
      return res.status(200).json({ destination, document: row });
    }

    // destination === 'property'
    const category = VAULT_CATEGORIES.includes(vaultCategory as never) ? vaultCategory : 'Other';

    const { data: property } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    if (!property) {
      return res.status(400).json({ error: 'Complete your property setup before filing documents.' });
    }

    // Same bucket — a rename is enough.
    const finalPath = `${user.id}/${property.id}/${fileId}${ext}`;
    const { error: moveErr } = await supabase.storage
      .from(STAGING_BUCKET)
      .move(stagingPath, finalPath);
    if (moveErr) throw new Error(`move failed: ${moveErr.message}`);

    const { data: row, error: insErr } = await supabase
      .from('property_documents')
      .insert({
        property_id: property.id,
        user_id: user.id,
        name: cleanTitle,
        category,
        file_name: fileName,
        file_size_bytes: sizeBytes,
        storage_path: finalPath,
        notes: cleanNotes,
        ai_processed: aiProcessed,
        ai_insights: cleanInsights,
        extracted_text: cleanText,
      })
      .select('*')
      .single();
    if (insErr || !row) {
      // Put the binary back in staging so the client can retry or clean up.
      await supabase.storage.from(STAGING_BUCKET).move(finalPath, stagingPath);
      throw new Error(`insert failed: ${insErr?.message || 'no row'}`);
    }

    return res.status(200).json({ destination, document: row });
  } catch (err) {
    console.error('[intake/file] failed:', err);
    return res.status(500).json({ error: 'Could not file the document. Please try again.' });
  }
}

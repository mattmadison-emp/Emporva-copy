import { supabase } from '../lib/supabase';

// Client side of the Smart Intake flow: stage the file in the user's own
// staging folder, ask the AI where it belongs, then file it once confirmed.

export interface SuggestedNewSystem {
  name: string;
  category: string;
  type: string;
  brandModel: string | null;
  installYear: number | null;
}

export interface IntakeClassification {
  destination: 'system' | 'property';
  title: string;
  systemDocType: 'manual' | 'warranty' | 'receipt' | 'other' | null;
  vaultCategory: string | null;
  matchedSystemId: string | null;
  suggestedNewSystem: SuggestedNewSystem | null;
  extractedText: string | null;
  insights: string[];
  reason: string;
}

export interface ClassifyResponse {
  classification: IntakeClassification;
  unsupported?: boolean;
  message?: string;
}

export interface FilePayload {
  stagingPath: string;
  fileName: string;
  fileSizeBytes: number;
  destination: 'system' | 'property';
  title: string;
  systemDocType?: string | null;
  vaultCategory?: string | null;
  systemId?: string | null;
  notes?: string | null;
  extractedText?: string | null;
  insights?: string[];
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

/** Upload a file into the caller's staging folder; returns the staging path. */
export async function uploadToStaging(file: File, userId: string): Promise<string> {
  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  const fileId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const stagingPath = `${userId}/staging/${fileId}${ext}`;

  const { error } = await supabase.storage
    .from('property-documents')
    .upload(stagingPath, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message || 'Upload failed');
  return stagingPath;
}

/** Ask the AI to read the staged file and suggest where it belongs. */
export async function classifyStagedDocument(
  stagingPath: string,
  fileName: string,
): Promise<ClassifyResponse> {
  const res = await fetch('/api/intake/classify', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ stagingPath, fileName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Classification failed: ${res.status}`);
  }
  return res.json();
}

/** File the staged document into its confirmed home. */
export async function fileStagedDocument(payload: FilePayload): Promise<void> {
  const res = await fetch('/api/intake/file', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Filing failed: ${res.status}`);
  }
}

/** Remove a staged file the user decided not to keep. */
export async function discardStaged(stagingPath: string): Promise<void> {
  const { error } = await supabase.storage.from('property-documents').remove([stagingPath]);
  if (error) console.error('[smart-intake] staging cleanup failed:', error);
}

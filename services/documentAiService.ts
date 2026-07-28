import { supabase } from '../lib/supabase';

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

export interface AnalyzeDocumentResult {
  insights: string[];
  unsupported?: boolean;
  message?: string;
}

/** Run real AI analysis on an uploaded document; persists insights + extracted text server-side. */
export async function analyzeDocument(documentId: string): Promise<AnalyzeDocumentResult> {
  const res = await fetch('/api/analyze-document', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ documentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Document analysis failed: ${res.status}`);
  }
  return res.json();
}

/** Ask a question about a system, answered from its uploaded documents + details. */
export async function askDocument(systemId: string, question: string): Promise<string> {
  const res = await fetch('/api/ask-document', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ systemId, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return typeof data.answer === 'string' ? data.answer : '';
}

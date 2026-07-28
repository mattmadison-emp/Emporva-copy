// Shared pieces for the Smart Intake flow (api/intake/*): a homeowner drops any
// document on the dashboard, AI classifies it, and it gets filed into either the
// Systems Profile (property_system_documents) or the Document Vault
// (property_documents).

export const STAGING_BUCKET = 'property-documents';
export const SYSTEM_DOCS_BUCKET = 'system-documents';

// Must match the CHECK constraint on property_system_documents.type (migration 044).
export const SYSTEM_DOC_TYPES = ['manual', 'warranty', 'receipt', 'other'] as const;

// Must match DOCUMENT_CATEGORIES in the Document Vault UI.
export const VAULT_CATEGORIES = [
  'Insurance',
  'Warranty',
  'Inspection',
  'Permit',
  'Receipt',
  'Appliance Manual',
  'Tax Document',
  'Appraisal',
  'Contract',
  'Other',
] as const;

// Must match the category list in the Systems Profile UI (SystemRegistry.tsx).
export const SYSTEM_CATEGORIES = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Roofing',
  'Exterior',
  'Pool & Spa',
  'Landscaping & Irrigation',
  'Windows & Doors',
  'Kitchen',
  'Laundry',
  'Flooring',
  'Fireplace & Chimney',
  'Security',
  'Garage',
  'Septic & Well',
  'Fencing & Gates',
  'Driveway & Walkways',
  'Solar & Energy',
  'Other',
] as const;

export const MAX_EXTRACTED_CHARS = 6000;
export const MAX_INSIGHTS = 6;

export function mimeFromName(name: string): string {
  const ext = name.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (['txt', 'text', 'md', 'csv', 'log'].includes(ext)) return 'text/plain';
  return '';
}

/**
 * A staged upload must live in the caller's own staging folder:
 * {user_id}/staging/{uuid}.{ext}. Rejects traversal and anything outside it.
 */
export function isValidStagingPath(path: unknown, userId: string): path is string {
  if (typeof path !== 'string') return false;
  if (path.includes('..') || path.includes('//') || path.includes('\\')) return false;
  return new RegExp(`^${userId}/staging/[A-Za-z0-9._-]+$`).test(path);
}

export function sanitizeInsights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    .map(i => i.trim().slice(0, 300))
    .slice(0, MAX_INSIGHTS);
}

export function sanitizeExtractedText(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return value.slice(0, MAX_EXTRACTED_CHARS);
}

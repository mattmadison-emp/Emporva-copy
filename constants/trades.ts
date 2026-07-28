/**
 * Contractor trade options — single source of truth.
 * Used in enrollment, profile editing, job marketplace filters, etc.
 */
export const CONTRACTOR_TRADES = [
  'General Contractor',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Carpentry',
  'Painting',
  'Flooring',
  'Landscaping',
  'Masonry',
  'Drywall',
  'Windows & Doors',
  'Other',
] as const;

export type ContractorTrade = (typeof CONTRACTOR_TRADES)[number];

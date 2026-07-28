// Typical service-life estimates (in years) for home systems, components and
// appliances. Figures are industry baselines drawn from the InterNACHI / ASHI
// "Standard Estimated Life Expectancy" tables — well-established constants, so a
// static lookup is preferable to a live AI call here: it's instant, free and
// can't hallucinate. Used to prefill the "Estimated Lifespan" the moment a
// homeowner picks a system type, and as the fallback for the lifespan progress
// bar when no value was stored.
//
// Note on ordering: keyword rules are evaluated top-to-bottom, so put more
// specific keywords first (e.g. "tankless" before "tank").

interface Rule {
  match: string[];
  years: number;
}

interface CategoryEntry {
  rules: Rule[];
  default: number;
}

const TABLE: Record<string, CategoryEntry> = {
  HVAC: {
    rules: [
      { match: ['mini split', 'mini-split', 'ductless'], years: 20 },
      { match: ['heat pump'], years: 15 },
      { match: ['boiler'], years: 25 },
      { match: ['furnace'], years: 20 },
      { match: ['central', 'air condition', 'central air', 'central-ac', 'ac unit'], years: 15 },
    ],
    default: 15,
  },
  Plumbing: {
    rules: [
      { match: ['tankless'], years: 20 },
      { match: ['hybrid', 'heat pump'], years: 12 },
      { match: ['solar'], years: 20 },
      { match: ['tank', 'water heater'], years: 10 },
      { match: ['copper'], years: 50 },
      { match: ['cast iron'], years: 75 },
      { match: ['galvanized'], years: 45 },
      { match: ['pex'], years: 40 },
      { match: ['cpvc', 'pvc'], years: 40 },
    ],
    default: 50,
  },
  Electrical: {
    rules: [
      { match: ['ev charger', 'ev-charger', 'charger'], years: 15 },
      { match: ['generator'], years: 20 },
      { match: ['panel', 'amp', 'breaker', 'service'], years: 40 },
    ],
    default: 30,
  },
  Roofing: {
    rules: [
      { match: ['slate'], years: 75 },
      { match: ['metal'], years: 50 },
      { match: ['tile', 'clay', 'concrete'], years: 50 },
      { match: ['wood', 'shake', 'cedar'], years: 30 },
      { match: ['flat', 'built-up', 'epdm', 'membrane'], years: 20 },
      { match: ['asphalt', 'shingle', 'composition'], years: 20 },
    ],
    default: 20,
  },
  Exterior: {
    rules: [
      { match: ['brick', 'masonry'], years: 75 },
      { match: ['fiber cement', 'hardie'], years: 50 },
      { match: ['stucco'], years: 50 },
      { match: ['vinyl'], years: 40 },
      { match: ['wood'], years: 30 },
      { match: ['window'], years: 20 },
      { match: ['deck'], years: 15 },
      { match: ['fence'], years: 15 },
      { match: ['patio'], years: 30 },
      { match: ['siding'], years: 40 },
    ],
    default: 25,
  },
  'Windows & Doors': {
    rules: [
      { match: ['window'], years: 20 },
      { match: ['door'], years: 30 },
    ],
    default: 25,
  },
  'Pool & Spa': {
    rules: [
      { match: ['spa', 'hot tub'], years: 10 },
      { match: ['pool'], years: 10 },
    ],
    default: 10,
  },
  'Landscaping & Irrigation': {
    rules: [{ match: ['irrigation', 'sprinkler'], years: 20 }],
    default: 15,
  },
  'Septic & Well': {
    rules: [
      { match: ['septic'], years: 25 },
      { match: ['well'], years: 15 },
    ],
    default: 25,
  },
  'Solar & Energy': {
    rules: [{ match: ['solar', 'panel'], years: 25 }],
    default: 25,
  },
  Security: {
    rules: [{ match: ['smart', 'camera', 'sensor'], years: 5 }],
    default: 10,
  },
  Garage: {
    rules: [
      { match: ['opener'], years: 12 },
      { match: ['door'], years: 20 },
    ],
    default: 15,
  },
  Appliances: {
    rules: [
      { match: ['refrigerator', 'fridge'], years: 13 },
      { match: ['dishwasher'], years: 10 },
      { match: ['oven', 'range', 'stove', 'cooktop'], years: 15 },
      { match: ['microwave'], years: 9 },
      { match: ['washer', 'washing'], years: 11 },
      { match: ['dryer'], years: 13 },
      { match: ['freezer'], years: 15 },
      { match: ['garage door opener', 'opener'], years: 12 },
    ],
    default: 12,
  },
};

// Last-resort keyword pass for categories not in the table (e.g. free-text
// "Other" systems) — checks the type string against a few high-signal terms.
const GLOBAL_RULES: Rule[] = [
  { match: ['water heater', 'tank'], years: 10 },
  { match: ['roof', 'shingle'], years: 20 },
  { match: ['hvac', 'furnace', 'ac'], years: 15 },
  { match: ['window'], years: 20 },
  { match: ['siding'], years: 40 },
];

const FALLBACK_YEARS = 15;

/**
 * Returns a typical service-life estimate (years) for a system, keyed on its
 * category and refined by keywords in the type/model string. Always returns a
 * positive number so it's safe to use directly as a default.
 */
export function getEstimatedLifespan(category?: string | null, type?: string | null): number {
  const t = (type || '').toLowerCase();
  const entry = category ? TABLE[category.trim()] : undefined;

  if (entry) {
    for (const rule of entry.rules) {
      if (rule.match.some(m => t.includes(m))) return rule.years;
    }
    return entry.default;
  }

  for (const rule of GLOBAL_RULES) {
    if (rule.match.some(m => t.includes(m))) return rule.years;
  }
  return FALLBACK_YEARS;
}

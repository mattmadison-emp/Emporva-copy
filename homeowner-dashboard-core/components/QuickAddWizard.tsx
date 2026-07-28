import { useState } from 'react';
import { getEstimatedLifespan } from '../../../utils/systemLifespans';

// Quick Setup Questionnaire — the 5-step onboarding flow from the client's
// "FAQs & Quick Setup" doc. Collects property basics, major systems, exterior,
// features, and appliances, then hands a structured result to the parent which
// persists it (Step 1 -> properties table; everything trackable -> property_systems).

export interface QuickSetupSystem {
  name: string;
  category: string;
  type: string;
  installYear: number | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  estimatedLifespan: number;
}

export interface QuickSetupResult {
  property: {
    property_type?: string;
    year_built?: number | null;
    square_footage?: number | null;
    floors?: string;
    ownership_length?: string;
    hvac_type?: string | null;
    hvac_age?: number | null;
    water_heater_type?: string | null;
    water_heater_age?: number | null;
    roofing_type?: string | null;
    roofing_age?: number | null;
  };
  systems: QuickSetupSystem[];
}

interface QuickAddWizardProps {
  onComplete: (result: QuickSetupResult) => void;
  onSkip: () => void;
}

interface Option { value: string; label: string }

// ── Option catalogs (labels from the doc, values mapped to existing enums) ──
const PROPERTY_TYPES: Option[] = [
  { value: 'single-family', label: 'Single-family' },
  { value: 'townhouse', label: 'Townhome' },
  { value: 'condo', label: 'Condo' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'other', label: 'Other' },
];
const STORIES: Option[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4+' },
];
const OWNERSHIP: Option[] = [
  { value: '<1', label: 'Less than 1 year' },
  { value: '1-5', label: '1–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
];
// HVAC: label -> hvac_type enum ('central-ac'|'heat-pump'|'furnace'|'mini-split'|'other')
const HVAC_TYPES: Option[] = [
  { value: 'central-ac', label: 'Central Air' },
  { value: 'heat-pump', label: 'Heat Pump' },
  { value: 'mini-split', label: 'Mini Split' },
  { value: 'boiler', label: 'Boiler' },
  { value: 'furnace', label: 'Furnace' },
  { value: 'other', label: 'Other' },
];
// Water heater: label -> water_heater_type enum ('tank'|'tankless'|'heat-pump'|'solar')
const WATER_HEATER_TYPES: Option[] = [
  { value: 'tank', label: 'Tank' },
  { value: 'tankless', label: 'Tankless' },
  { value: 'heat-pump', label: 'Hybrid' },
];
const PLUMBING_TYPES: Option[] = [
  { value: 'Copper', label: 'Copper' },
  { value: 'PEX', label: 'PEX' },
  { value: 'CPVC', label: 'CPVC' },
  { value: 'Galvanized', label: 'Galvanized' },
  { value: 'Not sure', label: 'Not sure' },
];
const ELECTRICAL_SERVICE: Option[] = [
  { value: '100 amp', label: '100 amp' },
  { value: '150 amp', label: '150 amp' },
  { value: '200 amp', label: '200 amp' },
  { value: 'Not sure', label: 'Not sure' },
];
const PANEL_UPDATED: Option[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Not sure', label: 'Not sure' },
];
// Roof: label -> roofing_type enum ('asphalt-shingles'|'metal'|'tile'|'slate'|'flat'); 'Other' has no enum
// Roof: 'roof-other' has no roofing_type enum, so it's stored only as a system row.
const ROOF_TYPES: Option[] = [
  { value: 'asphalt-shingles', label: 'Asphalt' },
  { value: 'metal', label: 'Metal' },
  { value: 'tile', label: 'Tile' },
  { value: 'slate', label: 'Slate' },
  { value: 'roof-other', label: 'Other' },
];
const SIDING_TYPES: Option[] = [
  { value: 'Vinyl', label: 'Vinyl' },
  { value: 'Fiber cement', label: 'Fiber cement' },
  { value: 'Brick', label: 'Brick' },
  { value: 'Wood', label: 'Wood' },
  { value: 'Stucco', label: 'Stucco' },
  { value: 'Other', label: 'Other' },
];
const WINDOW_STATUS: Option[] = [
  { value: 'Original', label: 'Original' },
  { value: 'Updated', label: 'Updated' },
  { value: 'Not sure', label: 'Not sure' },
];

interface FeatureDef { key: string; label: string; icon: string; name: string; category: string; type: string }
const FEATURES: FeatureDef[] = [
  { key: 'pool', label: 'Pool', icon: 'ri-water-flash-line', name: 'Swimming Pool', category: 'Pool & Spa', type: 'Pool' },
  { key: 'spa', label: 'Spa / Hot Tub', icon: 'ri-hotel-bed-line', name: 'Hot Tub / Spa', category: 'Pool & Spa', type: 'Spa' },
  { key: 'deck', label: 'Deck', icon: 'ri-building-2-line', name: 'Deck', category: 'Exterior', type: 'Deck' },
  { key: 'patio', label: 'Patio', icon: 'ri-layout-grid-line', name: 'Patio', category: 'Exterior', type: 'Patio' },
  { key: 'fence', label: 'Fence', icon: 'ri-layout-column-line', name: 'Fence', category: 'Exterior', type: 'Fence' },
  { key: 'irrigation', label: 'Irrigation System', icon: 'ri-plant-line', name: 'Irrigation System', category: 'Landscaping & Irrigation', type: 'Irrigation' },
  { key: 'well', label: 'Well', icon: 'ri-drop-line', name: 'Well Water', category: 'Septic & Well', type: 'Well' },
  { key: 'septic', label: 'Septic System', icon: 'ri-recycle-line', name: 'Septic System', category: 'Septic & Well', type: 'Septic' },
  { key: 'solar', label: 'Solar Panels', icon: 'ri-sun-line', name: 'Solar Panels', category: 'Solar & Energy', type: 'Solar' },
  { key: 'generator', label: 'Backup Generator', icon: 'ri-flashlight-line', name: 'Backup Generator', category: 'Electrical', type: 'Generator' },
  { key: 'smart-home', label: 'Smart Home Devices', icon: 'ri-home-wifi-line', name: 'Smart Home Devices', category: 'Security', type: 'Smart Home' },
  { key: 'ev', label: 'EV Charger', icon: 'ri-charging-pile-2-line', name: 'EV Charger', category: 'Electrical', type: 'EV Charger' },
];
const APPLIANCES: Option[] = [
  { value: 'Refrigerator', label: 'Refrigerator' },
  { value: 'Dishwasher', label: 'Dishwasher' },
  { value: 'Oven/Range', label: 'Oven/Range' },
  { value: 'Microwave', label: 'Microwave' },
  { value: 'Washer', label: 'Washer' },
  { value: 'Dryer', label: 'Dryer' },
  { value: 'Freezer', label: 'Freezer' },
  { value: 'Garage Door Opener', label: 'Garage Door Opener' },
];

const STEPS = ['About Your Property', 'Major Home Systems', 'Exterior', 'Property Features', 'Appliances'];
const TOTAL_STEPS = STEPS.length;

// Reusable single-select pill group
function PillGroup({ options, value, onChange }: { options: Option[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o, i) => {
        const active = value === o.value && value !== null;
        return (
          <button
            key={`${o.value}-${i}`}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all whitespace-nowrap border ${
              active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-[#0B1F33] border-gray-200 hover:border-teal-300'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#6B7C8F] mb-2 uppercase tracking-wide">
        {label}{optional && <span className="ml-1 font-normal normal-case tracking-normal text-gray-400">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const numberInputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors';

export default function QuickAddWizard({ onComplete, onSkip }: QuickAddWizardProps) {
  const [step, setStep] = useState(0); // 0..TOTAL_STEPS-1 = data steps, TOTAL_STEPS = done screen
  const currentYear = new Date().getFullYear();

  // Step 1 — property
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [yearBuilt, setYearBuilt] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [stories, setStories] = useState<string | null>(null);
  const [yearsOwned, setYearsOwned] = useState<string | null>(null); // persisted to properties.ownership_length (migration 060)

  // Step 2 — major systems
  const [hvacType, setHvacType] = useState<string | null>(null);
  const [hvacAge, setHvacAge] = useState('');
  const [hvacMfr, setHvacMfr] = useState('');
  const [whType, setWhType] = useState<string | null>(null);
  const [whAge, setWhAge] = useState('');
  const [whModel, setWhModel] = useState('');
  const [plumbingType, setPlumbingType] = useState<string | null>(null);
  const [elecService, setElecService] = useState<string | null>(null);
  const [panelUpdated, setPanelUpdated] = useState<string | null>(null);

  // Step 3 — exterior
  const [roofType, setRoofType] = useState<string | null>(null);
  const [roofAge, setRoofAge] = useState('');
  const [sidingType, setSidingType] = useState<string | null>(null);
  const [windows, setWindows] = useState<string | null>(null);

  // Step 4 / 5 — multi-select
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [appliances, setAppliances] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setter(next);
  };

  const ageToYear = (age: string): number | null => {
    const n = parseInt(age, 10);
    return Number.isFinite(n) && n >= 0 && n < 150 ? currentYear - n : null;
  };

  const buildResult = (): QuickSetupResult => {
    const property: QuickSetupResult['property'] = {};
    // 'duplex' has no property_type enum -> store as 'other'.
    if (propertyType) property.property_type = propertyType === 'duplex' ? 'other' : propertyType;
    if (yearBuilt) property.year_built = Number(yearBuilt) || null;
    if (squareFootage) property.square_footage = Number(squareFootage) || null;
    if (stories) property.floors = stories;
    if (yearsOwned) property.ownership_length = yearsOwned;
    // 'boiler' has no hvac_type enum -> store as 'other' (the label is kept on the system row).
    if (hvacType) { property.hvac_type = hvacType === 'boiler' ? 'other' : hvacType; property.hvac_age = parseInt(hvacAge, 10) >= 0 ? Number(hvacAge) : null; }
    if (whType) { property.water_heater_type = whType; property.water_heater_age = parseInt(whAge, 10) >= 0 ? Number(whAge) : null; }
    // 'roof-other' has no roofing_type enum -> leave the column unset.
    if (roofType && roofType !== 'roof-other') { property.roofing_type = roofType; property.roofing_age = parseInt(roofAge, 10) >= 0 ? Number(roofAge) : null; }

    const systems: QuickSetupSystem[] = [];
    const add = (s: Partial<QuickSetupSystem> & { name: string; category: string }) => {
      const row: QuickSetupSystem = { type: '', installYear: null, condition: 'good', notes: '', estimatedLifespan: 0, ...s };
      // Prefill the expected service life from the system type when not given.
      if (!row.estimatedLifespan) row.estimatedLifespan = getEstimatedLifespan(row.category, row.type);
      systems.push(row);
    };

    if (hvacType) {
      const label = HVAC_TYPES.find(o => o.value === hvacType)?.label || 'HVAC';
      add({ name: 'HVAC System', category: 'HVAC', type: label, installYear: ageToYear(hvacAge), notes: hvacMfr ? `Manufacturer: ${hvacMfr}` : '' });
    }
    if (whType) {
      const label = WATER_HEATER_TYPES.find(o => o.value === whType)?.label || 'Water Heater';
      add({ name: 'Water Heater', category: 'Plumbing', type: label, installYear: ageToYear(whAge), notes: whModel ? `Manufacturer/model: ${whModel}` : '' });
    }
    if (plumbingType && plumbingType !== 'Not sure') {
      add({ name: 'Plumbing', category: 'Plumbing', type: plumbingType });
    }
    if ((elecService && elecService !== 'Not sure') || (panelUpdated && panelUpdated !== 'Not sure')) {
      add({
        name: 'Electrical Panel',
        category: 'Electrical',
        type: elecService && elecService !== 'Not sure' ? elecService : 'Main Panel',
        notes: panelUpdated && panelUpdated !== 'Not sure' ? `Panel updated: ${panelUpdated}` : '',
      });
    }
    if (roofType) {
      const label = ROOF_TYPES.find(o => o.value === roofType)?.label || 'Roof';
      add({ name: 'Roof', category: 'Roofing', type: label, installYear: ageToYear(roofAge) });
    }
    if (sidingType) add({ name: 'Siding', category: 'Exterior', type: sidingType });
    if (windows) add({ name: 'Windows', category: 'Exterior', type: windows });

    FEATURES.filter(f => features.has(f.key)).forEach(f =>
      add({ name: f.name, category: f.category, type: f.type }),
    );
    APPLIANCES.filter(a => appliances.has(a.value)).forEach(a =>
      add({ name: a.label, category: 'Appliances', type: a.label }),
    );

    return { property, systems };
  };

  const result = step === TOTAL_STEPS ? buildResult() : null;

  const next = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <i className="ri-magic-line text-xl text-teal-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F33]">
                  {step < TOTAL_STEPS ? `Quick Setup — ${STEPS[step]}` : 'All set!'}
                </h3>
                <p className="text-sm text-[#6B7C8F]">
                  {step < TOTAL_STEPS ? `Step ${step + 1} of ${TOTAL_STEPS}` : 'Your Property Command Center is ready'}
                </p>
              </div>
            </div>
            {step < TOTAL_STEPS && (
              <button onClick={onSkip} className="text-sm text-[#6B7C8F] hover:text-[#0B1F33] font-semibold cursor-pointer whitespace-nowrap">
                Skip setup
              </button>
            )}
          </div>
          {step < TOTAL_STEPS && (
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-teal-500' : 'bg-gray-100'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-[#6B7C8F] mb-5">
            Everything here is optional — answer what you know and skip the rest. You can always fill in
            details later from your dashboard.
          </p>

          {/* Step 1 — About Your Property */}
          {step === 0 && (
            <div className="space-y-5">
              <Field label="What type of property do you own?">
                <PillGroup options={PROPERTY_TYPES} value={propertyType} onChange={setPropertyType} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Year built">
                  <input type="number" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} placeholder="e.g. 1998" min={1850} max={currentYear} className={numberInputCls} />
                </Field>
                <Field label="Approx. square feet">
                  <input type="number" value={squareFootage} onChange={e => setSquareFootage(e.target.value)} placeholder="e.g. 2200" min={100} className={numberInputCls} />
                </Field>
              </div>
              <Field label="How many stories?">
                <PillGroup options={STORIES} value={stories} onChange={setStories} />
              </Field>
              <Field label="How long have you owned the property?">
                <PillGroup options={OWNERSHIP} value={yearsOwned} onChange={setYearsOwned} />
              </Field>
            </div>
          )}

          {/* Step 2 — Major Home Systems */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-temp-cold-line text-teal-600"></i>HVAC</p>
                <Field label="What type of HVAC system?"><PillGroup options={HVAC_TYPES} value={hvacType} onChange={setHvacType} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Approx. age (years)"><input type="number" value={hvacAge} onChange={e => setHvacAge(e.target.value)} placeholder="e.g. 8" min={0} max={100} className={numberInputCls} /></Field>
                  <Field label="Manufacturer" optional><input type="text" value={hvacMfr} onChange={e => setHvacMfr(e.target.value)} placeholder="e.g. Carrier" className={numberInputCls} /></Field>
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-drop-line text-teal-600"></i>Water Heater</p>
                <Field label="What type of water heater?"><PillGroup options={WATER_HEATER_TYPES} value={whType} onChange={setWhType} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Approx. age (years)"><input type="number" value={whAge} onChange={e => setWhAge(e.target.value)} placeholder="e.g. 5" min={0} max={100} className={numberInputCls} /></Field>
                  <Field label="Manufacturer / model" optional><input type="text" value={whModel} onChange={e => setWhModel(e.target.value)} placeholder="e.g. Rheem" className={numberInputCls} /></Field>
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-water-percent-line text-teal-600"></i>Plumbing</p>
                <Field label="What type of plumbing does your home have?"><PillGroup options={PLUMBING_TYPES} value={plumbingType} onChange={setPlumbingType} /></Field>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-flashlight-line text-teal-600"></i>Electrical</p>
                <Field label="What size electrical service?"><PillGroup options={ELECTRICAL_SERVICE} value={elecService} onChange={setElecService} /></Field>
                <Field label="Has the electrical panel been updated?"><PillGroup options={PANEL_UPDATED} value={panelUpdated} onChange={setPanelUpdated} /></Field>
              </div>
            </div>
          )}

          {/* Step 3 — Exterior */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-home-4-line text-teal-600"></i>Roof</p>
                <Field label="What type of roof do you have?">
                  <PillGroup options={ROOF_TYPES} value={roofType} onChange={setRoofType} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Approx. age (years)"><input type="number" value={roofAge} onChange={e => setRoofAge(e.target.value)} placeholder="e.g. 12" min={0} max={100} className={numberInputCls} /></Field>
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-layout-masonry-line text-teal-600"></i>Siding</p>
                <Field label="What type of siding?"><PillGroup options={SIDING_TYPES} value={sidingType} onChange={setSidingType} /></Field>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="font-bold text-[#0B1F33] text-sm flex items-center gap-2"><i className="ri-window-line text-teal-600"></i>Windows</p>
                <Field label="Are the windows original or updated?"><PillGroup options={WINDOW_STATUS} value={windows} onChange={setWindows} /></Field>
              </div>
            </div>
          )}

          {/* Step 4 — Property Features */}
          {step === 3 && (
            <div>
              <p className="text-sm text-[#0B1F33] font-semibold mb-3">Select everything that applies:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FEATURES.map(f => {
                  const active = features.has(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggle(features, f.key, setFeatures)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                        active ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-[#0B1F33] hover:border-teal-300'
                      }`}
                    >
                      <i className={`${f.icon} text-lg ${active ? 'text-teal-600' : 'text-[#6B7C8F]'}`}></i>
                      <span className="flex-1">{f.label}</span>
                      {active && <i className="ri-check-line text-teal-600"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5 — Appliances */}
          {step === 4 && (
            <div>
              <p className="text-sm text-[#0B1F33] font-semibold mb-1">Which major appliances would you like Emporva to help you track?</p>
              <p className="text-xs text-[#6B7C8F] mb-3">Select everything that applies.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {APPLIANCES.map(a => {
                  const active = appliances.has(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggle(appliances, a.value, setAppliances)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                        active ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-[#0B1F33] hover:border-teal-300'
                      }`}
                    >
                      <i className={`ri-archive-line text-lg ${active ? 'text-teal-600' : 'text-[#6B7C8F]'}`}></i>
                      <span className="flex-1">{a.label}</span>
                      {active && <i className="ri-check-line text-teal-600"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion */}
          {step === TOTAL_STEPS && result && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-rocket-2-line text-3xl text-green-600"></i>
              </div>
              <h4 className="text-xl font-bold text-[#0B1F33] mb-2">Your Property Command Center is Ready</h4>
              <p className="text-sm text-[#6B7C8F] max-w-md mx-auto">
                We'll save your property profile{result.systems.length > 0 ? <> and add <strong>{result.systems.length}</strong> item{result.systems.length !== 1 ? 's' : ''} to your Systems Profile</> : ''}.
                You can edit anything anytime.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              {step > 0 && step <= TOTAL_STEPS && (
                <button onClick={back} className="text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer flex items-center gap-1">
                  <i className="ri-arrow-left-line"></i>Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step < TOTAL_STEPS - 1 && (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                  Next<i className="ri-arrow-right-line"></i>
                </button>
              )}
              {step === TOTAL_STEPS - 1 && (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                  Review<i className="ri-arrow-right-line"></i>
                </button>
              )}
              {step === TOTAL_STEPS && result && (
                <button onClick={() => onComplete(result)} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                  <i className="ri-check-line"></i>Go to my Command Center
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

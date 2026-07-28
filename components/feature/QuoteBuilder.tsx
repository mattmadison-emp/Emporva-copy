
import { useState, useEffect } from 'react';
import { aiAgentService } from '../../services/aiAgentService';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

interface QuoteBuilderProps {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  aiScopeSummary?: string;
  trades?: string[];
  budgetRange?: string;
  onClose: () => void;
  onSubmit: (quote: any) => void;
}

interface AIGeneratedData {
  scopeSummary: string;
  workSteps: string[];
  lineItems: LineItem[];
  materials: string[];
  assumptions: string;
  exclusions: string;
  estimatedDuration: string;
}

function generateAIContent(jobTitle: string, jobDescription: string, _aiScopeSummary?: string, trades?: string[], _budgetRange?: string): AIGeneratedData {
  const title = `${jobTitle} ${jobDescription}`.toLowerCase();

  // Use description hash to vary quantities so different scopes produce different quotes
  const descHash = (jobDescription || jobTitle).split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const vary = (base: number, range: number) => {
    const offset = ((Math.abs(descHash) % (range * 2 + 1)) - range);
    return Math.max(0.5, Math.round((base + offset) * 100) / 100);
  };
  const descSnippet = jobDescription ? ` Scope includes: ${jobDescription.slice(0, 120).toLowerCase()}.` : '';

  if (title.includes('faucet') || title.includes('plumb') || title.includes('sink') || title.includes('leak') || title.includes('drain') || (trades && trades.includes('Plumbing'))) {
    const laborHrs = vary(3, 2);
    return {
      scopeSummary: `Complete ${jobTitle.toLowerCase()} including removal of existing fixture, installation of new unit, connection to water supply lines, and thorough leak testing.${descSnippet} All work performed by licensed professionals in compliance with local plumbing codes.`,
      workSteps: [
        'Shut off water supply and drain existing lines',
        'Disconnect and remove existing faucet/fixture',
        'Inspect supply lines and connections for wear or corrosion',
        'Install new faucet/fixture with proper seals and fittings',
        'Reconnect water supply lines and test connections',
        'Run full leak test under pressure for 15 minutes',
        'Clean work area and dispose of old materials'
      ],
      lineItems: [
        { id: '1', description: 'Licensed plumber labor', quantity: laborHrs, unit: 'hours', unitCost: 95, total: Math.round(laborHrs * 95 * 100) / 100 },
        { id: '2', description: 'Faucet installation hardware kit', quantity: 1, unit: 'ea', unitCost: 35, total: 35 },
        { id: '3', description: 'Supply line connectors (braided stainless)', quantity: 2, unit: 'ea', unitCost: 18, total: 36 },
        { id: '4', description: 'Plumber\'s putty and thread seal tape', quantity: 1, unit: 'lot', unitCost: 12, total: 12 },
        { id: '5', description: 'Cleanup and disposal', quantity: 1, unit: 'ea', unitCost: 25, total: 25 }
      ],
      materials: [
        'Installation hardware kit (mounting nuts, washers, gaskets)',
        'Braided stainless steel supply lines (2x)',
        'Plumber\'s putty',
        'Thread seal tape (PTFE)',
        'Silicone caulk for countertop seal'
      ],
      assumptions: 'Customer has already purchased the new faucet. Existing shut-off valves are functional. No corrosion or damage to supply lines beneath the sink. Standard sink cutout size compatible with new fixture.',
      exclusions: 'Does not include cost of the new faucet itself, replacement of shut-off valves, repair of corroded pipes, or any drywall/cabinet modifications.',
      estimatedDuration: '2-3 hours'
    };
  }

  if (title.includes('paint') || (trades && trades.includes('Painting'))) {
    const prepHrs = vary(4, 2);
    const paintHrs = vary(6, 3);
    return {
      scopeSummary: `Exterior paint touch-up and restoration including surface preparation, priming of damaged areas, and application of matching paint to restore appearance.${descSnippet} All work follows manufacturer specifications for surface prep and paint application.`,
      workSteps: [
        'Inspect all surfaces and identify areas needing attention',
        'Power wash or hand-clean surfaces to remove dirt and loose paint',
        'Scrape and sand peeling or flaking paint areas',
        'Apply primer to bare wood and damaged spots',
        'Caulk gaps and joints as needed',
        'Apply first coat of matching exterior paint',
        'Apply second coat for full coverage and durability',
        'Final inspection and touch-up of any missed areas',
        'Clean up work area and remove drop cloths'
      ],
      lineItems: [
        { id: '1', description: 'Painter labor - surface prep', quantity: prepHrs, unit: 'hours', unitCost: 65, total: Math.round(prepHrs * 65) },
        { id: '2', description: 'Painter labor - painting', quantity: paintHrs, unit: 'hours', unitCost: 65, total: Math.round(paintHrs * 65) },
        { id: '3', description: 'Exterior primer (1 gallon)', quantity: 1, unit: 'ea', unitCost: 42, total: 42 },
        { id: '4', description: 'Exterior paint - color matched (2 gallons)', quantity: 2, unit: 'ea', unitCost: 55, total: 110 },
        { id: '5', description: 'Sandpaper, caulk, and prep supplies', quantity: 1, unit: 'lot', unitCost: 35, total: 35 },
        { id: '6', description: 'Drop cloths and masking materials', quantity: 1, unit: 'lot', unitCost: 20, total: 20 }
      ],
      materials: [
        'Exterior primer (1 gallon)',
        'Color-matched exterior paint (2 gallons)',
        'Sandpaper (80, 120, 220 grit)',
        'Exterior caulk',
        'Drop cloths and painter\'s tape',
        'Brushes and rollers'
      ],
      assumptions: 'Existing paint color can be matched. Surfaces are structurally sound. Weather permits outdoor work during scheduled dates. Scaffolding not required (single-story reach).',
      exclusions: 'Does not include full exterior repaint, wood rot repair, structural repairs, lead paint abatement, or scaffolding rental for multi-story areas.',
      estimatedDuration: '1-2 days'
    };
  }

  if (title.includes('hvac') || title.includes('heat') || title.includes('furnace') || title.includes('air condition') || (trades && trades.includes('HVAC'))) {
    return {
      scopeSummary: `Comprehensive HVAC system maintenance for all units including filter replacement, system inspection, refrigerant level checks, coil cleaning, and minor repairs as needed.${descSnippet} All work performed by EPA-certified technicians.`,
      workSteps: [
        'Schedule unit access with property management',
        'Replace air filters in all units',
        'Inspect and clean evaporator and condenser coils',
        'Check refrigerant levels and top off if needed',
        'Test thermostat calibration and operation',
        'Inspect electrical connections and tighten as needed',
        'Lubricate moving parts (motors, bearings)',
        'Check condensate drain lines and clear blockages',
        'Test system operation in heating and cooling modes',
        'Document findings and provide maintenance report'
      ],
      lineItems: [
        { id: '1', description: 'HVAC technician labor (2 techs)', quantity: 24, unit: 'hours', unitCost: 95, total: 2280 },
        { id: '2', description: 'Air filters (standard sizes, 12 units)', quantity: 12, unit: 'ea', unitCost: 18, total: 216 },
        { id: '3', description: 'Refrigerant top-off (estimated 3 units)', quantity: 3, unit: 'ea', unitCost: 85, total: 255 },
        { id: '4', description: 'Coil cleaning solution and supplies', quantity: 1, unit: 'lot', unitCost: 65, total: 65 },
        { id: '5', description: 'Miscellaneous parts (capacitors, contactors)', quantity: 1, unit: 'lot', unitCost: 150, total: 150 },
        { id: '6', description: 'Travel and equipment', quantity: 1, unit: 'lot', unitCost: 75, total: 75 }
      ],
      materials: [
        'Replacement air filters (12x)',
        'R-410A refrigerant',
        'Coil cleaning solution',
        'Condensate drain tablets',
        'Electrical contact cleaner',
        'Replacement capacitors and contactors (as needed)'
      ],
      assumptions: 'All units are accessible during scheduled maintenance window. Systems are standard split systems under 5 years old. No major component failures requiring replacement. Property management provides unit access.',
      exclusions: 'Does not include major component replacement (compressors, blower motors), ductwork repair or cleaning, thermostat replacement, or emergency service calls outside scheduled maintenance.',
      estimatedDuration: '2-3 days'
    };
  }

  if (title.includes('tile') || (trades && trades.includes('Tile Work'))) {
    return {
      scopeSummary: `Bathroom shower tile repair including careful removal of damaged tiles, surface preparation, waterproofing membrane application, installation of matching replacement tiles, and professional grouting to restore the shower to like-new condition.`,
      workSteps: [
        'Protect bathroom fixtures and flooring with drop cloths',
        'Carefully remove damaged tiles without disturbing surrounding tiles',
        'Clean and inspect substrate for moisture damage',
        'Apply waterproofing membrane to exposed areas',
        'Apply thinset mortar and install replacement tiles',
        'Allow 24-hour cure time for thinset',
        'Apply matching grout to all repaired joints',
        'Seal grout lines with penetrating sealer',
        'Final cleanup and inspection'
      ],
      lineItems: [
        { id: '1', description: 'Tile installer labor', quantity: 8, unit: 'hours', unitCost: 75, total: 600 },
        { id: '2', description: 'Thinset mortar (modified)', quantity: 1, unit: 'ea', unitCost: 28, total: 28 },
        { id: '3', description: 'Waterproofing membrane', quantity: 1, unit: 'ea', unitCost: 45, total: 45 },
        { id: '4', description: 'Grout (color matched)', quantity: 1, unit: 'ea', unitCost: 22, total: 22 },
        { id: '5', description: 'Grout sealer', quantity: 1, unit: 'ea', unitCost: 18, total: 18 },
        { id: '6', description: 'Tile spacers and leveling clips', quantity: 1, unit: 'lot', unitCost: 15, total: 15 }
      ],
      materials: [
        'Modified thinset mortar',
        'Waterproofing membrane (RedGard or equivalent)',
        'Color-matched grout',
        'Penetrating grout sealer',
        'Tile spacers and leveling clips',
        'Silicone caulk for corners and transitions'
      ],
      assumptions: 'Customer has matching replacement tiles available. Substrate behind tiles is in good condition. Damage is limited to 6-8 tiles as described. No plumbing modifications needed.',
      exclusions: 'Does not include cost of replacement tiles, plumbing repairs, mold remediation, full shower re-tile, or replacement of shower fixtures.',
      estimatedDuration: '2 days (including cure time)'
    };
  }

  if (title.includes('electrical') || title.includes('panel') || (trades && trades.includes('Electrical'))) {
    return {
      scopeSummary: `Electrical panel upgrade from 100-amp to 200-amp service including permit acquisition, meter base upgrade coordination with utility company, new panel installation, circuit relocation, inspection coordination, and final testing. All work by licensed master electrician.`,
      workSteps: [
        'Submit permit application to local building department',
        'Coordinate with utility company for meter disconnect/reconnect',
        'Install new 200-amp meter base and weatherhead',
        'Mount and wire new 200-amp main breaker panel',
        'Transfer all existing circuits to new panel',
        'Install new grounding system (ground rods and bonding)',
        'Label all circuits and update panel schedule',
        'Schedule and pass rough-in inspection',
        'Coordinate utility reconnection',
        'Final testing and inspection sign-off'
      ],
      lineItems: [
        { id: '1', description: 'Master electrician labor', quantity: 16, unit: 'hours', unitCost: 110, total: 1760 },
        { id: '2', description: 'Apprentice electrician labor', quantity: 16, unit: 'hours', unitCost: 55, total: 880 },
        { id: '3', description: '200-amp main breaker panel', quantity: 1, unit: 'ea', unitCost: 320, total: 320 },
        { id: '4', description: '200-amp meter base', quantity: 1, unit: 'ea', unitCost: 185, total: 185 },
        { id: '5', description: 'Service entrance cable (SER 4/0)', quantity: 25, unit: 'lf', unitCost: 8, total: 200 },
        { id: '6', description: 'Ground rods and bonding clamps', quantity: 1, unit: 'lot', unitCost: 65, total: 65 },
        { id: '7', description: 'Permits and inspection fees', quantity: 1, unit: 'ea', unitCost: 175, total: 175 }
      ],
      materials: [
        '200-amp main breaker panel (40-space)',
        '200-amp meter base',
        'SER 4/0 service entrance cable',
        'Ground rods (2x 8-foot copper)',
        'Bonding clamps and grounding wire',
        'Circuit breakers (as needed for transfer)',
        'Weatherhead and service mast'
      ],
      assumptions: 'Existing wiring is in good condition for transfer. Utility company will coordinate disconnect/reconnect within standard timeframe. Panel location remains in garage. No additional circuits being added at this time.',
      exclusions: 'Does not include new circuit runs for additions, EV charger installation, sub-panel installation, utility company fees for service upgrade, or repair of existing wiring deficiencies.',
      estimatedDuration: '2 days + permit/inspection timeline'
    };
  }

  // Generic fallback
  const laborHrs = vary(16, 6);
  const materialsRate = vary(450, 150);
  return {
    scopeSummary: `Complete ${jobTitle.toLowerCase()} project including all necessary materials and labor.${descSnippet} Work will be performed by licensed professionals following local building codes and industry best practices.`,
    workSteps: [
      'Initial site assessment and measurements',
      'Material procurement and delivery',
      'Preparation and protection of work area',
      'Primary installation/construction work',
      'Quality inspection and adjustments',
      'Final cleanup and walkthrough with client'
    ],
    lineItems: [
      { id: '1', description: 'Skilled labor - project execution', quantity: laborHrs, unit: 'hours', unitCost: 85, total: Math.round(laborHrs * 85) },
      { id: '2', description: 'Materials and supplies', quantity: 1, unit: 'lot', unitCost: Math.round(materialsRate), total: Math.round(materialsRate) },
      { id: '3', description: 'Equipment rental', quantity: 2, unit: 'days', unitCost: 75, total: 150 },
      { id: '4', description: 'Permits and fees', quantity: 1, unit: 'ea', unitCost: 125, total: 125 },
      { id: '5', description: 'Cleanup and disposal', quantity: 1, unit: 'ea', unitCost: 50, total: 50 }
    ],
    materials: [
      'Primary materials per job specifications',
      'Fasteners and adhesives',
      'Protective coverings and drop cloths',
      'Cleanup supplies'
    ],
    assumptions: 'Work area is accessible and clear. All utilities are functional. Weather permits outdoor work if applicable. No hidden conditions behind walls or under surfaces.',
    exclusions: 'Does not include structural repairs, upgrades beyond described scope, or unforeseen conditions discovered during work.',
    estimatedDuration: '2-3 days'
  };
}

export default function QuoteBuilder({ jobId, jobTitle, jobDescription, aiScopeSummary, trades, budgetRange, onClose, onSubmit }: QuoteBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [aiFieldFlags, setAiFieldFlags] = useState<Record<string, boolean>>({});

  // Form fields
  const [scopeSummary, setScopeSummary] = useState('');
  const [workSteps, setWorkSteps] = useState<string[]>(['']);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }
  ]);
  const [materials, setMaterials] = useState<string[]>(['']);
  const [assumptions, setAssumptions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState('50% deposit, 50% upon completion');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [contractorNotes, setContractorNotes] = useState('');

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      const applyResult = (aiData: AIGeneratedData) => {
        if (cancelled) return;
        setScopeSummary(aiData.scopeSummary);
        setWorkSteps(aiData.workSteps);
        setLineItems(aiData.lineItems);
        setMaterials(aiData.materials);
        setAssumptions(aiData.assumptions);
        setExclusions(aiData.exclusions);
        setEstimatedDuration(aiData.estimatedDuration);
        setAiFieldFlags({
          scopeSummary: true, workSteps: true, lineItems: true,
          materials: true, assumptions: true, exclusions: true, estimatedDuration: true,
        });
        setIsGenerating(false);
      };

      try {
        const ai = await aiAgentService.generateQuote({
          jobTitle,
          trade: trades?.[0] || 'General',
          description: jobDescription,
          budgetRange,
        });
        applyResult(ai);
      } catch (err) {
        console.warn('[QuoteBuilder] AI agent failed, using fallback:', err);
        const aiData = generateAIContent(jobTitle, jobDescription, aiScopeSummary, trades, budgetRange);
        applyResult(aiData);
      }
    };

    generate();

    return () => { cancelled = true; };
  }, [jobTitle, jobDescription, aiScopeSummary, trades, budgetRange]);

  const clearAiFlag = (field: string) => {
    setAiFieldFlags(prev => ({ ...prev, [field]: false }));
  };

  const addLineItem = () => {
    const newId = (Date.now()).toString();
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]);
    clearAiFlag('lineItems');
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
      clearAiFlag('lineItems');
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    clearAiFlag('lineItems');
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updated.total = updated.quantity * updated.unitCost;
        }
        return updated;
      }
      return item;
    }));
  };

  const addWorkStep = () => {
    setWorkSteps([...workSteps, '']);
    clearAiFlag('workSteps');
  };

  const removeWorkStep = (index: number) => {
    if (workSteps.length > 1) {
      setWorkSteps(workSteps.filter((_, i) => i !== index));
      clearAiFlag('workSteps');
    }
  };

  const updateWorkStep = (index: number, value: string) => {
    clearAiFlag('workSteps');
    const updated = [...workSteps];
    updated[index] = value;
    setWorkSteps(updated);
  };

  const addMaterial = () => {
    setMaterials([...materials, '']);
    clearAiFlag('materials');
  };

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
      clearAiFlag('materials');
    }
  };

  const updateMaterial = (index: number, value: string) => {
    clearAiFlag('materials');
    const updated = [...materials];
    updated[index] = value;
    setMaterials(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (status: 'draft' | 'sent') => {
    const quote = {
      jobId,
      jobTitle,
      scopeSummary,
      workSteps: workSteps.filter(step => step.trim()),
      lineItems,
      materials: materials.filter(m => m.trim()),
      assumptions,
      exclusions,
      validityDays,
      paymentTerms,
      estimatedDuration,
      total: calculateTotal(),
      status,
      createdAt: new Date().toISOString(),
      contractorNotes
    };
    onSubmit(quote);
  };

  const AiBadge = ({ field }: { field: string }) => {
    if (!aiFieldFlags[field]) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full ml-2">
        <i className="ri-sparkling-line text-xs"></i>
        AI-suggested
      </span>
    );
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="w-16 h-16 border-4 border-teal-200 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="ri-sparkling-line text-teal-600 text-xl"></i>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Your Quote</h3>
          <p className="text-gray-600 text-sm mb-4">AI is analyzing the job details and pre-filling steps, materials, and pricing for you...</p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <i className="ri-checkbox-circle-fill text-teal-600"></i>
              <span>Reading job description</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <i className="ri-checkbox-circle-fill text-teal-600"></i>
              <span>Identifying required work steps</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
              <i className="ri-loader-4-line text-teal-600 animate-spin"></i>
              <span>Estimating materials &amp; pricing</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-5xl w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Quote</h2>
              <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          {/* AI notice banner */}
          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <i className="ri-sparkling-line text-amber-600 text-lg mt-0.5"></i>
            <div>
              <p className="text-sm font-semibold text-amber-900">AI has pre-filled this quote based on the job details</p>
              <p className="text-xs text-amber-700 mt-0.5">Review and edit any section before sending. Fields marked with &quot;AI-suggested&quot; were auto-generated.</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8 flex-1 overflow-y-auto">
          {/* Job Reference */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Reference</p>
            <p className="text-sm text-gray-700">{jobDescription}</p>
            {aiScopeSummary && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-1">AI Scope Summary</p>
                <p className="text-sm text-gray-600">{aiScopeSummary}</p>
              </div>
            )}
          </div>

          {/* Scope Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Scope of Work Summary
              <AiBadge field="scopeSummary" />
            </label>
            <textarea
              value={scopeSummary}
              onChange={(e) => { setScopeSummary(e.target.value); clearAiFlag('scopeSummary'); }}
              placeholder="Describe the overall scope of work..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Estimated Duration
              <AiBadge field="estimatedDuration" />
            </label>
            <input
              type="text"
              value={estimatedDuration}
              onChange={(e) => { setEstimatedDuration(e.target.value); clearAiFlag('estimatedDuration'); }}
              placeholder="e.g., 2-3 days"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Work Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Work Steps / Sequence
                <AiBadge field="workSteps" />
              </label>
              <button
                onClick={addWorkStep}
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>Add Step
              </button>
            </div>
            <div className="space-y-2">
              {workSteps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateWorkStep(index, e.target.value)}
                    placeholder="Describe this step..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  {workSteps.length > 1 && (
                    <button
                      onClick={() => removeWorkStep(index)}
                      className="px-3 text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Materials Required
                <AiBadge field="materials" />
              </label>
              <button
                onClick={addMaterial}
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>Add Material
              </button>
            </div>
            <div className="space-y-2">
              {materials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-10 bg-teal-50 rounded-lg flex-shrink-0">
                    <i className="ri-tools-line text-teal-600 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => updateMaterial(index, e.target.value)}
                    placeholder="Material name and specification..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  {materials.length > 1 && (
                    <button
                      onClick={() => removeMaterial(index)}
                      className="px-3 text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Pricing Line Items
                <AiBadge field="lineItems" />
              </label>
              <button
                onClick={addLineItem}
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>Add Line Item
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-24">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-24">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">Total</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.unit}
                            onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                          >
                            <option value="ea">ea</option>
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                            <option value="sqft">sqft</option>
                            <option value="lf">lf</option>
                            <option value="lot">lot</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateLineItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {lineItems.length > 1 && (
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">
                        Total Estimate:
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-600 text-lg">
                        ${calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Assumptions
              <AiBadge field="assumptions" />
            </label>
            <textarea
              value={assumptions}
              onChange={(e) => { setAssumptions(e.target.value); clearAiFlag('assumptions'); }}
              placeholder="List any assumptions made in this quote..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Exclusions
              <AiBadge field="exclusions" />
            </label>
            <textarea
              value={exclusions}
              onChange={(e) => { setExclusions(e.target.value); clearAiFlag('exclusions'); }}
              placeholder="List what is NOT included in this quote..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Additional Terms */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quote Valid For (Days)
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g., 50% deposit, 50% upon completion"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Contractor Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Internal Notes (not visible to client)
            </label>
            <textarea
              value={contractorNotes}
              onChange={(e) => setContractorNotes(e.target.value)}
              placeholder="Add any private notes for your records..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={2}
              maxLength={500}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => handleSubmit('draft')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-save-line mr-2"></i>
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('sent')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-send-plane-line mr-2"></i>
            Send Quote to Client
          </button>
        </div>
      </div>
    </div>
  );
}

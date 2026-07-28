import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface TaskCompletion {
  id: string;
  task_id: string;
  task_title: string;
  season: string;
  year: number;
  completed_at: string;
  notes: string | null;
}

interface PropertySystem {
  id: string;
  name: string;
  category: string;
  type: string;
  installYear: number;
  lastService: string;
  condition: string;
}

interface SeasonalTask {
  id: string;
  task: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedCost: string;
  diyDifficulty: 'easy' | 'moderate' | 'professional';
  timeEstimate: string;
  systemId?: string;
  systemName?: string;
  category: string;
  proTip?: string;
}

const currentMonth = new Date().getMonth();
const getCurrentSeason = (): string => {
  if (currentMonth >= 2 && currentMonth <= 4) return 'spring';
  if (currentMonth >= 5 && currentMonth <= 7) return 'summer';
  if (currentMonth >= 8 && currentMonth <= 10) return 'fall';
  return 'winter';
};

const generateTasksForSeason = (season: string, systems: PropertySystem[]): SeasonalTask[] => {
  const tasks: SeasonalTask[] = [];
  const hasSystem = (cat: string) => systems.some(s => s.category === cat);
  const getSystem = (cat: string) => systems.find(s => s.category === cat);

  // Universal tasks every home needs
  const universalTasks: Record<string, SeasonalTask[]> = {
    spring: [
      { id: 'sp-u1', task: 'Test smoke & CO detectors', description: 'Replace batteries and test all units throughout the home', priority: 'critical', estimatedCost: '$15–$30', diyDifficulty: 'easy', timeEstimate: '30 min', category: 'Safety', proTip: 'Press and hold the test button for 3 seconds. If the alarm doesn\'t sound, replace the unit immediately.' },
      { id: 'sp-u2', task: 'Clean gutters & downspouts', description: 'Remove debris from winter and ensure proper drainage away from foundation', priority: 'high', estimatedCost: '$0–$200', diyDifficulty: 'moderate', timeEstimate: '2–3 hrs', category: 'Exterior', proTip: 'Use a garden hose to flush downspouts after clearing debris. Check for any loose brackets.' },
      { id: 'sp-u3', task: 'Inspect exterior caulking & weatherstripping', description: 'Check around windows, doors, and siding joints for gaps or deterioration', priority: 'medium', estimatedCost: '$20–$50', diyDifficulty: 'easy', timeEstimate: '1–2 hrs', category: 'Exterior', proTip: 'Silicone caulk lasts longer than latex in exterior applications. Apply on a dry day above 40°F.' },
      { id: 'sp-u4', task: 'Check foundation for cracks', description: 'Walk the perimeter and inspect for new cracks, settling, or water intrusion signs', priority: 'high', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '30 min', category: 'Structure', proTip: 'Hairline cracks are normal. Cracks wider than 1/4 inch or with horizontal displacement need professional evaluation.' },
    ],
    summer: [
      { id: 'su-u1', task: 'Deep clean kitchen exhaust & range hood', description: 'Degrease filters, clean fan blades, and check ductwork', priority: 'medium', estimatedCost: '$0–$15', diyDifficulty: 'easy', timeEstimate: '1 hr', category: 'Kitchen', proTip: 'Soak metal filters in boiling water with baking soda and dish soap for 15 minutes.' },
      { id: 'su-u2', task: 'Inspect & clean dryer vent', description: 'Disconnect and clean the full vent run to prevent fire hazard', priority: 'critical', estimatedCost: '$0–$150', diyDifficulty: 'moderate', timeEstimate: '1–2 hrs', category: 'Safety', proTip: 'Dryer fires cause $35M in damage annually. If your dryer takes longer than one cycle, the vent is likely clogged.' },
      { id: 'su-u3', task: 'Check attic ventilation & insulation', description: 'Ensure soffit vents are clear and insulation hasn\'t been disturbed by pests', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'moderate', timeEstimate: '1 hr', category: 'Structure', proTip: 'Proper attic ventilation can reduce cooling costs by up to 10%. Look for daylight through soffit vents.' },
      { id: 'su-u4', task: 'Test GFCI outlets', description: 'Press test/reset buttons on all GFCI outlets in bathrooms, kitchen, garage, and exterior', priority: 'high', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '15 min', category: 'Electrical', proTip: 'GFCI outlets should trip instantly when you press Test. If they don\'t, replace them — they\'re a shock hazard.' },
    ],
    fall: [
      { id: 'fa-u1', task: 'Clean gutters & downspouts (fall)', description: 'Clear leaves and debris before winter freeze to prevent ice dams', priority: 'critical', estimatedCost: '$0–$200', diyDifficulty: 'moderate', timeEstimate: '2–3 hrs', category: 'Exterior', proTip: 'Wait until most leaves have fallen (late November) for best results. Install gutter guards if you\'re tired of this chore.' },
      { id: 'fa-u2', task: 'Check weatherstripping on doors & windows', description: 'Replace worn seals to prevent heat loss and drafts during winter', priority: 'high', estimatedCost: '$20–$60', diyDifficulty: 'easy', timeEstimate: '1–2 hrs', category: 'Exterior', proTip: 'Hold a lit candle near door/window edges on a windy day — flickering reveals air leaks.' },
      { id: 'fa-u3', task: 'Test smoke & CO detectors (fall)', description: 'Semi-annual check — replace batteries and test all units', priority: 'critical', estimatedCost: '$15–$30', diyDifficulty: 'easy', timeEstimate: '30 min', category: 'Safety' },
      { id: 'fa-u4', task: 'Winterize outdoor faucets & hose bibs', description: 'Disconnect hoses, drain lines, and install insulated covers', priority: 'high', estimatedCost: '$10–$25', diyDifficulty: 'easy', timeEstimate: '30 min', category: 'Plumbing', proTip: 'A single burst pipe from a frozen hose bib can cause $5,000+ in water damage. Don\'t skip this one.' },
    ],
    winter: [
      { id: 'wi-u1', task: 'Check for ice dams on roof', description: 'Monitor roof edges and gutters for ice buildup after storms', priority: 'high', estimatedCost: '$0–$500', diyDifficulty: 'professional', timeEstimate: 'Ongoing', category: 'Roofing', proTip: 'Never use a hammer or ice pick on ice dams — you\'ll damage shingles. Use calcium chloride ice melt in a stocking laid across the dam.' },
      { id: 'wi-u2', task: 'Check insulation in attic & crawl spaces', description: 'Ensure insulation is adequate and hasn\'t been disturbed by pests', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'moderate', timeEstimate: '1 hr', category: 'Structure', proTip: 'If you can see the floor joists above the insulation, you likely need more. R-38 to R-60 is recommended for most attics.' },
      { id: 'wi-u3', task: 'Reverse ceiling fan direction', description: 'Set fans to clockwise (winter mode) to push warm air down from ceiling', priority: 'low', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '10 min', category: 'HVAC', proTip: 'This simple trick can reduce heating costs by up to 15% in rooms with high ceilings.' },
      { id: 'wi-u4', task: 'Inspect pipes in unheated areas', description: 'Check for insulation on pipes in garage, crawl space, and exterior walls', priority: 'critical', estimatedCost: '$10–$30', diyDifficulty: 'easy', timeEstimate: '30 min', category: 'Plumbing', proTip: 'Pipe insulation foam costs $1/ft and takes minutes to install. A burst pipe costs thousands.' },
    ],
  };

  tasks.push(...(universalTasks[season] || []));

  // HVAC-specific tasks
  if (hasSystem('HVAC')) {
    const hvac = getSystem('HVAC');
    const hvacTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-hvac1', task: `Service AC unit — ${hvac?.name}`, description: `Schedule professional tune-up for your ${hvac?.type}. Clean coils, check refrigerant, test thermostat calibration.`, priority: 'critical', estimatedCost: '$75–$200', diyDifficulty: 'professional', timeEstimate: '1–2 hrs', systemId: hvac?.id, systemName: hvac?.name, category: 'HVAC', proTip: 'Spring tune-ups catch 90% of issues before the summer heat. Book early — HVAC pros get booked fast in May.' },
        { id: 'sp-hvac2', task: 'Replace HVAC air filters', description: 'Swap out filters for fresh ones. Check filter size on the existing filter edge.', priority: 'high', estimatedCost: '$10–$30', diyDifficulty: 'easy', timeEstimate: '10 min', systemId: hvac?.id, systemName: hvac?.name, category: 'HVAC', proTip: 'MERV 11-13 filters offer the best balance of filtration and airflow for most homes.' },
      ],
      summer: [
        { id: 'su-hvac1', task: 'Check AC refrigerant & performance', description: `Monitor your ${hvac?.name} for unusual noises, weak airflow, or warm air output`, priority: 'high', estimatedCost: '$0–$300', diyDifficulty: 'professional', timeEstimate: '1 hr', systemId: hvac?.id, systemName: hvac?.name, category: 'HVAC', proTip: 'If your AC runs constantly but can\'t cool below 78°F, it likely needs refrigerant or has a compressor issue.' },
        { id: 'su-hvac2', task: 'Clean AC condenser coils (outdoor unit)', description: 'Gently rinse outdoor unit with garden hose. Clear debris and vegetation within 2 ft.', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '30 min', systemId: hvac?.id, systemName: hvac?.name, category: 'HVAC', proTip: 'Spray from inside out to push debris away. Never use a pressure washer — it bends the delicate fins.' },
      ],
      fall: [
        { id: 'fa-hvac1', task: `Schedule furnace tune-up — ${systems.find(s => s.name === 'Furnace')?.name || 'Furnace'}`, description: `Professional inspection of your ${systems.find(s => s.name === 'Furnace')?.type || 'heating system'}. Check heat exchanger, burners, and safety controls.`, priority: 'critical', estimatedCost: '$80–$200', diyDifficulty: 'professional', timeEstimate: '1–2 hrs', systemId: systems.find(s => s.name === 'Furnace')?.id, systemName: 'Furnace', category: 'HVAC', proTip: 'A cracked heat exchanger can leak carbon monoxide. Annual inspection is non-negotiable for gas furnaces.' },
        { id: 'fa-hvac2', task: 'Replace furnace filter & test heating', description: 'Install fresh filter and run heating for 15 minutes to verify operation before cold weather', priority: 'high', estimatedCost: '$10–$30', diyDifficulty: 'easy', timeEstimate: '20 min', category: 'HVAC', proTip: 'A burning smell on first use is normal (dust burning off). If it persists beyond 30 minutes, shut down and call a pro.' },
      ],
      winter: [
        { id: 'wi-hvac1', task: 'Replace HVAC filters (mid-winter)', description: 'Filters work harder in winter with the house sealed up. Replace every 60-90 days.', priority: 'high', estimatedCost: '$10–$30', diyDifficulty: 'easy', timeEstimate: '10 min', category: 'HVAC', proTip: 'Set a recurring reminder. A clogged filter makes your furnace work 15% harder and can cause overheating shutdowns.' },
      ],
    };
    tasks.push(...(hvacTasks[season] || []));
  }

  // Fireplace-specific
  if (systems.some(s => s.name.toLowerCase().includes('fireplace') || s.name.toLowerCase().includes('chimney'))) {
    const fp = systems.find(s => s.name.toLowerCase().includes('fireplace'));
    const fpTasks: Record<string, SeasonalTask[]> = {
      fall: [
        { id: 'fa-fp1', task: `Inspect & clean chimney — ${fp?.name}`, description: `Professional chimney sweep and inspection for your ${fp?.type}. Check for creosote buildup, cracks, and cap condition.`, priority: 'critical', estimatedCost: '$150–$350', diyDifficulty: 'professional', timeEstimate: '1–2 hrs', systemId: fp?.id, systemName: fp?.name, category: 'HVAC', proTip: 'Creosote buildup is the #1 cause of chimney fires. If it\'s been more than a year, schedule this immediately.' },
      ],
      winter: [
        { id: 'wi-fp1', task: 'Check fireplace damper & ash cleanup', description: 'Ensure damper opens/closes fully. Remove ash buildup (leave 1-inch bed for wood-burning).', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '30 min', systemId: fp?.id, systemName: fp?.name, category: 'HVAC', proTip: 'Always close the damper when the fireplace isn\'t in use — an open damper is like leaving a window open in winter.' },
      ],
    };
    tasks.push(...(fpTasks[season] || []));
  }

  // Pool-specific tasks
  if (hasSystem('Pool')) {
    const pool = getSystem('Pool');
    const poolTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-pool1', task: `Open & start up pool — ${pool?.name}`, description: `Remove winter cover, reconnect pump/filter, shock treat water, and balance chemicals for your ${pool?.type}`, priority: 'high', estimatedCost: '$150–$400', diyDifficulty: 'moderate', timeEstimate: '4–6 hrs', systemId: pool?.id, systemName: pool?.name, category: 'Pool', proTip: 'Don\'t rush the opening. Run the filter 24 hours after shocking before testing chemistry. Algae prevention starts now.' },
        { id: 'sp-pool2', task: 'Inspect pool equipment after winter', description: 'Check pump seals, filter pressure, heater ignition, and all plumbing connections for leaks', priority: 'high', estimatedCost: '$0–$200', diyDifficulty: 'moderate', timeEstimate: '1–2 hrs', systemId: pool?.id, systemName: pool?.name, category: 'Pool', proTip: 'A small drip at a pump seal now becomes a flood later. Tighten fittings and replace worn O-rings proactively.' },
      ],
      summer: [
        { id: 'su-pool1', task: 'Weekly pool chemistry check', description: 'Test pH (7.2–7.6), chlorine (1–3 ppm), alkalinity (80–120 ppm), and cyanuric acid levels', priority: 'high', estimatedCost: '$20–$50/mo', diyDifficulty: 'easy', timeEstimate: '15 min/week', systemId: pool?.id, systemName: pool?.name, category: 'Pool', proTip: 'Test in the evening after the sun goes down for the most accurate readings. UV breaks down chlorine during the day.' },
        { id: 'su-pool2', task: 'Clean pool filter & check pump', description: 'Backwash or clean filter cartridge. Check pump basket and skimmer for debris.', priority: 'medium', estimatedCost: '$0–$30', diyDifficulty: 'easy', timeEstimate: '30 min', systemId: pool?.id, systemName: pool?.name, category: 'Pool' },
      ],
      fall: [
        { id: 'fa-pool1', task: `Winterize pool — ${pool?.name}`, description: `Lower water level, blow out plumbing lines, add winterizing chemicals, and install winter cover for your ${pool?.type}`, priority: 'critical', estimatedCost: '$200–$500', diyDifficulty: 'moderate', timeEstimate: '4–6 hrs', systemId: pool?.id, systemName: pool?.name, category: 'Pool', proTip: 'Winterize when water temp stays below 65°F consistently. Blow out ALL lines — one missed line can crack from freezing.' },
        { id: 'fa-pool2', task: 'Store pool accessories & furniture', description: 'Clean, dry, and store ladders, diving board, skimmer baskets, and patio furniture', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '2 hrs', systemId: pool?.id, systemName: pool?.name, category: 'Pool' },
      ],
      winter: [
        { id: 'wi-pool1', task: 'Check pool cover & water level', description: 'Remove standing water/snow from cover. Ensure water level hasn\'t dropped below skimmer.', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '20 min', systemId: pool?.id, systemName: pool?.name, category: 'Pool', proTip: 'A pool cover pump ($30-$50) saves your cover from collapsing under water weight. Best investment for pool owners.' },
      ],
    };
    tasks.push(...(poolTasks[season] || []));
  }

  // Irrigation-specific tasks
  if (hasSystem('Irrigation')) {
    const irr = getSystem('Irrigation');
    const irrTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-irr1', task: `Activate irrigation system — ${irr?.name}`, description: `Slowly pressurize your ${irr?.type}, check each zone for leaks, broken heads, and proper coverage`, priority: 'high', estimatedCost: '$0–$100', diyDifficulty: 'moderate', timeEstimate: '1–2 hrs', systemId: irr?.id, systemName: irr?.name, category: 'Irrigation', proTip: 'Turn on the main valve slowly (quarter turn at a time) to avoid water hammer that can crack pipes.' },
        { id: 'sp-irr2', task: 'Adjust sprinkler heads & program timer', description: 'Realign heads for coverage, replace broken nozzles, and set seasonal watering schedule', priority: 'medium', estimatedCost: '$5–$30', diyDifficulty: 'easy', timeEstimate: '1 hr', systemId: irr?.id, systemName: irr?.name, category: 'Irrigation', proTip: 'Water early morning (5-8 AM) to minimize evaporation. Adjust run times monthly as temperatures change.' },
      ],
      summer: [
        { id: 'su-irr1', task: 'Mid-season irrigation audit', description: 'Walk each zone while running. Look for dry spots, runoff, broken heads, and overspray on hardscape.', priority: 'medium', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '45 min', systemId: irr?.id, systemName: irr?.name, category: 'Irrigation', proTip: 'Place tuna cans around the yard while a zone runs. After 15 min, measure water depth — aim for even distribution.' },
      ],
      fall: [
        { id: 'fa-irr1', task: `Winterize irrigation system — ${irr?.name}`, description: `Blow out all lines with compressed air, drain backflow preventer, and shut off water supply to your ${irr?.type}`, priority: 'critical', estimatedCost: '$50–$150', diyDifficulty: 'professional', timeEstimate: '1–2 hrs', systemId: irr?.id, systemName: irr?.name, category: 'Irrigation', proTip: 'Use 50 PSI max when blowing out lines — higher pressure can damage PVC fittings. Each zone needs 2-3 blow cycles.' },
        { id: 'fa-irr2', task: 'Insulate backflow preventer', description: 'Wrap the above-ground backflow device with insulation tape or a cover to prevent freeze damage', priority: 'high', estimatedCost: '$10–$25', diyDifficulty: 'easy', timeEstimate: '15 min', systemId: irr?.id, systemName: irr?.name, category: 'Irrigation', proTip: 'A replacement backflow preventer costs $200-$500. A $15 insulation cover is the cheapest insurance you\'ll buy.' },
      ],
    };
    tasks.push(...(irrTasks[season] || []));
  }

  // Plumbing-specific (sump pump, water heater, septic)
  if (systems.some(s => s.name.toLowerCase().includes('sump'))) {
    const sump = systems.find(s => s.name.toLowerCase().includes('sump'));
    const sumpTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-sump1', task: `Test sump pump — ${sump?.name}`, description: `Pour water into the pit to trigger your ${sump?.type}. Verify it activates, pumps, and shuts off properly.`, priority: 'critical', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '15 min', systemId: sump?.id, systemName: sump?.name, category: 'Plumbing', proTip: 'Test the backup battery too. Power outages during storms are exactly when you need the sump pump most.' },
      ],
      fall: [
        { id: 'fa-sump1', task: 'Test sump pump before winter', description: 'Verify operation and check discharge line for clogs before ground freezes', priority: 'high', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '15 min', systemId: sump?.id, systemName: sump?.name, category: 'Plumbing' },
      ],
    };
    tasks.push(...(sumpTasks[season] || []));
  }

  if (systems.some(s => s.name.toLowerCase().includes('water heater'))) {
    const wh = systems.find(s => s.name.toLowerCase().includes('water heater'));
    const whTasks: Record<string, SeasonalTask[]> = {
      fall: [
        { id: 'fa-wh1', task: `Flush water heater — ${wh?.name}`, description: `Drain sediment from your ${wh?.type} to maintain efficiency and extend lifespan`, priority: 'high', estimatedCost: '$0–$150', diyDifficulty: 'moderate', timeEstimate: '1 hr', systemId: wh?.id, systemName: wh?.name, category: 'Plumbing', proTip: 'Sediment buildup reduces efficiency by up to 25%. Attach a garden hose to the drain valve and flush until water runs clear.' },
      ],
      spring: [
        { id: 'sp-wh1', task: 'Check water heater T&P valve', description: 'Lift the temperature & pressure relief valve lever briefly to ensure it operates freely', priority: 'high', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '5 min', systemId: wh?.id, systemName: wh?.name, category: 'Plumbing', proTip: 'Place a bucket under the discharge pipe first. If no water flows when you lift the lever, the valve needs replacement.' },
      ],
    };
    tasks.push(...(whTasks[season] || []));
  }

  if (systems.some(s => s.name.toLowerCase().includes('septic'))) {
    const sep = systems.find(s => s.name.toLowerCase().includes('septic'));
    const sepTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-sep1', task: `Inspect septic system — ${sep?.name}`, description: `Check for wet spots, odors, or slow drains. Schedule pumping if last service was 3+ years ago.`, priority: 'high', estimatedCost: '$300–$600', diyDifficulty: 'professional', timeEstimate: '1 hr', systemId: sep?.id, systemName: sep?.name, category: 'Plumbing', proTip: 'Spring thaw can reveal septic issues. Lush green patches over the drain field may indicate a leak.' },
      ],
    };
    tasks.push(...(sepTasks[season] || []));
  }

  // Roofing-specific
  if (hasSystem('Roofing')) {
    const roof = getSystem('Roofing');
    const roofTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-roof1', task: `Inspect roof — ${roof?.name}`, description: `Check your ${roof?.type} for missing, cracked, or curling shingles after winter weather`, priority: 'high', estimatedCost: '$0–$300', diyDifficulty: 'moderate', timeEstimate: '1 hr', systemId: roof?.id, systemName: roof?.name, category: 'Roofing', proTip: 'Use binoculars from the ground first. Look for dark streaks (algae), missing granules, and flashing gaps around vents.' },
      ],
      fall: [
        { id: 'fa-roof1', task: 'Pre-winter roof inspection', description: 'Check flashing, vents, and shingles before snow season. Address any issues now.', priority: 'high', estimatedCost: '$0–$300', diyDifficulty: 'moderate', timeEstimate: '1 hr', systemId: roof?.id, systemName: roof?.name, category: 'Roofing' },
      ],
    };
    tasks.push(...(roofTasks[season] || []));
  }

  // Garage door
  if (hasSystem('Garage')) {
    const garage = getSystem('Garage');
    const garageTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-gar1', task: `Lubricate garage door — ${garage?.name}`, description: `Apply silicone lubricant to springs, hinges, rollers, and tracks on your ${garage?.type}`, priority: 'medium', estimatedCost: '$5–$10', diyDifficulty: 'easy', timeEstimate: '20 min', systemId: garage?.id, systemName: garage?.name, category: 'Garage', proTip: 'Use white lithium grease on the opener chain/screw and silicone spray on everything else. Never use WD-40 on garage door parts.' },
      ],
      fall: [
        { id: 'fa-gar1', task: 'Test garage door safety reverse', description: 'Place a 2x4 flat on the ground under the door. It should reverse immediately on contact.', priority: 'high', estimatedCost: '$0', diyDifficulty: 'easy', timeEstimate: '10 min', systemId: garage?.id, systemName: garage?.name, category: 'Garage', proTip: 'Also test the photo-eye sensors by waving an object through the beam while the door is closing.' },
      ],
    };
    tasks.push(...(garageTasks[season] || []));
  }

  // Deck / Exterior
  if (hasSystem('Exterior') || systems.some(s => s.name.toLowerCase().includes('deck'))) {
    const deck = systems.find(s => s.name.toLowerCase().includes('deck'));
    const deckTasks: Record<string, SeasonalTask[]> = {
      spring: [
        { id: 'sp-deck1', task: `Inspect & clean deck — ${deck?.name || 'Deck'}`, description: `Power wash your ${deck?.type || 'deck'}, check for loose boards, popped nails, and structural integrity`, priority: 'medium', estimatedCost: '$0–$100', diyDifficulty: 'moderate', timeEstimate: '2–4 hrs', systemId: deck?.id, systemName: deck?.name, category: 'Exterior', proTip: 'For composite decking, use a fan-tip nozzle at 1500 PSI max. Higher pressure can damage the surface.' },
      ],
      fall: [
        { id: 'fa-deck1', task: 'Apply deck sealant/stain if needed', description: 'Splash water on the deck — if it soaks in instead of beading, it\'s time to reseal', priority: 'medium', estimatedCost: '$50–$200', diyDifficulty: 'moderate', timeEstimate: '4–6 hrs', systemId: deck?.id, systemName: deck?.name, category: 'Exterior', proTip: 'Apply sealant when temps are 50-80°F with no rain for 48 hours. Two thin coats beat one thick coat.' },
      ],
    };
    tasks.push(...(deckTasks[season] || []));
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return tasks;
};

const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: 'ri-alarm-warning-line' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: 'ri-arrow-up-line' },
  medium: { label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', icon: 'ri-subtract-line' },
  low: { label: 'Low', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: 'ri-arrow-down-line' },
};

const difficultyConfig = {
  easy: { label: 'DIY — Easy', color: 'text-green-600', icon: 'ri-user-line' },
  moderate: { label: 'DIY — Moderate', color: 'text-yellow-600', icon: 'ri-tools-line' },
  professional: { label: 'Hire a Pro', color: 'text-red-600', icon: 'ri-user-star-line' },
};

const seasonConfig = [
  { id: 'spring', label: 'Spring', icon: 'ri-plant-line', months: 'Mar – May', color: 'from-green-50 to-emerald-50', accent: 'text-green-600', bg: 'bg-green-600' },
  { id: 'summer', label: 'Summer', icon: 'ri-sun-line', months: 'Jun – Aug', color: 'from-amber-50 to-yellow-50', accent: 'text-amber-600', bg: 'bg-amber-600' },
  { id: 'fall', label: 'Fall', icon: 'ri-leaf-line', months: 'Sep – Nov', color: 'from-orange-50 to-red-50', accent: 'text-orange-600', bg: 'bg-orange-600' },
  { id: 'winter', label: 'Winter', icon: 'ri-snowy-line', months: 'Dec – Feb', color: 'from-blue-50 to-cyan-50', accent: 'text-blue-600', bg: 'bg-blue-600' },
];

export default function SeasonalMaintenance() {
  const { user } = useAuth();
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [allCompletions, setAllCompletions] = useState<TaskCompletion[]>([]);
  const [propertySystems, setPropertySystems] = useState<PropertySystem[]>([]);
  const [systemsLoaded, setSystemsLoaded] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompletedToast, setShowCompletedToast] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState('');

  const currentYear = new Date().getFullYear();

  // Fetch property systems from DB
  const fetchSystems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('property_systems')
      .select('id, name, category, type, install_year, last_service_date, condition')
      .eq('user_id', user.id)
      .order('category', { ascending: true });

    if (data) {
      setPropertySystems(data.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        type: s.type || '',
        installYear: s.install_year || 0,
        lastService: s.last_service_date || '',
        condition: s.condition || 'good',
      })));
    }
    setSystemsLoaded(true);
  }, [user]);

  // Fetch all completions from DB
  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('seasonal_task_completions')
      .select('id, task_id, task_title, season, year, completed_at, notes')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (data) {
      setAllCompletions(data as TaskCompletion[]);
      // Build current-year completed map
      const completed: Record<string, boolean> = {};
      data.forEach((c: TaskCompletion) => {
        if (c.year === currentYear) {
          completed[c.task_id] = true;
        }
      });
      setCompletedTasks(completed);
    }
  }, [user, currentYear]);

  useEffect(() => {
    fetchSystems();
    fetchCompletions();
  }, [fetchSystems, fetchCompletions]);

  const allSeasonTasks = useMemo(() => {
    const result: Record<string, SeasonalTask[]> = {};
    seasonConfig.forEach(s => {
      result[s.id] = generateTasksForSeason(s.id, propertySystems);
    });
    return result;
  }, [propertySystems]);

  const currentTasks = useMemo(() => allSeasonTasks[selectedSeason] || [], [allSeasonTasks, selectedSeason]);

  const filteredTasks = currentTasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  const categories = useMemo(() => {
    const cats = new Set(currentTasks.map(t => t.category));
    return Array.from(cats).sort();
  }, [currentTasks]);

  const getTaskHistory = (taskId: string): TaskCompletion[] =>
    allCompletions.filter(c => c.task_id === taskId);

  const toggleTask = async (taskId: string, taskName: string) => {
    if (!user) return;
    const wasCompleted = completedTasks[taskId];

    if (wasCompleted) {
      // Uncomplete: remove this year's completion
      const thisYearCompletion = allCompletions.find(
        c => c.task_id === taskId && c.year === currentYear
      );
      if (thisYearCompletion) {
        await supabase
          .from('seasonal_task_completions')
          .delete()
          .eq('id', thisYearCompletion.id);
      }
      setCompletedTasks(prev => ({ ...prev, [taskId]: false }));
      setAllCompletions(prev => prev.filter(c => !(c.task_id === taskId && c.year === currentYear)));
    } else {
      // Complete: insert a new record
      // Get property_id if available
      const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      const { data: inserted } = await supabase
        .from('seasonal_task_completions')
        .insert({
          user_id: user.id,
          property_id: prop?.id || null,
          task_id: taskId,
          task_title: taskName,
          season: selectedSeason,
          year: currentYear,
        })
        .select('id, task_id, task_title, season, year, completed_at, notes')
        .single();

      setCompletedTasks(prev => ({ ...prev, [taskId]: true }));
      if (inserted) {
        setAllCompletions(prev => [inserted as TaskCompletion, ...prev]);
      }
      setLastCompletedTask(taskName);
      setShowCompletedToast(true);
      setTimeout(() => setShowCompletedToast(false), 2500);
    }
  };

  const completedCount = currentTasks.filter(t => completedTasks[t.id]).length;
  const totalCount = currentTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const criticalRemaining = currentTasks.filter(t => t.priority === 'critical' && !completedTasks[t.id]).length;
  const highRemaining = currentTasks.filter(t => t.priority === 'high' && !completedTasks[t.id]).length;

  const activeSeason = seasonConfig.find(s => s.id === selectedSeason)!;

  const completedFiltered = filteredTasks.filter(t => completedTasks[t.id]);
  const incompleteFiltered = filteredTasks.filter(t => !completedTasks[t.id]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33] mb-1">Seasonal Maintenance</h2>
            <p className="text-xs sm:text-sm text-[#6B7C8F]">
              {propertySystems.length > 0
                ? `Personalized tasks based on your ${propertySystems.length} registered system${propertySystems.length !== 1 ? 's' : ''}`
                : 'Add your home systems to get personalized maintenance tasks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
              <i className="ri-sparkling-line"></i>
              AI-Personalized
            </span>
          </div>
        </div>

        {/* Season Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {seasonConfig.map((season) => {
            const seasonTasks = allSeasonTasks[season.id] || [];
            const seasonCompleted = seasonTasks.filter(t => completedTasks[t.id]).length;
            const isActive = selectedSeason === season.id;
            const isCurrent = season.id === getCurrentSeason();

            return (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isActive
                    ? 'border-[#0B1F33] bg-[#0B1F33] text-white shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {isCurrent && (
                  <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${
                    isActive ? 'bg-teal-400 text-[#0B1F33]' : 'bg-teal-600 text-white'
                  }`}>
                    Current
                  </span>
                )}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/15' : 'bg-gray-50'
                  }`}>
                    <i className={`${season.icon} text-lg sm:text-xl ${isActive ? 'text-white' : season.accent}`}></i>
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-xs sm:text-sm ${isActive ? 'text-white' : 'text-[#0B1F33]'}`}>{season.label}</p>
                    <p className={`text-[10px] sm:text-xs ${isActive ? 'text-white/70' : 'text-[#6B7C8F]'}`}>{season.months}</p>
                  </div>
                  <div className={`text-[10px] sm:text-xs font-semibold ${isActive ? 'text-white/80' : 'text-[#6B7C8F]'}`}>
                    {seasonCompleted}/{seasonTasks.length} done
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className={`bg-gradient-to-r ${activeSeason.color} rounded-xl p-4 sm:p-5 border border-gray-100`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${activeSeason.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${activeSeason.icon} text-lg sm:text-xl text-white`}></i>
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F33] text-sm sm:text-base">{activeSeason.label} Progress</h3>
                <p className="text-[10px] sm:text-xs text-[#6B7C8F]">{completedCount} of {totalCount} tasks completed</p>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[#0B1F33]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 sm:h-3 bg-white/80 rounded-full overflow-hidden">
            <div
              className={`h-full ${activeSeason.bg} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {(criticalRemaining > 0 || highRemaining > 0) && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
              {criticalRemaining > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-red-700">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                  {criticalRemaining} critical remaining
                </span>
              )}
              {highRemaining > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-orange-700">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></span>
                  {highRemaining} high priority remaining
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-[10px] sm:text-xs font-bold text-[#6B7C8F] uppercase tracking-wide">Priority:</label>
              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
                {['all', 'critical', 'high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                      filterPriority === p
                        ? 'bg-[#0B1F33] text-white'
                        : 'bg-gray-100 text-[#6B7C8F] hover:bg-gray-200'
                    }`}
                  >
                    {p === 'all' ? 'All' : priorityConfig[p as keyof typeof priorityConfig].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-[10px] sm:text-xs font-bold text-[#6B7C8F] uppercase tracking-wide">Category:</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-200 rounded-lg text-[10px] sm:text-xs text-[#0B1F33] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs text-[#6B7C8F]">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Task List — Incomplete */}
      <div className="space-y-3">
        {incompleteFiltered.map(task => {
          const pConfig = priorityConfig[task.priority];
          const dConfig = difficultyConfig[task.diyDifficulty];
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id, task.task); }}
                    className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-md border-2 border-gray-300 hover:border-teal-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                  >
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5">
                      <h4
                        className="font-bold text-[#0B1F33] text-xs sm:text-sm cursor-pointer hover:text-teal-700 transition-colors break-words flex-1"
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      >
                        {task.task}
                      </h4>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${pConfig.color}`}>
                          {pConfig.label}
                        </span>
                        <button
                          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-[#6B7C8F] text-sm sm:text-base`}></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-2 break-words">{task.description}</p>

                    {/* Quick Info Tags */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#6B7C8F]">
                        <i className="ri-money-dollar-circle-line text-[10px] sm:text-xs"></i>
                        {task.estimatedCost}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] sm:text-xs ${dConfig.color}`}>
                        <i className={`${dConfig.icon} text-[10px] sm:text-xs`}></i>
                        <span className="hidden sm:inline">{dConfig.label}</span>
                        <span className="sm:hidden">{dConfig.label.split('—')[0].trim()}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#6B7C8F]">
                        <i className="ri-time-line text-[10px] sm:text-xs"></i>
                        {task.timeEstimate}
                      </span>
                      {task.systemName && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-teal-600 font-semibold truncate max-w-[120px] sm:max-w-none">
                          <i className="ri-link text-[10px] sm:text-xs"></i>
                          {task.systemName}
                        </span>
                      )}
                      <span className="px-1.5 sm:px-2 py-0.5 bg-gray-50 rounded text-[9px] sm:text-[10px] text-[#6B7C8F] font-semibold">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-3 sm:p-4">
                  {task.proTip && (
                    <div className="flex items-start gap-2 sm:gap-3 mb-4 bg-amber-50 rounded-lg p-2.5 sm:p-3 border border-amber-100">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-lightbulb-flash-line text-amber-600 text-sm sm:text-base"></i>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-amber-800 mb-0.5">Pro Tip</p>
                        <p className="text-[10px] sm:text-xs text-amber-900 leading-relaxed break-words">{task.proTip}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wide mb-1">Estimated Cost</p>
                      <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">{task.estimatedCost}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wide mb-1">Time Needed</p>
                      <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">{task.timeEstimate}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wide mb-1">Difficulty</p>
                      <p className={`text-xs sm:text-sm font-bold ${dConfig.color} truncate`}>{dConfig.label.split('—')[0].trim()}</p>
                    </div>
                  </div>

                  {/* Completion History */}
                  {(() => {
                    const history = getTaskHistory(task.id);
                    if (history.length === 0) return null;
                    return (
                      <div className="mb-4 bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-[9px] sm:text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wide mb-2">
                          <i className="ri-history-line mr-1"></i>Completion History
                        </p>
                        <div className="space-y-1.5">
                          {history.map(c => (
                            <div key={c.id} className="flex items-center justify-between text-[10px] sm:text-xs">
                              <span className="text-[#0B1F33] font-semibold capitalize">
                                {c.season} {c.year}
                              </span>
                              <span className="text-[#6B7C8F]">
                                {new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* PHASE_1_GTM: contractor marketplace paused — restore Find a Pro for Phase 2
                    {task.diyDifficulty === 'professional' && (
                      <a
                        href="/providers"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-user-star-line"></i>
                        Find a Pro
                      </a>
                    )}
                    */}
                    <button
                      onClick={() => toggleTask(task.id, task.task)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <i className="ri-check-line"></i>
                      Mark Complete
                    </button>
                    {task.systemName && (
                      <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors">
                        <i className="ri-file-list-line"></i>
                        <span className="hidden sm:inline">View System</span>
                        <span className="sm:hidden">System</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completed Tasks */}
      {completedFiltered.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-[#6B7C8F] uppercase tracking-wide">
              Completed ({completedFiltered.length})
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            {completedFiltered.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => toggleTask(task.id, task.task)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-teal-600 border-2 border-teal-600 flex items-center justify-center cursor-pointer flex-shrink-0"
                  >
                    <i className="ri-check-line text-white text-xs sm:text-sm"></i>
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm text-[#6B7C8F] line-through break-words">{task.task}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                    {task.systemName && (
                      <span className="text-[9px] sm:text-[10px] text-teal-600 font-semibold truncate max-w-[80px] sm:max-w-none">{task.systemName}</span>
                    )}
                    <span className="px-1.5 sm:px-2 py-0.5 bg-gray-50 rounded text-[9px] sm:text-[10px] text-[#6B7C8F] whitespace-nowrap">{task.category}</span>
                    <button
                      onClick={() => toggleTask(task.id, task.task)}
                      className="px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-arrow-go-back-line mr-0.5 sm:mr-1"></i>
                      Undo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-filter-off-line text-3xl text-[#6B7C8F]"></i>
          </div>
          <p className="font-bold text-[#0B1F33] mb-1">No tasks match your filters</p>
          <p className="text-sm text-[#6B7C8F]">Try adjusting the priority or category filter</p>
        </div>
      )}

      {/* Seasonal Tips Card */}
      <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-flash-line text-[#D4B483] text-xl sm:text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-white">
              {activeSeason.label} Smart Insights
              <span className="px-2 py-0.5 bg-teal-500/30 text-teal-300 text-xs font-bold rounded-full">AI</span>
            </h3>
            <div className="space-y-3">
              {propertySystems.length === 0 ? (
                <div className="flex items-start gap-3">
                  <i className="ri-add-circle-line text-[#D4B483] mt-0.5"></i>
                  <p className="text-sm text-white/90">Register your home systems (HVAC, plumbing, pool, etc.) to get personalized seasonal maintenance tasks and smart insights tailored to your property.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <i className="ri-home-gear-line text-amber-400 mt-0.5"></i>
                    <p className="text-sm text-white/90">
                      Your home has <strong>{propertySystems.length} registered system{propertySystems.length !== 1 ? 's' : ''}</strong> across {new Set(propertySystems.map(s => s.category)).size} categories.
                      {criticalRemaining > 0
                        ? ` You have ${criticalRemaining} critical task${criticalRemaining !== 1 ? 's' : ''} remaining this ${activeSeason.label.toLowerCase()}.`
                        : ` All critical tasks are done for ${activeSeason.label.toLowerCase()}!`}
                    </p>
                  </div>
                  {propertySystems.some(s => s.lastService) && (() => {
                    const overdue = propertySystems.filter(s => {
                      if (!s.lastService) return false;
                      const lastDate = new Date(s.lastService);
                      const monthsSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                      return monthsSince > 12;
                    });
                    if (overdue.length === 0) return null;
                    return (
                      <div className="flex items-start gap-3">
                        <i className="ri-alarm-warning-line text-orange-400 mt-0.5"></i>
                        <p className="text-sm text-white/90">
                          <strong>{overdue.length} system{overdue.length !== 1 ? 's' : ''}</strong> ha{overdue.length !== 1 ? 've' : 's'}n&apos;t been serviced in over 12 months: {overdue.map(s => s.name).join(', ')}.
                        </p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Toast */}
      {showCompletedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Task Completed!</p>
              <p className="text-xs text-white/70 max-w-xs truncate">{lastCompletedTask}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

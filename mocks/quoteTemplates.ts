
export interface QuoteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  scopeSummary: string;
  workSteps: string[];
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    total: number;
  }[];
  materials: string[];
  assumptions: string;
  exclusions: string;
  estimatedDuration: string;
  paymentTerms: string;
  validityDays: number;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

export const mockQuoteTemplates: QuoteTemplate[] = [
  {
    id: "tpl-001",
    name: "Standard Plumbing Repair",
    category: "Plumbing",
    description: "General plumbing repair template for leak fixes, faucet replacements, and pipe repairs.",
    scopeSummary: "Complete plumbing repair including inspection of existing connections, removal and replacement of faulty components, new fitting installation, and thorough leak testing. All work by licensed plumber per local codes.",
    workSteps: [
      "Shut off water supply and drain lines",
      "Remove and inspect existing components",
      "Identify root cause of issue",
      "Install replacement parts with proper seals",
      "Reconnect supply lines and test connections",
      "Run 15-minute pressure leak test",
      "Clean work area and dispose of old materials"
    ],
    lineItems: [
      { id: "1", description: "Licensed plumber labor", quantity: 2.5, unit: "hours", unitCost: 95, total: 237.5 },
      { id: "2", description: "Replacement parts and fittings", quantity: 1, unit: "lot", unitCost: 65, total: 65 },
      { id: "3", description: "Supply line connectors", quantity: 2, unit: "ea", unitCost: 18, total: 36 },
      { id: "4", description: "Sealant and tape supplies", quantity: 1, unit: "lot", unitCost: 12, total: 12 },
      { id: "5", description: "Cleanup and disposal", quantity: 1, unit: "ea", unitCost: 25, total: 25 }
    ],
    materials: ["Replacement fittings and hardware", "Braided stainless supply lines", "Plumber\\'s putty", "PTFE thread seal tape", "Silicone caulk"],
    assumptions: "Shut-off valves are functional. No hidden corrosion behind walls. Standard pipe sizes and connections.",
    exclusions: "Valve replacement, pipe rerouting, drywall repair, or cabinet restoration not included.",
    estimatedDuration: "2-3 hours",
    paymentTerms: "Due upon completion",
    validityDays: 30,
    usageCount: 14,
    lastUsed: "2024-01-15T09:00:00Z",
    createdAt: "2023-09-10T08:00:00Z"
  },
  {
    id: "tpl-002",
    name: "HVAC Diagnostic & Repair",
    category: "HVAC",
    description: "Full HVAC system diagnostic with component testing and standard repair work.",
    scopeSummary: "Full HVAC diagnostic and repair including system inspection, component testing, part replacement as needed, and verification of proper operation across all modes.",
    workSteps: [
      "Perform full system diagnostic and error code check",
      "Inspect thermostat wiring and calibration",
      "Test igniter, flame sensor, and gas valve",
      "Check blower motor and capacitor",
      "Replace faulty components",
      "Test system through full heating/cooling cycle",
      "Verify airflow at all vents"
    ],
    lineItems: [
      { id: "1", description: "HVAC technician - diagnostic", quantity: 1.5, unit: "hours", unitCost: 110, total: 165 },
      { id: "2", description: "HVAC technician - repair", quantity: 2, unit: "hours", unitCost: 110, total: 220 },
      { id: "3", description: "Replacement components", quantity: 1, unit: "lot", unitCost: 120, total: 120 },
      { id: "4", description: "Service call fee", quantity: 1, unit: "ea", unitCost: 75, total: 75 }
    ],
    materials: ["Flame sensor", "Igniter assembly", "Electrical contact cleaner", "Replacement filter"],
    assumptions: "Standard gas furnace under 15 years old. Gas supply functioning. Ductwork intact.",
    exclusions: "Heat exchanger replacement, full system replacement, ductwork repair, thermostat upgrade.",
    estimatedDuration: "3-4 hours",
    paymentTerms: "50% deposit, 50% upon completion",
    validityDays: 14,
    usageCount: 9,
    lastUsed: "2024-01-14T14:00:00Z",
    createdAt: "2023-10-05T10:00:00Z"
  },
  {
    id: "tpl-003",
    name: "Electrical Fixture Install",
    category: "Electrical",
    description: "Standard template for ceiling fan, light fixture, and outlet installations.",
    scopeSummary: "Professional electrical installation including circuit verification, component mounting, code-compliant wiring, and full safety testing. All work by licensed electrician.",
    workSteps: [
      "De-energize circuit at breaker and verify",
      "Remove existing fixture/component if applicable",
      "Inspect wiring and connections",
      "Install new component with proper mounting",
      "Make all electrical connections per code",
      "Restore power and test operation",
      "Clean up and verify safety"
    ],
    lineItems: [
      { id: "1", description: "Licensed electrician labor", quantity: 2, unit: "hours", unitCost: 95, total: 190 },
      { id: "2", description: "Electrical components", quantity: 1, unit: "lot", unitCost: 45, total: 45 },
      { id: "3", description: "Mounting hardware", quantity: 1, unit: "lot", unitCost: 15, total: 15 },
      { id: "4", description: "Wire and connectors", quantity: 1, unit: "lot", unitCost: 12, total: 12 }
    ],
    materials: ["Electrical box (rated)", "Wire nuts and connectors", "Mounting hardware", "Electrical tape"],
    assumptions: "Existing wiring is in good condition. Standard ceiling/wall height. No additional circuits needed.",
    exclusions: "New circuit runs, panel upgrades, drywall repair, painting, or fixture cost.",
    estimatedDuration: "1.5-2 hours",
    paymentTerms: "Due upon completion",
    validityDays: 30,
    usageCount: 11,
    lastUsed: "2024-01-13T16:00:00Z",
    createdAt: "2023-08-20T09:00:00Z"
  },
  {
    id: "tpl-004",
    name: "Exterior Paint Touch-Up",
    category: "Painting",
    description: "Exterior paint prep and application for touch-ups and partial repaints.",
    scopeSummary: "Exterior paint touch-up and restoration including surface preparation, priming of damaged areas, and application of matching paint to restore appearance.",
    workSteps: [
      "Power wash or hand-clean surfaces",
      "Scrape and sand peeling or flaking areas",
      "Apply primer to bare spots",
      "Caulk gaps and joints as needed",
      "Apply first coat of matching exterior paint",
      "Apply second coat for full coverage",
      "Final inspection and touch-up",
      "Clean up work area"
    ],
    lineItems: [
      { id: "1", description: "Painter labor - surface prep", quantity: 4, unit: "hours", unitCost: 65, total: 260 },
      { id: "2", description: "Painter labor - painting", quantity: 6, unit: "hours", unitCost: 65, total: 390 },
      { id: "3", description: "Exterior primer (1 gallon)", quantity: 1, unit: "ea", unitCost: 42, total: 42 },
      { id: "4", description: "Exterior paint - color matched (2 gal)", quantity: 2, unit: "ea", unitCost: 55, total: 110 },
      { id: "5", description: "Supplies (sandpaper, caulk, tape)", quantity: 1, unit: "lot", unitCost: 35, total: 35 }
    ],
    materials: ["Exterior primer", "Color-matched exterior paint", "Sandpaper (80, 120, 220 grit)", "Exterior caulk", "Painter\\'s tape"],
    assumptions: "Single-story reach, no scaffolding needed. Existing color can be matched. Weather permits work.",
    exclusions: "Full exterior repaint, wood rot repair, lead paint abatement, multi-story scaffolding.",
    estimatedDuration: "1-2 days",
    paymentTerms: "Due upon completion",
    validityDays: 21,
    usageCount: 7,
    lastUsed: "2024-01-10T08:00:00Z",
    createdAt: "2023-11-15T11:00:00Z"
  },
  {
    id: "tpl-005",
    name: "Bathroom Remodel - Full",
    category: "General",
    description: "Complete bathroom renovation including demo, plumbing, electrical, tile, and fixtures.",
    scopeSummary: "Full bathroom remodel including demolition of existing fixtures, new tile installation, vanity replacement, shower conversion, and all associated plumbing and electrical work.",
    workSteps: [
      "Protect adjacent rooms and establish dust barriers",
      "Demo existing fixtures and tile",
      "Rough-in plumbing for new layout",
      "Update electrical for new lighting and exhaust",
      "Install cement board and waterproofing membrane",
      "Tile shower walls, floor, and niche",
      "Install vanity, countertop, and faucet",
      "Install toilet, shower glass, and accessories",
      "Paint, trim, and final cleanup",
      "Final walkthrough with client"
    ],
    lineItems: [
      { id: "1", description: "Demolition and haul-away", quantity: 1, unit: "lot", unitCost: 1200, total: 1200 },
      { id: "2", description: "Plumbing rough-in and finish", quantity: 1, unit: "lot", unitCost: 2800, total: 2800 },
      { id: "3", description: "Electrical work", quantity: 1, unit: "lot", unitCost: 950, total: 950 },
      { id: "4", description: "Tile installation (floor + shower)", quantity: 120, unit: "sqft", unitCost: 18, total: 2160 },
      { id: "5", description: "Vanity + countertop install", quantity: 1, unit: "ea", unitCost: 650, total: 650 },
      { id: "6", description: "Shower glass enclosure", quantity: 1, unit: "ea", unitCost: 1400, total: 1400 },
      { id: "7", description: "Painting and trim", quantity: 1, unit: "lot", unitCost: 480, total: 480 },
      { id: "8", description: "Permits and inspection fees", quantity: 1, unit: "ea", unitCost: 350, total: 350 }
    ],
    materials: ["Cement board", "Waterproofing membrane", "Porcelain tile", "Thinset and grout", "Vanity unit", "Quartz countertop", "Shower glass", "Toilet", "Exhaust fan", "LED recessed lights"],
    assumptions: "No structural modifications needed. Existing plumbing and electrical can be extended. Customer has selected all fixtures.",
    exclusions: "Cost of fixtures/materials (customer-supplied), mold remediation, structural modifications, HVAC duct relocation.",
    estimatedDuration: "3-4 weeks",
    paymentTerms: "30% deposit, 30% at rough-in, 40% upon completion",
    validityDays: 30,
    usageCount: 4,
    lastUsed: "2024-01-08T10:00:00Z",
    createdAt: "2023-12-01T14:00:00Z"
  }
];

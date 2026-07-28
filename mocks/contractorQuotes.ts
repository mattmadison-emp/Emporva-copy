
export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface QuoteData {
  id: string;
  jobId?: string;
  jobTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  scopeSummary: string;
  workSteps: string[];
  lineItems: QuoteLineItem[];
  materials: string[];
  assumptions: string;
  exclusions: string;
  validityDays: number;
  paymentTerms: string;
  estimatedDuration: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  contractorNotes: string;
}

export const mockContractorQuotes: QuoteData[] = [
  {
    id: "qt-001",
    jobId: "job-001",
    jobTitle: "Kitchen Sink Leak Repair",
    clientName: "Jennifer Martinez",
    clientEmail: "jennifer.m@email.com",
    clientPhone: "(512) 555-0142",
    clientAddress: "1847 Riverside Dr, Austin, TX 78701",
    scopeSummary: "Complete kitchen sink leak repair including removal of corroded P-trap, replacement of supply line connections, and installation of new drain assembly with thorough leak testing.",
    workSteps: [
      "Shut off water supply and drain existing lines",
      "Remove cabinet contents and protect surrounding area",
      "Disconnect and remove corroded P-trap assembly",
      "Inspect supply lines and connections for wear",
      "Install new P-trap and drain assembly",
      "Replace supply line connectors",
      "Run full leak test under pressure for 15 minutes",
      "Clean work area and dispose of old materials"
    ],
    lineItems: [
      { id: "1", description: "Licensed plumber labor", quantity: 2.5, unit: "hours", unitCost: 95, total: 237.5 },
      { id: "2", description: "P-trap assembly (PVC)", quantity: 1, unit: "ea", unitCost: 28, total: 28 },
      { id: "3", description: "Supply line connectors (braided stainless)", quantity: 2, unit: "ea", unitCost: 18, total: 36 },
      { id: "4", description: "Plumber's putty and thread seal tape", quantity: 1, unit: "lot", unitCost: 12, total: 12 },
      { id: "5", description: "Cleanup and disposal", quantity: 1, unit: "ea", unitCost: 25, total: 25 }
    ],
    materials: ["PVC P-trap assembly", "Braided stainless steel supply lines (2x)", "Plumber's putty", "Thread seal tape (PTFE)", "Silicone caulk"],
    assumptions: "Existing shut-off valves are functional. No corrosion or damage to supply lines beyond visible area. Standard sink configuration.",
    exclusions: "Does not include replacement of shut-off valves, repair of corroded pipes behind wall, or cabinet repair from water damage.",
    validityDays: 30,
    paymentTerms: "Due upon completion",
    estimatedDuration: "2-3 hours",
    total: 338.5,
    status: "sent",
    createdAt: "2024-01-15T09:00:00Z",
    sentAt: "2024-01-15T09:30:00Z",
    contractorNotes: "Customer mentioned water damage to cabinet floor — may need separate quote for that."
  },
  {
    id: "qt-002",
    jobId: "job-002",
    jobTitle: "HVAC System Diagnostic & Repair",
    clientName: "Tom Bradley",
    clientEmail: "tom.bradley@email.com",
    clientPhone: "(512) 555-0198",
    clientAddress: "3201 Oak Hill Blvd, Austin, TX 78704",
    scopeSummary: "Comprehensive HVAC diagnostic and repair for furnace not producing heat. Includes full system inspection, component testing, and necessary repairs to restore heating function.",
    workSteps: [
      "Perform full system diagnostic and error code check",
      "Inspect thermostat wiring and calibration",
      "Test igniter, flame sensor, and gas valve",
      "Check blower motor and capacitor",
      "Inspect heat exchanger for cracks",
      "Replace faulty components as identified",
      "Test system operation through full heating cycle",
      "Verify proper airflow at all vents"
    ],
    lineItems: [
      { id: "1", description: "HVAC technician - diagnostic", quantity: 1.5, unit: "hours", unitCost: 110, total: 165 },
      { id: "2", description: "HVAC technician - repair labor", quantity: 2, unit: "hours", unitCost: 110, total: 220 },
      { id: "3", description: "Flame sensor (replacement)", quantity: 1, unit: "ea", unitCost: 35, total: 35 },
      { id: "4", description: "Igniter assembly", quantity: 1, unit: "ea", unitCost: 85, total: 85 },
      { id: "5", description: "Service call fee", quantity: 1, unit: "ea", unitCost: 75, total: 75 }
    ],
    materials: ["Flame sensor", "Igniter assembly", "Electrical contact cleaner", "Furnace filter"],
    assumptions: "System is a standard gas furnace under 15 years old. Gas supply is functioning. Ductwork is intact.",
    exclusions: "Does not include heat exchanger replacement, full system replacement, ductwork repair, or thermostat upgrade.",
    validityDays: 14,
    paymentTerms: "50% deposit, 50% upon completion",
    estimatedDuration: "3-4 hours",
    total: 580,
    status: "accepted",
    createdAt: "2024-01-14T14:00:00Z",
    sentAt: "2024-01-14T14:30:00Z",
    respondedAt: "2024-01-14T18:00:00Z",
    contractorNotes: "Likely flame sensor based on symptoms. Bringing backup igniter just in case."
  },
  {
    id: "qt-003",
    jobTitle: "Bathroom Remodel - Master Bath",
    clientName: "David & Karen Wilson",
    clientEmail: "dwilson@email.com",
    clientPhone: "(512) 555-0267",
    clientAddress: "5520 Barton Creek Dr, Austin, TX 78735",
    scopeSummary: "Full master bathroom remodel including demolition of existing fixtures, new tile installation, vanity replacement, shower conversion from tub, and all associated plumbing and electrical work.",
    workSteps: [
      "Protect adjacent rooms and establish dust barriers",
      "Demo existing tub, vanity, toilet, and tile",
      "Rough-in plumbing for new shower and vanity layout",
      "Update electrical for new lighting and exhaust fan",
      "Install cement board and waterproofing membrane",
      "Tile shower walls, floor, and niche",
      "Install new vanity, countertop, and faucet",
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
    assumptions: "No structural modifications needed. Existing plumbing and electrical can be extended to new layout. Customer has selected all fixtures and materials.",
    exclusions: "Does not include cost of fixtures/materials (customer-supplied), mold remediation, structural modifications, or HVAC duct relocation.",
    validityDays: 30,
    paymentTerms: "30% deposit, 30% at rough-in, 40% upon completion",
    estimatedDuration: "3-4 weeks",
    total: 9990,
    status: "draft",
    createdAt: "2024-01-16T11:00:00Z",
    contractorNotes: "Large project — need to coordinate plumber and electrician schedules. Wilson family flexible on start date."
  },
  {
    id: "qt-004",
    jobTitle: "Exterior Paint Touch-Up",
    clientName: "Rachel Kim",
    clientEmail: "rachel.kim@email.com",
    clientPhone: "(512) 555-0334",
    clientAddress: "2100 S Lamar Blvd, Austin, TX 78704",
    scopeSummary: "Exterior paint touch-up on south-facing wall and trim. Includes surface prep, priming, and two coats of color-matched exterior paint.",
    workSteps: [
      "Power wash south-facing wall",
      "Scrape and sand peeling areas",
      "Apply primer to bare spots",
      "Caulk gaps around trim",
      "Apply two coats of exterior paint",
      "Touch up trim paint",
      "Final inspection and cleanup"
    ],
    lineItems: [
      { id: "1", description: "Painter labor - prep", quantity: 3, unit: "hours", unitCost: 65, total: 195 },
      { id: "2", description: "Painter labor - painting", quantity: 5, unit: "hours", unitCost: 65, total: 325 },
      { id: "3", description: "Exterior primer (1 gal)", quantity: 1, unit: "ea", unitCost: 42, total: 42 },
      { id: "4", description: "Exterior paint color-matched (2 gal)", quantity: 2, unit: "ea", unitCost: 55, total: 110 },
      { id: "5", description: "Supplies (caulk, tape, sandpaper)", quantity: 1, unit: "lot", unitCost: 30, total: 30 }
    ],
    materials: ["Exterior primer", "Color-matched exterior paint", "Sandpaper", "Exterior caulk", "Painter's tape"],
    assumptions: "Single-story reach, no scaffolding needed. Existing color can be matched. Weather permits work.",
    exclusions: "Full exterior repaint, wood rot repair, lead paint abatement, multi-story scaffolding.",
    validityDays: 21,
    paymentTerms: "Due upon completion",
    estimatedDuration: "1 day",
    total: 702,
    status: "declined",
    createdAt: "2024-01-10T08:00:00Z",
    sentAt: "2024-01-10T08:30:00Z",
    respondedAt: "2024-01-12T10:00:00Z",
    contractorNotes: "Client may have gone with a cheaper option. Follow up in spring."
  },
  {
    id: "qt-005",
    jobId: "job-005",
    jobTitle: "Ceiling Fan Installation",
    clientName: "Lisa Thompson",
    clientEmail: "lisa.t@email.com",
    clientPhone: "(512) 555-0411",
    clientAddress: "4415 Westlake Dr, Austin, TX 78703",
    scopeSummary: "Remove existing light fixture and install new ceiling fan with light kit in master bedroom. Includes electrical box upgrade to fan-rated box and proper mounting.",
    workSteps: [
      "Turn off power at breaker and verify",
      "Remove existing light fixture",
      "Install fan-rated electrical box",
      "Assemble and mount ceiling fan",
      "Wire fan and light kit",
      "Install blades and light globes",
      "Test all speeds and light functions",
      "Clean up and dispose of old fixture"
    ],
    lineItems: [
      { id: "1", description: "Electrician labor", quantity: 2, unit: "hours", unitCost: 95, total: 190 },
      { id: "2", description: "Fan-rated electrical box", quantity: 1, unit: "ea", unitCost: 22, total: 22 },
      { id: "3", description: "Mounting hardware", quantity: 1, unit: "lot", unitCost: 15, total: 15 },
      { id: "4", description: "Wire nuts and electrical tape", quantity: 1, unit: "lot", unitCost: 8, total: 8 }
    ],
    materials: ["Fan-rated electrical box", "Mounting bracket and hardware", "Wire nuts", "Electrical tape"],
    assumptions: "Existing wiring supports fan. Standard 8-foot ceiling height. Customer has purchased the ceiling fan.",
    exclusions: "Cost of ceiling fan, additional wiring runs, drywall repair, painting.",
    validityDays: 30,
    paymentTerms: "Due upon completion",
    estimatedDuration: "1.5-2 hours",
    total: 235,
    status: "sent",
    createdAt: "2024-01-13T16:00:00Z",
    sentAt: "2024-01-13T16:15:00Z",
    contractorNotes: ""
  }
];

export const mockActiveJobs = [
  { id: "job-001", title: "Kitchen Sink Leak Repair", client: "Jennifer Martinez", trade: "Plumbing", address: "1847 Riverside Dr, Austin, TX 78701" },
  { id: "job-002", title: "HVAC System Not Heating", client: "Tom Bradley", trade: "HVAC", address: "3201 Oak Hill Blvd, Austin, TX 78704" },
  { id: "job-003", title: "Electrical Outlet Not Working", client: "Sarah Chen", trade: "Electrical", address: "920 E 6th St, Austin, TX 78702" },
  { id: "job-004", title: "Bathroom Faucet Replacement", client: "Michael Roberts", trade: "Plumbing", address: "1205 W 38th St, Austin, TX 78705" },
  { id: "job-005", title: "Ceiling Fan Installation", client: "Lisa Thompson", trade: "Electrical", address: "4415 Westlake Dr, Austin, TX 78703" },
  { id: "job-006", title: "Water Heater Replacement", client: "James Patterson", trade: "Plumbing", address: "6700 Bee Cave Rd, Austin, TX 78746" },
  { id: "job-007", title: "Deck Construction", client: "Amanda Foster", trade: "General", address: "3300 Lake Austin Blvd, Austin, TX 78703" }
];

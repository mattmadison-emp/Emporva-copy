
export interface ReceivedInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  contractorLicense: string;
  jobTitle: string;
  propertyAddress: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountLabel: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms: string;
  notes?: string;
  status: 'pending' | 'paid' | 'overdue' | 'disputed';
}

export const receivedInvoices: ReceivedInvoice[] = [
  {
    id: 'rinv-001',
    invoiceNumber: 'EMP-INV-2025-0042',
    date: 'Jan 20, 2025',
    dueDate: 'Feb 3, 2025',
    contractorName: 'ProFlow Plumbing & Repair',
    contractorEmail: 'contact@proflowplumbing.com',
    contractorPhone: '(704) 555-0192',
    contractorLicense: 'NC-PLB-29471',
    jobTitle: 'Crawlspace Moisture Remediation',
    propertyAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
    lineItems: [
      { description: 'Labor — Dehumidifier setup & calibration', quantity: 1, unit: 'lot', unitCost: 594, total: 594 },
      { description: 'Materials — Dehumidifier unit (70-pint)', quantity: 1, unit: 'ea', unitCost: 380, total: 380 },
      { description: 'Permits & disposal fees', quantity: 1, unit: 'lot', unitCost: 16, total: 16 },
    ],
    subtotal: 990,
    tax: 0,
    taxRate: 0,
    discount: 0,
    discountLabel: '',
    total: 990,
    amountPaid: 0,
    balanceDue: 990,
    paymentTerms: 'Net 15 — Payment due within 15 days of invoice date',
    notes: 'Milestone 3 — Dehumidifier Setup & Calibration. Payment held in Emporva escrow until work verified.',
    status: 'pending',
  },
  {
    id: 'rinv-002',
    invoiceNumber: 'EMP-INV-2025-0038',
    date: 'Dec 28, 2024',
    dueDate: 'Jan 12, 2025',
    contractorName: 'Precision Plumbing Services',
    contractorEmail: 'info@precisionplumbing.com',
    contractorPhone: '(704) 555-0287',
    contractorLicense: 'NC-PLB-31205',
    jobTitle: 'Water Heater Replacement',
    propertyAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
    lineItems: [
      { description: 'Labor — Water heater removal & installation', quantity: 8, unit: 'hours', unitCost: 125, total: 1000 },
      { description: '50-Gallon Rheem Performance Plus', quantity: 1, unit: 'ea', unitCost: 850, total: 850 },
      { description: 'Fittings, connectors & supply lines', quantity: 1, unit: 'lot', unitCost: 150, total: 150 },
      { description: 'Haul-away & disposal of old unit', quantity: 1, unit: 'ea', unitCost: 100, total: 100 },
    ],
    subtotal: 2100,
    tax: 0,
    taxRate: 0,
    discount: 0,
    discountLabel: '',
    total: 2100,
    amountPaid: 2100,
    balanceDue: 0,
    paymentTerms: 'Net 15 — Payment due within 15 days of invoice date',
    status: 'paid',
  },
  {
    id: 'rinv-003',
    invoiceNumber: 'EMP-INV-2025-0050',
    date: 'Jan 22, 2025',
    dueDate: 'Feb 5, 2025',
    contractorName: 'Summit Roofing & Repair',
    contractorEmail: 'david@summitroofing.com',
    contractorPhone: '(704) 555-0341',
    contractorLicense: 'NC-ROF-18923',
    jobTitle: 'Roof Shingle Replacement - South Side',
    propertyAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
    lineItems: [
      { description: 'Labor — Shingle tear-off & replacement', quantity: 1, unit: 'lot', unitCost: 1600, total: 1600 },
      { description: 'Architectural shingles (420 sq ft)', quantity: 14, unit: 'bundles', unitCost: 45, total: 630 },
      { description: 'Underlayment & flashing', quantity: 1, unit: 'lot', unitCost: 320, total: 320 },
      { description: 'Ridge vent & ventilation', quantity: 1, unit: 'lot', unitCost: 250, total: 250 },
      { description: 'Debris removal & cleanup', quantity: 1, unit: 'lot', unitCost: 200, total: 200 },
    ],
    subtotal: 3000,
    tax: 200,
    taxRate: 6.67,
    discount: 0,
    discountLabel: '',
    total: 3200,
    amountPaid: 0,
    balanceDue: 3200,
    paymentTerms: 'Net 15 — Payment due within 15 days of invoice date',
    notes: 'Deposit of $800 due before work begins. Remaining balance due upon completion.',
    status: 'pending',
  },
];

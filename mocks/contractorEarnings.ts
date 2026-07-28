export const earningsSummary = {
  totalRevenue: 87450,
  pendingEscrow: 12800,
  availableBalance: 6240,
  totalPayouts: 68410,
  monthlyRevenue: 14650,
  monthlyGrowth: 12.4,
  avgJobValue: 2180,
  completedJobs: 42
};

export const revenueByMonth = [
  { month: 'Aug', year: 2024, revenue: 9200, payouts: 8100 },
  { month: 'Sep', year: 2024, revenue: 11400, payouts: 10200 },
  { month: 'Oct', year: 2024, revenue: 10800, payouts: 9600 },
  { month: 'Nov', year: 2024, revenue: 13500, payouts: 12400 },
  { month: 'Dec', year: 2024, revenue: 12900, payouts: 11800 },
  { month: 'Jan', year: 2025, revenue: 14650, payouts: 10070 }
];

export const revenueByMonthPriorYear = [
  { month: 'Aug', year: 2023, revenue: 7100, payouts: 6200 },
  { month: 'Sep', year: 2023, revenue: 8400, payouts: 7500 },
  { month: 'Oct', year: 2023, revenue: 9100, payouts: 8000 },
  { month: 'Nov', year: 2023, revenue: 10200, payouts: 9300 },
  { month: 'Dec', year: 2023, revenue: 9800, payouts: 8900 },
  { month: 'Jan', year: 2024, revenue: 11200, payouts: 9400 }
];

export const revenueByMonthPriorPeriod = [
  { month: 'Feb', year: 2024, revenue: 8500, payouts: 7400 },
  { month: 'Mar', year: 2024, revenue: 9800, payouts: 8700 },
  { month: 'Apr', year: 2024, revenue: 10100, payouts: 9200 },
  { month: 'May', year: 2024, revenue: 11300, payouts: 10100 },
  { month: 'Jun', year: 2024, revenue: 10600, payouts: 9500 },
  { month: 'Jul', year: 2024, revenue: 9400, payouts: 8300 }
];

export const periodSummaries = {
  'last-30': {
    current: { revenue: 14650, payouts: 10070, jobs: 7, avgJob: 2093 },
    priorPeriod: { revenue: 12900, payouts: 11800, jobs: 6, avgJob: 2150 },
    priorYear: { revenue: 11200, payouts: 9400, jobs: 5, avgJob: 2240 }
  },
  'last-90': {
    current: { revenue: 41050, payouts: 34270, jobs: 19, avgJob: 2161 },
    priorPeriod: { revenue: 31400, payouts: 27800, jobs: 15, avgJob: 2093 },
    priorYear: { revenue: 29100, payouts: 25700, jobs: 14, avgJob: 2079 }
  },
  'last-6m': {
    current: { revenue: 72450, payouts: 62170, jobs: 35, avgJob: 2070 },
    priorPeriod: { revenue: 59700, payouts: 53200, jobs: 30, avgJob: 1990 },
    priorYear: { revenue: 55800, payouts: 49300, jobs: 28, avgJob: 1993 }
  },
  'last-12m': {
    current: { revenue: 87450, payouts: 68410, jobs: 42, avgJob: 2082 },
    priorPeriod: { revenue: 72100, payouts: 58900, jobs: 36, avgJob: 2003 },
    priorYear: { revenue: 65400, payouts: 53200, jobs: 32, avgJob: 2044 }
  },
  'ytd': {
    current: { revenue: 14650, payouts: 10070, jobs: 7, avgJob: 2093 },
    priorPeriod: { revenue: 11200, payouts: 9400, jobs: 5, avgJob: 2240 },
    priorYear: { revenue: 11200, payouts: 9400, jobs: 5, avgJob: 2240 }
  }
};

export const escrowHolds = [
  {
    id: 'ESC-4821',
    jobTitle: 'Crawlspace Moisture Remediation',
    homeowner: 'Jennifer Martinez',
    amount: 4950,
    milestone: 'Final Inspection',
    expectedRelease: 'Jan 28, 2025',
    status: 'pending_approval' as const
  },
  {
    id: 'ESC-4819',
    jobTitle: 'Electrical Panel Upgrade',
    homeowner: 'Sarah Mitchell',
    amount: 2800,
    milestone: 'Work Complete',
    expectedRelease: 'Jan 25, 2025',
    status: 'under_review' as const
  },
  {
    id: 'ESC-4815',
    jobTitle: 'Bathroom Renovation — Phase 2',
    homeowner: 'Tom Anderson',
    amount: 3250,
    milestone: 'Tile Installation',
    expectedRelease: 'Feb 3, 2025',
    status: 'held' as const
  },
  {
    id: 'ESC-4810',
    jobTitle: 'Deck Waterproofing',
    homeowner: 'Lisa Wong',
    amount: 1800,
    milestone: 'Materials & Labor',
    expectedRelease: 'Jan 22, 2025',
    status: 'releasing' as const
  }
];

export const payoutHistory = [
  {
    id: 'PAY-9847',
    date: 'Jan 18, 2025',
    amount: 4200,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Kitchen Faucet Replacement + Garbage Disposal',
    homeowner: 'John Davis',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-98471A'
  },
  {
    id: 'PAY-9839',
    date: 'Jan 14, 2025',
    amount: 1800,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Water Heater Installation',
    homeowner: 'Jennifer Lee',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-98392B'
  },
  {
    id: 'PAY-9831',
    date: 'Jan 10, 2025',
    amount: 2650,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'HVAC Duct Cleaning & Sealing',
    homeowner: 'Robert Kim',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-98314C'
  },
  {
    id: 'PAY-9822',
    date: 'Jan 5, 2025',
    amount: 3400,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Roof Leak Repair — Emergency',
    homeowner: 'David Park',
    status: 'completed' as const,
    processingTime: '1 business day',
    confirmationId: 'EMV-TXN-98225D'
  },
  {
    id: 'PAY-9814',
    date: 'Dec 28, 2024',
    amount: 5800,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Full Bathroom Remodel — Phase 1',
    homeowner: 'Emily Rodriguez',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-98147E'
  },
  {
    id: 'PAY-9806',
    date: 'Dec 22, 2024',
    amount: 1250,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Gutter Replacement — Front Elevation',
    homeowner: 'Mark Stevens',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-98068F'
  },
  {
    id: 'PAY-9798',
    date: 'Dec 16, 2024',
    amount: 920,
    method: 'Direct Deposit — ****6742',
    jobTitle: 'Plumbing Inspection & Minor Repairs',
    homeowner: 'Angela Torres',
    status: 'completed' as const,
    processingTime: '2 business days',
    confirmationId: 'EMV-TXN-97989G'
  }
];

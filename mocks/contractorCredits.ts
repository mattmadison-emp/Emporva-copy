
export const contractorCreditBalance = {
  credits: 12,
  costPerCredit: 15,
  creditsUsedThisMonth: 8,
  creditsUsedAllTime: 47,
  lastPurchase: '2025-01-12',
  lastPurchaseAmount: 10,
};

export const creditPurchaseHistory = [
  { id: 'cp-1', date: 'Jan 12, 2025', credits: 10, amount: 150, method: 'Visa •••• 4242' },
  { id: 'cp-2', date: 'Dec 28, 2024', credits: 5, amount: 75, method: 'Visa •••• 4242' },
  { id: 'cp-3', date: 'Dec 15, 2024', credits: 10, amount: 150, method: 'Visa •••• 4242' },
  { id: 'cp-4', date: 'Nov 30, 2024', credits: 5, amount: 75, method: 'Visa •••• 4242' },
  { id: 'cp-5', date: 'Nov 10, 2024', credits: 10, amount: 150, method: 'Visa •••• 4242' },
  { id: 'cp-6', date: 'Oct 22, 2024', credits: 7, amount: 105, method: 'Visa •••• 4242' },
];

export const leadsPurchased = [
  { id: 'lp-1', jobTitle: 'Kitchen Sink Leak Repair', homeowner: 'Jennifer Martinez', date: 'Jan 15, 2025', creditCost: 1, status: 'quoted' as const, quoteAmount: '$375' },
  { id: 'lp-2', jobTitle: 'HVAC System Not Heating', homeowner: 'Tom Bradley', date: 'Jan 14, 2025', creditCost: 1, status: 'won' as const, quoteAmount: '$650' },
  { id: 'lp-3', jobTitle: 'Bathroom Faucet Replacement', homeowner: 'Michael Roberts', date: 'Jan 12, 2025', creditCost: 1, status: 'lost' as const, quoteAmount: '$420' },
  { id: 'lp-4', jobTitle: 'Water Heater Inspection', homeowner: 'David Park', date: 'Jan 10, 2025', creditCost: 1, status: 'quoted' as const, quoteAmount: '$280' },
  { id: 'lp-5', jobTitle: 'Garbage Disposal Install', homeowner: 'Amy Wilson', date: 'Jan 8, 2025', creditCost: 1, status: 'won' as const, quoteAmount: '$310' },
  { id: 'lp-6', jobTitle: 'Pipe Insulation - Crawlspace', homeowner: 'Robert Chen', date: 'Jan 5, 2025', creditCost: 1, status: 'expired' as const, quoteAmount: '' },
  { id: 'lp-7', jobTitle: 'Shower Valve Replacement', homeowner: 'Karen Lee', date: 'Jan 2, 2025', creditCost: 1, status: 'won' as const, quoteAmount: '$520' },
  { id: 'lp-8', jobTitle: 'Sump Pump Replacement', homeowner: 'Steve Nguyen', date: 'Dec 28, 2024', creditCost: 1, status: 'won' as const, quoteAmount: '$890' },
];

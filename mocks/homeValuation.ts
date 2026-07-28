export const homeValuationData = {
  currentValue: 487500,
  purchasePrice: 385000,
  purchaseDate: '2019-03-15',
  mortgageBalance: 298000,
  lastUpdated: '2025-01-15',

  mortgage: {
    originalAmount: 308000,
    currentBalance: 298000,
    interestRate: 6.25,
    termYears: 30,
    monthlyPayment: 1896,
    startDate: '2019-03-15',
    extraMonthlyPayment: 0,
    lender: 'First National Bank',
    payoffDate: '2049-03-15',
    totalInterestPaid: 24680,
    totalInterestRemaining: 357520,
    principalPaidToDate: 10000,
    ltv: 61.1,
    amortizationSchedule: [
      { year: 2019, principalPaid: 1420, interestPaid: 18832, balance: 306580 },
      { year: 2020, principalPaid: 3180, interestPaid: 19572, balance: 303400 },
      { year: 2021, principalPaid: 3380, interestPaid: 19372, balance: 300020 },
      { year: 2022, principalPaid: 3590, interestPaid: 19162, balance: 296430 },
      { year: 2023, principalPaid: 3820, interestPaid: 18932, balance: 292610 },
      { year: 2024, principalPaid: 4060, interestPaid: 18692, balance: 288550 },
      { year: 2025, principalPaid: 4320, interestPaid: 18432, balance: 284230 },
      { year: 2026, principalPaid: 4590, interestPaid: 18162, balance: 279640 },
      { year: 2027, principalPaid: 4880, interestPaid: 17872, balance: 274760 },
      { year: 2028, principalPaid: 5190, interestPaid: 17562, balance: 269570 },
      { year: 2029, principalPaid: 5510, interestPaid: 17242, balance: 264060 },
      { year: 2030, principalPaid: 5860, interestPaid: 16892, balance: 258200 },
      { year: 2031, principalPaid: 6230, interestPaid: 16522, balance: 251970 },
      { year: 2032, principalPaid: 6620, interestPaid: 16132, balance: 245350 },
      { year: 2033, principalPaid: 7040, interestPaid: 15712, balance: 238310 },
      { year: 2034, principalPaid: 7480, interestPaid: 15272, balance: 230830 },
      { year: 2035, principalPaid: 7950, interestPaid: 14802, balance: 222880 },
      { year: 2036, principalPaid: 8450, interestPaid: 14302, balance: 214430 },
      { year: 2037, principalPaid: 8980, interestPaid: 13772, balance: 205450 },
      { year: 2038, principalPaid: 9540, interestPaid: 13212, balance: 195910 },
      { year: 2039, principalPaid: 10140, interestPaid: 12612, balance: 185770 },
      { year: 2040, principalPaid: 10780, interestPaid: 11972, balance: 174990 },
      { year: 2041, principalPaid: 11460, interestPaid: 11292, balance: 163530 },
      { year: 2042, principalPaid: 12180, interestPaid: 10572, balance: 151350 },
      { year: 2043, principalPaid: 12940, interestPaid: 9812, balance: 138410 },
      { year: 2044, principalPaid: 13750, interestPaid: 9002, balance: 124660 },
      { year: 2045, principalPaid: 14610, interestPaid: 8142, balance: 110050 },
      { year: 2046, principalPaid: 15530, interestPaid: 7222, balance: 94520 },
      { year: 2047, principalPaid: 16500, interestPaid: 6252, balance: 78020 },
      { year: 2048, principalPaid: 17540, interestPaid: 5212, balance: 60480 },
      { year: 2049, principalPaid: 60480, interestPaid: 3150, balance: 0 },
    ]
  },

  valueHistory: [
    { date: '2019-03', value: 385000, label: 'Purchase' },
    { date: '2019-12', value: 392000, label: '' },
    { date: '2020-06', value: 405000, label: '' },
    { date: '2020-12', value: 418000, label: '' },
    { date: '2021-06', value: 438000, label: 'Kitchen Reno' },
    { date: '2021-12', value: 445000, label: '' },
    { date: '2022-06', value: 452000, label: '' },
    { date: '2022-12', value: 458000, label: '' },
    { date: '2023-06', value: 465000, label: 'Roof Replace' },
    { date: '2023-12', value: 472000, label: '' },
    { date: '2024-06', value: 480000, label: '' },
    { date: '2025-01', value: 487500, label: 'Current' }
  ],

  improvements: [
    {
      id: '1',
      name: 'Kitchen Renovation',
      completedDate: '2021-05-20',
      cost: 32500,
      estimatedValueAdd: 28000,
      roi: 86,
      category: 'Major Renovation',
      description: 'Complete kitchen remodel with new cabinets, countertops, and appliances'
    },
    {
      id: '2',
      name: 'Roof Replacement',
      completedDate: '2023-04-12',
      cost: 18500,
      estimatedValueAdd: 15200,
      roi: 82,
      category: 'Exterior',
      description: 'Full roof replacement with architectural shingles'
    },
    {
      id: '3',
      name: 'HVAC System Upgrade',
      completedDate: '2022-09-08',
      cost: 8900,
      estimatedValueAdd: 7100,
      roi: 80,
      category: 'Systems',
      description: 'High-efficiency heating and cooling system installation'
    },
    {
      id: '4',
      name: 'Bathroom Remodel',
      completedDate: '2020-11-15',
      cost: 14200,
      estimatedValueAdd: 11800,
      roi: 83,
      category: 'Major Renovation',
      description: 'Master bathroom renovation with walk-in shower and dual vanity'
    },
    {
      id: '5',
      name: 'Deck Addition',
      completedDate: '2024-06-22',
      cost: 12800,
      estimatedValueAdd: 9600,
      roi: 75,
      category: 'Outdoor',
      description: 'Composite deck with built-in seating and lighting'
    }
  ],

  marketData: {
    neighborhood: 'Riverside Heights',
    medianHomePrice: 465000,
    yearOverYearChange: 5.8,
    monthOverMonthChange: 0.9,
    daysOnMarket: 28,
    inventoryLevel: 'Low',
    marketTrend: 'Seller\'s Market',
    comparableHomes: [
      {
        address: '2847 Oak Ridge Drive',
        distance: '0.3 miles',
        soldPrice: 492000,
        soldDate: '2024-12-18',
        beds: 4,
        baths: 3,
        sqft: 2450
      },
      {
        address: '1523 Maple Avenue',
        distance: '0.5 miles',
        soldPrice: 478000,
        soldDate: '2024-11-22',
        beds: 4,
        baths: 2.5,
        sqft: 2380
      },
      {
        address: '3912 Birch Lane',
        distance: '0.7 miles',
        soldPrice: 495000,
        soldDate: '2024-10-30',
        beds: 4,
        baths: 3,
        sqft: 2520
      }
    ]
  },

  projections: [
    {
      id: '1',
      name: 'Basement Finishing',
      estimatedCost: 45000,
      estimatedValueAdd: 38000,
      projectedROI: 84,
      timeframe: '3-4 months',
      impact: 'High'
    },
    {
      id: '2',
      name: 'Exterior Paint & Siding',
      estimatedCost: 12500,
      estimatedValueAdd: 10800,
      projectedROI: 86,
      timeframe: '2-3 weeks',
      impact: 'Medium'
    },
    {
      id: '3',
      name: 'Landscaping Upgrade',
      estimatedCost: 8500,
      estimatedValueAdd: 6800,
      projectedROI: 80,
      timeframe: '1-2 weeks',
      impact: 'Medium'
    },
    {
      id: '4',
      name: 'Energy-Efficient Windows',
      estimatedCost: 18000,
      estimatedValueAdd: 14400,
      projectedROI: 80,
      timeframe: '1-2 weeks',
      impact: 'High'
    }
  ]
};

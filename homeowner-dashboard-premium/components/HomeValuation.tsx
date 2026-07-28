import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { aiAgentService } from '../../../services/aiAgentService';

interface ValuationData {
  currentValue: number;
  purchasePrice: number;
  purchaseDate: string;
  mortgageBalance: number;
  lastUpdated: string;
  mortgage: {
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    termYears: number;
    monthlyPayment: number;
    startDate: string;
    extraMonthlyPayment: number;
    lender: string;
    payoffDate: string;
    totalInterestPaid: number;
    totalInterestRemaining: number;
    principalPaidToDate: number;
    ltv: number;
    amortizationSchedule: Array<{ year: number; principalPaid: number; interestPaid: number; balance: number }>;
  };
  valueHistory: Array<{ date: string; value: number; label: string }>;
  improvements: Array<{ id: string; name: string; completedDate: string; cost: number; estimatedValueAdd: number; roi: number; category: string; description: string }>;
  marketData: {
    neighborhood: string;
    medianHomePrice: number;
    yearOverYearChange: number;
    monthOverMonthChange: number;
    daysOnMarket: number;
    inventoryLevel: string;
    marketTrend: string;
    comparableHomes: Array<{ address: string; distance: string; soldPrice: number; soldDate: string; beds: number; baths: number; sqft: number }>;
  };
  projections: Array<{ id: string; name: string; estimatedCost: number; estimatedValueAdd: number; projectedROI: number; timeframe: string; impact: string }>;
}

/** Calculate the correct principal & interest monthly payment from loan terms */
function calculatePIPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function generateAmortizationSchedule(
  principal: number, rate: number, termYears: number, startDate: string, _monthlyPayment: number
): Array<{ year: number; principalPaid: number; interestPaid: number; balance: number }> {
  const schedule: Array<{ year: number; principalPaid: number; interestPaid: number; balance: number }> = [];
  let balance = principal;
  const monthlyRate = rate / 100 / 12;
  const startYear = new Date(startDate).getFullYear();
  // Use the mathematically correct P&I payment instead of user-entered total (which may include escrow)
  const piPayment = calculatePIPayment(principal, rate, termYears);

  for (let y = 0; y < termYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const months = y === 0 ? (12 - new Date(startDate).getMonth()) : 12;
    for (let m = 0; m < months && balance > 0; m++) {
      const interest = balance * monthlyRate;
      const principalPart = Math.min(piPayment - interest, balance);
      yearInterest += interest;
      yearPrincipal += principalPart;
      balance -= principalPart;
    }
    schedule.push({
      year: startYear + y,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    });
    if (balance <= 0) break;
  }
  return schedule;
}

const defaultMarketData: ValuationData['marketData'] = {
  neighborhood: 'Your Neighborhood',
  medianHomePrice: 0,
  yearOverYearChange: 0,
  monthOverMonthChange: 0,
  daysOnMarket: 0,
  inventoryLevel: '—',
  marketTrend: '—',
  comparableHomes: [],
};

const defaultProjections: ValuationData['projections'] = [
  { id: '1', name: 'Basement Finishing', estimatedCost: 45000, estimatedValueAdd: 38000, projectedROI: 84, timeframe: '3-4 months', impact: 'High' },
  { id: '2', name: 'Exterior Paint & Siding', estimatedCost: 12500, estimatedValueAdd: 10800, projectedROI: 86, timeframe: '2-3 weeks', impact: 'Medium' },
  { id: '3', name: 'Landscaping Upgrade', estimatedCost: 8500, estimatedValueAdd: 6800, projectedROI: 80, timeframe: '1-2 weeks', impact: 'Medium' },
  { id: '4', name: 'Energy-Efficient Windows', estimatedCost: 18000, estimatedValueAdd: 14400, projectedROI: 80, timeframe: '1-2 weeks', impact: 'High' },
];

export default function HomeValuation() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'overview' | 'improvements' | 'market' | 'projections' | 'mortgage'>('overview');
  const [expandedImprovement, setExpandedImprovement] = useState<string | null>(null);
  const [expandedProjection, setExpandedProjection] = useState<string | null>(null);
  const [projectionsLoading, setProjectionsLoading] = useState(false);
  const [projectionsLoaded, setProjectionsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [homeValuationData, setHomeValuationData] = useState<ValuationData | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Setup form state
  const [setupPurchasePrice, setSetupPurchasePrice] = useState('');
  const [setupPurchaseDate, setSetupPurchaseDate] = useState('');
  const [setupCurrentValue, setSetupCurrentValue] = useState('');
  const [setupMortgageAmount, setSetupMortgageAmount] = useState('');
  const [setupMortgageBalance, setSetupMortgageBalance] = useState('');
  const [setupInterestRate, setSetupInterestRate] = useState('');
  const [setupTermYears, setSetupTermYears] = useState('30');
  const [setupMonthlyPayment, setSetupMonthlyPayment] = useState('');
  const [setupLender, setSetupLender] = useState('');
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupError, setSetupError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!prop) { setLoading(false); return; }
    setPropertyId(prop.id);

    const [valRes, histRes, impRes] = await Promise.all([
      supabase.from('property_valuations').select('*').eq('property_id', prop.id).single(),
      supabase.from('property_value_history').select('*').eq('property_id', prop.id).order('recorded_date', { ascending: true }),
      supabase.from('property_improvements').select('*').eq('property_id', prop.id).order('completed_date', { ascending: false }),
    ]);

    if (!valRes.data) {
      setLoading(false);
      return; // No valuation data — will show setup prompt
    }

    const v = valRes.data;
    const mortgageStartDate = v.mortgage_start_date || v.purchase_date || '2020-01-01';
    const origAmount = Number(v.mortgage_original_amount) || 0;
    const curBalance = Number(v.mortgage_current_balance) || 0;
    const rate = Number(v.mortgage_interest_rate) || 0;
    const term = v.mortgage_term_years || 30;
    const monthly = Number(v.mortgage_monthly_payment) || 0;
    const schedule = generateAmortizationSchedule(origAmount, rate, term, mortgageStartDate, monthly);
    const principalPaidToDate = origAmount - curBalance;
    const totalInterestPaid = schedule
      .filter(s => s.year <= new Date().getFullYear())
      .reduce((sum, s) => sum + s.interestPaid, 0);
    const totalInterestRemaining = schedule
      .filter(s => s.year > new Date().getFullYear())
      .reduce((sum, s) => sum + s.interestPaid, 0);

    const startDate = new Date(mortgageStartDate);
    const payoffDate = new Date(startDate);
    payoffDate.setFullYear(payoffDate.getFullYear() + term);

    const currentValue = Number(v.current_value) || 0;

    const data: ValuationData = {
      currentValue,
      purchasePrice: Number(v.purchase_price) || 0,
      purchaseDate: v.purchase_date || '',
      mortgageBalance: curBalance,
      lastUpdated: v.value_last_updated || v.updated_at,
      mortgage: {
        originalAmount: origAmount,
        currentBalance: curBalance,
        interestRate: rate,
        termYears: term,
        monthlyPayment: monthly,
        startDate: mortgageStartDate,
        extraMonthlyPayment: Number(v.mortgage_extra_payment) || 0,
        lender: v.mortgage_lender || '',
        payoffDate: payoffDate.toISOString().split('T')[0],
        totalInterestPaid,
        totalInterestRemaining,
        principalPaidToDate,
        ltv: currentValue > 0 ? Math.round((curBalance / currentValue) * 1000) / 10 : 0,
        amortizationSchedule: schedule,
      },
      valueHistory: (histRes.data || []).map(h => ({
        date: h.recorded_date,
        value: Number(h.value),
        label: h.label || '',
      })),
      improvements: (impRes.data || []).map(i => ({
        id: i.id,
        name: i.name,
        completedDate: i.completed_date || '',
        cost: Number(i.cost) || 0,
        estimatedValueAdd: Number(i.estimated_value_add) || 0,
        roi: Number(i.cost) > 0 ? Math.round((Number(i.estimated_value_add) / Number(i.cost)) * 100) : 0,
        category: i.category || 'Other',
        description: i.description || '',
      })),
      marketData: defaultMarketData,
      projections: defaultProjections,
    };

    setHomeValuationData(data);
    setLoading(false);
  }, [user]);

  const fetchProjections = useCallback(async () => {
    if (!user || !homeValuationData || projectionsLoaded || projectionsLoading) return;
    setProjectionsLoading(true);

    try {
      // Fetch property details for context
      const { data: property } = await supabase
        .from('properties')
        .select('property_type, year_built, square_footage')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      // Fetch system registry for additional context
      const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      let systems: Array<{ name: string; category: string; condition: string; age: number }> = [];
      if (prop) {
        const { data: systemData } = await supabase
          .from('property_systems')
          .select('name, category, condition, install_year')
          .eq('property_id', prop.id);

        if (systemData) {
          const currentYear = new Date().getFullYear();
          systems = systemData.map(s => ({
            name: s.name,
            category: s.category,
            condition: s.condition || 'Unknown',
            age: s.install_year ? currentYear - s.install_year : 0,
          }));
        }
      }

      const result = await aiAgentService.generateProjections({
        propertyType: property?.property_type || 'single-family',
        yearBuilt: property?.year_built || null,
        squareFootage: property?.square_footage || null,
        currentValue: homeValuationData.currentValue,
        systems,
      });

      if (result.projections && result.projections.length > 0) {
        setHomeValuationData(prev => prev ? {
          ...prev,
          projections: result.projections.map((p, i) => ({
            id: `ai-${i + 1}`,
            name: p.name,
            estimatedCost: p.estimatedCost,
            estimatedValueAdd: p.estimatedValueAdd,
            projectedROI: p.projectedROI,
            timeframe: p.timeframe,
            impact: p.impact,
            description: p.description || '',
          })),
        } : prev);
      }
      setProjectionsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch AI projections:', err);
      // Keep default projections on error
      setProjectionsLoaded(true);
    } finally {
      setProjectionsLoading(false);
    }
  }, [user, homeValuationData, projectionsLoaded, projectionsLoading]);

  // Load projections when tab is selected
  useEffect(() => {
    if (selectedView === 'projections' && homeValuationData && !projectionsLoaded) {
      fetchProjections();
    }
  }, [selectedView, homeValuationData, projectionsLoaded, fetchProjections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetupSave = async () => {
    if (!user) return;
    if (!propertyId) {
      // No property record yet — surface a visible error instead of failing silently.
      setSetupError('We could not find your property record. Please complete property setup from the homeowner enrollment flow first.');
      return;
    }
    setSetupSaving(true);
    setSetupError('');

    const purchasePrice = Number(setupPurchasePrice) || 0;
    const currentValue = Number(setupCurrentValue) || purchasePrice;

    const valuationPayload = {
      property_id: propertyId,
      user_id: user.id,
      purchase_price: purchasePrice,
      purchase_date: setupPurchaseDate || null,
      current_value: currentValue,
      value_last_updated: new Date().toISOString(),
      mortgage_original_amount: Number(setupMortgageAmount) || null,
      mortgage_current_balance: Number(setupMortgageBalance) || null,
      mortgage_interest_rate: Number(setupInterestRate) || null,
      mortgage_term_years: Number(setupTermYears) || 30,
      mortgage_monthly_payment: Number(setupMonthlyPayment) || null,
      mortgage_start_date: setupPurchaseDate || null,
      mortgage_lender: setupLender || null,
    };

    const { error } = isEditing
      ? await supabase.from('property_valuations').update(valuationPayload).eq('property_id', propertyId)
      : await supabase.from('property_valuations').insert(valuationPayload);

    if (!error) {
      // Also insert initial value history point
      if (purchasePrice && setupPurchaseDate) {
        await supabase.from('property_value_history').insert({
          property_id: propertyId,
          user_id: user.id,
          recorded_date: setupPurchaseDate,
          value: purchasePrice,
          label: 'Purchase',
          source: 'manual',
        });
      }
      if (currentValue && currentValue !== purchasePrice) {
        await supabase.from('property_value_history').insert({
          property_id: propertyId,
          user_id: user.id,
          recorded_date: new Date().toISOString().split('T')[0],
          value: currentValue,
          label: 'Current',
          source: 'manual',
        });
      }
    }

    setSetupSaving(false);
    if (error) {
      console.error('Failed to save home valuation:', error);
      setSetupError('Failed to save. Please check your entries and try again.');
      return;
    }
    setShowSetupModal(false);
    setIsEditing(false);
    fetchData();
  };

  const renderSetupModal = () => showSetupModal && (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">{isEditing ? 'Edit Property Valuation' : 'Property Valuation Setup'}</h3>
            <button onClick={() => { setShowSetupModal(false); setIsEditing(false); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Purchase Price *</label>
                <input type="number" value={setupPurchasePrice} onChange={e => setSetupPurchasePrice(e.target.value)} placeholder="385000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Purchase Date</label>
                <input type="date" value={setupPurchaseDate} onChange={e => setSetupPurchaseDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Current Estimated Value</label>
              <input type="number" value={setupCurrentValue} onChange={e => setSetupCurrentValue(e.target.value)} placeholder="487500" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Mortgage Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Original Amount</label>
                  <input type="number" value={setupMortgageAmount} onChange={e => setSetupMortgageAmount(e.target.value)} placeholder="308000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Current Balance</label>
                  <input type="number" value={setupMortgageBalance} onChange={e => setSetupMortgageBalance(e.target.value)} placeholder="298000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Interest Rate (%)</label>
                  <input type="number" step="0.01" value={setupInterestRate} onChange={e => setSetupInterestRate(e.target.value)} placeholder="6.25" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Term (Years)</label>
                  <select value={setupTermYears} onChange={e => setSetupTermYears(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent">
                    <option value="15">15 Years</option>
                    <option value="20">20 Years</option>
                    <option value="30">30 Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Monthly Payment</label>
                  <input type="number" value={setupMonthlyPayment} onChange={e => setSetupMonthlyPayment(e.target.value)} placeholder="1896" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5">Lender</label>
                  <input type="text" value={setupLender} onChange={e => setSetupLender(e.target.value)} placeholder="First National Bank" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D4B483] focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {setupError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700"><i className="ri-error-warning-line mr-1"></i>{setupError}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => { setShowSetupModal(false); setIsEditing(false); setSetupError(''); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm">Cancel</button>
            <button onClick={handleSetupSave} disabled={setupSaving || !setupPurchasePrice} className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50">
              {setupSaving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!homeValuationData) {
    if (!propertyId) {
      // No property record at all — user hasn't completed enrollment.
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-home-4-line text-3xl text-amber-600"></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Property setup needed</h3>
            <p className="text-sm text-[#6B7C8F] mb-6 max-w-md mx-auto">
              We could not find your property record. Please complete the homeowner enrollment so we can track your home's value.
            </p>
            <a
              href="/enroll-homeowner"
              className="inline-block px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer"
            >
              <i className="ri-arrow-right-line mr-2"></i>
              Complete Property Setup
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-line-chart-line text-3xl text-white"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Set Up Home Valuation</h3>
          <p className="text-sm text-[#6B7C8F] mb-6 max-w-md mx-auto">
            Enter your purchase price and mortgage details to start tracking your home's value, equity, and investment returns.
          </p>
          <button
            type="button"
            onClick={() => setShowSetupModal(true)}
            className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer"
          >
            <i className="ri-add-line mr-2"></i>
            Enter Property Details
          </button>
        </div>

        {renderSetupModal()}
      </div>
    );
  }

  const totalInvested = homeValuationData.improvements.reduce((sum, imp) => sum + imp.cost, 0);
  const totalValueAdded = homeValuationData.improvements.reduce((sum, imp) => sum + imp.estimatedValueAdd, 0);
  const averageROI = totalInvested > 0 ? Math.round(totalValueAdded / totalInvested * 100) : 0;
  const netEquity = homeValuationData.currentValue - homeValuationData.mortgageBalance;
  const totalGain = homeValuationData.currentValue - homeValuationData.purchasePrice;
  const gainPercentage = homeValuationData.purchasePrice > 0 ? Math.round((totalGain / homeValuationData.purchasePrice) * 100) : 0;

  const maxValue = homeValuationData.valueHistory.length > 0 ? Math.max(...homeValuationData.valueHistory.map(v => v.value)) : homeValuationData.currentValue;
  const minValue = homeValuationData.valueHistory.length > 0 ? Math.min(...homeValuationData.valueHistory.map(v => v.value)) : homeValuationData.purchasePrice;
  const valueRange = maxValue - minValue || 1;

  const mortgage = homeValuationData.mortgage;
  const equityPercent = homeValuationData.currentValue > 0 ? Math.round((netEquity / homeValuationData.currentValue) * 100) : 0;
  const mortgagePercent = 100 - equityPercent;

  // Amortization chart helpers
  const currentYear = new Date().getFullYear();
  const maxScheduleBalance = mortgage.amortizationSchedule.length > 0 ? Math.max(...mortgage.amortizationSchedule.map(s => s.balance), mortgage.originalAmount) : mortgage.originalAmount || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl flex items-center justify-center">
            <i className="ri-line-chart-line text-white text-xl sm:text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33]">Home Valuation</h2>
            <p className="text-xs sm:text-sm text-gray-600">Track your property value and investment returns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (homeValuationData) {
                setSetupPurchasePrice(homeValuationData.purchasePrice.toString());
                setSetupPurchaseDate(homeValuationData.purchaseDate || '');
                setSetupCurrentValue(homeValuationData.currentValue.toString());
                setSetupMortgageAmount(homeValuationData.mortgage.originalAmount?.toString() || '');
                setSetupMortgageBalance(homeValuationData.mortgageBalance?.toString() || '');
                setSetupInterestRate(homeValuationData.mortgage.interestRate?.toString() || '');
                setSetupTermYears(homeValuationData.mortgage.termYears?.toString() || '30');
                setSetupMonthlyPayment(homeValuationData.mortgage.monthlyPayment?.toString() || '');
                setSetupLender(homeValuationData.mortgage.lender || '');
                setIsEditing(true);
                setShowSetupModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-[#6B7C8F] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <i className="ri-edit-line"></i>
            Edit Details
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full">
            <i className="ri-vip-crown-line text-amber-600 text-xs sm:text-sm"></i>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700">Premium Feature</span>
          </div>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-2xl p-5 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <p className="text-white text-xs sm:text-sm font-medium mb-2">Estimated Home Value</p>
            <h3 className="text-3xl sm:text-5xl font-bold text-white mb-1">${homeValuationData.currentValue.toLocaleString()}</h3>
            <p className="text-white text-xs sm:text-sm">Last updated: {new Date(homeValuationData.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end mb-2">
              <i className="ri-arrow-up-line text-xl sm:text-xl text-emerald-400"></i>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">+{gainPercentage}%</span>
            </div>
            <p className="text-white text-xs sm:text-sm">Since purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-white/20">
          <div>
            <p className="text-white text-[10px] sm:text-xs mb-1">Purchase Price</p>
            <p className="text-base sm:text-xl font-bold text-white">${homeValuationData.purchasePrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white text-[10px] sm:text-xs mb-1">Net Equity</p>
            <p className="text-base sm:text-xl font-bold text-white">${netEquity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white text-[10px] sm:text-xs mb-1">Total Gain</p>
            <p className="text-base sm:text-xl font-bold text-white">+${totalGain.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
          { id: 'mortgage', label: 'Mortgage', icon: 'ri-bank-line' },
          { id: 'improvements', label: 'Improvements', icon: 'ri-hammer-line' },
          { id: 'projections', label: 'Projections', icon: 'ri-lightbulb-line' },
          { id: 'market', label: 'Market Data', icon: 'ri-bar-chart-box-line' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as typeof selectedView)}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedView === tab.id
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className={`${tab.icon} mr-1 sm:mr-2`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Value History Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#0B1F33] mb-4 sm:mb-6">Value History</h3>
            <div className="relative h-64 sm:h-80">
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500 pr-2">
                <span>${Math.round(maxValue / 1000)}k</span>
                <span>${Math.round((maxValue + minValue) / 2 / 1000)}k</span>
                <span>${Math.round(minValue / 1000)}k</span>
              </div>
              <div className="ml-8 sm:ml-12 h-full flex items-end gap-0.5 sm:gap-1 pb-8">
                {homeValuationData.valueHistory.map((point, index) => {
                  const height = ((point.value - minValue) / valueRange) * 100;
                  const isLabeled = point.label !== '';
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] sm:text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                        ${point.value.toLocaleString()}
                      </div>
                      {isLabeled && (
                        <div className="absolute bottom-full mb-1 text-[9px] sm:text-xs font-semibold text-emerald-600 whitespace-nowrap transform -rotate-45 origin-bottom-left">
                          {point.label}
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t transition-all ${isLabeled ? 'bg-emerald-500' : 'bg-teal-400'} group-hover:opacity-80`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute top-full mt-1 text-[9px] sm:text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {point.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-5 sm:p-6 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-funds-line text-emerald-400 text-base sm:text-lg"></i>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">Investment Summary</h4>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white">Total Invested</span>
                  <span className="font-bold text-sm sm:text-base text-white">${totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white">Value Added</span>
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">+${totalValueAdded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-white/20">
                  <span className="text-xs sm:text-sm font-semibold text-white">Average ROI</span>
                  <span className="font-bold text-base sm:text-lg text-emerald-400">{averageROI}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-5 sm:p-6 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-bank-line text-[#D4B483] text-base sm:text-lg"></i>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">Equity Breakdown</h4>
              </div>
              {/* Equity bar */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-white mb-1.5">
                  <span>Equity {equityPercent}%</span>
                  <span>Mortgage {mortgagePercent}%</span>
                </div>
                <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400 rounded-l-full" style={{ width: `${equityPercent}%` }}></div>
                  <div className="h-full bg-[#D4B483] rounded-r-full" style={{ width: `${mortgagePercent}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white">Current Value</span>
                  <span className="font-bold text-sm sm:text-base text-white">${homeValuationData.currentValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white">Mortgage Balance</span>
                  <span className="font-bold text-[#D4B483] text-sm sm:text-base">${homeValuationData.mortgageBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                  <span className="text-xs sm:text-sm font-semibold text-white">Net Equity</span>
                  <span className="font-bold text-base sm:text-lg text-emerald-400">${netEquity.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedView('mortgage')}
                className="mt-3 sm:mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden sm:inline">View Mortgage Timeline</span>
                <span className="sm:hidden">Mortgage Timeline</span>
                <i className="ri-arrow-right-s-line ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mortgage Tab */}
      {selectedView === 'mortgage' && (
        <div className="space-y-6">
          {/* Mortgage Summary */}
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-2xl p-5 sm:p-8 text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="ri-bank-line text-[#D4B483] text-xl sm:text-2xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">Mortgage Overview</h3>
                <p className="text-xs sm:text-sm text-white truncate">{mortgage.lender} &middot; {mortgage.interestRate}% Fixed &middot; {mortgage.termYears}-Year</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-white mb-1">Monthly Payment</p>
                <p className="text-lg sm:text-2xl font-bold text-white">${mortgage.monthlyPayment.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-white mb-1 truncate">Remaining Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-white">${mortgage.currentBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-white mb-1">LTV Ratio</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{mortgage.ltv}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-white mb-1">Payoff Date</p>
                <p className="text-base sm:text-2xl font-bold text-white">{new Date(mortgage.payoffDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Equity vs Mortgage donut-style bar */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"></span>
                  <span className="text-white">Equity: ${netEquity.toLocaleString()} ({equityPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#D4B483] rounded-full"></span>
                  <span className="text-white">Mortgage: ${mortgage.currentBalance.toLocaleString()} ({mortgagePercent}%)</span>
                </div>
              </div>
              <div className="w-full h-4 sm:h-5 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-400 rounded-l-full transition-all" style={{ width: `${equityPercent}%` }}></div>
                <div className="h-full bg-[#D4B483] rounded-r-full transition-all" style={{ width: `${mortgagePercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Interest vs Principal Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                  <i className="ri-arrow-down-circle-line text-emerald-400 text-sm sm:text-base"></i>
                </div>
                <p className="text-xs sm:text-sm text-white">Principal Paid</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">${mortgage.principalPaidToDate.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-white mt-1">of ${mortgage.originalAmount.toLocaleString()} original</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
                  <i className="ri-percent-line text-[#D4B483] text-sm sm:text-base"></i>
                </div>
                <p className="text-xs sm:text-sm text-white">Interest Paid</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">${mortgage.totalInterestPaid.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-white mt-1">to date</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-red-400 text-sm sm:text-base"></i>
                </div>
                <p className="text-xs sm:text-sm text-white truncate">Interest Remaining</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">${mortgage.totalInterestRemaining.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-white mt-1">over remaining term</p>
            </div>
          </div>

          {/* Amortization Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Payoff Timeline</h3>
                <p className="text-xs sm:text-sm text-gray-500">Projected balance over the life of your mortgage</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#0B1F33] rounded-sm"></span>
                  <span className="text-gray-600">Remaining Balance</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-sm"></span>
                  <span className="text-gray-600">Principal Paid</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#D4B483] rounded-sm"></span>
                  <span className="text-gray-600">Interest Paid</span>
                </div>
              </div>
            </div>

            <div className="relative h-56 sm:h-72">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500 pr-2 w-10 sm:w-12">
                <span>${Math.round(maxScheduleBalance / 1000)}k</span>
                <span>${Math.round(maxScheduleBalance / 2 / 1000)}k</span>
                <span>$0</span>
              </div>

              {/* Chart */}
              <div className="ml-12 sm:ml-14 h-full flex items-end gap-0.5 pb-8">
                {mortgage.amortizationSchedule.map((entry, index) => {
                  const balanceHeight = (entry.balance / maxScheduleBalance) * 100;
                  const isPast = entry.year <= currentYear;
                  const isCurrent = entry.year === currentYear;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        <p className="font-bold mb-1">{entry.year}</p>
                        <p>Balance: ${entry.balance.toLocaleString()}</p>
                        <p>Principal: ${entry.principalPaid.toLocaleString()}</p>
                        <p>Interest: ${entry.interestPaid.toLocaleString()}</p>
                      </div>

                      {/* Stacked bars */}
                      <div className="w-full flex flex-col items-stretch">
                        <div
                          className={`w-full rounded-t-sm ${isCurrent ? 'bg-teal-500' : isPast ? 'bg-[#0B1F33]' : 'bg-[#0B1F33]/40'} group-hover:opacity-80 transition-opacity`}
                          style={{ height: `${balanceHeight * 2.4}px` }}
                        ></div>
                      </div>

                      {/* Year label (every 5 years + current) */}
                      {(entry.year % 5 === 0 || isCurrent) && (
                        <div className={`absolute top-full mt-1 text-[9px] sm:text-[10px] whitespace-nowrap ${isCurrent ? 'text-teal-600 font-bold' : 'text-gray-500'}`}>
                          {isCurrent ? `${entry.year}*` : entry.year}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-2 text-center">* Current year</p>
          </div>

          {/* Amortization Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Amortization Schedule</h3>
              <p className="text-xs sm:text-sm text-gray-500">Year-by-year breakdown of your mortgage payments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Year</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Principal</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Interest</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Total Paid</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mortgage.amortizationSchedule.map((entry) => {
                    const isCurrent = entry.year === currentYear;
                    const isPast = entry.year < currentYear;
                    return (
                      <tr
                        key={entry.year}
                        className={`transition-colors ${isCurrent ? 'bg-teal-50 font-semibold' : isPast ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100`}
                      >
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-[#0B1F33]">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {entry.year}
                            {isCurrent && (
                              <span className="px-1 sm:px-1.5 py-0.5 bg-teal-600 text-white text-[9px] sm:text-[10px] font-bold rounded">NOW</span>
                            )}
                            {isPast && !isCurrent && (
                              <i className="ri-check-line text-emerald-500 text-xs sm:text-sm"></i>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-right text-emerald-600 font-semibold">${entry.principalPaid.toLocaleString()}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-right text-[#D4B483] font-semibold">${entry.interestPaid.toLocaleString()}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-right text-[#0B1F33] hidden sm:table-cell">${(entry.principalPaid + entry.interestPaid).toLocaleString()}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-right font-bold text-[#0B1F33]">
                          {entry.balance === 0 ? (
                            <span className="text-emerald-600 flex items-center justify-end gap-1">
                              <i className="ri-checkbox-circle-fill"></i> <span className="hidden sm:inline">Paid Off</span>
                            </span>
                          ) : (
                            `$${entry.balance.toLocaleString()}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-sparkling-line text-[#D4B483] text-xl sm:text-2xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-2">AI Mortgage Insight</h4>
                <p className="text-xs sm:text-sm text-white leading-relaxed mb-3 sm:mb-4">
                  At your current rate of ${mortgage.monthlyPayment}/month, you&apos;ll pay <strong className="text-[#D4B483]">${mortgage.totalInterestRemaining.toLocaleString()}</strong> in remaining interest. Adding just <strong className="text-emerald-400">$200/month</strong> extra toward principal could save you approximately <strong className="text-emerald-400">$68,000</strong> in interest and pay off your mortgage <strong className="text-emerald-400">7 years early</strong>.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-white mb-1">Current Payoff</p>
                    <p className="font-bold text-xs sm:text-sm">Mar 2049</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-white mb-1">With +$200/mo</p>
                    <p className="font-bold text-emerald-400 text-xs sm:text-sm">~2042</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-white mb-1 truncate">Interest Saved</p>
                    <p className="font-bold text-emerald-400 text-xs sm:text-sm">~$68,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improvements Tab */}
      {selectedView === 'improvements' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Total Impact</h3>
                <p className="text-sm text-white">Your improvements have added significant value</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">+${totalValueAdded.toLocaleString()}</p>
                <p className="text-sm text-white">Average ROI: {averageROI}%</p>
              </div>
            </div>
          </div>

          {homeValuationData.improvements.map((improvement) => (
            <div
              key={improvement.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedImprovement(expandedImprovement === improvement.id ? null : improvement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-[#0B1F33]">{improvement.name}</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {improvement.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Completed: {new Date(improvement.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cost</p>
                        <p className="font-bold text-[#0B1F33]">${improvement.cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Value Added</p>
                        <p className="font-bold text-emerald-600">+${improvement.estimatedValueAdd.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p className="font-bold text-teal-600">{improvement.roi}%</p>
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                    <i className={`ri-arrow-${expandedImprovement === improvement.id ? 'up' : 'down'}-s-line text-xl`}></i>
                  </button>
                </div>

                {expandedImprovement === improvement.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{improvement.description}</p>
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Return on Investment</span>
                        <span className="text-xs font-bold text-emerald-600">{improvement.roi}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                          style={{ width: `${Math.min(improvement.roi, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Market Data Tab — Coming Soon */}
      {selectedView === 'market' && (
        <div className="relative rounded-xl overflow-hidden">
          {/* Blurred preview behind overlay */}
          <div className="pointer-events-none select-none blur-[2px] opacity-40">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0B1F33] mb-4 sm:mb-6">Market Overview - Your Neighborhood</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Median Home Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-[#0B1F33]">$465,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Year-over-Year</p>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <i className="ri-arrow-up-line text-emerald-600"></i>
                      <p className="text-lg sm:text-2xl font-bold text-emerald-600">+5.8%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Days on Market</p>
                    <p className="text-lg sm:text-2xl font-bold text-[#0B1F33]">28</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Market Type</p>
                    <span className="inline-flex px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-sm font-semibold rounded-full">Seller&apos;s Market</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h4 className="font-bold text-[#0B1F33] text-sm sm:text-base mb-4">Recent Trends</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Month-over-Month</span><span className="font-bold text-emerald-600 text-sm">+1.2%</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Inventory Level</span><span className="font-bold text-[#0B1F33] text-sm">Low</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Avg. Days Listed</span><span className="font-bold text-[#0B1F33] text-sm">28 days</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
                  <h4 className="font-bold text-sm sm:text-base mb-4">Your Position</h4>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between mb-2"><span className="text-xs text-white">Your Home</span><span className="text-sm font-bold">$520,000</span></div>
                    <div className="flex justify-between"><span className="text-xs text-white">Neighborhood Median</span><span className="text-sm font-bold">$465,000</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon overlay */}
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-bar-chart-box-line text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-white/80 text-sm max-w-md">
                Real-time market data including comparable sales, neighborhood trends, and your home&apos;s position in the local market.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {selectedView === 'projections' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <i className="ri-sparkling-line text-[#D4B483] text-lg"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">AI-Powered Projections</h3>
              </div>
              {projectionsLoaded && (
                <button
                  onClick={() => { setProjectionsLoaded(false); }}
                  className="text-xs text-white/60 hover:text-white cursor-pointer flex items-center gap-1"
                >
                  <i className="ri-refresh-line"></i>Refresh
                </button>
              )}
            </div>
            <p className="text-sm text-white">
              Personalized renovation suggestions based on your property type, age, systems, and current value. Cost estimates and ROI projections may vary based on materials, labor costs in your area, and scope of work. Our AI is always improving.
            </p>
          </div>

          {projectionsLoading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#D4B483] animate-spin"></div>
              </div>
              <h4 className="font-bold text-[#0B1F33] mb-1">Analyzing your property...</h4>
              <p className="text-sm text-[#6B7C8F]">AI is generating personalized improvement projections</p>
            </div>
          )}

          {homeValuationData.projections.map((projection) => (
            <div
              key={projection.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedProjection(expandedProjection === projection.id ? null : projection.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-[#0B1F33]">{projection.name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        projection.impact === 'High'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {projection.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Estimated timeframe: {projection.timeframe}</p>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
                        <p className="font-bold text-[#0B1F33]">${projection.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Potential Value Add</p>
                        <p className="font-bold text-emerald-600">+${projection.estimatedValueAdd.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Projected ROI</p>
                        <p className="font-bold text-teal-600">{projection.projectedROI}%</p>
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                    <i className={`ri-arrow-${expandedProjection === projection.id ? 'up' : 'down'}-s-line text-xl`}></i>
                  </button>
                </div>

                {expandedProjection === projection.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                      <h5 className="font-bold text-[#0B1F33] mb-3">Projected Impact</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Home Value</span>
                          <span className="font-bold text-[#0B1F33]">${homeValuationData.currentValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">After {projection.name}</span>
                          <span className="font-bold text-emerald-600">
                            ${(homeValuationData.currentValue + projection.estimatedValueAdd).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                          <span className="text-sm font-semibold text-gray-900">Net Gain</span>
                          <span className="font-bold text-lg text-emerald-600">
                            +${(projection.estimatedValueAdd - projection.estimatedCost).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Combined Projection */}
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-rocket-line text-white text-lg"></i>
              </div>
              <h4 className="font-bold text-lg text-white">Complete All Improvements</h4>
            </div>
            <p className="text-white text-sm mb-4">
              If you complete all projected improvements, here&apos;s the potential impact:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white mb-1">Total Investment</p>
                <p className="text-xl font-bold text-white">
                  ${homeValuationData.projections.reduce((sum, p) => sum + p.estimatedCost, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white mb-1">Potential Value Add</p>
                <p className="text-xl font-bold text-white">
                  +${homeValuationData.projections.reduce((sum, p) => sum + p.estimatedValueAdd, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white mb-1">Projected Home Value</p>
                <p className="text-xl font-bold text-white">
                  ${(homeValuationData.currentValue + homeValuationData.projections.reduce((sum, p) => sum + p.estimatedValueAdd, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup / Edit Modal */}
      {renderSetupModal()}
    </div>
  );
}

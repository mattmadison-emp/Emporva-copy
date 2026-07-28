import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { generateEarningsStatementPDF } from '../../../utils/earningsStatementPdf';

type DateRange = 'last-30' | 'last-90' | 'last-6m' | 'last-12m' | 'ytd' | 'custom';
type CompareMode = 'none' | 'prior-period' | 'prior-year';

interface PaymentRow {
  id: string;
  job_id: string | null;
  amount: number;
  status: string;
  payment_type: string;
  payment_method: string | null;
  description: string | null;
  confirmation_id: string | null;
  created_at: string;
}

const dateRangeLabels: Record<DateRange, string> = {
  'last-30': 'Last 30 Days',
  'last-90': 'Last 90 Days',
  'last-6m': 'Last 6 Months',
  'last-12m': 'Last 12 Months',
  ytd: 'Year to Date',
  custom: 'Custom Range',
};

const compareModeLabels: Record<CompareMode, string> = {
  none: 'No Comparison',
  'prior-period': 'Prior Period',
  'prior-year': 'Prior Year',
};

function calcChange(
  current: number,
  previous: number
): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(parseFloat(change.toFixed(1))), isPositive: change >= 0 };
}

function getMonthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short' });
}

function getDateRangeMs(range: DateRange, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;
  switch (range) {
    case 'last-30': start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    case 'last-90': start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
    case 'last-6m': start = new Date(now.getFullYear(), now.getMonth() - 6, 1); break;
    case 'last-12m': start = new Date(now.getFullYear(), now.getMonth() - 12, 1); break;
    case 'ytd': start = new Date(now.getFullYear(), 0, 1); break;
    case 'custom': start = new Date(customStart || now.toISOString()); end.setTime(new Date(customEnd || now.toISOString()).getTime()); break;
    default: start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }
  return { start, end };
}

export default function EarningsDashboard() {
  const { user } = useAuth();
  const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('last-6m');
  const [compareMode, setCompareMode] = useState<CompareMode>('prior-period');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [customStart, setCustomStart] = useState('2024-08-01');
  const [customEnd, setCustomEnd] = useState('2025-01-31');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [allPayments, setAllPayments] = useState<PaymentRow[]>([]);
  const [jobMap, setJobMap] = useState<Record<string, { title: string; homeowner: string }>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [statementForm, setStatementForm] = useState({
    contractorName: '',
    contractorEmail: '',
    contractorPhone: '',
    contractorAddress: '',
    contractorLicense: '',
    ein: '',
  });
  const [showLogRevenueModal, setShowLogRevenueModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [logRevenueForm, setLogRevenueForm] = useState({
    amount: '' as string | number,
    description: '',
    date: new Date().toISOString().split('T')[0],
    source: 'Cash' as 'Cash' | 'Check' | 'Venmo' | 'Zelle' | 'Other',
  });

  // Fetch contractor profile for statement form
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const [profileRes, cpRes] = await Promise.all([
      supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', user.id).single(),
      supabase.from('contractor_profiles').select('business_name').eq('user_id', user.id).single(),
    ]);
    if (profileRes.data) {
      setStatementForm(prev => ({
        ...prev,
        contractorName: cpRes.data?.business_name || `${profileRes.data.first_name} ${profileRes.data.last_name}`,
        contractorEmail: profileRes.data.email,
        contractorPhone: profileRes.data.phone || '',
      }));
    }
  }, [user]);

  // Fetch all payments where this contractor is the payee
  const fetchPayments = useCallback(async () => {
    if (!user) return;
    const { data: payments } = await supabase
      .from('payments')
      .select('id, job_id, amount, status, payment_type, payment_method, description, confirmation_id, created_at')
      .eq('payee_id', user.id)
      .order('created_at', { ascending: false });

    const rows = (payments || []) as PaymentRow[];
    setAllPayments(rows);

    // Build job map for titles and homeowner names
    if (rows.length > 0) {
      const jobIds = [...new Set(rows.map(p => p.job_id))];
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, user_id')
        .in('id', jobIds);

      const homeownerIds = [...new Set((jobs || []).map(j => j.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', homeownerIds);

      const profileNames = Object.fromEntries(
        (profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
      );
      const jMap: Record<string, { title: string; homeowner: string }> = {};
      (jobs || []).forEach(j => {
        jMap[j.id] = { title: j.title, homeowner: profileNames[j.user_id] || 'Unknown' };
      });
      setJobMap(jMap);
    }
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchPayments();
  }, [fetchProfile, fetchPayments]);

  // Derive all mock-equivalent data from real payments
  const completedPayments = allPayments.filter(p => p.status === 'completed');

  const totalRevenue = completedPayments.reduce((s, p) => s + Number(p.amount), 0);
  const completedJobs = new Set(completedPayments.map(p => p.job_id)).size;
  const avgJobValue = completedJobs > 0 ? Math.round(totalRevenue / completedJobs) : 0;

  const earningsSummary = {
    totalRevenue,
    availableBalance: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    avgJobValue,
    completedJobs,
  };

  // Build monthly revenue data from payments
  const buildMonthlyData = (payments: PaymentRow[]) => {
    const months: Record<string, { revenue: number; payouts: number; year: number }> = {};
    payments.forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) months[key] = { revenue: 0, payouts: 0, year: d.getFullYear() };
      const amt = Number(p.amount);
      months[key].revenue += amt;
      if (p.status === 'completed') months[key].payouts += amt;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        month: getMonthLabel(new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]))),
        year: data.year,
        revenue: Math.round(data.revenue),
        payouts: Math.round(data.payouts),
      }));
  };

  const revenueByMonth = buildMonthlyData(completedPayments);

  // Build period-filtered data
  const getPaymentsInRange = (start: Date, end: Date) =>
    completedPayments.filter(p => {
      const d = new Date(p.created_at);
      return d >= start && d <= end;
    });

  const { start: currentStart, end: currentEnd } = getDateRangeMs(dateRange, customStart, customEnd);
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const priorPeriodStart = new Date(currentStart.getTime() - durationMs);
  const priorPeriodEnd = new Date(currentStart.getTime() - 1);
  const priorYearStart = new Date(currentStart);
  priorYearStart.setFullYear(priorYearStart.getFullYear() - 1);
  const priorYearEnd = new Date(currentEnd);
  priorYearEnd.setFullYear(priorYearEnd.getFullYear() - 1);

  const currentPeriodPayments = getPaymentsInRange(currentStart, currentEnd);
  const priorPeriodPayments = getPaymentsInRange(priorPeriodStart, priorPeriodEnd);
  const priorYearPayments = getPaymentsInRange(priorYearStart, priorYearEnd);

  const buildSummary = (payments: PaymentRow[]) => ({
    revenue: payments.reduce((s, p) => s + Number(p.amount), 0),
    payouts: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    jobs: new Set(payments.map(p => p.job_id)).size,
    avgJob: payments.length > 0 ? Math.round(payments.reduce((s, p) => s + Number(p.amount), 0) / new Set(payments.map(p => p.job_id)).size) : 0,
  });

  const periodSummaries: Record<string, { current: ReturnType<typeof buildSummary>; priorPeriod: ReturnType<typeof buildSummary>; priorYear: ReturnType<typeof buildSummary> }> = {
    [dateRange]: {
      current: buildSummary(currentPeriodPayments),
      priorPeriod: buildSummary(priorPeriodPayments),
      priorYear: buildSummary(priorYearPayments),
    },
  };

  const revenueByMonthPriorPeriod = buildMonthlyData(priorPeriodPayments);
  const revenueByMonthPriorYear = buildMonthlyData(priorYearPayments);

  // Payout history = completed payments
  const payoutHistory = (showAllTransactions ? completedPayments : completedPayments.slice(0, 10)).map(p => {
    const isManual = p.confirmation_id?.startsWith('MANUAL-');
    return {
      id: p.id.substring(0, 8).toUpperCase(),
      date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: Number(p.amount),
      method: isManual ? 'Manual Entry' : 'Direct Deposit',
      jobTitle: isManual ? (p.description || 'Manual Revenue') : (p.job_id ? (jobMap[p.job_id]?.title || 'Unknown Job') : (p.description || 'Revenue')),
      homeowner: isManual ? '' : (p.job_id ? (jobMap[p.job_id]?.homeowner || 'Unknown') : ''),
      status: 'completed' as const,
      processingTime: isManual ? 'Recorded manually' : '2 business days',
      confirmationId: p.confirmation_id || p.id.substring(0, 12).toUpperCase(),
      isManual,
    };
  });

  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const compareDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
      if (compareDropdownRef.current && !compareDropdownRef.current.contains(e.target as Node)) {
        setShowCompareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentChartData = useMemo(() => {
    if (dateRange === 'last-30' || dateRange === 'ytd') return revenueByMonth.slice(-1);
    if (dateRange === 'last-90') return revenueByMonth.slice(-3);
    return revenueByMonth;
  }, [dateRange]);

  const comparisonChartData = useMemo(() => {
    if (compareMode === 'none') return null;
    const source = compareMode === 'prior-year' ? revenueByMonthPriorYear : revenueByMonthPriorPeriod;
    if (dateRange === 'last-30' || dateRange === 'ytd') return source.slice(-1);
    if (dateRange === 'last-90') return source.slice(-3);
    return source;
  }, [dateRange, compareMode]);

  const summaryKey = dateRange === 'custom' ? 'last-6m' : dateRange;
  const currentSummary =
    periodSummaries[summaryKey as keyof typeof periodSummaries]?.current ??
    periodSummaries['last-6m'].current;
  const comparisonSummary =
    compareMode === 'prior-year'
      ? periodSummaries[summaryKey as keyof typeof periodSummaries]?.priorYear
      : compareMode === 'prior-period'
      ? periodSummaries[summaryKey as keyof typeof periodSummaries]?.priorPeriod
      : null;

  const revenueChange = comparisonSummary
    ? calcChange(currentSummary.revenue, comparisonSummary.revenue)
    : null;
  const jobsChange = comparisonSummary
    ? calcChange(currentSummary.jobs, comparisonSummary.jobs)
    : null;
  const avgJobChange = comparisonSummary
    ? calcChange(currentSummary.avgJob, comparisonSummary.avgJob)
    : null;

  const allBars = [
    ...currentChartData.map((m) => m.revenue),
    ...(comparisonChartData?.map((m) => m.revenue) ?? []),
  ];
  const maxRevenue = Math.max(...allBars, 1);

  const handleCopyId = (id: string) => {
    // Clipboard API may fail (e.g., insecure context). Wrap in try/catch.
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const handleDateRangeSelect = (range: DateRange) => {
    if (range === 'custom') {
      setShowCustomPicker(true);
      setShowDateDropdown(false);
      return;
    }
    setDateRange(range);
    setShowDateDropdown(false);
    setShowCustomPicker(false);
  };

  const handleApplyCustom = () => {
    setDateRange('custom');
    setShowCustomPicker(false);
  };

  const ComparisonBadge = ({
    change,
  }: {
    change: { value: number; isPositive: boolean } | null;
  }) => {
    if (!change || compareMode === 'none') return null;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
          change.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}
      >
        <i className={`ri-arrow-${change.isPositive ? 'up' : 'down'}-s-fill text-xs`}></i>
        {change.value}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-2xl font-bold text-[#0B1F33]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Earnings &amp; Payouts
          </h2>
          <p
            className="text-sm text-[#6B7C8F] mt-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Track revenue and completed payouts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowCompareDropdown(false);
              }}
              className="px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2 bg-white"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-calendar-line text-[#6B7C8F]"></i>
              {dateRange === 'custom' ? `${customStart} — ${customEnd}` : dateRangeLabels[dateRange]}
              <i
                className={`ri-arrow-${showDateDropdown ? 'up' : 'down'}-s-line text-[#6B7C8F] text-xs`}
              ></i>
            </button>
            {showDateDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleDateRangeSelect(range)}
                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      dateRange === range
                        ? 'bg-[#00B8A9]/5 text-[#00B8A9] font-semibold'
                        : 'text-[#0B1F33] hover:bg-[#F9F9FB]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {dateRangeLabels[range]}
                    {dateRange === range && <i className="ri-check-line text-[#00B8A9]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compare Dropdown */}
          <div className="relative" ref={compareDropdownRef}>
            <button
              onClick={() => {
                setShowCompareDropdown(!showCompareDropdown);
                setShowDateDropdown(false);
              }}
              className={`px-3.5 py-2 border rounded-lg transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                compareMode !== 'none'
                  ? 'border-[#00B8A9]/30 bg-[#00B8A9]/5 text-[#00B8A9]'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-[#6B7C8F]'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-arrow-left-right-line"></i>
              {compareMode === 'none' ? 'Compare' : compareModeLabels[compareMode]}
              <i className={`ri-arrow-${showCompareDropdown ? 'up' : 'down'}-s-line text-xs`}></i>
            </button>
            {showCompareDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1.5">
                {(Object.keys(compareModeLabels) as CompareMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setCompareMode(mode);
                      setShowCompareDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      compareMode === mode
                        ? 'bg-[#00B8A9]/5 text-[#00B8A9] font-semibold'
                        : 'text-[#0B1F33] hover:bg-[#F9F9FB]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {compareModeLabels[mode]}
                    {compareMode === mode && <i className="ri-check-line text-[#00B8A9]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tax Statement */}
          <button
            onClick={() => setShowStatementModal(true)}
            className="px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2 bg-white"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-file-text-line text-[#00B8A9]"></i>
            Tax Statement
          </button>

          {/* Export */}
          <button
            onClick={() => {
              const rows = payoutHistory.map(p => ({
                Date: p.date,
                Job: p.jobTitle,
                Homeowner: p.homeowner,
                Amount: p.amount,
                Status: p.status,
                ConfirmationID: p.confirmationId,
                PaymentMethod: p.method,
              }));
              const header = Object.keys(rows[0] || {}).join(',');
              const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `earnings-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-download-line"></i>
            Export
          </button>
          <button
            onClick={() => setShowLogRevenueModal(true)}
            className="px-3.5 py-2 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a3a52] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-add-line"></i>
            Log Revenue
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-end gap-4 flex-wrap">
          <div>
            <label
              className="block text-xs font-semibold text-[#6B7C8F] mb-1.5"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-[#6B7C8F] mb-1.5"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              End Date
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-[#0B1F33]/90 transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Apply Range
          </button>
          <button
            onClick={() => setShowCustomPicker(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors text-[#6B7C8F]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comparison Active Banner */}
      {compareMode !== 'none' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00B8A9]/5 border border-[#00B8A9]/15 rounded-lg">
          <i className="ri-arrow-left-right-line text-[#00B8A9] text-sm"></i>
          <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Comparing{' '}
            <strong>{dateRange === 'custom' ? 'Custom Range' : dateRangeLabels[dateRange]}</strong>{' '}
            vs. <strong>{compareModeLabels[compareMode]}</strong>
            {compareMode === 'prior-period' && (
              <span className="text-[#6B7C8F]"> — the equivalent preceding time window</span>
            )}
            {compareMode === 'prior-year' && (
              <span className="text-[#6B7C8F]"> — same period one year ago</span>
            )}
          </p>
          <button
            onClick={() => setCompareMode('none')}
            className="ml-auto text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-xl text-[#00B8A9]"></i>
            </div>
            <div className="flex items-center gap-2">
              {revenueChange ? (
                <ComparisonBadge change={revenueChange} />
              ) : (
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  +{earningsSummary.monthlyGrowth}%
                </span>
              )}
              <button
                onClick={() => setShowLogRevenueModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00B8A9]/10 hover:bg-[#00B8A9]/20 text-[#00B8A9] transition-colors cursor-pointer"
                title="Log Revenue"
              >
                <i className="ri-add-line text-sm font-bold"></i>
              </button>
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0B1F33] mb-0.5"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ${currentSummary.revenue.toLocaleString()}
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Total Revenue
          </p>
          {comparisonSummary && (
            <p
              className="text-[10px] text-[#6B7C8F] mt-1.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              vs. ${comparisonSummary.revenue.toLocaleString()}{' '}
              {compareModeLabels[compareMode].toLowerCase()}
            </p>
          )}
        </div>

        {/* Jobs Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-briefcase-line text-xl text-green-600"></i>
            </div>
            {jobsChange && <ComparisonBadge change={jobsChange} />}
          </div>
          <p
            className="text-2xl font-bold text-[#0B1F33] mb-0.5"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {currentSummary.jobs}
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Completed Jobs
          </p>
          {comparisonSummary && (
            <p
              className="text-[10px] text-[#6B7C8F] mt-1.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              vs. {comparisonSummary.jobs}{' '}
              {compareModeLabels[compareMode].toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div>
        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h3
              className="text-lg font-bold text-[#0B1F33]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Monthly Revenue
            </h3>
            <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#00B8A9]"></span>
                Revenue
              </span>
              {compareMode !== 'none' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#00B8A9]/25 border border-[#00B8A9]/40"></span>
                  {compareModeLabels[compareMode]}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {currentChartData.map((m, idx) => {
              const compMonth = comparisonChartData?.[idx];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '160px' }}>
                    {/* Comparison bars (behind) */}
                    {compMonth && (
                      <div
                        className="flex-1 max-w-4 bg-[#00B8A9]/20 rounded-t-md transition-all cursor-pointer relative group border border-[#00B8A9]/30"
                        style={{ height: `${(compMonth.revenue / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0B1F33] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          ${compMonth.revenue.toLocaleString()} ({compMonth.month})
                        </div>
                      </div>
                    )}
                    {/* Current Revenue */}
                    <div
                      className="flex-1 max-w-5 bg-[#00B8A9] rounded-t-md transition-all hover:bg-[#00a89a] cursor-pointer relative group"
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0B1F33] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ${m.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                This period
              </span>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ${currentSummary.revenue.toLocaleString()}
                </p>
                {revenueChange && compareMode !== 'none' && (
                  <ComparisonBadge change={revenueChange} />
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Avg. job value
              </span>
              <div className="flex items-center gap-2 justify-end">
                <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ${currentSummary.avgJob.toLocaleString()}
                </p>
                {avgJobChange && compareMode !== 'none' && (
                  <ComparisonBadge change={avgJobChange} />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-lg font-bold text-[#0B1F33]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Revenue History
          </h3>
          <div className="flex items-center gap-2">
            {(['all', 'completed', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPayoutFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  payoutFilter === f
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-[#F9F9FB] rounded-lg mb-2">
          <span className="col-span-2 text-[11px] font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Date
          </span>
          <span className="col-span-3 text-[11px] font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Job
          </span>
          <span className="col-span-2 text-[11px] font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Homeowner
          </span>
          <span className="col-span-2 text-[11px] font-semibold text-[#6B7C8F] uppercase tracking-wider text-right" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Amount
          </span>
          <span className="col-span-2 text-[11px] font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Status
          </span>
          <span className="col-span-1"></span>
        </div>

        {/* Revenue Rows */}
        <div className="space-y-1">
          {payoutHistory
            .filter(() => payoutFilter === 'all' || payoutFilter === 'completed')
            .map((payout) => (
              <div key={payout.id}>
                <div
                  onClick={() => setExpandedPayout(expandedPayout === payout.id ? null : payout.id)}
                  className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-[#F9F9FB] transition-colors cursor-pointer items-center"
                >
                  <span className="col-span-2 text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {payout.date}
                  </span>
                  <span className="col-span-3 text-sm font-medium text-[#0B1F33] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {payout.jobTitle}
                  </span>
                  <span className="col-span-2 text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {payout.homeowner || (payout.isManual ? <span className="text-xs text-[#D4B483] font-medium">Manual</span> : '—')}
                  </span>
                  <span className="col-span-2 text-sm font-bold text-[#0B1F33] text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ${payout.amount.toLocaleString()}
                  </span>
                  <span className="col-span-2">
                    <span className="text-[11px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </span>
                  <span className="col-span-1 flex justify-end">
                    <i className={`ri-arrow-${expandedPayout === payout.id ? 'up' : 'down'}-s-line text-[#6B7C8F]`}></i>
                  </span>
                </div>

                {/* Expanded Details */}
                {expandedPayout === payout.id && (
                  <div className="mx-4 mb-2 p-4 bg-[#F9F9FB] rounded-lg border border-gray-100">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-[11px] text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Confirmation ID
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#0B1F33] font-mono">{payout.confirmationId}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId(payout.confirmationId);
                            }}
                            className="text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
                          >
                            <i
                              className={`${
                                copiedId === payout.confirmationId ? 'ri-check-line text-green-600' : 'ri-file-copy-line'
                              } text-sm`}
                            ></i>
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Payment Method
                        </p>
                        <p className="text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {payout.method}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Source
                        </p>
                        <p className="text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {payout.processingTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="px-3 py-1.5 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-[#0B1F33]/90 transition-colors flex items-center gap-1.5"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-download-line text-sm"></i>
                        Download Receipt
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(payout.confirmationId);
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-[#6B7C8F]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-file-copy-line text-sm"></i>
                        {copiedId === payout.confirmationId ? 'Copied!' : 'Copy ID'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {payoutHistory.length} transactions
          </p>
          <button
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            className="text-xs font-semibold text-[#00B8A9] hover:underline cursor-pointer"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {showAllTransactions ? 'Show Less' : `View All ${completedPayments.length} Transactions →`}
          </button>
        </div>
      </div>

      {/* Earnings Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-[#00B8A9] text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Download Earnings Statement</h3>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Tax-ready PDF with income summary, payouts &amp; fees</p>
              </div>
              <button onClick={() => setShowStatementModal(false)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/15 rounded-lg p-3 flex items-start gap-2.5">
                <i className="ri-information-line text-[#00B8A9] mt-0.5"></i>
                <p className="text-xs text-[#0B1F33] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  This generates a comprehensive earnings statement for <strong>{dateRange === 'custom' ? `${customStart} — ${customEnd}` : dateRangeLabels[dateRange]}</strong> including gross revenue, platform fees, and net payouts — formatted for tax reporting.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Full Name</label>
                  <input type="text" value={statementForm.contractorName} onChange={e => setStatementForm(prev => ({ ...prev, contractorName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email</label>
                  <input type="email" value={statementForm.contractorEmail} onChange={e => setStatementForm(prev => ({ ...prev, contractorEmail: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Phone</label>
                  <input type="tel" value={statementForm.contractorPhone} onChange={e => setStatementForm(prev => ({ ...prev, contractorPhone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>License #</label>
                  <input type="text" value={statementForm.contractorLicense} onChange={e => setStatementForm(prev => ({ ...prev, contractorLicense: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Business Address</label>
                <input type="text" value={statementForm.contractorAddress} onChange={e => setStatementForm(prev => ({ ...prev, contractorAddress: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>EIN / Tax ID <span className="text-[#6B7C8F] font-normal">(optional)</span></label>
                <input type="text" value={statementForm.ein} onChange={e => setStatementForm(prev => ({ ...prev, ein: e.target.value }))} placeholder="XX-XXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none placeholder:text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              {/* What's included */}
              <div className="bg-[#F9F9FB] rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Statement includes</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Income Summary', 'Monthly Breakdown', 'Platform Fees', 'Payout Log', 'Escrow Holds', 'Tax Notes'].map(item => (
                    <span key={item} className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] text-[#0B1F33] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <i className="ri-check-line text-[#00B8A9] mr-1"></i>{item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-[#F9F9FB] rounded-b-xl">
              <button onClick={() => setShowStatementModal(false)} className="px-5 py-2.5 text-[#6B7C8F] font-semibold text-sm cursor-pointer whitespace-nowrap hover:text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
              <button
                onClick={() => {
                  generateEarningsStatementPDF({
                    dateRange,
                    dateRangeLabel: dateRange === 'custom' ? `${customStart} — ${customEnd}` : dateRangeLabels[dateRange],
                    contractorName: statementForm.contractorName,
                    contractorEmail: statementForm.contractorEmail,
                    contractorPhone: statementForm.contractorPhone,
                    contractorAddress: statementForm.contractorAddress,
                    contractorLicense: statementForm.contractorLicense || undefined,
                    ein: statementForm.ein || undefined,
                  });
                  setShowStatementModal(false);
                }}
                disabled={!statementForm.contractorName.trim()}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${statementForm.contractorName.trim() ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-download-2-line"></i>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Revenue Modal */}
      {showLogRevenueModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
                <i className="ri-add-circle-line text-[#00B8A9] text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Log Revenue</h3>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Record an off-platform payment</p>
              </div>
              <button onClick={() => setShowLogRevenueModal(false)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={logRevenueForm.amount}
                  onChange={e => setLogRevenueForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</label>
                <input
                  type="text"
                  value={logRevenueForm.description}
                  onChange={e => setLogRevenueForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Deck repair payment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Date</label>
                  <input
                    type="date"
                    value={logRevenueForm.date}
                    onChange={e => setLogRevenueForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Source</label>
                  <select
                    value={logRevenueForm.source}
                    onChange={e => setLogRevenueForm(prev => ({ ...prev, source: e.target.value as typeof prev.source }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] outline-none bg-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {['Cash', 'Check', 'Venmo', 'Zelle', 'Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-[#F9F9FB] rounded-b-xl">
              <button onClick={() => setShowLogRevenueModal(false)} className="px-5 py-2.5 text-[#6B7C8F] font-semibold text-sm cursor-pointer whitespace-nowrap hover:text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
              <button
                onClick={async () => {
                  const amt = Number(logRevenueForm.amount);
                  if (!amt || amt <= 0 || !logRevenueForm.description.trim()) return;
                  const { error } = await supabase.from('payments').insert({
                    payer_id: user!.id,
                    payee_id: user!.id,
                    amount: amt,
                    description: `${logRevenueForm.description.trim()} (${logRevenueForm.source})`,
                    payment_type: 'full',
                    payment_method: 'other',
                    status: 'completed',
                    confirmation_id: `MANUAL-${Date.now()}`,
                    created_at: new Date(logRevenueForm.date).toISOString(),
                  });
                  if (error) {
                    console.error('Failed to log revenue:', error);
                    return;
                  }
                  await fetchPayments();
                  setLogRevenueForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0], source: 'Cash' });
                  setShowLogRevenueModal(false);
                }}
                disabled={!Number(logRevenueForm.amount) || Number(logRevenueForm.amount) <= 0 || !logRevenueForm.description.trim()}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${Number(logRevenueForm.amount) > 0 && logRevenueForm.description.trim() ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-check-line"></i>
                Log Revenue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

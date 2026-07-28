import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface UtilityBill {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  utility_type: string | null;
  provider: string | null;
  account_number: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  usage_amount: number | null;
  usage_unit: string | null;
  total_cost: number | null;
  previous_usage: number | null;
  previous_cost: number | null;
  rate_per_unit: number | null;
  taxes_and_fees: number | null;
  due_date: string | null;
  ai_summary: string | null;
  ai_tips: string | null;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error_message: string | null;
  created_at: string;
}

interface UtilityReading {
  id: string;
  utility_type: string;
  provider: string | null;
  billing_period: string;
  usage_amount: number;
  usage_unit: string;
  total_cost: number;
  notes: string | null;
  created_at: string;
}

// Unified record for display — either from a bill or manual reading
interface UsageRecord {
  id: string;
  source: 'bill' | 'manual';
  utility_type: string;
  provider: string | null;
  period: string;          // YYYY-MM
  usage_amount: number;
  usage_unit: string;
  total_cost: number;
  created_at: string;
  periodStart?: string;    // YYYY-MM-DD — bills only, for month spreading
  periodEnd?: string;      // YYYY-MM-DD — bills only, for month spreading
}

const UTILITY_ICONS: Record<string, string> = {
  electric: 'ri-flashlight-line',
  gas: 'ri-fire-line',
  water: 'ri-drop-line',
  sewer: 'ri-water-flash-line',
  trash: 'ri-delete-bin-line',
  internet: 'ri-wifi-line',
  other: 'ri-file-list-3-line',
};

const UTILITY_COLORS: Record<string, string> = {
  electric: 'bg-yellow-500',
  gas: 'bg-orange-500',
  water: 'bg-teal-500',
  sewer: 'bg-cyan-600',
  trash: 'bg-gray-500',
  internet: 'bg-indigo-500',
  other: 'bg-slate-500',
};

const UTILITY_UNITS: Record<string, string> = {
  electric: 'kWh',
  gas: 'therms',
  water: 'gallons',
  sewer: 'gallons',
  trash: 'pickups',
  internet: 'GB',
  other: 'units',
};

function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function periodFromDate(dateStr: string): string {
  return dateStr.slice(0, 7);
}

// Spread a billing period across the calendar months it touches, weighting each
// month by the number of days the period covers in it. Returns [{ period, weight }]
// where weights sum to 1. A bi-monthly bill thus contributes to every month it
// spans rather than landing entirely in its start month. Falls back to a single
// month if the dates are missing/invalid. Dates are parsed component-wise (local)
// to avoid UTC timezone drift shifting a day into the wrong month.
function spreadAcrossMonths(startStr: string, endStr: string): { period: string; weight: number }[] {
  const fallback = [{ period: startStr.slice(0, 7), weight: 1 }];
  const [sy, sm, sd] = startStr.slice(0, 10).split('-').map(Number);
  const [ey, em, ed] = endStr.slice(0, 10).split('-').map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return fallback;

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return fallback;

  const dayCounts: Record<string, number> = {};
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    dayCounts[key] = (dayCounts[key] || 0) + 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDays = Object.values(dayCounts).reduce((a, b) => a + b, 0);
  if (totalDays === 0) return fallback;
  return Object.entries(dayCounts).map(([period, days]) => ({ period, weight: days / totalDays }));
}

export default function UtilityInsights() {
  const { user, session } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBillDetail, setShowBillDetail] = useState<UtilityBill | null>(null);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    utility: 'electric' as string,
    periodMonth: new Date().toISOString().slice(0, 7),
    usage: '',
    cost: '',
    notes: '',
  });
  const [manualFormErrors, setManualFormErrors] = useState<Record<string, string>>({});
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // ---- Data Loading ----
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [billsRes, readingsRes] = await Promise.all([
      supabase
        .from('utility_bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('utility_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (billsRes.data) setBills(billsRes.data);
    if (readingsRes.data) setReadings(readingsRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll for processing bills
  useEffect(() => {
    const processingBills = bills.filter(b => b.status === 'processing' || b.status === 'pending');
    if (processingBills.length === 0) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('utility_bills')
        .select('*')
        .in('id', processingBills.map(b => b.id));

      if (data) {
        setBills(prev => {
          const updated = [...prev];
          for (const fresh of data) {
            const idx = updated.findIndex(b => b.id === fresh.id);
            if (idx >= 0) updated[idx] = fresh;
          }
          return updated;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bills]);

  // ---- Build unified usage records ----
  const usageRecords: UsageRecord[] = [
    ...bills
      .filter(b => b.status === 'complete' && b.utility_type && b.usage_amount != null && b.total_cost != null)
      .map(b => ({
        id: b.id,
        source: 'bill' as const,
        utility_type: b.utility_type!,
        provider: b.provider,
        period: b.billing_period_start ? periodFromDate(b.billing_period_start) : periodFromDate(b.created_at),
        usage_amount: b.usage_amount!,
        usage_unit: b.usage_unit || UTILITY_UNITS[b.utility_type!] || 'units',
        total_cost: b.total_cost!,
        created_at: b.created_at,
        periodStart: b.billing_period_start || undefined,
        periodEnd: b.billing_period_end || undefined,
      })),
    ...readings.map(r => ({
      id: r.id,
      source: 'manual' as const,
      utility_type: r.utility_type,
      provider: r.provider,
      period: r.billing_period,
      usage_amount: r.usage_amount,
      usage_unit: r.usage_unit,
      total_cost: r.total_cost,
      created_at: r.created_at,
    })),
  ].sort((a, b) => b.period.localeCompare(a.period));

  // Expand each record into per-month allocations, prorating usage and cost
  // across every calendar month its billing period spans. Manual readings (and
  // bills missing a full period) stay as a single month. usageRecords itself is
  // kept one-per-source for record counts and the active-type list; only the
  // period-based aggregates and trend chart use these spread allocations.
  const monthlyAllocations: UsageRecord[] = usageRecords.flatMap(r => {
    if (!r.periodStart || !r.periodEnd) return [r];
    const slices = spreadAcrossMonths(r.periodStart, r.periodEnd);
    if (slices.length <= 1) return [{ ...r, period: slices[0].period }];
    return slices.map(s => ({
      ...r,
      period: s.period,
      usage_amount: r.usage_amount * s.weight,
      total_cost: r.total_cost * s.weight,
    }));
  });

  // ---- Compute period-based aggregates ----
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  function getMonthsBack(n: number): string {
    const d = new Date(now.getFullYear(), now.getMonth() - n, 1);
    return d.toISOString().slice(0, 7);
  }

  function filterByPeriodRange(records: UsageRecord[], monthsBack: number): UsageRecord[] {
    const cutoff = getMonthsBack(monthsBack);
    return records.filter(r => r.period >= cutoff && r.period <= currentMonth);
  }

  const periodMonths = selectedPeriod === 'month' ? 1 : selectedPeriod === 'quarter' ? 3 : 12;
  const currentRecords = filterByPeriodRange(monthlyAllocations, periodMonths);
  const previousRecords = filterByPeriodRange(monthlyAllocations, periodMonths * 2).filter(
    r => !currentRecords.find(cr => cr.id === r.id && cr.period === r.period)
  );

  function aggregateByType(records: UsageRecord[]) {
    const grouped: Record<string, { usage: number; cost: number; unit: string; count: number }> = {};
    for (const r of records) {
      const key = r.utility_type;
      if (!grouped[key]) grouped[key] = { usage: 0, cost: 0, unit: r.usage_unit, count: 0 };
      grouped[key].usage += r.usage_amount;
      grouped[key].cost += r.total_cost;
      grouped[key].count += 1;
    }
    return grouped;
  }

  const currentAgg = aggregateByType(currentRecords);
  const previousAgg = aggregateByType(previousRecords);
  const activeUtilityTypes = [...new Set(usageRecords.map(r => r.utility_type))];

  function getTrend(type: string): number {
    const curr = currentAgg[type]?.usage || 0;
    const prev = previousAgg[type]?.usage || 0;
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  }

  const totalCurrentCost = Object.values(currentAgg).reduce((sum, v) => sum + v.cost, 0);
  const totalPreviousCost = Object.values(previousAgg).reduce((sum, v) => sum + v.cost, 0);
  const totalTrend = totalPreviousCost > 0 ? ((totalCurrentCost - totalPreviousCost) / totalPreviousCost) * 100 : 0;

  // Build trend data for chart: last N periods
  const trendMonths = selectedPeriod === 'month' ? 6 : selectedPeriod === 'quarter' ? 4 : 4;
  const trendData: { label: string; [key: string]: string | number }[] = [];
  for (let i = trendMonths - 1; i >= 0; i--) {
    const period = getMonthsBack(i);
    const monthRecords = monthlyAllocations.filter(r => r.period === period);
    const entry: { label: string; [key: string]: string | number } = { label: formatPeriod(period) };
    for (const type of activeUtilityTypes) {
      const typeRecords = monthRecords.filter(r => r.utility_type === type);
      entry[type] = typeRecords.reduce((sum, r) => sum + r.usage_amount, 0);
    }
    trendData.push(entry);
  }

  // ---- File Upload Handlers ----
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const processFiles = async (files: File[]) => {
    if (!user || !session) return;

    const validFiles = files.filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      const fileName = file.name;
      setUploadingFiles(prev => [...prev, fileName]);

      try {
        // 1. Upload file to Supabase storage
        const storagePath = `${user.id}/${Date.now()}-${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('utility-bills')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // 2. Create DB record
        const { data: billRecord, error: insertError } = await supabase
          .from('utility_bills')
          .insert({
            user_id: user.id,
            file_name: fileName,
            file_path: storagePath,
            file_type: file.type,
            status: 'pending',
          })
          .select()
          .single();

        if (insertError || !billRecord) throw insertError;

        setBills(prev => [billRecord, ...prev]);

        // 3. Send to AI analysis — API downloads the file from storage server-side
        try {
          await fetch('/api/analyze-utility-bill', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ bill_id: billRecord.id }),
          });
          // Poll will pick up the result
        } catch {
          // Error handled by API — poll will show error status
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploadingFiles(prev => prev.filter(n => n !== fileName));
      }
    }
  };

  const removeBill = async (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;

    // Remove from storage
    await supabase.storage.from('utility-bills').remove([bill.file_path]);
    // Remove DB record
    await supabase.from('utility_bills').delete().eq('id', id);
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const removeReading = async (id: string) => {
    await supabase.from('utility_readings').delete().eq('id', id);
    setReadings(prev => prev.filter(r => r.id !== id));
  };

  // ---- Manual Entry ----
  const validateManualForm = () => {
    const errors: Record<string, string> = {};
    if (!manualForm.usage || parseFloat(manualForm.usage) <= 0) errors.usage = 'Please enter a valid usage amount';
    if (!manualForm.cost || parseFloat(manualForm.cost) < 0) errors.cost = 'Please enter a valid cost';
    if (!manualForm.periodMonth) errors.periodMonth = 'Please select a billing period';
    setManualFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleManualSubmit = async () => {
    if (!user || !validateManualForm()) return;

    const { data, error } = await supabase
      .from('utility_readings')
      .insert({
        user_id: user.id,
        utility_type: manualForm.utility,
        billing_period: manualForm.periodMonth,
        usage_amount: parseFloat(manualForm.usage),
        usage_unit: UTILITY_UNITS[manualForm.utility] || 'units',
        total_cost: parseFloat(manualForm.cost),
        notes: manualForm.notes || null,
      })
      .select()
      .single();

    if (error) {
      setManualFormErrors({ submit: 'Failed to save reading. Please try again.' });
      return;
    }

    setReadings(prev => [data, ...prev]);
    setManualSaveSuccess(true);

    setTimeout(() => {
      setManualSaveSuccess(false);
      setManualForm({
        utility: 'electric',
        periodMonth: new Date().toISOString().slice(0, 7),
        usage: '',
        cost: '',
        notes: '',
      });
    }, 1500);
  };

  // ---- Period labels ----
  const periodLabels = {
    month: { label: 'Monthly', periodLabel: 'this month', vsLabel: 'vs last month' },
    quarter: { label: 'Quarterly', periodLabel: 'this quarter', vsLabel: 'vs last quarter' },
    year: { label: 'Yearly', periodLabel: 'this year', vsLabel: 'vs last year' },
  };
  const currentLabels = periodLabels[selectedPeriod];

  // ---- Savings recommendations (static — could be AI-driven later) ----
  const recommendations = [
    { title: 'Install Smart Thermostat', savings: '$180/year', difficulty: 'Easy', payback: '8 months', icon: 'ri-temp-cold-line' },
    { title: 'LED Bulb Replacement', savings: '$75/year', difficulty: 'Easy', payback: '4 months', icon: 'ri-lightbulb-flash-line' },
    { title: 'Water Heater Insulation', savings: '$95/year', difficulty: 'Medium', payback: '6 months', icon: 'ri-fire-line' },
    { title: 'Low-Flow Fixtures', savings: '$120/year', difficulty: 'Easy', payback: '10 months', icon: 'ri-drop-line' },
  ];

  // ---- Personalized insights rolled up per utility type from the user's
  // bills. Deduped per type so the same tip isn't repeated for every bill
  // (capped at 3 distinct tips per type). ----
  const insightsByType = (() => {
    const map = new Map<string, Set<string>>();
    for (const b of bills) {
      if (b.status !== 'complete' || !b.utility_type || !b.ai_tips) continue;
      const tip = b.ai_tips.trim();
      if (!tip) continue;
      if (!map.has(b.utility_type)) map.set(b.utility_type, new Set());
      map.get(b.utility_type)!.add(tip);
    }
    return Array.from(map.entries()).map(([type, tips]) => ({
      type,
      tips: Array.from(tips).slice(0, 3),
    }));
  })();

  const hasData = usageRecords.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-[#0B1F33] mb-3 block"></i>
          <p className="text-[#6B7C8F]">Loading utility data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-1">Utility Insights</h2>
            <p className="text-sm text-[#6B7C8F]">Track consumption, costs, and find savings opportunities</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap lg:justify-end">
            <button
              onClick={() => setShowManualEntry(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-[#162d45] transition-colors"
            >
              <i className="ri-edit-line text-lg"></i>
              Manual Entry
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-teal-700 transition-colors"
            >
              <i className="ri-upload-cloud-line text-lg"></i>
              Upload Bills
            </button>
            <div className="flex bg-[#F4F4F6] rounded-lg p-1 w-full sm:w-auto">
              {(['month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap transition-all ${
                    selectedPeriod === period
                      ? 'bg-[#0B1F33] text-white shadow-sm'
                      : 'text-[#6B7C8F] hover:text-[#0B1F33]'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Total Summary */}
        {hasData ? (
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-lg p-6 text-white">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-white/70 mb-1">Total {currentLabels.label} Cost</p>
                <p className="text-3xl font-bold mb-1 text-white">${totalCurrentCost.toFixed(2)}</p>
                <div className="flex items-center gap-2">
                  {totalPreviousCost > 0 && (
                    <>
                      <span className={`flex items-center gap-1 text-sm ${totalTrend < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <i className={totalTrend < 0 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}></i>
                        {Math.abs(totalTrend).toFixed(1)}%
                      </span>
                      <span className="text-xs text-white/70">{currentLabels.vsLabel}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Utility Types Tracked</p>
                <p className="text-3xl font-bold mb-1 text-white">{activeUtilityTypes.length}</p>
                <p className="text-sm text-white/80">{activeUtilityTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Total Records</p>
                <p className="text-3xl font-bold mb-1 text-white">{usageRecords.length}</p>
                <p className="text-sm text-white/80">{bills.filter(b => b.status === 'complete').length} bills, {readings.length} manual</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-lg p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-upload-cloud-2-line text-3xl text-[#D4B483]"></i>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Get Started with Utility Insights</h3>
            <p className="text-white/70 mb-4 max-w-md mx-auto">
              Upload a photo of your utility bill or enter readings manually. Our AI will extract the data and start tracking your usage patterns.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <i className="ri-upload-cloud-line mr-2"></i>Upload a Bill
              </button>
              <button
                onClick={() => setShowManualEntry(true)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <i className="ri-edit-line mr-2"></i>Enter Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Utility Cards */}
      {activeUtilityTypes.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {activeUtilityTypes.slice(0, 6).map((type) => {
            const curr = currentAgg[type];
            const trend = getTrend(type);
            if (!curr) return null;
            return (
              <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${UTILITY_COLORS[type] || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                    <i className={`${UTILITY_ICONS[type] || 'ri-file-line'} text-white text-xl`}></i>
                  </div>
                  {previousAgg[type] && (
                    <span className={`flex items-center gap-1 text-sm font-semibold ${trend < 0 ? 'text-green-600' : trend > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {trend !== 0 && <i className={trend < 0 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}></i>}
                      {Math.abs(trend).toFixed(1)}%
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#0B1F33] capitalize mb-1">{type}</h3>
                <p className="text-3xl font-bold text-[#0B1F33] mb-1">{curr.usage.toLocaleString()}</p>
                <p className="text-sm text-[#6B7C8F] mb-3">{curr.unit} {currentLabels.periodLabel}</p>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7C8F]">Cost</span>
                    <span className="font-bold text-[#0B1F33]">${curr.cost.toFixed(2)}</span>
                  </div>
                  {previousAgg[type] && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-[#6B7C8F]">Previous period</span>
                      <span className="text-[#6B7C8F]">{previousAgg[type].usage.toLocaleString()} {curr.unit}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage Trends */}
      {trendData.length > 0 && trendData.some(d => activeUtilityTypes.some(t => (d[t] as number) > 0)) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#0B1F33]">Usage Trends</h3>
            <span className="text-sm text-[#6B7C8F] font-medium">{currentLabels.label} View</span>
          </div>
          <div className="space-y-4">
            {trendData.map((row, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-16 text-sm font-semibold text-[#6B7C8F]">{row.label}</span>
                <div className="flex-1 flex gap-2">
                  {activeUtilityTypes.map(type => (
                    <div key={type} className="flex-1 bg-[#F9F9FB] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#6B7C8F] capitalize">{type}</span>
                        <span className="text-sm font-bold text-[#0B1F33]">
                          {((row[type] as number) || 0).toLocaleString()} {UTILITY_UNITS[type] || 'units'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Bills & Manual Readings */}
      {(bills.length > 0 || readings.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-file-list-3-line text-[#0B1F33] text-xl"></i>
              <h3 className="text-xl font-bold text-[#0B1F33]">Uploaded Bills & Readings</h3>
              <span className="ml-2 px-2 py-0.5 bg-[#F4F4F6] rounded-full text-xs font-semibold text-[#6B7C8F]">
                {bills.length + readings.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowManualEntry(true)} className="text-sm text-[#0B1F33] font-semibold hover:text-[#D4B483] cursor-pointer whitespace-nowrap">
                <i className="ri-edit-line"></i> Add Reading
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setShowUploadModal(true)} className="text-sm text-teal-600 font-semibold hover:text-teal-700 cursor-pointer whitespace-nowrap">
                <i className="ri-add-line"></i> Upload Bill
              </button>
            </div>
          </div>

          {/* Manual Readings */}
          {readings.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2">Manual Readings</p>
              <div className="space-y-2">
                {readings.map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${UTILITY_COLORS[reading.utility_type] || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                        <i className={`${UTILITY_ICONS[reading.utility_type] || 'ri-file-line'} text-white text-lg`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]">
                          {reading.utility_type.charAt(0).toUpperCase() + reading.utility_type.slice(1)} — {reading.usage_amount.toLocaleString()} {reading.usage_unit}
                        </p>
                        <p className="text-xs text-[#6B7C8F]">
                          {formatPeriod(reading.billing_period)} &middot; ${reading.total_cost.toFixed(2)}
                          {reading.notes && <span> &middot; {reading.notes}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F33] bg-[#F4F4F6] px-2.5 py-1 rounded-full">
                        <i className="ri-edit-line"></i> Manual
                      </span>
                      <button
                        onClick={() => removeReading(reading.id)}
                        className="w-7 h-7 flex items-center justify-center text-[#6B7C8F] hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Bills */}
          {bills.length > 0 && (
            <div>
              {readings.length > 0 && (
                <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2">Uploaded Bills</p>
              )}
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className={`bg-[#F9F9FB] rounded-xl border border-gray-100 overflow-hidden ${bill.status === 'complete' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    onClick={() => bill.status === 'complete' ? setShowBillDetail(bill) : undefined}
                  >
                    {/* Bill Header Row */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 ${bill.utility_type ? (UTILITY_COLORS[bill.utility_type] || 'bg-gray-500') : 'bg-gray-200'} rounded-xl flex items-center justify-center`}>
                          {bill.utility_type ? (
                            <i className={`${UTILITY_ICONS[bill.utility_type] || 'ri-file-line'} text-white text-xl`}></i>
                          ) : (
                            <i className="ri-file-pdf-2-line text-gray-500 text-xl"></i>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0B1F33]">
                            {bill.provider || bill.file_name}
                          </p>
                          <p className="text-xs text-[#6B7C8F]">
                            {bill.utility_type
                              ? `${bill.utility_type.charAt(0).toUpperCase() + bill.utility_type.slice(1)}`
                              : 'Pending analysis'
                            }
                            {bill.billing_period_start && bill.billing_period_end && (
                              <span> &middot; {new Date(bill.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(bill.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {bill.status === 'complete' && bill.total_cost != null && (
                          <span className="text-lg font-bold text-[#0B1F33]">${Number(bill.total_cost).toFixed(2)}</span>
                        )}
                        {bill.status === 'pending' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            <i className="ri-time-line"></i> Pending
                          </span>
                        )}
                        {bill.status === 'processing' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            <i className="ri-loader-4-line animate-spin"></i> Analyzing
                          </span>
                        )}
                        {bill.status === 'error' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full" title={bill.error_message || ''}>
                            <i className="ri-error-warning-line"></i> Error
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBill(bill.id); }}
                          className="w-7 h-7 flex items-center justify-center text-[#6B7C8F] hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>

                    {/* Extracted Data Summary — only for complete bills */}
                    {bill.status === 'complete' && (
                      <div className="px-4 pb-4">
                        {/* Key metrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          {bill.usage_amount != null && (
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-0.5">Usage</p>
                              <p className="text-sm font-bold text-[#0B1F33]">{Number(bill.usage_amount).toLocaleString()} {bill.usage_unit}</p>
                            </div>
                          )}
                          {bill.due_date && (
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-0.5">Due Date</p>
                              <p className="text-sm font-bold text-[#0B1F33]">{new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          )}
                          {bill.account_number && (
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-0.5">Account</p>
                              <p className="text-sm font-bold text-[#0B1F33]">{bill.account_number}</p>
                            </div>
                          )}
                          {bill.previous_cost != null && (
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-0.5">Previous Bill</p>
                              <p className="text-sm font-bold text-[#0B1F33]">${Number(bill.previous_cost).toFixed(2)}</p>
                            </div>
                          )}
                        </div>

                        {/* AI Summary */}
                        {bill.ai_summary && (
                          <div className="bg-white rounded-lg p-3 border border-gray-100 mb-2">
                            <div className="flex items-start gap-2">
                              <i className="ri-sparkling-line text-[#D4B483] mt-0.5"></i>
                              <p className="text-sm text-[#0B1F33]">{bill.ai_summary}</p>
                            </div>
                          </div>
                        )}

                        {/* AI Tips */}
                        {bill.ai_tips && (
                          <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                            <div className="flex items-start gap-2">
                              <i className="ri-lightbulb-line text-teal-600 mt-0.5"></i>
                              <p className="text-sm text-teal-800">{bill.ai_tips}</p>
                            </div>
                          </div>
                        )}

                        {/* View full details link */}
                        <div className="mt-2 text-right">
                          <span className="text-xs font-semibold text-[#0B1F33] hover:text-[#D4B483] transition-colors">
                            View full details <i className="ri-arrow-right-line"></i>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Savings Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-1">Savings Recommendations</h3>
        {insightsByType.length > 0 ? (
          <>
            <p className="text-sm text-[#6B7C8F] mb-4">Based on the bills you&apos;ve uploaded, grouped by utility.</p>
            <div className="space-y-4">
              {insightsByType.map(({ type, tips }) => (
                <div key={type} className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${UTILITY_COLORS[type] || 'bg-[#0B1F33]'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${UTILITY_ICONS[type] || 'ri-flashlight-line'} text-white text-lg`}></i>
                    </div>
                    <h4 className="font-bold text-[#0B1F33] capitalize">{type} &mdash; ways to save</h4>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#333645]">
                        <i className="ri-lightbulb-flash-line text-[#D4B483] mt-0.5 flex-shrink-0"></i>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#6B7C8F] mb-4">Upload bills to get tips tailored to your usage. General ideas in the meantime:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-[#F9F9FB] rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0B1F33] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${rec.icon} text-white text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0B1F33] mb-1">{rec.title}</h4>
                      <div className="flex items-center gap-3 text-sm mb-2">
                        <span className="text-green-600 font-semibold">{rec.savings}</span>
                        <span className="text-[#6B7C8F]">&middot;</span>
                        <span className="text-[#6B7C8F]">{rec.difficulty}</span>
                        <span className="text-[#6B7C8F]">&middot;</span>
                        <span className="text-[#6B7C8F]">Payback: {rec.payback}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bill Detail Modal */}
      {showBillDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBillDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header with colored banner */}
            <div className={`${showBillDetail.utility_type ? (UTILITY_COLORS[showBillDetail.utility_type] || 'bg-gray-500') : 'bg-[#0B1F33]'} p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className={`${UTILITY_ICONS[showBillDetail.utility_type || 'other']} text-white text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{showBillDetail.provider || 'Utility Bill'}</h3>
                    <p className="text-sm text-white/80 capitalize">{showBillDetail.utility_type || 'Unknown type'}</p>
                  </div>
                </div>
                <button onClick={() => setShowBillDetail(null)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              {/* Big cost display */}
              {showBillDetail.total_cost != null && (
                <div className="text-center pt-2 pb-1">
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-4xl font-bold text-white">${Number(showBillDetail.total_cost).toFixed(2)}</p>
                  {showBillDetail.billing_period_start && showBillDetail.billing_period_end && (
                    <p className="text-sm text-white/80 mt-1">
                      {new Date(showBillDetail.billing_period_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(showBillDetail.billing_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Key metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {showBillDetail.usage_amount != null && (
                  <div className="bg-[#F9F9FB] rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-1">Usage</p>
                    <p className="text-xl font-bold text-[#0B1F33]">{Number(showBillDetail.usage_amount).toLocaleString()}</p>
                    <p className="text-xs text-[#6B7C8F]">{showBillDetail.usage_unit}</p>
                  </div>
                )}
                {showBillDetail.due_date && (
                  <div className="bg-[#F9F9FB] rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-1">Due Date</p>
                    <p className="text-xl font-bold text-[#0B1F33]">{new Date(showBillDetail.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-[#6B7C8F]">{new Date(showBillDetail.due_date).getFullYear()}</p>
                  </div>
                )}
                {showBillDetail.previous_cost != null && (
                  <div className="bg-[#F9F9FB] rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-1">Previous Bill</p>
                    <p className="text-xl font-bold text-[#0B1F33]">${Number(showBillDetail.previous_cost).toFixed(2)}</p>
                    {showBillDetail.total_cost != null && (
                      <p className={`text-xs font-semibold ${Number(showBillDetail.total_cost) > Number(showBillDetail.previous_cost) ? 'text-red-500' : 'text-green-600'}`}>
                        {Number(showBillDetail.total_cost) > Number(showBillDetail.previous_cost) ? '+' : ''}
                        ${(Number(showBillDetail.total_cost) - Number(showBillDetail.previous_cost)).toFixed(2)} change
                      </p>
                    )}
                  </div>
                )}
                {showBillDetail.rate_per_unit != null && (
                  <div className="bg-[#F9F9FB] rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wider mb-1">Rate</p>
                    <p className="text-xl font-bold text-[#0B1F33]">${Number(showBillDetail.rate_per_unit).toFixed(4)}</p>
                    <p className="text-xs text-[#6B7C8F]">per {showBillDetail.usage_unit}</p>
                  </div>
                )}
              </div>

              {/* Account details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider">Account Details</h4>
                <div className="bg-[#F9F9FB] rounded-xl divide-y divide-gray-100">
                  {showBillDetail.account_number && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-[#6B7C8F]">Account Number</span>
                      <span className="text-sm font-semibold text-[#0B1F33]">{showBillDetail.account_number}</span>
                    </div>
                  )}
                  {showBillDetail.taxes_and_fees != null && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-[#6B7C8F]">Taxes & Fees</span>
                      <span className="text-sm font-semibold text-[#0B1F33]">${Number(showBillDetail.taxes_and_fees).toFixed(2)}</span>
                    </div>
                  )}
                  {showBillDetail.previous_usage != null && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-[#6B7C8F]">Previous Usage</span>
                      <span className="text-sm font-semibold text-[#0B1F33]">{Number(showBillDetail.previous_usage).toLocaleString()} {showBillDetail.usage_unit}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-[#6B7C8F]">Source File</span>
                    <span className="text-sm font-semibold text-[#0B1F33]">{showBillDetail.file_name}</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {(showBillDetail.ai_summary || showBillDetail.ai_tips) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider flex items-center gap-1.5">
                    <i className="ri-sparkling-line text-[#D4B483]"></i> AI Analysis
                  </h4>
                  {showBillDetail.ai_summary && (
                    <div className="bg-[#F9F9FB] rounded-xl p-4">
                      <p className="text-sm text-[#0B1F33] leading-relaxed">{showBillDetail.ai_summary}</p>
                    </div>
                  )}
                  {showBillDetail.ai_tips && (
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-lightbulb-line text-teal-600"></i>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-teal-800 mb-1">Savings Tip</p>
                          <p className="text-sm text-teal-700 leading-relaxed">{showBillDetail.ai_tips}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-[#0B1F33]">Upload Utility Bills</h3>
                <p className="text-sm text-[#6B7C8F] mt-1">Upload your bills and we'll extract the data automatically</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F4F4F6] text-[#6B7C8F] cursor-pointer transition-colors">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-400 hover:bg-[#F9F9FB]'
                }`}
              >
                <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.pdf" onChange={handleFileSelect} className="hidden" />
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-upload-cloud-2-line text-teal-600 text-3xl"></i>
                </div>
                <p className="text-base font-semibold text-[#0B1F33] mb-1">
                  {dragActive ? 'Drop files here' : 'Drag & drop your bills here'}
                </p>
                <p className="text-sm text-[#6B7C8F] mb-3">or click to browse files</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['PNG', 'JPG', 'WebP', 'PDF'].map(ext => (
                    <span key={ext} className="px-2.5 py-1 bg-[#F4F4F6] rounded-full text-xs font-medium text-[#6B7C8F]">{ext}</span>
                  ))}
                </div>
              </div>

              {uploadingFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadingFiles.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg">
                      <i className="ri-loader-4-line animate-spin text-teal-600"></i>
                      <span className="text-sm font-medium text-[#0B1F33] flex-1">{name}</span>
                      <span className="text-xs text-[#6B7C8F]">Uploading...</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 p-4 bg-[#F9F9FB] rounded-lg">
                <p className="text-sm font-semibold text-[#0B1F33] mb-2">Tips for best results:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-sm text-[#6B7C8F]">
                    <i className="ri-check-line text-teal-600 mt-0.5"></i>
                    Take a clear photo of the full bill — our AI will extract usage, cost, and more
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#6B7C8F]">
                    <i className="ri-check-line text-teal-600 mt-0.5"></i>
                    Include bills from all utility providers for full tracking
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#6B7C8F]">
                    <i className="ri-check-line text-teal-600 mt-0.5"></i>
                    Upload multiple months for better trend analysis
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer whitespace-nowrap transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowManualEntry(false); setManualSaveSuccess(false); setManualFormErrors({}); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-[#0B1F33]">Manual Utility Reading</h3>
                <p className="text-sm text-[#6B7C8F] mt-1">Enter your meter reading or usage when a bill isn't available</p>
              </div>
              <button onClick={() => { setShowManualEntry(false); setManualSaveSuccess(false); setManualFormErrors({}); }} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F4F4F6] text-[#6B7C8F] cursor-pointer transition-colors">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {manualSaveSuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-green-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Reading saved successfully!</p>
                    <p className="text-xs text-green-600">Your data has been added to the insights dashboard.</p>
                  </div>
                </div>
              )}

              {manualFormErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{manualFormErrors.submit}</div>
              )}

              {/* Utility Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Utility Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['electric', 'gas', 'water'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setManualForm(prev => ({ ...prev, utility: type }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        manualForm.utility === type ? 'border-[#0B1F33] bg-[#0B1F33]/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 ${UTILITY_COLORS[type]} rounded-lg flex items-center justify-center`}>
                        <i className={`${UTILITY_ICONS[type]} text-white text-lg`}></i>
                      </div>
                      <span className={`text-sm font-semibold capitalize ${manualForm.utility === type ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'}`}>
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Period */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Billing Period</label>
                <input
                  type="month"
                  value={manualForm.periodMonth}
                  onChange={(e) => setManualForm(prev => ({ ...prev, periodMonth: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 focus:border-[#0B1F33] transition-colors ${
                    manualFormErrors.periodMonth ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {manualFormErrors.periodMonth && <p className="text-xs text-red-500 mt-1">{manualFormErrors.periodMonth}</p>}
              </div>

              {/* Usage & Cost Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                    Usage ({UTILITY_UNITS[manualForm.utility] || 'units'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={`e.g. ${manualForm.utility === 'electric' ? '245' : manualForm.utility === 'gas' ? '82' : '4200'}`}
                    value={manualForm.usage}
                    onChange={(e) => setManualForm(prev => ({ ...prev, usage: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 focus:border-[#0B1F33] transition-colors ${
                      manualFormErrors.usage ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {manualFormErrors.usage && <p className="text-xs text-red-500 mt-1">{manualFormErrors.usage}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 42.15"
                    value={manualForm.cost}
                    onChange={(e) => setManualForm(prev => ({ ...prev, cost: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 focus:border-[#0B1F33] transition-colors ${
                      manualFormErrors.cost ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {manualFormErrors.cost && <p className="text-xs text-red-500 mt-1">{manualFormErrors.cost}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                  Notes <span className="font-normal text-[#6B7C8F]">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Meter reading from garage panel, estimated usage during vacation..."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-[#0B1F33] resize-none focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 focus:border-[#0B1F33] transition-colors"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#F9F9FB] rounded-lg">
                <div className="w-8 h-8 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-[#D4B483] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-0.5">Where to find your readings</p>
                  <p className="text-xs text-[#6B7C8F] leading-relaxed">
                    Check your utility meter (usually near the main panel or outside your home). Record the current number displayed. For usage, subtract last month's reading from the current one.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-100">
              <button
                onClick={() => { setShowManualEntry(false); setManualSaveSuccess(false); setManualFormErrors({}); }}
                className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer whitespace-nowrap transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setManualForm({ utility: 'electric', periodMonth: new Date().toISOString().slice(0, 7), usage: '', cost: '', notes: '' }); setManualFormErrors({}); setManualSaveSuccess(false); }}
                  className="px-5 py-2.5 text-sm font-semibold text-[#0B1F33] border border-gray-200 rounded-lg hover:bg-[#F4F4F6] cursor-pointer whitespace-nowrap transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#162d45] cursor-pointer whitespace-nowrap transition-colors"
                >
                  Save Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

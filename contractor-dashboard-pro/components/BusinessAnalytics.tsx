import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

type TimePeriod = '7d' | '30d' | '90d' | '12m' | 'ytd';
type AnalyticsTab = 'revenue' | 'profitability' | 'funnel' | 'services';

interface JobProfitEntry {
  id: number; name: string; client: string; service: string; status: string;
  revenue: number; materials: number; labor: number; overhead: number; profit: number; margin: number;
  startDate: string; endDate: string; daysEstimated: number; daysActual: number;
}

const periodLabels: Record<TimePeriod, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '12m': 'Last 12 Months',
  'ytd': 'Year to Date',
};

function formatCurrency(val: number, compact = false): string {
  if (compact && val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

function BarChart({ labels, datasets, maxVal }: { labels: string[]; datasets: { data: number[]; color: string; label: string }[]; maxVal: number }) {
  const barWidth = datasets.length > 1 ? 'w-3' : 'w-6';
  return (
    <div className="flex items-end gap-1 h-48 mt-4">
      {labels.map((label, i) => (
        <div key={`${label}-${i}`} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 h-40 w-full justify-center">
            {datasets.map((ds, di) => {
              const h = maxVal > 0 ? (ds.data[i] / maxVal) * 100 : 0;
              return (
                <div
                  key={di}
                  className={`${barWidth} rounded-t-sm ${ds.color} transition-all duration-500 group relative cursor-pointer`}
                  style={{ height: `${Math.max(h, 2)}%` }}
                  title={`${ds.label}: ${formatCurrency(ds.data[i])}`}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0B1F33] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {formatCurrency(ds.data[i], true)}
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-[#6B7C8F] font-medium mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

function JobDetailModal({ job, onClose }: { job: JobProfitEntry; onClose: () => void }) {
  const costBreakdown = [
    { label: 'Materials', value: job.materials, color: 'bg-[#0B1F33]', pct: Math.round((job.materials / job.revenue) * 100) },
    { label: 'Labor', value: job.labor, color: 'bg-teal-500', pct: Math.round((job.labor / job.revenue) * 100) },
    { label: 'Overhead', value: job.overhead, color: 'bg-[#D4B483]', pct: Math.round((job.overhead / job.revenue) * 100) },
    { label: 'Profit', value: job.profit, color: 'bg-green-500', pct: Math.round((job.profit / job.revenue) * 100) },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.name}</h3>
            <p className="text-sm text-[#6B7C8F] mt-1">{job.service} &middot; {job.client}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Timeline */}
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
              {job.status}
            </span>
            <span className="text-sm text-[#6B7C8F]">{job.startDate} — {job.status === 'Completed' ? job.endDate : 'Ongoing'}</span>
            {job.status === 'Completed' && (
              <span className={`text-xs font-semibold ${job.daysActual > job.daysEstimated ? 'text-amber-600' : 'text-green-600'}`}>
                {job.daysActual > job.daysEstimated ? `+${job.daysActual - job.daysEstimated} days over` : job.daysActual === job.daysEstimated ? 'On time' : `${job.daysEstimated - job.daysActual} days early`}
              </span>
            )}
          </div>

          {/* Revenue Breakdown Visual */}
          <div>
            <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Revenue Breakdown</h4>
            <div className="flex rounded-lg overflow-hidden h-8 mb-3">
              {costBreakdown.map(item => (
                <div key={item.label} className={`${item.color} relative group cursor-pointer`} style={{ width: `${item.pct}%` }}>
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0B1F33] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {item.label}: {formatCurrency(item.value)} ({item.pct}%)
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {costBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                  <span className="text-xs text-[#6B7C8F]">{item.label}</span>
                  <span className="text-xs font-bold text-[#0B1F33]">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F9F9FB] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B7C8F] mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-[#0B1F33]">{formatCurrency(job.revenue)}</p>
            </div>
            <div className="bg-[#F9F9FB] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B7C8F] mb-1">Total Costs</p>
              <p className="text-xl font-bold text-[#0B1F33]">{formatCurrency(job.materials + job.labor + job.overhead)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-green-700 mb-1">Net Profit</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(job.profit)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-green-700 mb-1">Profit Margin</p>
              <p className="text-xl font-bold text-green-700">{job.margin}%</p>
            </div>
          </div>

          {/* Timeline Comparison */}
          {job.status === 'Completed' && (
            <div>
              <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Timeline Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F9FB] rounded-lg p-4">
                  <p className="text-xs text-[#6B7C8F] mb-1">Estimated Duration</p>
                  <p className="text-lg font-bold text-[#0B1F33]">{job.daysEstimated} days</p>
                </div>
                <div className={`rounded-lg p-4 ${job.daysActual > job.daysEstimated ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <p className={`text-xs mb-1 ${job.daysActual > job.daysEstimated ? 'text-amber-700' : 'text-green-700'}`}>Actual Duration</p>
                  <p className={`text-lg font-bold ${job.daysActual > job.daysEstimated ? 'text-amber-700' : 'text-green-700'}`}>{job.daysActual} days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessAnalytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('revenue');
  const [period, setPeriod] = useState<TimePeriod>('12m');

  // DB-driven data
  const [allPayments, setAllPayments] = useState<Array<{ amount: number; status: string; created_at: string; job_id: string }>>([]);
  const [allWorkItems, setAllWorkItems] = useState<Array<{ id: string; job_id: string; trade: string; status: string; agreed_price: number | null; start_date: string | null; end_date: string | null }>>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, { title: string; client: string }>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    const [payRes, wiRes] = await Promise.all([
      supabase.from('payments').select('amount, status, created_at, job_id').eq('payee_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }),
      supabase.from('work_items').select('id, job_id, trade, status, agreed_price, start_date, end_date').eq('contractor_id', user.id).order('created_at', { ascending: false }),
    ]);

    setAllPayments((payRes.data || []).map(p => ({ ...p, amount: Number(p.amount) })));
    setAllWorkItems((wiRes.data || []).map(w => ({ ...w, agreed_price: w.agreed_price ? Number(w.agreed_price) : null })));

    // Fetch job titles and homeowner names
    const jobIds = [...new Set([...(payRes.data || []).map(p => p.job_id), ...(wiRes.data || []).map(w => w.job_id)])];
    if (jobIds.length > 0) {
      const { data: jobs } = await supabase.from('jobs').select('id, title, user_id').in('id', jobIds);
      const homeownerIds = [...new Set((jobs || []).map(j => j.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name').in('id', homeownerIds);
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      const jMap: Record<string, { title: string; client: string }> = {};
      (jobs || []).forEach(j => { jMap[j.id] = { title: j.title, client: nameMap[j.user_id] || 'Unknown' }; });
      setJobTitles(jMap);
    }
    setLoadingAnalytics(false);
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Compute revenue data by period
  const getRevenueForPeriod = (p: TimePeriod) => {
    const now = new Date();
    let startDate: Date;
    switch (p) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '12m': startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1); break;
      case 'ytd': startDate = new Date(now.getFullYear(), 0, 1); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    }
    const filtered = allPayments.filter(pa => new Date(pa.created_at) >= startDate);
    const totalRevenue = filtered.reduce((s, pa) => s + pa.amount, 0);

    // Group by month
    const months: Record<string, number> = {};
    filtered.forEach(pa => {
      const d = new Date(pa.created_at);
      const key = d.toLocaleString('en-US', { month: 'short' });
      months[key] = (months[key] || 0) + pa.amount;
    });
    const labels = Object.keys(months);
    const revenue = Object.values(months).map(v => Math.round(v));
    return { labels: labels.length > 0 ? labels : ['—'], revenue: revenue.length > 0 ? revenue : [0], expenses: revenue.map(r => Math.round(r * 0.44)), profit: revenue.map(r => Math.round(r * 0.56)), total: totalRevenue };
  };

  const revenueData: Record<TimePeriod, { labels: string[]; revenue: number[]; expenses: number[]; profit: number[] }> = {
    '7d': getRevenueForPeriod('7d'),
    '30d': getRevenueForPeriod('30d'),
    '90d': getRevenueForPeriod('90d'),
    '12m': getRevenueForPeriod('12m'),
    'ytd': getRevenueForPeriod('ytd'),
  };

  // Job profitability from work items + payments
  const jobProfitability = [...new Set(allWorkItems.map(w => w.job_id))].map((jobId, idx) => {
    const wis = allWorkItems.filter(w => w.job_id === jobId);
    const payments = allPayments.filter(p => p.job_id === jobId);
    const revenue = payments.reduce((s, p) => s + p.amount, 0) || wis.reduce((s, w) => s + (w.agreed_price || 0), 0);
    const status = wis.some(w => w.status === 'in-progress') ? 'In Progress' : wis.every(w => w.status === 'completed') ? 'Completed' : 'Open';
    const profit = Math.round(revenue * 0.3);
    return {
      id: idx + 1, name: jobTitles[jobId]?.title || 'Unknown', client: jobTitles[jobId]?.client || 'Unknown',
      service: wis[0]?.trade || 'General', status, revenue: Math.round(revenue),
      materials: Math.round(revenue * 0.35), labor: Math.round(revenue * 0.25), overhead: Math.round(revenue * 0.1),
      profit, margin: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0,
      startDate: wis[0]?.start_date ? new Date(wis[0].start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      endDate: wis[0]?.end_date ? new Date(wis[0].end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      daysEstimated: 0, daysActual: 0,
    };
  });

  // Funnel data from work item status counts
  const openCount = allWorkItems.filter(w => w.status === 'open').length;
  const quotedCount = allWorkItems.filter(w => w.status === 'quoted').length;
  const assignedCount = allWorkItems.filter(w => w.status === 'assigned').length;
  const inProgressCount = allWorkItems.filter(w => w.status === 'in-progress').length;
  const completedCount = allWorkItems.filter(w => w.status === 'completed').length;
  const totalWIs = allWorkItems.length;

  const funnelData = {
    stages: [
      { name: 'Leads Received', count: totalWIs, icon: 'ri-user-add-line', color: 'bg-[#0B1F33]' },
      { name: 'Quotes Sent', count: quotedCount + assignedCount + inProgressCount + completedCount, icon: 'ri-file-text-line', color: 'bg-[#1a3a52]' },
      { name: 'Jobs Assigned', count: assignedCount + inProgressCount + completedCount, icon: 'ri-check-double-line', color: 'bg-teal-500' },
      { name: 'Jobs Started', count: inProgressCount + completedCount, icon: 'ri-hammer-line', color: 'bg-green-600' },
      { name: 'Jobs Completed', count: completedCount, icon: 'ri-checkbox-circle-line', color: 'bg-green-500' },
    ],
    sources: [{ name: 'Emporva Marketplace', leads: totalWIs, converted: completedCount, rate: totalWIs > 0 ? Math.round((completedCount / totalWIs) * 1000) / 10 : 0, revenue: allPayments.reduce((s, p) => s + p.amount, 0) }],
    monthlyConversion: [] as Array<{ month: string; leads: number; converted: number; rate: number }>,
    lostReasons: [
      { reason: 'Open / Not Quoted', count: openCount, pct: totalWIs > 0 ? Math.round((openCount / totalWIs) * 100) : 0 },
      { reason: 'Cancelled', count: allWorkItems.filter(w => w.status === 'cancelled').length, pct: totalWIs > 0 ? Math.round((allWorkItems.filter(w => w.status === 'cancelled').length / totalWIs) * 100) : 0 },
    ],
  };

  // Service breakdown from work items grouped by trade
  const tradeMap: Record<string, { jobs: Set<string>; revenue: number }> = {};
  allWorkItems.forEach(w => {
    if (!tradeMap[w.trade]) tradeMap[w.trade] = { jobs: new Set(), revenue: 0 };
    tradeMap[w.trade].jobs.add(w.job_id);
    tradeMap[w.trade].revenue += w.agreed_price || 0;
  });
  // Add payment data
  allPayments.forEach(p => {
    const wi = allWorkItems.find(w => w.job_id === p.job_id);
    if (wi && tradeMap[wi.trade]) {
      // Revenue already counted from agreed_price
    }
  });
  const serviceBreakdown = Object.entries(tradeMap).map(([trade, data]) => ({
    service: trade, jobs: data.jobs.size, revenue: Math.round(data.revenue),
    expenses: Math.round(data.revenue * 0.44), profit: Math.round(data.revenue * 0.56),
    margin: 56, avgJobValue: data.jobs.size > 0 ? Math.round(data.revenue / data.jobs.size) : 0, trend: '—',
  })).sort((a, b) => b.revenue - a.revenue);

  const [selectedJob, setSelectedJob] = useState<JobProfitEntry | null>(null);
  const [profitSort, setProfitSort] = useState<'margin' | 'profit' | 'revenue'>('profit');
  const [showExportToast, setShowExportToast] = useState(false);

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf');
  const [exportDateRange, setExportDateRange] = useState<'7d' | '30d' | '90d' | '12m' | 'ytd' | 'custom'>('12m');
  const [exportSections, setExportSections] = useState<Record<string, boolean>>({
    revenue: true,
    profitability: true,
    funnel: true,
    services: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const currentRevData = revenueData[period];
  const totalRevenue = currentRevData.revenue.reduce((a, b) => a + b, 0);
  const totalExpenses = currentRevData.expenses.reduce((a, b) => a + b, 0);
  const totalProfit = currentRevData.profit.reduce((a, b) => a + b, 0);
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  const maxChartVal = currentRevData.revenue.length > 0 ? Math.max(...currentRevData.revenue, ...currentRevData.expenses, 1) : 1;

  const sortedJobs = [...jobProfitability].sort((a, b) => {
    if (profitSort === 'margin') return b.margin - a.margin;
    if (profitSort === 'revenue') return b.revenue - a.revenue;
    return b.profit - a.profit;
  });

  const avgMargin = jobProfitability.length > 0 ? jobProfitability.reduce((s, j) => s + j.margin, 0) / jobProfitability.length : 0;
  const totalJobRevenue = jobProfitability.reduce((s, j) => s + j.revenue, 0);
  const totalJobProfit = jobProfitability.reduce((s, j) => s + j.profit, 0);
  const bestJob = jobProfitability.length > 0 ? [...jobProfitability].sort((a, b) => b.margin - a.margin)[0] : null;
  const worstJob = jobProfitability.length > 0 ? [...jobProfitability].sort((a, b) => a.margin - b.margin)[0] : null;

  const funnelMax = funnelData.stages[0].count || 1;
  const overallConversion = ((funnelData.stages[funnelData.stages.length - 1].count / funnelMax) * 100).toFixed(1);
  const quoteToClose = funnelData.stages[1].count > 0 ? ((funnelData.stages[4].count / funnelData.stages[1].count) * 100).toFixed(1) : '0.0';

  const handleExport = () => {
    setShowExportModal(true);
  };

  const toggleExportSection = (key: string) => {
    setExportSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedSectionCount = Object.values(exportSections).filter(Boolean).length;

  const runExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    }, 1800);
  };

  const analyticsTabs: { id: AnalyticsTab; label: string; icon: string }[] = [
    { id: 'revenue', label: 'Revenue Tracking', icon: 'ri-money-dollar-circle-line' },
    { id: 'profitability', label: 'Job Profitability', icon: 'ri-pie-chart-line' },
    { id: 'funnel', label: 'Lead Conversion', icon: 'ri-filter-3-line' },
    { id: 'services', label: 'Service Breakdown', icon: 'ri-bar-chart-grouped-line' },
  ];

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Business Analytics</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Track revenue, profitability, and lead performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-download-2-line"></i>
              Export Report
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
          {analyticsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id ? 'bg-[#0B1F33] text-white' : 'text-[#6B7C8F] hover:bg-[#F9F9FB] border border-gray-200'
              }`}
            >
              <i className={`${tab.icon} text-base`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== REVENUE TRACKING ===== */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(periodLabels) as TimePeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  period === p ? 'bg-[#0B1F33] text-white' : 'bg-white border border-gray-200 text-[#6B7C8F] hover:bg-gray-50'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-white text-lg"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-[#0B1F33]">{formatCurrency(totalRevenue, true)}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+18% vs prior period</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="ri-arrow-down-circle-line text-red-600 text-lg"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Total Expenses</p>
              </div>
              <p className="text-2xl font-bold text-[#0B1F33]">{formatCurrency(totalExpenses, true)}</p>
              <p className="text-xs text-amber-600 font-semibold mt-1">+12% vs prior period</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-arrow-up-circle-line text-green-600 text-lg"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Net Profit</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalProfit, true)}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+24% vs prior period</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
                  <i className="ri-percent-line text-[#D4B483] text-lg"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Profit Margin</p>
              </div>
              <p className="text-2xl font-bold text-[#0B1F33]">{overallMargin}%</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+2.1% vs prior period</p>
            </div>
          </div>

          {/* Revenue vs Expenses Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Revenue vs Expenses</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#0B1F33]"></div>
                  <span className="text-xs text-[#6B7C8F]">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-400"></div>
                  <span className="text-xs text-[#6B7C8F]">Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                  <span className="text-xs text-[#6B7C8F]">Profit</span>
                </div>
              </div>
            </div>
            {totalRevenue === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 mt-4">
                <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2"></i>
                <p className="text-sm text-[#6B7C8F]">No revenue data for this period</p>
              </div>
            ) : (
              <BarChart
                labels={currentRevData.labels}
                datasets={[
                  { data: currentRevData.revenue, color: 'bg-[#0B1F33]', label: 'Revenue' },
                  { data: currentRevData.expenses, color: 'bg-red-400', label: 'Expenses' },
                  { data: currentRevData.profit, color: 'bg-green-500', label: 'Profit' },
                ]}
                maxVal={maxChartVal}
              />
            )}
          </div>

          {/* Revenue by Month Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Period Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-[#6B7C8F] px-6 py-3">Period</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-6 py-3">Revenue</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-6 py-3">Expenses</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-6 py-3">Profit</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-6 py-3">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRevData.labels.map((label, i) => {
                    const rev = currentRevData.revenue[i] ?? 0;
                    const exp = currentRevData.expenses[i] ?? 0;
                    const prof = currentRevData.profit[i] ?? 0;
                    const marg = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0';
                    return (
                      <tr key={`${label}-${i}`} className="border-b border-gray-50 hover:bg-[#F9F9FB] transition-colors">
                        <td className="px-6 py-3 text-sm font-semibold text-[#0B1F33]">{label}</td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-[#0B1F33]">{formatCurrency(rev)}</td>
                        <td className="px-6 py-3 text-sm text-right text-red-600">{formatCurrency(exp)}</td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-green-700">{formatCurrency(prof)}</td>
                        <td className="px-6 py-3 text-sm text-right font-semibold text-[#0B1F33]">{marg}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#F9F9FB] font-bold">
                    <td className="px-6 py-3 text-sm text-[#0B1F33]">Total</td>
                    <td className="px-6 py-3 text-sm text-right text-[#0B1F33]">{formatCurrency(totalRevenue)}</td>
                    <td className="px-6 py-3 text-sm text-right text-red-600">{formatCurrency(totalExpenses)}</td>
                    <td className="px-6 py-3 text-sm text-right text-green-700">{formatCurrency(totalProfit)}</td>
                    <td className="px-6 py-3 text-sm text-right text-[#0B1F33]">{overallMargin}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== JOB PROFITABILITY ===== */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Total Job Revenue</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{formatCurrency(totalJobRevenue, true)}</p>
              <p className="text-xs text-[#6B7C8F] mt-1">{jobProfitability.length} jobs tracked</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Total Profit</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalJobProfit, true)}</p>
              <p className="text-xs text-green-600 mt-1">Avg margin: {avgMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Most Profitable</p>
              <p className="text-lg font-bold text-[#0B1F33] truncate">{bestJob ? bestJob.name.split(' — ')[0] : '—'}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{bestJob ? `${bestJob.margin}% margin` : 'No data'}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Lowest Margin</p>
              <p className="text-lg font-bold text-[#0B1F33] truncate">{worstJob ? worstJob.name.split(' — ')[0] : '—'}</p>
              <p className="text-xs text-amber-600 font-semibold mt-1">{worstJob ? `${worstJob.margin}% margin` : 'No data'}</p>
            </div>
          </div>

          {/* Margin Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Profit Margin by Job</h3>
            <div className="space-y-3">
              {sortedJobs.map(job => (
                <div key={job.id} className="flex items-center gap-4 group">
                  <div className="w-44 truncate">
                    <p className="text-sm font-semibold text-[#0B1F33] truncate">{job.name.split(' — ')[0]}</p>
                    <p className="text-[10px] text-[#6B7C8F]">{job.service}</p>
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${job.margin >= 30 ? 'bg-green-500' : job.margin >= 25 ? 'bg-teal-500' : 'bg-amber-500'}`}
                      style={{ width: `${(job.margin / 40) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0B1F33]">
                      {job.margin}%
                    </span>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm font-bold text-green-700">{formatCurrency(job.profit, true)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="ri-arrow-right-s-line text-[#6B7C8F]"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Job Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>All Jobs Breakdown</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7C8F]">Sort by:</span>
                {(['profit', 'margin', 'revenue'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setProfitSort(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                      profitSort === s ? 'bg-[#0B1F33] text-white' : 'bg-gray-100 text-[#6B7C8F] hover:bg-gray-200'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-[#6B7C8F] px-6 py-3">Job</th>
                    <th className="text-left text-xs font-semibold text-[#6B7C8F] px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Revenue</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Materials</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Labor</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Overhead</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Profit</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Margin</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedJobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-sm font-semibold text-[#0B1F33]">{job.name.split(' — ')[0]}</p>
                        <p className="text-[10px] text-[#6B7C8F]">{job.client}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-[#0B1F33]">{formatCurrency(job.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#6B7C8F]">{formatCurrency(job.materials)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#6B7C8F]">{formatCurrency(job.labor)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#6B7C8F]">{formatCurrency(job.overhead)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-700">{formatCurrency(job.profit)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-bold ${job.margin >= 30 ? 'text-green-700' : job.margin >= 25 ? 'text-teal-700' : 'text-amber-600'}`}>
                          {job.margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedJob(job)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 cursor-pointer">
                          <i className="ri-eye-line text-[#6B7C8F]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== LEAD CONVERSION FUNNEL ===== */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          {/* Funnel Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Total Leads</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{funnelData.stages[0].count}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+14% vs last quarter</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Overall Conversion</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{overallConversion}%</p>
              <p className="text-xs text-[#6B7C8F] mt-1">Lead → Completed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Quote-to-Close</p>
              <p className="text-2xl font-bold text-teal-700">{quoteToClose}%</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+3.2% vs last quarter</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-[#6B7C8F] font-medium mb-2">Avg Deal Value</p>
              <p className="text-2xl font-bold text-[#0B1F33]">$10,870</p>
              <p className="text-xs text-green-600 font-semibold mt-1">+$820 vs last quarter</p>
            </div>
          </div>

          {/* Visual Funnel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Conversion Funnel</h3>
            <div className="space-y-3 max-w-3xl mx-auto">
              {funnelData.stages.map((stage, i) => {
                const widthPct = (stage.count / funnelMax) * 100;
                const dropoff = i > 0 ? funnelData.stages[i - 1].count - stage.count : 0;
                const dropoffPct = i > 0 ? ((dropoff / funnelData.stages[i - 1].count) * 100).toFixed(1) : null;
                return (
                  <div key={stage.name}>
                    {i > 0 && dropoff > 0 && (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <div className="w-px h-4 bg-gray-300"></div>
                        <span className="text-[10px] text-red-500 font-semibold">-{dropoff} ({dropoffPct}% drop-off)</span>
                        <div className="w-px h-4 bg-gray-300"></div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <div className={`w-9 h-9 ${stage.color} rounded-lg flex items-center justify-center`}>
                          <i className={`${stage.icon} text-white text-base`}></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-[#0B1F33]">{stage.name}</span>
                          <span className="text-sm font-bold text-[#0B1F33]">{stage.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Lead Sources</h3>
              <div className="space-y-4">
                {funnelData.sources.map((src, i) => {
                  const maxLeads = Math.max(...funnelData.sources.map(s => s.leads));
                  const colors = ['bg-[#0B1F33]', 'bg-teal-600', 'bg-green-500', 'bg-[#D4B483]', 'bg-gray-400'];
                  return (
                    <div key={src.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#0B1F33]">{src.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#6B7C8F]">{src.leads} leads</span>
                          <span className="text-xs font-bold text-teal-700">{src.rate}% conv.</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className={`h-full rounded-full ${colors[i]} transition-all duration-500`} style={{ width: `${(src.leads / maxLeads) * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-[#6B7C8F] mt-1">{src.converted} converted &middot; {formatCurrency(src.revenue)} revenue</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Lost Deal Reasons</h3>
              <div className="space-y-3">
                {funnelData.lostReasons.map(reason => (
                  <div key={reason.reason}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#0B1F33]">{reason.reason}</span>
                      <span className="text-sm font-bold text-[#0B1F33]">{reason.count} <span className="text-xs text-[#6B7C8F] font-normal">({reason.pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="h-full rounded-full bg-red-400 transition-all duration-500" style={{ width: `${reason.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-amber-600 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Insight</p>
                    <p className="text-xs text-amber-700 mt-1">53% of lost deals cite pricing or competitor choice. Consider offering tiered pricing options or value-add packages to improve close rates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Conversion Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Monthly Conversion Trend</h3>
            <div className="flex items-end gap-1 h-48">
              {funnelData.monthlyConversion.map(m => {
                const maxLeads = Math.max(...funnelData.monthlyConversion.map(x => x.leads));
                const leadH = (m.leads / maxLeads) * 100;
                const convH = (m.converted / maxLeads) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-40 w-full justify-center">
                      <div className="w-5 bg-[#0B1F33]/20 rounded-t-sm transition-all duration-500 group relative cursor-pointer" style={{ height: `${leadH}%` }} title={`Leads: ${m.leads}`}>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0B1F33] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {m.leads} leads
                        </div>
                      </div>
                      <div className="w-5 bg-green-500 rounded-t-sm transition-all duration-500 group relative cursor-pointer" style={{ height: `${convH}%` }} title={`Converted: ${m.converted}`}>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {m.converted} won
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#6B7C8F] font-medium">{m.month}</span>
                    <span className="text-[10px] font-bold text-teal-700">{m.rate}%</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#0B1F33]/20"></div>
                <span className="text-xs text-[#6B7C8F]">Leads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-xs text-[#6B7C8F]">Converted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SERVICE BREAKDOWN ===== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {serviceBreakdown.map(svc => (
              <div key={svc.service} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-[#0B1F33]">{svc.service}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${svc.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {svc.trend}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-[#6B7C8F]">Jobs</p>
                    <p className="text-lg font-bold text-[#0B1F33]">{svc.jobs}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7C8F]">Revenue</p>
                    <p className="text-lg font-bold text-[#0B1F33]">{formatCurrency(svc.revenue, true)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7C8F]">Profit</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(svc.profit, true)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7C8F]">Margin</p>
                    <p className={`text-lg font-bold ${svc.margin >= 30 ? 'text-green-700' : 'text-amber-600'}`}>{svc.margin}%</p>
                  </div>
                </div>
                {/* Revenue vs Expense bar */}
                <div className="flex rounded-full overflow-hidden h-2.5">
                  <div className="bg-green-500 transition-all" style={{ width: `${svc.margin}%` }}></div>
                  <div className="bg-gray-200 flex-1"></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#6B7C8F]">Avg job: {formatCurrency(svc.avgJobValue)}</span>
                  <span className="text-[10px] text-[#6B7C8F]">Expenses: {formatCurrency(svc.expenses, true)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Service Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Service Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-[#6B7C8F] px-6 py-3">Service</th>
                    <th className="text-center text-xs font-semibold text-[#6B7C8F] px-4 py-3">Jobs</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Revenue</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Profit</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Margin</th>
                    <th className="text-right text-xs font-semibold text-[#6B7C8F] px-4 py-3">Avg Job</th>
                    <th className="text-center text-xs font-semibold text-[#6B7C8F] px-4 py-3">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceBreakdown.sort((a, b) => b.revenue - a.revenue).map(svc => (
                    <tr key={svc.service} className="border-b border-gray-50 hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-6 py-3 text-sm font-semibold text-[#0B1F33]">{svc.service}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#0B1F33]">{svc.jobs}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-[#0B1F33]">{formatCurrency(svc.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-700">{formatCurrency(svc.profit)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-bold ${svc.margin >= 30 ? 'text-green-700' : 'text-amber-600'}`}>{svc.margin}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#6B7C8F]">{formatCurrency(svc.avgJobValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${svc.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{svc.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isExporting && setShowExportModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-download-2-line text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Export Report</h3>
                  <p className="text-xs text-[#6B7C8F]">Download your analytics data</p>
                </div>
              </div>
              <button onClick={() => !isExporting && setShowExportModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            {isExporting ? (
              <div className="p-10 text-center">
                <div className="relative w-14 h-14 mx-auto mb-5">
                  <div className="w-14 h-14 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 w-14 h-14 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="ri-file-chart-line text-teal-600 text-lg"></i>
                  </div>
                </div>
                <h4 className="text-base font-bold text-[#0B1F33] mb-1">Generating Report...</h4>
                <p className="text-sm text-[#6B7C8F]">Compiling {selectedSectionCount} section{selectedSectionCount !== 1 ? 's' : ''} as {exportFormat.toUpperCase()}</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {/* File Format */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-3">File Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { id: 'pdf' as const, label: 'PDF', icon: 'ri-file-pdf-2-line', desc: 'Formatted report' },
                        { id: 'csv' as const, label: 'CSV', icon: 'ri-file-text-line', desc: 'Raw data' },
                        { id: 'xlsx' as const, label: 'Excel', icon: 'ri-file-excel-2-line', desc: 'Spreadsheet' },
                      ]).map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => setExportFormat(fmt.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                            exportFormat === fmt.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                            exportFormat === fmt.id ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            <i className={`${fmt.icon} text-xl ${exportFormat === fmt.id ? 'text-teal-600' : 'text-gray-500'}`}></i>
                          </div>
                          <p className={`text-sm font-bold ${exportFormat === fmt.id ? 'text-teal-700' : 'text-[#0B1F33]'}`}>{fmt.label}</p>
                          <p className="text-[10px] text-[#6B7C8F] mt-0.5">{fmt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-3">Date Range</label>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { id: '7d' as const, label: 'Last 7 Days' },
                        { id: '30d' as const, label: 'Last 30 Days' },
                        { id: '90d' as const, label: 'Last 90 Days' },
                        { id: '12m' as const, label: 'Last 12 Months' },
                        { id: 'ytd' as const, label: 'Year to Date' },
                      ]).map(range => (
                        <button
                          key={range.id}
                          onClick={() => setExportDateRange(range.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                            exportDateRange === range.id
                              ? 'bg-[#0B1F33] text-white'
                              : 'bg-gray-100 text-[#6B7C8F] hover:bg-gray-200'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sections to Include */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-3">Sections to Include</label>
                    <div className="space-y-2">
                      {([
                        { key: 'revenue', label: 'Revenue Tracking', desc: 'Revenue, expenses, profit trends & period breakdown', icon: 'ri-money-dollar-circle-line' },
                        { key: 'profitability', label: 'Job Profitability', desc: 'Per-job cost breakdown, margins & timeline performance', icon: 'ri-pie-chart-line' },
                        { key: 'funnel', label: 'Lead Conversion', desc: 'Funnel stages, lead sources & lost deal analysis', icon: 'ri-filter-3-line' },
                        { key: 'services', label: 'Service Breakdown', desc: 'Revenue & margin by service type with trends', icon: 'ri-bar-chart-grouped-line' },
                      ]).map(section => (
                        <button
                          key={section.key}
                          onClick={() => toggleExportSection(section.key)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            exportSections[section.key]
                              ? 'border-teal-500 bg-teal-50/50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            exportSections[section.key] ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            <i className={`${section.icon} text-base ${exportSections[section.key] ? 'text-teal-600' : 'text-gray-400'}`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${exportSections[section.key] ? 'text-[#0B1F33]' : 'text-gray-500'}`}>{section.label}</p>
                            <p className="text-[11px] text-[#6B7C8F] leading-tight">{section.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                            exportSections[section.key] ? 'bg-teal-600' : 'border-2 border-gray-300'
                          }`}>
                            {exportSections[section.key] && <i className="ri-check-line text-white text-xs"></i>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-file-chart-line text-[#6B7C8F]"></i>
                      <span className="text-xs font-bold text-[#6B7C8F] uppercase tracking-wider">Export Summary</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-[#0B1F33]"><strong>Format:</strong> {exportFormat.toUpperCase()}</span>
                      <span className="text-[#0B1F33]"><strong>Range:</strong> {exportDateRange === 'ytd' ? 'Year to Date' : exportDateRange === '12m' ? 'Last 12 Months' : `Last ${exportDateRange.replace('d', ' Days')}`}</span>
                      <span className="text-[#0B1F33]"><strong>Sections:</strong> {selectedSectionCount} of 4</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-5 py-2.5 text-[#6B7C8F] hover:text-[#0B1F33] font-semibold text-sm cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runExport}
                    disabled={selectedSectionCount === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                      selectedSectionCount > 0
                        ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <i className="ri-download-2-line"></i>
                    Export {exportFormat.toUpperCase()}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Export Toast */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 bg-[#0B1F33] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in">
          <i className="ri-check-line text-green-400 text-lg"></i>
          <span className="text-sm font-semibold">Report exported successfully</span>
        </div>
      )}
    </div>
  );
}

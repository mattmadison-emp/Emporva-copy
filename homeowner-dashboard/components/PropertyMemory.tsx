import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { exportToPDF } from '../../../utils/pdfExport';
import DocumentVault from './DocumentVault';

interface TimelineEvent {
  id: string;
  date: string;
  category: string;
  title: string;
  contractor: string;
  cost: number;
  status: string;
  notes: string;
  source: 'job' | 'maintenance_log' | 'seasonal_task' | 'diy_project';
}

interface SystemGroup {
  category: string;
  icon: string;
  color: string;
  items: TimelineEvent[];
}

const categoryIcon = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes('hvac')) return 'ri-temp-cold-line';
  if (c.includes('plumbing')) return 'ri-drop-line';
  if (c.includes('electric')) return 'ri-flashlight-line';
  if (c.includes('roof')) return 'ri-home-4-line';
  if (c.includes('appliance')) return 'ri-fridge-line';
  if (c.includes('paint')) return 'ri-paint-brush-line';
  if (c.includes('landscap') || c.includes('gutter')) return 'ri-plant-line';
  if (c.includes('pool')) return 'ri-water-flash-line';
  if (c.includes('safety')) return 'ri-shield-check-line';
  return 'ri-tools-line';
};

const categoryColor = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes('hvac')) return 'bg-blue-500';
  if (c.includes('plumbing')) return 'bg-cyan-500';
  if (c.includes('electric')) return 'bg-yellow-500';
  if (c.includes('roof')) return 'bg-orange-500';
  if (c.includes('appliance')) return 'bg-purple-500';
  if (c.includes('paint')) return 'bg-pink-500';
  if (c.includes('pool')) return 'bg-sky-500';
  return 'bg-gray-500';
};

export default function PropertyMemory() {
  const { user } = useAuth();
  const [view, setView] = useState<'timeline' | 'systems' | 'documents'>('timeline');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'job' | 'maintenance_log' | 'seasonal_task' | 'diy_project'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Add log form state
  const [logTitle, setLogTitle] = useState('');
  const [logCategory, setLogCategory] = useState('');
  const [logContractor, setLogContractor] = useState('');
  const [logCost, setLogCost] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (prop) setPropertyId(prop.id);

    // Fetch from 4 sources in parallel
    const [jobsRes, logsRes, seasonalRes, diyRes] = await Promise.all([
      // Completed jobs with work items and contractor info
      supabase
        .from('jobs')
        .select('id, title, category, description, status, updated_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false }),
      // Manual maintenance logs
      prop
        ? supabase
            .from('property_maintenance_logs')
            .select('id, title, category, contractor_name, cost, completed_date, status, notes')
            .eq('property_id', prop.id)
            .order('completed_date', { ascending: false })
        : Promise.resolve({ data: [] }),
      // Seasonal task completions
      supabase
        .from('seasonal_task_completions')
        .select('id, task_title, season, year, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false }),
      // Completed DIY projects
      supabase
        .from('diy_projects')
        .select('id, name, category, description, total_cost, updated_at')
        .eq('user_id', user.id)
        .eq('status', 'Completed')
        .order('updated_at', { ascending: false }),
    ]);

    const allEvents: TimelineEvent[] = [];

    // Process completed jobs
    if (jobsRes.data && jobsRes.data.length > 0) {
      const jobIds = jobsRes.data.map(j => j.id);

      // Fetch work items for contractor names and prices
      const { data: workItems } = await supabase
        .from('work_items')
        .select('job_id, contractor_id, agreed_price')
        .in('job_id', jobIds);

      // Get contractor profile names
      const contractorIds = [...new Set((workItems || []).map(w => w.contractor_id).filter(Boolean))] as string[];
      let contractorMap: Record<string, string> = {};
      if (contractorIds.length > 0) {
        const [profilesRes, cpRes] = await Promise.all([
          supabase.from('profiles').select('id, first_name, last_name').in('id', contractorIds),
          supabase.from('contractor_profiles').select('user_id, business_name').in('user_id', contractorIds),
        ]);
        const bizMap = Object.fromEntries((cpRes.data || []).map(c => [c.user_id, c.business_name]));
        (profilesRes.data || []).forEach(p => {
          contractorMap[p.id] = bizMap[p.id] || `${p.first_name} ${p.last_name}`;
        });
      }

      // Sum payments per job
      const { data: payments } = await supabase
        .from('payments')
        .select('job_id, amount, status')
        .in('job_id', jobIds)
        .eq('status', 'completed');

      const paymentTotals: Record<string, number> = {};
      (payments || []).forEach(p => {
        paymentTotals[p.job_id] = (paymentTotals[p.job_id] || 0) + Number(p.amount);
      });

      for (const job of jobsRes.data) {
        const jobWIs = (workItems || []).filter(w => w.job_id === job.id);
        const primaryContractorId = jobWIs.find(w => w.contractor_id)?.contractor_id;
        const totalAgreed = jobWIs.reduce((s, w) => s + (Number(w.agreed_price) || 0), 0);
        const totalPaid = paymentTotals[job.id] || 0;

        allEvents.push({
          id: job.id,
          date: job.updated_at,
          category: job.category,
          title: job.title,
          contractor: primaryContractorId ? contractorMap[primaryContractorId] || 'Contractor' : '',
          cost: totalPaid || totalAgreed,
          status: 'Completed',
          notes: job.description || '',
          source: 'job',
        });
      }
    }

    // Process maintenance logs
    (logsRes.data || []).forEach(log => {
      allEvents.push({
        id: log.id,
        date: log.completed_date || '',
        category: log.category,
        title: log.title,
        contractor: log.contractor_name || '',
        cost: Number(log.cost) || 0,
        status: log.status || 'Completed',
        notes: log.notes || '',
        source: 'maintenance_log',
      });
    });

    // Process seasonal task completions
    (seasonalRes.data || []).forEach(s => {
      allEvents.push({
        id: s.id,
        date: s.completed_at,
        category: 'Maintenance',
        title: s.task_title,
        contractor: 'DIY',
        cost: 0,
        status: 'Completed',
        notes: `Seasonal task — ${s.season} ${s.year}`,
        source: 'seasonal_task',
      });
    });

    // Process completed DIY projects
    (diyRes.data || []).forEach(diy => {
      allEvents.push({
        id: diy.id,
        date: diy.updated_at,
        category: diy.category || 'DIY',
        title: `DIY: ${diy.name}`,
        contractor: 'DIY',
        cost: Number(diy.total_cost) || 0,
        status: 'Completed',
        notes: diy.description || '',
        source: 'diy_project',
      });
    });

    // Sort by date descending
    allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setEvents(allEvents);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddLog = async () => {
    if (!user || !propertyId || !logTitle || !logCategory) return;
    setSaving(true);

    await supabase.from('property_maintenance_logs').insert({
      property_id: propertyId,
      user_id: user.id,
      title: logTitle,
      category: logCategory,
      contractor_name: logContractor || null,
      cost: logCost ? Number(logCost) : null,
      completed_date: logDate || null,
      notes: logNotes || null,
    });

    setLogTitle('');
    setLogCategory('');
    setLogContractor('');
    setLogCost('');
    setLogDate('');
    setLogNotes('');
    setSaving(false);
    setShowAddModal(false);
    fetchData();
  };

  const filteredTimeline = events.filter(event => {
    if (sourceFilter !== 'all' && event.source !== sourceFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return event.title.toLowerCase().includes(term) ||
      event.category.toLowerCase().includes(term) ||
      event.contractor.toLowerCase().includes(term);
  });

  // Build systems grouping
  const systemsHistory: SystemGroup[] = [];
  const catMap: Record<string, TimelineEvent[]> = {};
  events.forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = [];
    catMap[e.category].push(e);
  });
  Object.entries(catMap).forEach(([cat, items]) => {
    systemsHistory.push({
      category: cat,
      icon: categoryIcon(cat),
      color: categoryColor(cat),
      items,
    });
  });
  systemsHistory.sort((a, b) => b.items.length - a.items.length);

  // AI Summary stats
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const recentEvents = events.filter(e => new Date(e.date) >= oneYearAgo);
  const totalJobs = recentEvents.length;
  const totalSpent = recentEvents.reduce((s, e) => s + e.cost, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33] mb-1">Property Memory</h2>
            <p className="text-xs sm:text-sm text-[#6B7C8F]">Complete history of all work done on your property</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-line"></i>
                <span className="hidden sm:inline">Download Resale Report</span>
                <span className="sm:hidden">Report</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 w-44">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        const rows = events.map(e => ({
                          Date: e.date ? new Date(e.date).toLocaleDateString() : '',
                          Category: e.category,
                          Title: e.title,
                          Contractor: e.contractor,
                          Cost: e.cost ? `$${e.cost.toLocaleString()}` : '',
                          Status: e.status,
                          Notes: (e.notes || '').replace(/,/g, ';'),
                        }));
                        const header = Object.keys(rows[0] || {}).join(',');
                        const csv = [
                          'PROPERTY RESALE REPORT',
                          `Generated: ${new Date().toLocaleDateString()}`,
                          `Total Records: ${events.length}`,
                          `Total Invested (12mo): $${totalSpent.toLocaleString()}`,
                          '',
                          header,
                          ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')),
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `resale-report-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] transition-colors cursor-pointer rounded-t-lg"
                    >
                      <i className="ri-file-text-line text-[#6B7C8F]"></i>
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        const headers = ['Date', 'Category', 'Title', 'Contractor', 'Cost', 'Status'];
                        const rows = events.map(e => [
                          e.date ? new Date(e.date).toLocaleDateString() : '',
                          e.category,
                          e.title,
                          e.contractor,
                          e.cost ? `$${e.cost.toLocaleString()}` : '',
                          e.status,
                        ]);
                        exportToPDF({
                          title: 'Property Resale Report',
                          subtitle: 'Complete history of all work done on your property',
                          headers,
                          rows,
                          summaryLines: [
                            `Total Records: ${events.length}`,
                            `Total Invested (12 months): $${totalSpent.toLocaleString()}`,
                            `Categories Tracked: ${systemsHistory.length}`,
                          ],
                          filename: `resale-report-${new Date().toISOString().split('T')[0]}.pdf`,
                        });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] transition-colors cursor-pointer rounded-b-lg"
                    >
                      <i className="ri-file-pdf-line text-red-500"></i>
                      Export as PDF
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              Log Maintenance
            </button>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <i className="ri-sparkling-line text-[#D4B483] text-lg sm:text-xl"></i>
            <h3 className="font-bold text-base sm:text-lg text-white">AI Property Insights</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] sm:text-xs text-white mb-1">Last 12 Months</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{totalJobs} Events</p>
              <p className="text-xs sm:text-sm text-white">${totalSpent.toLocaleString()} invested</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-white mb-1">Categories</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{systemsHistory.length}</p>
              <p className="text-xs sm:text-sm text-white">systems tracked</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] sm:text-xs text-white mb-1">Total History</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{events.length} Records</p>
              <p className="text-xs sm:text-sm text-white">all time</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setView('timeline')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap transition-all ${
                  view === 'timeline' ? 'bg-[#0B1F33] text-white' : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                }`}
              >
                <i className="ri-time-line mr-1 sm:mr-2"></i>
                Timeline
              </button>
              <button
                onClick={() => setView('systems')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap transition-all ${
                  view === 'systems' ? 'bg-[#0B1F33] text-white' : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                }`}
              >
                <i className="ri-tools-line mr-1 sm:mr-2"></i>
                By System
              </button>
              <button
                onClick={() => setView('documents')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap transition-all ${
                  view === 'documents' ? 'bg-[#0B1F33] text-white' : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                }`}
              >
                <i className="ri-folder-3-line mr-1 sm:mr-2"></i>
                Document Vault
              </button>
            </div>
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F]"></i>
              <input
                type="text"
                placeholder={view === 'documents' ? 'Search documents...' : 'Search history...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
              />
            </div>
          </div>

          {/* Source Filter */}
          {view === 'timeline' && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {([
                { key: 'all', label: 'All', icon: 'ri-list-check' },
                { key: 'job', label: 'Jobs', icon: 'ri-briefcase-line' },
                { key: 'maintenance_log', label: 'Maintenance', icon: 'ri-tools-line' },
                { key: 'seasonal_task', label: 'Seasonal', icon: 'ri-sun-line' },
                { key: 'diy_project', label: 'DIY Projects', icon: 'ri-hammer-line' },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setSourceFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    sourceFilter === f.key
                      ? 'bg-[#D4B483] text-[#0B1F33]'
                      : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                  }`}
                >
                  <i className={f.icon}></i>
                  {f.label}
                  <span className={`ml-0.5 text-[10px] ${sourceFilter === f.key ? 'text-[#0B1F33]/70' : 'text-[#6B7C8F]'}`}>
                    {f.key === 'all' ? events.length : events.filter(e => e.source === f.key).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-3 sm:space-y-4">
          {filteredTimeline.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-3xl text-gray-400"></i>
              </div>
              <p className="font-bold text-[#0B1F33] mb-1">No history yet</p>
              <p className="text-sm text-[#6B7C8F]">
                {searchTerm ? 'No results match your search' : 'Completed jobs and maintenance logs will appear here'}
              </p>
            </div>
          )}
          {filteredTimeline.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F9F9FB] rounded-lg flex items-center justify-center">
                    <i className={`${categoryIcon(event.category)} text-xl sm:text-2xl ${categoryColor(event.category).replace('bg-', 'text-').replace('-500', '-600')}`}></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-lg font-bold text-[#0B1F33]">{event.title}</h3>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-semibold">
                          {event.status}
                        </span>
                        {event.source === 'seasonal_task' && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-semibold">Seasonal</span>
                        )}
                        {event.source === 'maintenance_log' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">Manual Log</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#6B7C8F]">
                        <span><i className="ri-calendar-line mr-1"></i>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {event.contractor && <span><i className="ri-user-line mr-1"></i>{event.contractor}</span>}
                        {event.cost > 0 && <span className="font-semibold text-[#0B1F33]">${event.cost.toLocaleString()}</span>}
                      </div>
                    </div>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap self-start">
                      {event.category}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-xs sm:text-sm text-[#6B7C8F]">{event.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Systems View */}
      {view === 'systems' && (
        <div className="space-y-4 sm:space-y-6">
          {systemsHistory.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-tools-line text-3xl text-gray-400"></i>
              </div>
              <p className="font-bold text-[#0B1F33] mb-1">No systems data yet</p>
              <p className="text-sm text-[#6B7C8F]">Complete jobs or log maintenance to see history grouped by system</p>
            </div>
          )}
          {systemsHistory.map((system) => (
            <div key={system.category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${system.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${system.icon} text-white text-lg sm:text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-[#0B1F33]">{system.category}</h3>
                  <p className="text-xs sm:text-sm text-[#6B7C8F]">{system.items.length} service{system.items.length !== 1 ? 's' : ''} recorded</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {system.items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#0B1F33] text-xs sm:text-sm truncate">{item.title}</h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] sm:text-xs font-semibold ml-2 flex-shrink-0">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#6B7C8F]">
                        <span><i className="ri-calendar-line mr-1"></i>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {item.contractor && <span><i className="ri-user-line mr-1"></i>{item.contractor}</span>}
                        {item.cost > 0 && <span className="font-semibold text-[#0B1F33]">${item.cost.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Vault View */}
      {view === 'documents' && <DocumentVault searchTerm={searchTerm} />}

      {/* Add Maintenance Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Log Maintenance</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7C8F] mb-4">Record work done by contractors not on the platform, or DIY maintenance.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Title *</label>
                  <input type="text" value={logTitle} onChange={e => setLogTitle(e.target.value)} placeholder="e.g. Annual HVAC Maintenance" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Category *</label>
                    <select value={logCategory} onChange={e => setLogCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent">
                      <option value="">Select...</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Roofing">Roofing</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Painting">Painting</option>
                      <option value="Landscaping">Landscaping</option>
                      <option value="Pool">Pool</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Interior">Interior</option>
                      <option value="Safety">Safety</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Date</label>
                    <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Contractor / Provider</label>
                    <input type="text" value={logContractor} onChange={e => setLogContractor(e.target.value)} placeholder="e.g. CoolAir Services" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Cost ($)</label>
                    <input type="number" value={logCost} onChange={e => setLogCost(e.target.value)} placeholder="285" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Notes</label>
                  <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} rows={3} placeholder="What was done..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm">Cancel</button>
                <button onClick={handleAddLog} disabled={saving || !logTitle || !logCategory} className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

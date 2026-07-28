
import { useState, useMemo } from 'react';

interface Trade {
  id: number;
  tradeName: string;
  contractor: string;
  contractorEmail: string;
  status: 'Complete' | 'In Progress' | 'Ready to Start' | 'Requires Approval' | 'Blocked';
  startDate: string;
  endDate: string;
  progress: number;
  cost: string;
  dependencies: string[];
  materials: Array<{
    name: string;
    needed: string;
    ordered: string;
    status: 'delivered' | 'in-transit' | 'pending';
    cost: string;
    shared?: boolean;
  }>;
  unreadMessages: number;
  isMyTrade?: boolean;
}

interface TradeCoordinationProps {
  trades: Trade[];
  jobTitle: string;
  myTradeRole?: string;
}

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

const daysBetween = (a: Date, b: Date): number => {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};

const formatShortDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TradeCoordination({ trades, jobTitle: _jobTitle, myTradeRole: _myTradeRole }: TradeCoordinationProps) {
  const [viewMode, setViewMode] = useState<'gantt' | 'list' | 'dependencies'>('gantt');
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Gantt calculations
  const ganttData = useMemo(() => {
    const allDates = trades.flatMap(t => [parseDate(t.startDate), parseDate(t.endDate)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const totalDays = daysBetween(minDate, maxDate) + 1;

    // Generate week markers
    const weeks: Array<{ label: string; startPct: number; widthPct: number }> = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > maxDate) weekEnd.setTime(maxDate.getTime());
      const startPct = (daysBetween(minDate, weekStart) / totalDays) * 100;
      const widthPct = ((daysBetween(weekStart, weekEnd) + 1) / totalDays) * 100;
      weeks.push({
        label: formatShortDate(weekStart.toISOString()),
        startPct,
        widthPct,
      });
      current.setDate(current.getDate() + 7);
    }

    // Today marker
    const today = new Date();
    let todayPct: number | null = null;
    if (today >= minDate && today <= maxDate) {
      todayPct = (daysBetween(minDate, today) / totalDays) * 100;
    }

    const bars = trades.map(trade => {
      const start = parseDate(trade.startDate);
      const end = parseDate(trade.endDate);
      const leftPct = (daysBetween(minDate, start) / totalDays) * 100;
      const widthPct = ((daysBetween(start, end) + 1) / totalDays) * 100;
      const progressWidthPct = widthPct * (trade.progress / 100);
      return {
        ...trade,
        leftPct,
        widthPct,
        progressWidthPct,
        durationDays: daysBetween(start, end) + 1,
      };
    });

    return { weeks, bars, todayPct, totalDays, minDate, maxDate };
  }, [trades]);

  const filteredTrades = filterStatus === 'all' ? trades : trades.filter(t => t.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'In Progress': return { bg: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' };
      case 'Ready to Start': return { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
      case 'Blocked': return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-400', light: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const getBarGradient = (status: string, isMyTrade?: boolean) => {
    if (isMyTrade) return 'bg-gradient-to-r from-teal-500 to-teal-400';
    switch (status) {
      case 'Complete': return 'bg-gradient-to-r from-green-500 to-green-400';
      case 'In Progress': return 'bg-gradient-to-r from-[#0B1F33] to-[#1a3a52]';
      case 'Ready to Start': return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case 'Blocked': return 'bg-gradient-to-r from-red-400 to-red-300';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-300';
    }
  };

  const getBarTrack = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-200';
      case 'In Progress': return 'bg-[#0B1F33]/20';
      case 'Ready to Start': return 'bg-amber-200';
      case 'Blocked': return 'bg-red-200';
      default: return 'bg-gray-200';
    }
  };

  // Stats
  const completedTrades = trades.filter(t => t.status === 'Complete').length;
  const inProgressTrades = trades.filter(t => t.status === 'In Progress').length;
  const blockedTrades = trades.filter(t => t.status === 'Blocked').length;
  const totalCost = trades.reduce((s, t) => s + parseFloat(t.cost.replace(/[$,]/g, '')), 0);
  const overallProgress = trades.length > 0 ? Math.round(trades.reduce((s, t) => s + t.progress, 0) / trades.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0B1F33] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-team-line text-[#D4B483]"></i>
            <span className="text-xs text-white/70">Trades</span>
          </div>
          <p className="text-2xl font-bold">{trades.length}</p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="text-xs text-white/60 mt-1">{overallProgress}% overall</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-[#6B7C8F]">Complete</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]">{completedTrades}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            <span className="text-xs text-[#6B7C8F]">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]">{inProgressTrades}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-[#6B7C8F]">Blocked</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]">{blockedTrades}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-money-dollar-circle-line text-[#D4B483]"></i>
            <span className="text-xs text-[#6B7C8F]">Total Cost</span>
          </div>
          <p className="text-xl font-bold text-[#0B1F33]">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { id: 'gantt', label: 'Gantt Chart', icon: 'ri-bar-chart-horizontal-line' },
            { id: 'list', label: 'List View', icon: 'ri-list-check-2' },
            { id: 'dependencies', label: 'Dependencies', icon: 'ri-git-merge-line' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                viewMode === v.id ? 'bg-[#0B1F33] text-white' : 'bg-white border border-gray-200 text-[#6B7C8F] hover:bg-[#F9F9FB]'
              }`}
            >
              <i className={`${v.icon} text-base`}></i>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all', 'Complete', 'In Progress', 'Ready to Start', 'Blocked'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterStatus === s ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ===== GANTT VIEW ===== */}
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="ri-bar-chart-horizontal-line text-[#0B1F33] text-lg"></i>
              <h3 className="font-bold text-[#0B1F33] text-base">Project Gantt Chart</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#6B7C8F]">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div>Complete</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-teal-500"></div>Your Work</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#0B1F33]"></div>In Progress</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500"></div>Ready</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400"></div>Blocked</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Week Headers */}
              <div className="flex border-b border-gray-100">
                <div className="w-64 flex-shrink-0 px-4 py-3 bg-[#F9F9FB] border-r border-gray-100">
                  <span className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Trade / Contractor</span>
                </div>
                <div className="flex-1 relative">
                  <div className="flex h-full">
                    {ganttData.weeks.map((week, i) => (
                      <div
                        key={i}
                        className="border-r border-gray-100 px-2 py-3 flex-shrink-0"
                        style={{ width: `${week.widthPct}%` }}
                      >
                        <span className="text-xs font-semibold text-[#6B7C8F]">{week.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gantt Rows */}
              {filteredTrades.map((trade) => {
                const bar = ganttData.bars.find(b => b.id === trade.id);
                if (!bar) return null;
                const statusColor = getStatusColor(trade.status);
                const isHovered = hoveredTrade === trade.id;

                return (
                  <div
                    key={trade.id}
                    className={`flex border-b border-gray-50 transition-colors ${isHovered ? 'bg-[#F9F9FB]' : ''} ${trade.isMyTrade ? 'bg-teal-50/30' : ''}`}
                    onMouseEnter={() => setHoveredTrade(trade.id)}
                    onMouseLeave={() => setHoveredTrade(null)}
                  >
                    {/* Trade Info */}
                    <div
                      className="w-64 flex-shrink-0 px-4 py-3 border-r border-gray-100 cursor-pointer hover:bg-[#F9F9FB] transition-colors"
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColor.light}`}>
                          {trade.status === 'Complete' ? (
                            <i className="ri-check-line text-green-600 text-sm"></i>
                          ) : trade.status === 'Blocked' ? (
                            <i className="ri-lock-line text-red-500 text-sm"></i>
                          ) : (
                            <span className={`text-xs font-bold ${statusColor.text}`}>{trade.id}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-[#0B1F33] truncate">{trade.tradeName}</p>
                            {trade.isMyTrade && (
                              <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[9px] font-bold rounded-full flex-shrink-0">YOU</span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7C8F] truncate">{trade.contractor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar */}
                    <div className="flex-1 relative py-3 px-2">
                      {/* Background track */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-9 rounded-lg ${getBarTrack(trade.status)} transition-all`}
                        style={{ left: `${bar.leftPct}%`, width: `${bar.widthPct}%` }}
                      ></div>

                      {/* Progress fill */}
                      {trade.progress > 0 && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-9 rounded-lg ${getBarGradient(trade.status, trade.isMyTrade)} transition-all shadow-sm`}
                          style={{
                            left: `${bar.leftPct}%`,
                            width: `${bar.progressWidthPct}%`,
                            borderTopRightRadius: trade.progress >= 100 ? '' : '0',
                            borderBottomRightRadius: trade.progress >= 100 ? '' : '0',
                          }}
                        >
                          <div className="flex items-center h-full px-2.5 gap-1.5 overflow-hidden">
                            <span className="text-white text-xs font-bold whitespace-nowrap truncate">
                              {trade.tradeName}
                            </span>
                            <span className="text-white/80 text-[10px] font-semibold whitespace-nowrap ml-auto">
                              {trade.progress}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Zero progress label */}
                      {trade.progress === 0 && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-9 flex items-center px-2.5"
                          style={{ left: `${bar.leftPct}%`, width: `${bar.widthPct}%` }}
                        >
                          <span className={`text-xs font-bold whitespace-nowrap truncate ${statusColor.text}`}>
                            {trade.tradeName}
                          </span>
                          <span className={`text-[10px] font-semibold whitespace-nowrap ml-auto ${statusColor.text}`}>
                            {bar.durationDays}d
                          </span>
                        </div>
                      )}

                      {/* Today marker */}
                      {ganttData.todayPct !== null && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                          style={{ left: `${ganttData.todayPct}%` }}
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
                        </div>
                      )}

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div
                          className="absolute z-20 bg-[#0B1F33] text-white rounded-lg px-3 py-2 shadow-xl pointer-events-none"
                          style={{
                            left: `${Math.min(bar.leftPct + bar.widthPct / 2, 80)}%`,
                            top: '-8px',
                            transform: 'translateX(-50%) translateY(-100%)',
                          }}
                        >
                          <p className="text-xs font-bold whitespace-nowrap">{trade.tradeName} — {trade.contractor}</p>
                          <p className="text-[10px] text-white/70 whitespace-nowrap">
                            {formatShortDate(trade.startDate)} – {formatShortDate(trade.endDate)} &bull; {trade.progress}% &bull; {trade.cost}
                          </p>
                          {trade.dependencies.length > 0 && (
                            <p className="text-[10px] text-amber-300 whitespace-nowrap mt-0.5">
                              <i className="ri-git-merge-line mr-1"></i>After: {trade.dependencies.join(', ')}
                            </p>
                          )}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0B1F33]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today Legend */}
          {ganttData.todayPct !== null && (
            <div className="px-4 py-2 border-t border-gray-100 bg-[#F9F9FB] flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-400"></div>
              <span className="text-xs text-[#6B7C8F]">Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
            </div>
          )}
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTrades.map((trade) => {
            const statusColor = getStatusColor(trade.status);
            return (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:shadow-md transition-all ${
                  trade.isMyTrade ? `border-teal-200 bg-teal-50/20` : `${statusColor.border}`
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColor.light}`}>
                    {trade.status === 'Complete' ? (
                      <i className="ri-check-double-line text-green-600 text-xl"></i>
                    ) : trade.status === 'Blocked' ? (
                      <i className="ri-lock-line text-red-500 text-xl"></i>
                    ) : (
                      <span className={`text-lg font-bold ${statusColor.text}`}>{trade.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-[#0B1F33] text-base">{trade.tradeName}</h4>
                      {trade.isMyTrade && (
                        <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">Your Work</span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.light} ${statusColor.text}`}>
                        {trade.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7C8F] mb-3">{trade.contractor}</p>
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#6B7C8F]">Start</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{formatShortDate(trade.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F]">End</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{formatShortDate(trade.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F]">Cost</p>
                        <p className="text-sm font-bold text-[#0B1F33]">{trade.cost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F]">Materials</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{trade.materials.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${statusColor.bg}`} style={{ width: `${trade.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-[#0B1F33]">{trade.progress}%</span>
                    </div>
                    {trade.dependencies.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <i className="ri-git-merge-line text-[#6B7C8F] text-xs"></i>
                        <span className="text-xs text-[#6B7C8F]">Depends on: {trade.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== DEPENDENCIES VIEW ===== */}
      {viewMode === 'dependencies' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <i className="ri-git-merge-line text-[#0B1F33] text-lg"></i>
            <h3 className="font-bold text-[#0B1F33] text-base">Dependency Chain</h3>
          </div>

          <div className="relative">
            {trades.map((trade, index) => {
              const statusColor = getStatusColor(trade.status);
              return (
                <div key={trade.id} className="flex gap-4 mb-0">
                  {/* Vertical line */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: '40px' }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${statusColor.bg} ring-4 ring-white shadow-sm`}>
                      {trade.status === 'Complete' ? (
                        <i className="ri-check-line text-white text-sm"></i>
                      ) : trade.status === 'Blocked' ? (
                        <i className="ri-lock-line text-white text-sm"></i>
                      ) : trade.status === 'In Progress' ? (
                        <i className="ri-loader-4-line text-white text-sm animate-spin"></i>
                      ) : (
                        <span className="text-white text-xs font-bold">{trade.id}</span>
                      )}
                    </div>
                    {index < trades.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[20px] ${trade.status === 'Complete' ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                    )}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 pb-5 ${index < trades.length - 1 ? '' : ''}`}>
                    <div
                      className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all ${
                        trade.isMyTrade ? 'border-teal-300 bg-teal-50/30' :
                        trade.status === 'Complete' ? 'border-green-200 bg-green-50/30' :
                        trade.status === 'In Progress' ? 'border-[#0B1F33]/20 bg-[#0B1F33]/5' :
                        trade.status === 'Blocked' ? 'border-red-200 bg-red-50/30' :
                        'border-gray-200 bg-gray-50/30'
                      }`}
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#0B1F33] text-sm">{trade.tradeName}</h4>
                            {trade.isMyTrade && (
                              <span className="px-2 py-0.5 bg-teal-500 text-white text-[10px] font-bold rounded-full">YOUR WORK</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor.light} ${statusColor.text}`}>
                              {trade.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7C8F] mt-0.5">{trade.contractor}</p>
                        </div>
                        <span className="font-bold text-[#0B1F33] text-sm">{trade.cost}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-[#6B7C8F]">
                          <i className="ri-calendar-line mr-1"></i>
                          {formatShortDate(trade.startDate)} – {formatShortDate(trade.endDate)}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${statusColor.bg}`} style={{ width: `${trade.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-[#0B1F33]">{trade.progress}%</span>
                      </div>

                      {/* Dependencies */}
                      {trade.dependencies.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <i className="ri-arrow-left-up-line text-amber-500 text-sm"></i>
                          <span className="text-xs text-[#6B7C8F]">Requires:</span>
                          {trade.dependencies.map(dep => {
                            const depTrade = trades.find(t => t.tradeName === dep);
                            const depColor = depTrade ? getStatusColor(depTrade.status) : getStatusColor('');
                            return (
                              <span key={dep} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${depColor.light} ${depColor.text}`}>
                                {dep} {depTrade?.status === 'Complete' ? '✓' : depTrade?.status === 'In Progress' ? '⟳' : ''}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* What this unlocks */}
                      {trades.some(t => t.dependencies.includes(trade.tradeName)) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <i className="ri-arrow-right-down-line text-teal-500 text-sm"></i>
                          <span className="text-xs text-[#6B7C8F]">Unlocks:</span>
                          {trades.filter(t => t.dependencies.includes(trade.tradeName)).map(t => (
                            <span key={t.id} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F9F9FB] text-[#0B1F33]">
                              {t.tradeName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Path Alert */}
      {blockedTrades > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-alarm-warning-line text-red-600 text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-red-900">
              {blockedTrades} trade{blockedTrades > 1 ? 's' : ''} currently blocked
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              {trades.filter(t => t.status === 'Blocked').map(t => t.tradeName).join(', ')} — waiting on upstream dependencies to complete before work can begin.
            </p>
          </div>
        </div>
      )}

      {/* Material Coordination */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="ri-box-3-line text-[#D4B483] text-lg"></i>
            <h3 className="font-bold text-[#0B1F33] text-sm">Shared Materials Tracker</h3>
          </div>
        </div>
        <div className="space-y-2">
          {trades.flatMap(t => t.materials.filter(m => m.shared).map(m => ({ ...m, tradeName: t.tradeName }))).length > 0 ? (
            trades.flatMap(t => t.materials.filter(m => m.shared).map(m => ({ ...m, tradeName: t.tradeName }))).map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#D4B483]/20 text-[#D4B483] text-xs font-semibold rounded-full">Shared</span>
                  <span className="text-sm font-semibold text-[#0B1F33]">{m.name}</span>
                  <span className="text-xs text-[#6B7C8F]">({m.tradeName})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7C8F]">{m.needed}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    m.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    m.status === 'in-transit' ? 'bg-teal-100 text-teal-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{m.status}</span>
                  <span className="text-xs font-bold text-[#0B1F33]">{m.cost}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-[#6B7C8F]">
              <i className="ri-checkbox-circle-line text-2xl mb-2 block text-green-400"></i>
              <p className="text-xs">No shared materials requiring coordination</p>
            </div>
          )}
        </div>
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTrade(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-[#0B1F33]">{selectedTrade.tradeName}</h3>
                    {selectedTrade.isMyTrade && (
                      <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">Your Work</span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7C8F]">{selectedTrade.contractor}</p>
                  <p className="text-xs text-[#6B7C8F] mt-0.5">{selectedTrade.contractorEmail}</p>
                </div>
                <button onClick={() => setSelectedTrade(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                  <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Status & Progress */}
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedTrade.status).light} ${getStatusColor(selectedTrade.status).text}`}>
                  {selectedTrade.status}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${getStatusColor(selectedTrade.status).bg}`} style={{ width: `${selectedTrade.progress}%` }}></div>
                </div>
                <span className="text-sm font-bold text-[#0B1F33]">{selectedTrade.progress}%</span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <p className="text-xs text-[#6B7C8F] mb-1">Start Date</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{formatShortDate(selectedTrade.startDate)}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <p className="text-xs text-[#6B7C8F] mb-1">End Date</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{formatShortDate(selectedTrade.endDate)}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <p className="text-xs text-[#6B7C8F] mb-1">Cost</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{selectedTrade.cost}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <p className="text-xs text-[#6B7C8F] mb-1">Materials</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{selectedTrade.materials.length} items</p>
                </div>
              </div>

              {/* Dependencies */}
              {selectedTrade.dependencies.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-2">Dependencies</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrade.dependencies.map(dep => {
                      const depTrade = trades.find(t => t.tradeName === dep);
                      const depColor = depTrade ? getStatusColor(depTrade.status) : getStatusColor('');
                      return (
                        <div key={dep} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${depColor.border} ${depColor.light}`}>
                          {depTrade?.status === 'Complete' && <i className="ri-check-line text-green-600 text-sm"></i>}
                          {depTrade?.status === 'In Progress' && <i className="ri-loader-4-line text-teal-600 text-sm animate-spin"></i>}
                          <span className={`text-xs font-semibold ${depColor.text}`}>{dep}</span>
                          <span className={`text-[10px] ${depColor.text}`}>{depTrade?.progress}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Materials */}
              <div>
                <p className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-2">Materials ({selectedTrade.materials.length})</p>
                <div className="space-y-2">
                  {selectedTrade.materials.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#0B1F33] font-medium">{m.name}</span>
                        {m.shared && <span className="px-1.5 py-0.5 bg-[#D4B483]/20 text-[#D4B483] text-[10px] font-bold rounded">SHARED</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#6B7C8F]">{m.needed}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          m.status === 'in-transit' ? 'bg-teal-100 text-teal-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{m.status}</span>
                        <span className="text-xs font-bold text-[#0B1F33]">{m.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              {!selectedTrade.isMyTrade && (
                <button
                  onClick={() => { setSelectedTrade(null); showToast(`Message sent to ${selectedTrade.contractor}`); }}
                  className="flex-1 px-4 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-message-3-line"></i>
                  Message Contractor
                </button>
              )}
              <button
                onClick={() => setSelectedTrade(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-lg">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-white text-lg"></i>
          </div>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

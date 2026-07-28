export default function ProjectTimelineModal({ show, onClose, trades, jobTitle }: {
  show: boolean;
  onClose: () => void;
  trades: Array<{ id: number; tradeName: string; contractor: string; status: string; startDate: string; endDate: string; progress: number; cost: string; dependencies: string[]; isMyTrade?: boolean }>;
  jobTitle: string;
}) {
  if (!show) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return 'ri-check-double-line text-green-600';
      case 'In Progress': return 'ri-loader-4-line text-[#00B8A9]';
      case 'Ready to Start': return 'ri-time-line text-[#D4B483]';
      case 'Blocked': return 'ri-lock-line text-red-500';
      default: return 'ri-time-line text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'In Progress': return 'bg-[#00B8A9]';
      case 'Ready to Start': return 'bg-[#D4B483]';
      case 'Blocked': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Project Timeline</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle} &bull; Jan 20 – Feb 15, 2025</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {['Complete', 'In Progress', 'Ready to Start', 'Blocked'].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusBg(s)}`}></div>
                <span className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {trades.map((trade, index) => (
              <div key={trade.id} className="flex gap-4 mb-0">
                {/* Timeline Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trade.status === 'Complete' ? 'bg-green-100' :
                    trade.status === 'In Progress' ? 'bg-[#00B8A9]/20' :
                    trade.status === 'Ready to Start' ? 'bg-[#D4B483]/20' :
                    'bg-red-100'
                  }`}>
                    <i className={`${getStatusIcon(trade.status)} text-lg`}></i>
                  </div>
                  {index < trades.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[40px] ${
                      trade.status === 'Complete' ? 'bg-green-300' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-6 ${index < trades.length - 1 ? '' : ''}`}>
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    trade.isMyTrade ? 'border-[#00B8A9]/40 bg-[#00B8A9]/5' :
                    trade.status === 'Complete' ? 'border-green-200 bg-green-50/50' :
                    trade.status === 'In Progress' ? 'border-[#0B1F33]/20 bg-[#0B1F33]/5' :
                    'border-gray-200 bg-gray-50/50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{trade.tradeName}</p>
                          {trade.isMyTrade && (
                            <span className="px-2 py-0.5 bg-[#00B8A9] text-white text-xs font-semibold rounded-full">Your Work</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{trade.contractor}</p>
                      </div>
                      <span className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{trade.cost}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <i className="ri-calendar-line"></i>
                        {trade.startDate} – {trade.endDate}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        trade.status === 'Complete' ? 'bg-green-100 text-green-700' :
                        trade.status === 'In Progress' ? 'bg-[#0B1F33]/10 text-[#0B1F33]' :
                        trade.status === 'Ready to Start' ? 'bg-[#D4B483]/10 text-[#D4B483]' :
                        'bg-red-100 text-red-700'
                      }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{trade.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${getStatusBg(trade.status)}`} style={{ width: `${trade.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{trade.progress}%</span>
                    </div>

                    {trade.dependencies.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <i className="ri-git-merge-line text-gray-400 text-xs"></i>
                        <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          After: {trade.dependencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

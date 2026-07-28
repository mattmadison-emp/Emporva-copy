import { useState } from 'react';

export default function TradeScopesModal({ show, onClose, trades, jobTitle }: {
  show: boolean;
  onClose: () => void;
  trades: Array<{ id: number; tradeName: string; contractor: string; status: string; startDate: string; endDate: string; progress: number; cost: string; dependencies: string[]; materials: Array<{ name: string; needed: string; cost: string; status: string; shared?: boolean }> }>;
  jobTitle: string;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!show) return null;

  const totalCost = trades.reduce((sum, t) => sum + parseFloat(t.cost.replace(/[$,]/g, '')), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>All Trade Scopes</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle} &bull; {trades.length} trades &bull; Total: ${totalCost.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {trades.map(trade => (
            <div key={trade.id} className={`border-2 rounded-xl overflow-hidden transition-all ${
              trade.status === 'Complete' ? 'border-green-200' :
              trade.status === 'In Progress' ? 'border-[#00B8A9]/30' :
              trade.status === 'Ready to Start' ? 'border-[#D4B483]/30' :
              'border-gray-200'
            }`}>
              <button
                onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                className="w-full p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  trade.status === 'Complete' ? 'bg-green-100 text-green-700' :
                  trade.status === 'In Progress' ? 'bg-[#00B8A9]/20 text-[#00B8A9]' :
                  trade.status === 'Ready to Start' ? 'bg-[#D4B483]/20 text-[#D4B483]' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {trade.status === 'Complete' ? <i className="ri-check-line"></i> : trade.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{trade.tradeName}</p>
                    {trade.contractor.includes('You') && (
                      <span className="px-2 py-0.5 bg-[#00B8A9]/20 text-[#00B8A9] text-xs font-semibold rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{trade.contractor}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{trade.cost}</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{trade.startDate} – {trade.endDate}</p>
                </div>
                <i className={`ri-arrow-${expandedId === trade.id ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </button>

              {expandedId === trade.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      trade.status === 'Complete' ? 'bg-green-100 text-green-700 border-green-200' :
                      trade.status === 'In Progress' ? 'bg-[#00B8A9]/20 text-[#00B8A9]' :
                      trade.status === 'Ready to Start' ? 'bg-[#D4B483]/20 text-[#D4B483]' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{trade.status}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#00B8A9] h-2 rounded-full transition-all" style={{ width: `${trade.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-[#00B8A9]">{trade.progress}%</span>
                  </div>

                  {trade.dependencies.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Depends on:</span>
                      {trade.dependencies.map(d => (
                        <span key={d} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">{d}</span>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>MATERIALS ({trade.materials.length})</p>
                    <div className="space-y-1">
                      {trade.materials.map((m, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#2D2A74] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{m.name}</span>
                            {m.shared && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-md font-semibold">Shared</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{m.needed}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              m.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              m.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{m.status}</span>
                            <span className="text-xs font-semibold text-[#2D2A74]">{m.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

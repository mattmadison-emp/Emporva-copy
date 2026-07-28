import { useState } from 'react';

export default function MessageTradesModal({ show, onClose, onSubmit, trades, jobTitle }: {
  show: boolean;
  onClose: () => void;
  onSubmit: (tradeName: string) => void;
  trades: Array<{ id: number; tradeName: string; contractor: string; contractorEmail: string; status: string; isMyTrade?: boolean }>;
  jobTitle?: string;
}) {
  const [selectedTrade, setSelectedTrade] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const otherTrades = trades.filter(t => !t.isMyTrade);

  const quickMessages = [
    'When do you expect to start your phase?',
    'Are your materials ordered and on schedule?',
    'I left the work area prepped for your team.',
    'Can we coordinate on the shared materials?',
  ];

  const handleSubmit = () => {
    const trade = trades.find(t => t.id === selectedTrade);
    if (!trade || !message.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(trade.contractor);
      setSubmitting(false);
      setSelectedTrade(null); setMessage('');
    }, 800);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Message Other Trades</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle || 'Multi-Trade Project'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SELECT TRADE *</label>
            <div className="space-y-2">
              {otherTrades.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrade(t.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedTrade === t.id ? 'border-[#00B8A9] bg-[#00B8A9]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-line text-purple-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{t.contractor}</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{t.tradeName} &bull; {t.contractorEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                    t.status === 'Complete' ? 'bg-green-100 text-green-700 border-green-200' :
                    t.status === 'In Progress' ? 'bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20' :
                    t.status === 'Ready to Start' ? 'bg-[#D4B483]/10 text-[#D4B483] border-[#D4B483]/20' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.status}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedTrade && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>QUICK MESSAGES</label>
                <div className="flex flex-wrap gap-2">
                  {quickMessages.map((qm, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(qm)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {qm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>MESSAGE *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{message.length}/500</div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTrade || !message.trim() || submitting}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
            ) : (
              <><i className="ri-send-plane-line"></i> Send Message</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

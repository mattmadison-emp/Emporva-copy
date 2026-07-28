import { useState } from 'react';

export default function ChangeOrderModal({ show, onClose, onSubmit, jobTitle, homeowner }: {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  jobTitle: string;
  homeowner: string;
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [costImpact, setCostImpact] = useState<'increase' | 'decrease' | 'none'>('increase');
  const [amount, setAmount] = useState('');
  const [timeImpact, setTimeImpact] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Unforeseen site conditions',
    'Material substitution needed',
    'Scope expansion requested',
    'Code compliance requirement',
    'Design modification',
    'Weather-related delay',
    'Other'
  ];

  const handleSubmit = () => {
    if (!reason || !description.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit();
      setSubmitting(false);
      setReason(''); setDescription(''); setCostImpact('increase'); setAmount(''); setTimeImpact(''); setPriority('medium');
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Request Change Order</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle} &bull; Sent to {homeowner}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>REASON FOR CHANGE *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] cursor-pointer bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Select a reason...</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>DESCRIPTION *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Describe the change needed and why it's necessary..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{description.length}/500</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>COST IMPACT</label>
            <div className="flex gap-2">
              {[
                { id: 'increase' as const, label: 'Increase', icon: 'ri-arrow-up-line', color: 'red' },
                { id: 'decrease' as const, label: 'Decrease', icon: 'ri-arrow-down-line', color: 'green' },
                { id: 'none' as const, label: 'No Change', icon: 'ri-equal-line', color: 'gray' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCostImpact(c.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    costImpact === c.id
                      ? c.color === 'red' ? 'border-red-500 bg-red-50 text-red-700' :
                        c.color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                        'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className={c.icon}></i>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {costImpact !== 'none' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                AMOUNT ({costImpact === 'increase' ? '+' : '-'})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>TIMELINE IMPACT (DAYS)</label>
            <input
              type="text"
              value={timeImpact}
              onChange={e => setTimeImpact(e.target.value)}
              placeholder="e.g., +3 days, no change"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>PRIORITY</label>
            <div className="flex gap-2">
              {[
                { id: 'low' as const, label: 'Low', color: 'green' },
                { id: 'medium' as const, label: 'Medium', color: 'yellow' },
                { id: 'high' as const, label: 'High', color: 'orange' },
                { id: 'critical' as const, label: 'Critical', color: 'red' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    priority === p.id
                      ? p.color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                        p.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                        p.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                        'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-lg p-3 flex items-start gap-2">
            <i className="ri-information-line text-[#D4B483] text-lg mt-0.5"></i>
            <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
              The homeowner will receive this change order for review and approval. Work should not proceed on changed items until approved.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || !description.trim() || submitting}
            className="flex-1 px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c5a574] transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
            ) : (
              <><i className="ri-send-plane-line"></i> Send Change Order</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

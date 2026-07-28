import { useState } from 'react';

export default function ReportIssueModal({ show, onClose, onSubmit, jobTitle, trades }: {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  jobTitle: string;
  trades: Array<{ id: number; tradeName: string; contractor: string }>;
}) {
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [relatedTrade, setRelatedTrade] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    'Safety hazard',
    'Material defect',
    'Work quality concern',
    'Schedule conflict',
    'Scope overlap',
    'Communication breakdown',
    'Access/site issue',
    'Other'
  ];

  const handleSubmit = () => {
    if (!issueType || !description.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit();
      setSubmitting(false);
      setIssueType(''); setSeverity('medium'); setRelatedTrade(''); setDescription('');
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Report Issue / Concern</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>ISSUE TYPE *</label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] cursor-pointer bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Select issue type...</option>
              {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SEVERITY *</label>
            <div className="flex gap-2">
              {[
                { id: 'low' as const, label: 'Low', color: 'green' },
                { id: 'medium' as const, label: 'Medium', color: 'yellow' },
                { id: 'high' as const, label: 'High', color: 'orange' },
                { id: 'critical' as const, label: 'Critical', color: 'red' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSeverity(s.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    severity === s.id
                      ? s.color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                        s.color === 'yellow' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                        s.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                        'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>RELATED TRADE (OPTIONAL)</label>
            <select
              value={relatedTrade}
              onChange={e => setRelatedTrade(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] cursor-pointer bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Not specific to a trade</option>
              {trades.map(t => <option key={t.id} value={t.tradeName}>{t.tradeName} — {t.contractor}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>DESCRIPTION *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Describe the issue in detail, including what you observed and any potential impact..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{description.length}/500</div>
          </div>

          {severity === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <i className="ri-alarm-warning-line text-red-600 text-lg mt-0.5"></i>
              <p className="text-xs text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>Critical issues</strong> will immediately notify the project manager and all affected trades. If this is a safety emergency, please also call 911.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!issueType || !description.trim() || submitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Submitting...</>
            ) : (
              <><i className="ri-alert-line"></i> Submit Report</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function MilestoneCompleteModal({ show, onClose, onSubmit, milestones, jobTitle }: {
  show: boolean;
  onClose: () => void;
  onSubmit: (milestoneName: string) => void;
  milestones: Array<{ id: number; title: string; status: string; date: string; payment: string }>;
  jobTitle: string;
}) {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [confirmChecks, setConfirmChecks] = useState({ quality: false, cleanup: false, photos: false });
  const [submitting, setSubmitting] = useState(false);

  const activeMilestones = milestones.filter(m => m.status !== 'completed');

  const handleSubmit = () => {
    const ms = milestones.find(m => m.id === selectedMilestone);
    if (!ms || !confirmChecks.quality || !confirmChecks.cleanup) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(ms.title);
      setSubmitting(false);
      setSelectedMilestone(null); setCompletionNotes(''); setConfirmChecks({ quality: false, cleanup: false, photos: false });
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Mark Milestone Complete</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Progress Overview */}
          <div className="flex items-center gap-3 mb-2">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  m.status === 'completed' ? 'bg-green-500 text-white' :
                  m.status === 'in-progress' ? 'bg-[#00B8A9] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {m.status === 'completed' ? <i className="ri-check-line"></i> : i + 1}
                </div>
                {i < milestones.length - 1 && (
                  <div className={`flex-1 h-0.5 ${m.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SELECT MILESTONE *</label>
            <div className="space-y-2">
              {activeMilestones.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMilestone(m.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                    selectedMilestone === m.id
                      ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Due: {m.date} &bull; {m.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#00B8A9] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.payment}</p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Payment</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMilestone && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>COMPLETION NOTES (OPTIONAL)</label>
                <textarea
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value.slice(0, 500))}
                  placeholder="Any notes about the completed work..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{completionNotes.length}/500</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>COMPLETION CHECKLIST</label>
                <div className="space-y-2">
                  {[
                    { key: 'quality' as const, label: 'Quality check completed', required: true },
                    { key: 'cleanup' as const, label: 'Work area cleaned up', required: true },
                    { key: 'photos' as const, label: 'Progress photos uploaded', required: false },
                  ].map(check => (
                    <label key={check.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={confirmChecks[check.key]}
                        onChange={e => setConfirmChecks(prev => ({ ...prev, [check.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#00B8A9] cursor-pointer"
                      />
                      <span className="text-sm text-[#2D2A74]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {check.label} {check.required && <span className="text-red-400">*</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <i className="ri-money-dollar-circle-line text-green-600 text-lg mt-0.5"></i>
                <p className="text-xs text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Completing this milestone will trigger a payment release of <strong>{milestones.find(m => m.id === selectedMilestone)?.payment}</strong> after homeowner confirmation.
                </p>
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
            disabled={!selectedMilestone || !confirmChecks.quality || !confirmChecks.cleanup || submitting}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Completing...</>
            ) : (
              <><i className="ri-check-double-line"></i> Mark Complete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

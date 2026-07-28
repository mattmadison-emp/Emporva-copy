import { useState } from 'react';

export default function MarkJobCompleteModal({ show, onClose, onSubmit, jobTitle, homeowner, isMultiTrade, myTradeRole, confirmedQuote, milestones }: {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  jobTitle: string;
  homeowner: string;
  isMultiTrade?: boolean;
  myTradeRole?: string;
  confirmedQuote: string;
  milestones: Array<{ id: number; title: string; status: string; date: string; payment: string }>;
}) {
  const [step, setStep] = useState(1);
  const [checklist, setChecklist] = useState({
    allWork: false,
    quality: false,
    cleanup: false,
    photos: false,
    materials: false,
  });
  const [requestPayment, setRequestPayment] = useState(true);
  const [scheduleWalkthrough, setScheduleWalkthrough] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allChecklistComplete = checklist.allWork && checklist.quality && checklist.cleanup && checklist.photos && checklist.materials;

  const handleSubmit = () => {
    if (!allChecklistComplete) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit();
      setSubmitting(false);
      setStep(1);
      setChecklist({ allWork: false, quality: false, cleanup: false, photos: false, materials: false });
      setRequestPayment(true);
      setScheduleWalkthrough(false);
      setFinalNotes('');
    }, 2000);
  };

  if (!show) return null;

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {isMultiTrade ? `Mark ${myTradeRole} Work Complete` : 'Mark Job Complete'}
              </h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle} &bull; {homeowner}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg transition-all ${
                  step === s ? 'bg-[#00B8A9]/10 border-2 border-[#00B8A9]' :
                  step > s ? 'bg-green-50 border-2 border-green-200' :
                  'bg-gray-50 border-2 border-gray-200'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step === s ? 'bg-[#00B8A9] text-white' :
                    step > s ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {step > s ? <i className="ri-check-line"></i> : s}
                  </div>
                  <span className={`text-xs font-semibold ${
                    step >= s ? 'text-[#2D2A74]' : 'text-gray-400'
                  }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {s === 1 ? 'Checklist' : 'Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* Milestone Progress */}
              {!isMultiTrade && (
                <div className="bg-[#00B8A9]/10 border border-[#00B8A9]/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#00B8A9]" style={{ fontFamily: 'Montserrat, sans-serif' }}>MILESTONE PROGRESS</p>
                    <span className="text-sm font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {completedMilestones}/{totalMilestones}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              )}

              {isMultiTrade && (
                <div className="bg-[#00B8A9]/10 border border-[#00B8A9]/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <i className="ri-information-line text-[#00B8A9] text-xl"></i>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#00B8A9] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Multi-Trade Project
                      </p>
                      <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        You're marking your {myTradeRole} work as complete. Other trades will continue their work independently.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Checklist */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>COMPLETION CHECKLIST</label>
                <div className="space-y-2">
                  {[
                    { key: 'allWork' as const, label: 'All work items completed as specified', icon: 'ri-check-double-line' },
                    { key: 'quality' as const, label: 'Quality inspection performed and passed', icon: 'ri-shield-check-line' },
                    { key: 'cleanup' as const, label: 'Work area cleaned and debris removed', icon: 'ri-brush-line' },
                    { key: 'photos' as const, label: 'Final photos uploaded and documented', icon: 'ri-camera-line' },
                    { key: 'materials' as const, label: 'All materials accounted for', icon: 'ri-box-3-line' },
                  ].map(item => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        checklist[item.key] ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={e => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-5 h-5 accent-green-600 cursor-pointer"
                      />
                      <i className={`${item.icon} text-lg ${checklist[item.key] ? 'text-green-600' : 'text-gray-400'}`}></i>
                      <span className={`text-sm flex-1 ${checklist[item.key] ? 'text-green-900 font-semibold' : 'text-[#2D2A74]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.label}
                      </span>
                      {checklist[item.key] && (
                        <i className="ri-check-line text-green-600 text-xl"></i>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-green-50 to-[#00B8A9]/10 border border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-double-line text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#2D2A74] text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {isMultiTrade ? `${myTradeRole} Work Complete` : 'Job Complete'}
                    </p>
                    <p className="text-sm text-[#333645] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isMultiTrade
                        ? `Your ${myTradeRole} scope is finished and ready for final approval.`
                        : 'All work has been completed and is ready for final approval.'
                      }
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Project</p>
                        <p className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{jobTitle}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {isMultiTrade ? 'Your Scope' : 'Total Value'}
                        </p>
                        <p className="font-bold text-green-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {isMultiTrade ? '$3,200' : confirmedQuote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={requestPayment}
                    onChange={e => setRequestPayment(e.target.checked)}
                    className="w-5 h-5 accent-[#00B8A9] cursor-pointer"
                  />
                  <i className="ri-money-dollar-circle-line text-[#00B8A9] text-xl"></i>
                  <div className="flex-1">
                    <p className="font-semibold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Request Final Payment
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isMultiTrade ? 'Request release of your $3,200 payment' : `Request release of remaining balance`}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={scheduleWalkthrough}
                    onChange={e => setScheduleWalkthrough(e.target.checked)}
                    className="w-5 h-5 accent-[#00B8A9] cursor-pointer"
                  />
                  <i className="ri-walk-line text-[#00B8A9] text-xl"></i>
                  <div className="flex-1">
                    <p className="font-semibold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Schedule Final Walkthrough
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Request an in-person inspection with {homeowner}
                    </p>
                  </div>
                </label>
              </div>

              {/* Final Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>FINAL NOTES (OPTIONAL)</label>
                <textarea
                  value={finalNotes}
                  onChange={e => setFinalNotes(e.target.value.slice(0, 500))}
                  placeholder="Any final comments or instructions for the homeowner..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{finalNotes.length}/500</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!allChecklistComplete}
                className="flex-1 px-4 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Next <i className="ri-arrow-right-line"></i>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <i className="ri-arrow-left-line"></i> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {submitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-check-double-line"></i>
                    <span>Submit for Completion</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Processing Animation */}
        {submitting && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="ri-check-double-line text-green-600 text-4xl"></i>
              </div>
              <p className="font-bold text-[#2D2A74] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Processing Completion
              </p>
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Notifying {homeowner} and updating project status...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

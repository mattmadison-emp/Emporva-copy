import { useState } from 'react';

export default function RequestApprovalModal({ show, onClose, onSubmit, jobTitle, homeowner, milestones: _milestones }: {
  show: boolean;
  onClose: () => void;
  onSubmit: (approvalType: string) => void;
  jobTitle: string;
  homeowner: string;
  milestones: Array<{ id: number; title: string; status: string; date: string; payment: string }>;
}) {
  const [step, setStep] = useState(1);
  const [approvalType, setApprovalType] = useState('');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'standard' | 'urgent' | 'critical'>('standard');
  const [submitting, setSubmitting] = useState(false);

  const approvalTypes = [
    { id: 'milestone', label: 'Milestone Completion', icon: 'ri-check-double-line', desc: 'Request approval for completed milestone' },
    { id: 'change-order', label: 'Change Order', icon: 'ri-edit-line', desc: 'Request approval for scope or cost changes' },
    { id: 'material', label: 'Material Substitution', icon: 'ri-swap-line', desc: 'Request approval to use alternative materials' },
    { id: 'timeline', label: 'Timeline Extension', icon: 'ri-calendar-line', desc: 'Request approval for schedule adjustment' },
    { id: 'additional', label: 'Additional Work', icon: 'ri-add-circle-line', desc: 'Request approval for extra work discovered' },
    { id: 'inspection', label: 'Final Inspection', icon: 'ri-eye-line', desc: 'Request final walkthrough and sign-off' },
  ];

  const handleSubmit = () => {
    if (!approvalType || !details.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const type = approvalTypes.find(t => t.id === approvalType)?.label || approvalType;
      onSubmit(type);
      setSubmitting(false);
      setStep(1);
      setApprovalType('');
      setDetails('');
      setAttachments([]);
      setUrgency('standard');
    }, 1500);
  };

  const handleAddAttachment = () => {
    setAttachments(prev => [...prev, `document_${Date.now()}.pdf`]);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Request Approval</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle} &bull; Sent to {homeowner}</p>
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? 'bg-[#00B8A9] text-white' :
                    step > s ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {step > s ? <i className="ri-check-line"></i> : s}
                  </div>
                  <span className={`text-xs font-semibold ${
                    step >= s ? 'text-[#2D2A74]' : 'text-gray-400'
                  }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {s === 1 ? 'Type' : 'Details'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SELECT APPROVAL TYPE</label>
              {approvalTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setApprovalType(type.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                    approvalType === type.id ? 'border-[#00B8A9] bg-[#00B8A9]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    approvalType === type.id ? 'bg-[#00B8A9] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <i className={`${type.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#2D2A74] text-sm mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{type.label}</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{type.desc}</p>
                  </div>
                  {approvalType === type.id && (
                    <i className="ri-check-line text-[#00B8A9] text-xl"></i>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>DETAILS *</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value.slice(0, 500))}
                  placeholder="Describe what you're requesting approval for..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{details.length}/500</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SUPPORTING DOCUMENTS</label>
                <div className="space-y-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <i className="ri-file-line text-gray-400"></i>
                        <span className="text-xs text-[#2D2A74]" style={{ fontFamily: 'Inter, sans-serif' }}>{att}</span>
                      </div>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddAttachment}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#00B8A9] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm text-gray-500"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-attachment-line"></i>
                    Attach Document
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>URGENCY</label>
                <div className="flex gap-2">
                  {[
                    { id: 'standard' as const, label: 'Standard', icon: 'ri-time-line', color: 'gray' },
                    { id: 'urgent' as const, label: 'Urgent', icon: 'ri-speed-line', color: 'orange' },
                    { id: 'critical' as const, label: 'Critical', icon: 'ri-alarm-warning-line', color: 'red' },
                  ].map(u => (
                    <button
                      key={u.id}
                      onClick={() => setUrgency(u.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        urgency === u.id
                          ? u.color === 'gray' ? 'border-gray-600 bg-gray-50 text-gray-700' :
                            u.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                            'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className={u.icon}></i>
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#0B1F33] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>HOMEOWNER WILL SEE:</p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00B8A9] text-white flex items-center justify-center flex-shrink-0">
                      <i className={`${approvalTypes.find(t => t.id === approvalType)?.icon} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {approvalTypes.find(t => t.id === approvalType)?.label}
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      urgency === 'critical' ? 'bg-red-100 text-red-700' :
                      urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{urgency}</span>
                  </div>
                  <p className="text-xs text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {details || 'Your details will appear here...'}
                  </p>
                  {attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <i className="ri-attachment-line"></i>
                      {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
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
                disabled={!approvalType}
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
                disabled={!details.trim() || submitting}
                className="flex-1 px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c5a574] transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {submitting ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
                ) : (
                  <><i className="ri-send-plane-line"></i> Send Approval Request</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

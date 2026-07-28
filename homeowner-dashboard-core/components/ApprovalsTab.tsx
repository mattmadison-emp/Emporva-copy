interface Approval {
  id: string;
  type: 'estimate' | 'change_order' | 'milestone' | 'completion';
  title: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  documents?: string[];
  photos?: string[];
}

interface QAThread {
  id: string;
  jobId: string;
  approvalId?: string;
  question: string;
  category: string;
  askedBy: 'homeowner' | 'contractor';
  askerName: string;
  askedAt: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  status: 'pending' | 'answered';
}

interface ApprovalsTabProps {
  approvals: Approval[];
  qaThreads: QAThread[];
  jobId: string;
  onApprove: (jobId: string, approvalId: string, action: 'approve' | 'reject') => void;
  onAskQuestion: (jobId: string, approval?: Approval) => void;
}

export default function ApprovalsTab({ approvals, qaThreads, jobId, onApprove, onAskQuestion }: ApprovalsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Approval Requests</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-[#6B7C8F]">
            {approvals.filter(a => a.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-[#6B7C8F]">No approval requests at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const approvalThreads = qaThreads.filter(t => t.approvalId === approval.id);
            return (
              <div
                key={approval.id}
                className={`border rounded-xl p-4 sm:p-5 transition-all ${
                  approval.status === 'pending'
                    ? 'border-orange-200 bg-orange-50/30'
                    : approval.status === 'approved'
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-bold text-[#0B1F33] text-sm sm:text-base">{approval.title}</h4>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        approval.status === 'pending' ? 'bg-orange-100 text-orange-700'
                        : approval.status === 'approved' ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        approval.type === 'change_order' ? 'bg-blue-100 text-blue-700'
                        : approval.type === 'milestone' ? 'bg-purple-100 text-purple-700'
                        : approval.type === 'estimate' ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {approval.type.replace('_', ' ').charAt(0).toUpperCase() + approval.type.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B7C8F] mb-2">{approval.description}</p>
                    <p className="text-[10px] sm:text-xs text-[#6B7C8F]">
                      Submitted {new Date(approval.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {approval.amount && (
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Amount</p>
                      <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">${approval.amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {approval.photos && approval.photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-[#0B1F33] mb-2">Attached Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                      {approval.photos.map((_photo, idx) => (
                        <div key={idx} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-image-line text-xl sm:text-2xl text-gray-400"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approval.documents && approval.documents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-[#0B1F33] mb-2">Attached Documents</p>
                    <div className="space-y-2">
                      {approval.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7C8F]">
                          <i className="ri-file-pdf-line text-red-500"></i>
                          <span className="truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approvalThreads.length > 0 && (
                  <div className="mb-4 bg-white/60 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <p className="text-[10px] sm:text-xs font-semibold text-[#0B1F33] mb-3 flex items-center gap-2">
                      <i className="ri-question-answer-line text-[#14B8A6]"></i>
                      Questions about this item ({approvalThreads.length})
                    </p>
                    <div className="space-y-3">
                      {approvalThreads.map((thread) => (
                        <div key={thread.id} className="text-xs sm:text-sm">
                          <div className="flex items-start gap-2 mb-1">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              thread.askedBy === 'homeowner' ? 'bg-[#14B8A6]/20' : 'bg-[#0B1F33]/10'
                            }`}>
                              <i className={`ri-user-line text-[10px] sm:text-xs ${
                                thread.askedBy === 'homeowner' ? 'text-[#14B8A6]' : 'text-[#0B1F33]'
                              }`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#0B1F33] break-words">
                                <span className="font-semibold">{thread.askerName}:</span> {thread.question}
                              </p>
                              {thread.response && (
                                <div className="mt-2 ml-2 sm:ml-4 pl-2 sm:pl-3 border-l-2 border-[#14B8A6]/30">
                                  <p className="text-[#6B7C8F] break-words">
                                    <span className="font-semibold text-[#0B1F33]">{thread.respondedBy}:</span> {thread.response}
                                  </p>
                                </div>
                              )}
                              {!thread.response && thread.askedBy === 'homeowner' && (
                                <p className="text-[10px] sm:text-xs text-orange-600 mt-1 italic">Awaiting contractor response</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approval.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => onApprove(jobId, approval.id, 'approve')}
                      className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-check-line mr-1 sm:mr-2"></i>Approve
                    </button>
                    <button
                      onClick={() => onApprove(jobId, approval.id, 'reject')}
                      className="flex-1 px-3 sm:px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-close-line mr-1 sm:mr-2"></i>Reject
                    </button>
                    <button
                      onClick={() => onAskQuestion(jobId, approval)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#F9F9FB] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-question-line mr-1 sm:mr-2"></i>Ask Question
                    </button>
                  </div>
                )}

                {approval.status === 'approved' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 text-sm text-green-700">
                    <i className="ri-check-double-line"></i>
                    <span>Approved and contractor notified</span>
                  </div>
                )}

                {approval.status === 'rejected' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 text-sm text-red-700">
                    <i className="ri-close-circle-line"></i>
                    <span>Rejected and contractor notified</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

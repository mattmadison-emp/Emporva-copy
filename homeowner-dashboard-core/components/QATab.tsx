import { useState } from 'react';

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

interface Approval {
  id: string;
  type: 'estimate' | 'change_order' | 'milestone' | 'completion';
  title: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

interface QATabProps {
  threads: QAThread[];
  pendingQuestions: QAThread[];
  contractorName: string;
  jobId: string;
  approvals: Record<string, Approval[]>;
  onAskQuestion: (jobId: string) => void;
  onSendReply: (threadId: string, replyText: string) => void;
  replySending: boolean;
}

export default function QATab({ threads, pendingQuestions, contractorName, jobId, approvals, onAskQuestion, onSendReply, replySending }: QATabProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (threadId: string) => {
    if (!replyText.trim()) return;
    onSendReply(threadId, replyText);
    setReplyingTo(null);
    setReplyText('');
  };

  const ReplyUI = ({ threadId }: { threadId: string }) => (
    replyingTo === threadId ? (
      <div className="space-y-3">
        <textarea
          value={replyText}
          onChange={(e) => { if (e.target.value.length <= 500) setReplyText(e.target.value); }}
          placeholder="Type your response..."
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm text-[#0B1F33] placeholder-gray-400 focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between">
          <span className={`text-[10px] sm:text-xs ${replyText.length > 450 ? 'text-orange-500' : 'text-[#6B7C8F]'}`}>
            {replyText.length}/500
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => { setReplyingTo(null); setReplyText(''); }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 text-[#6B7C8F] rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSendReply(threadId)}
              disabled={!replyText.trim() || replySending}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 sm:gap-2 ${
                !replyText.trim() || replySending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#14B8A6] text-white hover:bg-[#0ea89a]'
              }`}
            >
              {replySending ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line"></i>
                  <span className="hidden sm:inline">Send Reply</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <button
        onClick={() => { setReplyingTo(threadId); setReplyText(''); }}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#14B8A6] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer whitespace-nowrap"
      >
        <i className="ri-reply-line mr-1 sm:mr-2"></i>
        Write Response
      </button>
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Questions &amp; Answers</h3>
          <p className="text-xs sm:text-sm text-[#6B7C8F] mt-1">Communication thread with {contractorName}</p>
        </div>
        <button
          onClick={() => onAskQuestion(jobId)}
          className="px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
        >
          <i className="ri-add-line mr-1 sm:mr-2"></i>
          <span className="hidden sm:inline">Ask New Question</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {pendingQuestions.length > 0 && (
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
            <i className="ri-alert-line"></i>
            Needs Your Response ({pendingQuestions.length})
          </h4>
          <div className="space-y-3">
            {pendingQuestions.map((thread) => (
              <div key={thread.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0B1F33]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-line text-[#0B1F33] text-sm sm:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="font-bold text-[#0B1F33] text-xs sm:text-sm">{thread.askerName}</span>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-[#0B1F33]/10 text-[#0B1F33] text-[10px] sm:text-xs font-semibold rounded-full flex items-center gap-1">
                        <i className="ri-user-line text-[8px] sm:text-[10px]"></i>
                        Contractor
                      </span>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-[#6B7C8F] text-[10px] sm:text-xs font-semibold rounded-full capitalize">{thread.category}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#0B1F33] mb-1 break-words">{thread.question}</p>
                    <p className="text-[10px] sm:text-xs text-[#6B7C8F]">
                      Asked {new Date(thread.askedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <ReplyUI threadId={thread.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs sm:text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
          <i className="ri-chat-history-line text-[#14B8A6]"></i>
          All Questions ({threads.length})
        </h4>
        {threads.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F9FB] rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-question-answer-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-[#6B7C8F] mb-4 text-sm sm:text-base">No questions yet for this project</p>
            <button
              onClick={() => onAskQuestion(jobId)}
              className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            >
              Ask Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <div key={thread.id} className={`bg-white border rounded-xl p-4 sm:p-5 ${
                thread.status === 'pending' && thread.askedBy === 'contractor' ? 'border-orange-200' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    thread.askedBy === 'homeowner' ? 'bg-[#14B8A6]/10' : 'bg-[#0B1F33]/10'
                  }`}>
                    <i className={`${thread.askedBy === 'homeowner' ? 'ri-home-4-line text-[#14B8A6]' : 'ri-user-line text-[#0B1F33]'} text-sm sm:text-base`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="font-bold text-[#0B1F33] text-xs sm:text-sm">{thread.askerName}</span>
                      <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${
                        thread.askedBy === 'homeowner' ? 'bg-[#14B8A6]/10 text-[#14B8A6]' : 'bg-[#0B1F33]/10 text-[#0B1F33]'
                      }`}>
                        {thread.askedBy === 'homeowner' ? 'You' : 'Contractor'}
                      </span>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-[#6B7C8F] text-[10px] sm:text-xs font-semibold rounded-full capitalize">{thread.category}</span>
                      {thread.approvalId && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold rounded-full truncate max-w-[120px] sm:max-w-none">
                          Re: {approvals[jobId]?.find(a => a.id === thread.approvalId)?.title || 'Approval'}
                        </span>
                      )}
                      <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-bold rounded-full">
                        {thread.status === 'answered' ? 'Answered' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#0B1F33] mb-1 break-words">{thread.question}</p>
                    <p className="text-[10px] sm:text-xs text-[#6B7C8F]">
                      {new Date(thread.askedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    {thread.response && (
                      <div className="mt-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-[#14B8A6]/30">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="font-bold text-[#0B1F33] text-xs sm:text-sm">{thread.respondedBy}</span>
                          <span className="text-[10px] sm:text-xs text-[#6B7C8F]">
                            {thread.respondedAt && new Date(thread.respondedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6B7C8F] break-words">{thread.response}</p>
                      </div>
                    )}

                    {!thread.response && thread.askedBy === 'contractor' && (
                      <div className="mt-3">
                        <ReplyUI threadId={thread.id} />
                      </div>
                    )}

                    {!thread.response && thread.askedBy === 'homeowner' && (
                      <p className="text-xs sm:text-sm text-orange-600 mt-2 italic flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        Awaiting contractor response
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

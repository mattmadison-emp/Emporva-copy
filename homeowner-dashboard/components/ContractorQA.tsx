
import { useState } from 'react';

interface ContractorQuestion {
  id: number;
  jobId: number;
  contractorName: string;
  contractorCompany: string;
  topic: string;
  question: string;
  askedAt: string;
  status: 'pending' | 'answered';
  response?: string;
  respondedAt?: string;
}

interface ContractorQAProps {
  jobId: number;
  jobTitle: string;
  onClose: () => void;
}

export default function ContractorQA({ jobId, jobTitle, onClose }: ContractorQAProps) {
  const [questions, setQuestions] = useState<ContractorQuestion[]>([
    {
      id: 1,
      jobId: 1,
      contractorName: 'Mike Thompson',
      contractorCompany: 'Charlotte Home Repair',
      topic: 'Scope of Work',
      question: 'Is the crawlspace currently accessible through an interior or exterior entry point? Also, are there any existing vapor barriers that need removal before we begin?',
      askedAt: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      jobId: 1,
      contractorName: 'Jake Rivera',
      contractorCompany: 'ProSeal Waterproofing',
      topic: 'Property Access',
      question: 'What is the height clearance in the crawlspace? We need to know if standard equipment will fit or if we need low-profile tools.',
      askedAt: '5 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      jobId: 1,
      contractorName: 'Sarah Lin',
      contractorCompany: 'DryTech Solutions',
      topic: 'Budget',
      question: 'Are you open to a phased approach where we address the moisture barrier first and then handle insulation in a second phase? This could help spread the cost.',
      askedAt: '1 day ago',
      status: 'answered',
      response: 'We would prefer to have everything done in one phase to minimize disruption. Our budget can accommodate the full scope as described.',
      respondedAt: '20 hours ago'
    },
    {
      id: 4,
      jobId: 3,
      contractorName: 'David Chen',
      contractorCompany: 'Summit Roofing & Repair',
      topic: 'Materials',
      question: 'Do you have a preference for shingle type? Architectural shingles last longer but cost about 20% more than 3-tab. Also, do you want us to match the existing color?',
      askedAt: '4 hours ago',
      status: 'pending'
    },
    {
      id: 5,
      jobId: 3,
      contractorName: 'Tom Bradley',
      contractorCompany: 'Apex Roofing Co.',
      topic: 'Timeline',
      question: 'We have availability starting Feb 3 instead of Feb 5. Would an earlier start work for you? Weather forecast looks better for that window.',
      askedAt: '6 hours ago',
      status: 'answered',
      response: 'Feb 3 works great for us! Earlier is better since we want to get ahead of any rain. Please go ahead and plan for that date.',
      respondedAt: '5 hours ago'
    },
    {
      id: 6,
      jobId: 2,
      contractorName: 'Carlos Mendez',
      contractorCompany: 'AirFlow HVAC Pros',
      topic: 'Scope of Work',
      question: 'When was the last time the HVAC system was serviced? And is the issue primarily with heating, cooling, or both? This will help us bring the right diagnostic equipment.',
      askedAt: '3 hours ago',
      status: 'pending'
    }
  ]);

  const [activeReply, setActiveReply] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const jobQuestions = questions.filter(q => q.jobId === jobId);
  const filteredQuestions = jobQuestions.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  const pendingCount = jobQuestions.filter(q => q.status === 'pending').length;
  const answeredCount = jobQuestions.filter(q => q.status === 'answered').length;

  const handleSendResponse = (questionId: number) => {
    if (!replyText.trim()) return;
    setSendingId(questionId);

    setTimeout(() => {
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, status: 'answered' as const, response: replyText, respondedAt: 'Just now' }
          : q
      ));
      setSendingId(null);
      setSuccessId(questionId);
      setReplyText('');
      setActiveReply(null);

      setTimeout(() => setSuccessId(null), 3000);
    }, 1200);
  };

  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'Scope of Work': return 'ri-file-list-3-line';
      case 'Timeline': return 'ri-time-line';
      case 'Budget': return 'ri-money-dollar-circle-line';
      case 'Property Access': return 'ri-door-open-line';
      case 'Materials': return 'ri-stack-line';
      default: return 'ri-question-line';
    }
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'Scope of Work': return 'bg-[#0B1F33]/10 text-[#0B1F33]';
      case 'Timeline': return 'bg-[#00B8A9]/10 text-[#00B8A9]';
      case 'Budget': return 'bg-green-100 text-green-700';
      case 'Property Access': return 'bg-orange-100 text-orange-700';
      case 'Materials': return 'bg-[#D4B483]/20 text-[#9a7a4a]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-question-answer-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Contractor Questions
                  </h2>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {jobTitle}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>

          {/* Stats & Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-orange-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {pendingCount} Awaiting Response
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <i className="ri-check-line text-green-600 text-sm"></i>
                <span className="text-xs font-semibold text-green-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {answeredCount} Answered
                </span>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'pending', 'answered'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    filter === f
                      ? 'bg-[#0B1F33] text-white'
                      : 'text-gray-600 hover:text-[#0B1F33]'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {f === 'all' ? 'All' : f === 'pending' ? 'Needs Reply' : 'Answered'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-chat-check-line text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {filter === 'pending' ? 'All questions have been answered!' : 'No questions yet for this job.'}
              </p>
            </div>
          )}

          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className={`rounded-xl border-2 transition-all ${
                q.status === 'pending'
                  ? 'border-orange-200 bg-orange-50/30'
                  : successId === q.id
                  ? 'border-green-300 bg-green-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Question Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {q.contractorName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {q.contractorName}
                      </p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {q.contractorCompany} &middot; {q.askedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 ${getTopicColor(q.topic)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <i className={`${getTopicIcon(q.topic)} text-sm`}></i>
                      {q.topic}
                    </span>
                    {q.status === 'pending' && (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        Needs Reply
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="ml-[52px]">
                  <p className="text-sm text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {q.question}
                  </p>
                </div>
              </div>

              {/* Response Section */}
              {q.status === 'answered' && q.response && (
                <div className="mx-4 mb-4 ml-[52px] mr-4">
                  <div className="bg-[#00B8A9]/10 border border-[#00B8A9]/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-reply-line text-[#00B8A9]"></i>
                      <span className="text-xs font-semibold text-[#00B8A9]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Your Response
                      </span>
                      <span className="text-xs text-gray-500 ml-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {q.respondedAt}
                      </span>
                    </div>
                    <p className="text-sm text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {q.response}
                    </p>
                  </div>
                  {successId === q.id && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <i className="ri-check-double-line"></i>
                      <span className="text-xs font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Response sent! The contractor will be notified.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Reply Form */}
              {q.status === 'pending' && (
                <div className="px-4 pb-4 ml-[52px] mr-0 pr-4">
                  {activeReply === q.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) setReplyText(e.target.value);
                        }}
                        placeholder="Type your response to this contractor..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent text-sm resize-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {replyText.length}/500 characters
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setActiveReply(null); setReplyText(''); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendResponse(q.id)}
                            disabled={!replyText.trim() || sendingId === q.id}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                              !replyText.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#00B8A9] text-white hover:bg-[#00a89a]'
                            }`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {sendingId === q.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="ri-send-plane-line"></i>
                                Send Response
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveReply(q.id); setReplyText(''); }}
                      className="w-full px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-reply-line"></i>
                      Write Response
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <i className="ri-information-line"></i>
            <span>
              Your responses are only visible to the contractor who asked. Answering helps contractors provide more accurate quotes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

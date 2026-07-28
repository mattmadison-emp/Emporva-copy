import { useState } from 'react';

interface AskQuestionModalProps {
  jobTitle: string;
  contractorName: string;
  approvalTitle?: string;
  sending: boolean;
  sent: boolean;
  onSend: (question: string, category: string) => void;
  onClose: () => void;
}

const questionCategories = [
  { id: 'scope', label: 'Scope of Work', icon: 'ri-file-list-line' },
  { id: 'timeline', label: 'Timeline', icon: 'ri-calendar-line' },
  { id: 'budget', label: 'Budget / Cost', icon: 'ri-money-dollar-circle-line' },
  { id: 'materials', label: 'Materials', icon: 'ri-tools-line' },
  { id: 'quality', label: 'Quality / Warranty', icon: 'ri-shield-check-line' },
  { id: 'other', label: 'Other', icon: 'ri-chat-3-line' },
];

const quickQuestions: Record<string, string[]> = {
  scope: [
    'Can you clarify what is included in this scope?',
    'Are there any additional areas that will be affected?',
    'What happens if unexpected issues are found during the work?',
  ],
  timeline: [
    'How long will this specific phase take?',
    'Will this cause any delays to the overall project?',
    'What is the expected start and end date for this work?',
  ],
  budget: [
    'Can you break down the cost in more detail?',
    'Are there more affordable alternatives?',
    'Does this price include all materials and labor?',
  ],
  materials: [
    'What brand/model of materials will be used?',
    'Are there higher quality options available?',
    'Where are the materials being sourced from?',
  ],
  quality: [
    'What warranty comes with this work?',
    'How long should this repair/installation last?',
    'What maintenance will be needed after completion?',
  ],
  other: [
    'Can you send additional photos of the current state?',
    'Is a permit required for this work?',
    'Will this affect any other systems in the home?',
  ],
};

export default function AskQuestionModal({ jobTitle, contractorName, approvalTitle, sending, sent, onSend, onClose }: AskQuestionModalProps) {
  const [category, setCategory] = useState('scope');
  const [questionText, setQuestionText] = useState('');

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-lg w-full my-8 shadow-2xl">
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-[#14B8A6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-3xl text-[#14B8A6]"></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Question Sent!</h3>
            <p className="text-sm text-[#6B7C8F]">Your contractor will be notified and can reply directly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#0B1F33] mb-1">Ask Your Contractor</h2>
              <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                <i className="ri-briefcase-line"></i>
                <span className="truncate">{jobTitle}</span>
                {approvalTitle && (
                  <>
                    <span className="text-gray-300">&middot;</span>
                    <span className="text-[#0B1F33] font-semibold truncate">Re: {approvalTitle}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-2">Question Topic</label>
            <div className="grid grid-cols-3 gap-2">
              {questionCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setQuestionText(''); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                    category === cat.id
                      ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                      : 'bg-white text-[#6B7C8F] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${cat.icon} text-sm`}></i>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-2">Quick Questions</label>
            <div className="space-y-1.5">
              {quickQuestions[category]?.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestionText(q)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer border ${
                    questionText === q
                      ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#0B1F33]'
                      : 'bg-gray-50 border-transparent text-[#6B7C8F] hover:bg-gray-100'
                  }`}
                >
                  <i className={`ri-chat-3-line mr-2 text-xs ${questionText === q ? 'text-[#14B8A6]' : 'text-gray-400'}`}></i>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-2">Your Question</label>
            <textarea
              value={questionText}
              onChange={(e) => { if (e.target.value.length <= 500) setQuestionText(e.target.value); }}
              placeholder="Type your question here or select one above..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-gray-400 focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-[#6B7C8F]">Your question will be sent to {contractorName}.</p>
              <span className={`text-[10px] font-medium ${questionText.length > 450 ? 'text-orange-500' : 'text-[#6B7C8F]'}`}>
                {questionText.length}/500
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(questionText, category)}
            disabled={!questionText.trim() || sending}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
              !questionText.trim() || sending
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#14B8A6] text-white hover:bg-[#0ea89a]'
            }`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                Send Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

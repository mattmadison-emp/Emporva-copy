
import { useState } from 'react';
import QuoteDetailView from './QuoteDetailView';

interface Quote {
  id: string;
  jobId: string;
  jobTitle: string;
  scopeSummary: string;
  workSteps: string[];
  lineItems: any[];
  assumptions: string;
  exclusions: string;
  validityDays: number;
  paymentTerms: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  contractorInfo: {
    name: string;
    company: string;
    rating: number;
    completedJobs: number;
    photo: string;
  };
}

interface OwnerQuotesViewProps {
  jobId: string;
  jobTitle: string;
  onAcceptQuote?: (quoteId: string) => void;
  onDeclineQuote?: (quoteId: string) => void;
  onAskQuestion?: (quoteId: string) => void;
}

export default function OwnerQuotesView({ jobId, jobTitle, onAcceptQuote, onDeclineQuote, onAskQuestion }: OwnerQuotesViewProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [acceptModal, setAcceptModal] = useState<Quote | null>(null);
  const [declineModal, setDeclineModal] = useState<Quote | null>(null);
  const [questionModal, setQuestionModal] = useState<Quote | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [acceptStep, setAcceptStep] = useState<'confirm' | 'success'>('confirm');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Mock quotes data
  const mockQuotes: Quote[] = [
    {
      id: 'quote-1',
      jobId: jobId,
      jobTitle: jobTitle,
      scopeSummary: 'Complete kitchen faucet replacement including removal of existing fixture, installation of new Moen single-handle faucet, connection to existing water supply lines, and comprehensive leak testing.',
      workSteps: [
        'Turn off water supply and drain lines',
        'Remove existing faucet and clean mounting area',
        'Install new faucet with proper sealing',
        'Connect supply lines and test for leaks',
        'Final inspection and cleanup'
      ],
      lineItems: [
        { id: '1', description: 'Labor - Faucet removal and installation', quantity: 2, unit: 'hours', unitCost: 95, total: 190 },
        { id: '2', description: 'Supply lines and connectors', quantity: 1, unit: 'set', unitCost: 45, total: 45 },
        { id: '3', description: 'Plumber\'s putty and sealant', quantity: 1, unit: 'ea', unitCost: 25, total: 25 },
        { id: '4', description: 'Service call and inspection', quantity: 1, unit: 'ea', unitCost: 75, total: 75 }
      ],
      assumptions: 'Existing water supply lines are in good condition. New faucet is already purchased and on-site. Work area is accessible.',
      exclusions: 'Does not include repair of damaged countertops, replacement of shut-off valves, or modifications to plumbing beyond standard connections.',
      validityDays: 30,
      paymentTerms: '100% upon completion',
      total: 335,
      status: 'sent',
      createdAt: '2024-01-16T10:00:00Z',
      sentAt: '2024-01-16T10:30:00Z',
      contractorInfo: {
        name: 'Mike Johnson',
        company: 'Johnson Plumbing Services',
        rating: 4.8,
        completedJobs: 127,
        photo: 'https://readdy.ai/api/search-image?query=professional%20male%20plumber%20portrait%20wearing%20work%20uniform%20smiling%20confident%20friendly%20simple%20clean%20background&width=200&height=200&seq=plumber1&orientation=squarish'
      }
    },
    {
      id: 'quote-2',
      jobId: jobId,
      jobTitle: jobTitle,
      scopeSummary: 'Professional kitchen faucet replacement service with premium installation techniques and extended warranty coverage.',
      workSteps: [
        'Initial assessment and water shut-off',
        'Careful removal of old faucet',
        'Surface preparation and cleaning',
        'Professional installation with premium materials',
        'Multi-point leak testing',
        'Final walkthrough and warranty documentation'
      ],
      lineItems: [
        { id: '1', description: 'Master plumber labor', quantity: 2.5, unit: 'hours', unitCost: 125, total: 312.5 },
        { id: '2', description: 'Premium supply lines (braided stainless)', quantity: 1, unit: 'set', unitCost: 75, total: 75 },
        { id: '3', description: 'Professional-grade sealants and materials', quantity: 1, unit: 'kit', unitCost: 50, total: 50 },
        { id: '4', description: 'Service call and detailed inspection', quantity: 1, unit: 'ea', unitCost: 100, total: 100 }
      ],
      assumptions: 'Standard installation conditions. Customer-supplied faucet is compatible with existing setup. Access to work area is clear.',
      exclusions: 'Does not include structural repairs, valve replacement, or modifications to existing plumbing infrastructure.',
      validityDays: 30,
      paymentTerms: '50% deposit, 50% upon completion',
      total: 537.5,
      status: 'sent',
      createdAt: '2024-01-16T14:00:00Z',
      sentAt: '2024-01-16T14:15:00Z',
      contractorInfo: {
        name: 'Sarah Martinez',
        company: 'Elite Plumbing Solutions',
        rating: 4.9,
        completedJobs: 203,
        photo: 'https://readdy.ai/api/search-image?query=professional%20female%20plumber%20portrait%20wearing%20work%20uniform%20smiling%20confident%20expert%20simple%20clean%20background&width=200&height=200&seq=plumber2&orientation=squarish'
      }
    },
    {
      id: 'quote-3',
      jobId: jobId,
      jobTitle: jobTitle,
      scopeSummary: 'Budget-friendly faucet replacement with quality workmanship and basic warranty.',
      workSteps: [
        'Water shut-off and line drainage',
        'Remove old faucet',
        'Install new faucet',
        'Connect and test',
        'Cleanup'
      ],
      lineItems: [
        { id: '1', description: 'Labor - Installation', quantity: 1.5, unit: 'hours', unitCost: 75, total: 112.5 },
        { id: '2', description: 'Basic supply lines', quantity: 1, unit: 'set', unitCost: 30, total: 30 },
        { id: '3', description: 'Sealant', quantity: 1, unit: 'ea', unitCost: 15, total: 15 },
        { id: '4', description: 'Service call', quantity: 1, unit: 'ea', unitCost: 50, total: 50 }
      ],
      assumptions: 'Standard installation. No complications expected.',
      exclusions: 'Additional repairs or modifications not included.',
      validityDays: 14,
      paymentTerms: 'Payment due upon completion',
      total: 207.5,
      status: 'sent',
      createdAt: '2024-01-15T16:00:00Z',
      sentAt: '2024-01-15T16:20:00Z',
      contractorInfo: {
        name: 'Tom Wilson',
        company: 'Quick Fix Plumbing',
        rating: 4.5,
        completedJobs: 89,
        photo: 'https://readdy.ai/api/search-image?query=professional%20male%20plumber%20portrait%20wearing%20casual%20work%20clothes%20friendly%20approachable%20simple%20clean%20background&width=200&height=200&seq=plumber3&orientation=squarish'
      }
    }
  ];

  const getQuoteStatus = (quote: Quote): Quote['status'] => {
    if (acceptedIds.includes(quote.id)) return 'accepted';
    if (declinedIds.includes(quote.id)) return 'declined';
    return quote.status;
  };

  const handleOpenAcceptModal = (quote: Quote) => {
    setAcceptStep('confirm');
    setAcceptModal(quote);
  };

  const handleConfirmAccept = () => {
    if (!acceptModal) return;
    setAcceptedIds(prev => [...prev, acceptModal.id]);
    onAcceptQuote?.(acceptModal.id);
    setAcceptStep('success');
  };

  const handleCloseAcceptModal = () => {
    setAcceptModal(null);
    setAcceptStep('confirm');
  };

  const handleOpenDeclineModal = (quote: Quote) => {
    setDeclineReason('');
    setDeclineModal(quote);
  };

  const handleConfirmDecline = () => {
    if (!declineModal) return;
    setDeclinedIds(prev => [...prev, declineModal.id]);
    onDeclineQuote?.(declineModal.id);
    setDeclineModal(null);
    showToast(`Quote from ${declineModal.contractorInfo.name} has been declined. They\u2019ve been notified.`, 'info');
  };

  const handleOpenQuestionModal = (quote: Quote) => {
    setQuestionText('');
    setQuestionModal(quote);
  };

  const handleSendQuestion = () => {
    if (!questionModal || !questionText.trim()) return;
    onAskQuestion?.(questionModal.id);
    const name = questionModal.contractorInfo.name;
    setQuestionModal(null);
    setQuestionText('');
    showToast(`Message sent to ${name}. You\u2019ll be notified when they reply.`, 'success');
  };

  const handleAcceptFromDetail = (quoteId: string) => {
    const quote = mockQuotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(null);
      handleOpenAcceptModal(quote);
    }
  };

  const handleDeclineFromDetail = (quoteId: string) => {
    const quote = mockQuotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(null);
      handleOpenDeclineModal(quote);
    }
  };

  const handleAskFromDetail = (quoteId: string) => {
    const quote = mockQuotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(null);
      handleOpenQuestionModal(quote);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <i className={`text-lg ${
              toast.type === 'success' ? 'ri-check-line text-green-600' :
              toast.type === 'info' ? 'ri-information-line text-blue-600' :
              'ri-error-warning-line text-red-600'
            }`}></i>
            <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-current opacity-50 hover:opacity-100 cursor-pointer">
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Received Quotes</h3>
          <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Review and compare quotes from contractors
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Quotes</p>
          <p className="text-2xl font-bold text-teal-600">{mockQuotes.length}</p>
        </div>
      </div>

      {/* Quote Comparison Summary */}
      {mockQuotes.length > 0 && (
        <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <i className="ri-bar-chart-grouped-line text-[#0B1F33] text-xl mt-0.5"></i>
            <div className="flex-1">
              <h4 className="font-semibold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Quote Range</h4>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-[#6B7C8F]">Lowest</p>
                  <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ${Math.min(...mockQuotes.map(q => q.total)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]">Average</p>
                  <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ${Math.round(mockQuotes.reduce((sum, q) => sum + q.total, 0) / mockQuotes.length).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]">Highest</p>
                  <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ${Math.max(...mockQuotes.map(q => q.total)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotes Grid */}
      <div className="grid gap-4">
        {mockQuotes.map((quote) => {
          const currentStatus = getQuoteStatus(quote);
          const isActioned = currentStatus === 'accepted' || currentStatus === 'declined';

          return (
            <div
              key={quote.id}
              className={`bg-white border rounded-xl p-6 transition-shadow ${
                currentStatus === 'accepted' ? 'border-green-300 shadow-green-100 shadow-md' :
                currentStatus === 'declined' ? 'border-gray-200 opacity-60' :
                'border-gray-200 hover:shadow-lg'
              }`}
            >
              <div className="flex gap-6">
                {/* Contractor Info */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={quote.contractorInfo.photo}
                      alt={quote.contractorInfo.name}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                    {currentStatus === 'accepted' && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <i className="ri-star-fill text-yellow-500 text-sm"></i>
                      <span className="text-sm font-bold text-gray-900">{quote.contractorInfo.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">{quote.contractorInfo.completedJobs} jobs</p>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{quote.contractorInfo.name}</h4>
                        {currentStatus === 'accepted' && (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                            <i className="ri-check-line text-xs"></i> Accepted
                          </span>
                        )}
                        {currentStatus === 'declined' && (
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full flex items-center gap-1">
                            <i className="ri-close-line text-xs"></i> Declined
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>{quote.contractorInfo.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${quote.total.toLocaleString()}</div>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{quote.paymentTerms}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>{quote.scopeSummary}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex items-center gap-2">
                      <i className="ri-file-list-line"></i>
                      <span>{quote.lineItems.length} line items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="ri-time-line"></i>
                      <span>Valid for {quote.validityDays} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="ri-calendar-line"></i>
                      <span>Received {new Date(quote.sentAt || quote.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Accepted confirmation banner */}
                  {currentStatus === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-double-line text-green-600"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Quote accepted — project is now in progress</p>
                        <p className="text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>{quote.contractorInfo.name} has been notified and will reach out to schedule.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-eye-line mr-2"></i>
                      View Full Quote
                    </button>
                    {!isActioned && (
                      <>
                        <button
                          onClick={() => handleOpenAcceptModal(quote)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-check-line mr-2"></i>
                          Accept Quote
                        </button>
                        <button
                          onClick={() => handleOpenDeclineModal(quote)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-close-line mr-2"></i>
                          Decline
                        </button>
                        <button
                          onClick={() => handleOpenQuestionModal(quote)}
                          className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-question-line mr-2"></i>
                          Ask Question
                        </button>
                      </>
                    )}
                    {currentStatus === 'accepted' && (
                      <button
                        onClick={() => handleOpenQuestionModal(quote)}
                        className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-message-3-line mr-2"></i>
                        Message Contractor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mockQuotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Quotes Yet</h3>
          <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Contractors will submit quotes for your job. You&apos;ll be notified when new quotes arrive.
          </p>
        </div>
      )}

      {/* ============================================================
         ACCEPT QUOTE MODAL
         ============================================================ */}
      {acceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {acceptStep === 'confirm' ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <i className="ri-check-double-line text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Accept Quote</h3>
                        <p className="text-sm text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>Confirm your selection</p>
                      </div>
                    </div>
                    <button onClick={handleCloseAcceptModal} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Contractor Summary */}
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                    <img
                      src={acceptModal.contractorInfo.photo}
                      alt={acceptModal.contractorInfo.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{acceptModal.contractorInfo.name}</p>
                      <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{acceptModal.contractorInfo.company}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <i className="ri-star-fill text-yellow-500 text-xs"></i>
                          <span className="text-xs font-bold text-[#0B1F33]">{acceptModal.contractorInfo.rating}</span>
                        </div>
                        <span className="text-xs text-[#6B7C8F]">{acceptModal.contractorInfo.completedJobs} completed jobs</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${acceptModal.total.toLocaleString()}</p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{acceptModal.paymentTerms}</p>
                    </div>
                  </div>

                  {/* What happens next */}
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F33] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>What happens next</p>
                    <div className="space-y-3">
                      {[
                        { icon: 'ri-notification-3-line', color: 'text-teal-600 bg-teal-100', text: 'The contractor will be notified immediately and will reach out to schedule the work.' },
                        { icon: 'ri-shield-check-line', color: 'text-green-600 bg-green-100', text: 'Payment is held in Emporva escrow until you verify and approve the completed work.' },
                        { icon: 'ri-message-3-line', color: 'text-[#0B1F33] bg-[#0B1F33]/10', text: 'You can message the contractor directly through your dashboard at any time.' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <i className={`${item.icon} text-sm`}></i>
                          </div>
                          <p className="text-sm text-[#0B1F33] pt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Escrow protection notice */}
                  <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-3 flex items-start gap-2">
                    <i className="ri-lock-line text-[#00B8A9] text-sm mt-0.5"></i>
                    <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <strong>Emporva Payment Protection:</strong> Your payment is secured in escrow. You won&apos;t be charged until you approve the completed work.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCloseAcceptModal}
                      className="flex-1 px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAccept}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-check-line mr-2"></i>
                      Confirm &amp; Accept Quote
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-double-line text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Quote Accepted!</h3>
                <p className="text-sm text-[#6B7C8F] mb-6 max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {acceptModal.contractorInfo.name} from {acceptModal.contractorInfo.company} has been notified. They&apos;ll reach out shortly to schedule the work.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={acceptModal.contractorInfo.photo} alt={acceptModal.contractorInfo.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{acceptModal.contractorInfo.name}</p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{acceptModal.contractorInfo.company}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-lg font-bold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${acceptModal.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <i className="ri-shield-check-line"></i>
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>Protected by Emporva Escrow</span>
                  </div>
                </div>

                <button
                  onClick={handleCloseAcceptModal}
                  className="w-full px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-bold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
         DECLINE QUOTE MODAL
         ============================================================ */}
      {declineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="ri-close-circle-line text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Decline Quote</h3>
                    <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>From {declineModal.contractorInfo.name}</p>
                  </div>
                </div>
                <button onClick={() => setDeclineModal(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <img src={declineModal.contractorInfo.photo} alt={declineModal.contractorInfo.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{declineModal.contractorInfo.company}</p>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Quote: ${declineModal.total.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Reason for declining <span className="text-[#6B7C8F] font-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Price too high', 'Found another contractor', 'Timeline doesn\u2019t work', 'Scope mismatch', 'Other'].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setDeclineReason(reason)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        declineReason === reason
                          ? 'bg-[#0B1F33] text-white'
                          : 'bg-gray-100 text-[#6B7C8F] hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value.slice(0, 500))}
                  placeholder="Add any additional feedback..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 focus:border-[#0B1F33]/30 resize-none"
                  rows={3}
                  maxLength={500}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="text-xs text-[#6B7C8F] mt-1 text-right">{declineReason.length}/500</p>
              </div>

              <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                The contractor will be notified that their quote was not selected. Your feedback helps them improve future quotes.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeclineModal(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecline}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className="ri-close-line mr-2"></i>
                  Decline Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         ASK QUESTION MODAL
         ============================================================ */}
      {questionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <i className="ri-message-3-line text-teal-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Ask a Question</h3>
                    <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Message {questionModal.contractorInfo.name}</p>
                  </div>
                </div>
                <button onClick={() => setQuestionModal(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <img src={questionModal.contractorInfo.photo} alt={questionModal.contractorInfo.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{questionModal.contractorInfo.name}</p>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{questionModal.contractorInfo.company} &middot; Quote: ${questionModal.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Quick question suggestions */}
              <div>
                <p className="text-xs font-semibold text-[#6B7C8F] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Common questions</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Can you break down the labor costs?',
                    'What\u2019s the estimated timeline?',
                    'Do you offer a warranty?',
                    'Can you start sooner?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuestionText(q)}
                      className="px-3 py-1.5 bg-gray-100 text-[#0B1F33] rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Your message
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value.slice(0, 500))}
                  placeholder="Type your question here..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 resize-none"
                  rows={4}
                  maxLength={500}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="text-xs text-[#6B7C8F] mt-1 text-right">{questionText.length}/500</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setQuestionModal(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuestion}
                  disabled={!questionText.trim()}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    questionText.trim()
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <QuoteDetailView
          quote={{...selectedQuote, status: getQuoteStatus(selectedQuote)}}
          onClose={() => setSelectedQuote(null)}
          onAccept={() => handleAcceptFromDetail(selectedQuote.id)}
          onDecline={() => handleDeclineFromDetail(selectedQuote.id)}
          onAskQuestion={() => handleAskFromDetail(selectedQuote.id)}
          viewMode="owner"
        />
      )}
    </div>
  );
}

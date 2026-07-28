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
  contractorInfo?: {
    name: string;
    company: string;
    rating: number;
    completedJobs: number;
    photo: string;
  };
}

interface QuoteDetailViewProps {
  quote: Quote;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onAskQuestion?: () => void;
  viewMode?: 'contractor' | 'owner';
}

export default function QuoteDetailView({ quote, onClose, onAccept, onDecline, onAskQuestion, viewMode = 'contractor' }: QuoteDetailViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const expiryDate = new Date(quote.createdAt);
  expiryDate.setDate(expiryDate.getDate() + quote.validityDays);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Quote Details</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600">{quote.jobTitle}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer ml-4">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Contractor Info (for owner view) */}
          {viewMode === 'owner' && quote.contractorInfo && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Contractor Information</h3>
              <div className="flex items-center gap-4">
                <img
                  src={quote.contractorInfo.photo}
                  alt={quote.contractorInfo.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{quote.contractorInfo.name}</h4>
                  <p className="text-sm text-gray-600">{quote.contractorInfo.company}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-500 text-sm"></i>
                      <span className="text-sm font-semibold text-gray-900">{quote.contractorInfo.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {quote.contractorInfo.completedJobs} completed jobs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quote Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Scope of Work</h3>
            <p className="text-gray-900 leading-relaxed">{quote.scopeSummary}</p>
          </div>

          {/* Work Steps */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Sequence</h3>
            <div className="space-y-3">
              {quote.workSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-600 rounded-full font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-900 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing Breakdown</h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${item.unitCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-900">
                      Total Estimate:
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-teal-600 text-xl">
                      ${quote.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Assumptions */}
          {quote.assumptions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Assumptions</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-900 text-sm leading-relaxed">{quote.assumptions}</p>
              </div>
            </div>
          )}

          {/* Exclusions */}
          {quote.exclusions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Exclusions</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-900 text-sm leading-relaxed">{quote.exclusions}</p>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Quote Valid Until</h4>
              <p className="text-gray-900 font-semibold">{formatDate(expiryDate.toISOString())}</p>
              <p className="text-xs text-gray-600 mt-1">{quote.validityDays} days from creation</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Terms</h4>
              <p className="text-gray-900 font-semibold">{quote.paymentTerms}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <i className="ri-calendar-line"></i>
              <span>Created: {formatDate(quote.createdAt)}</span>
            </div>
            {quote.sentAt && (
              <div className="flex items-center gap-2">
                <i className="ri-send-plane-line"></i>
                <span>Sent: {formatDate(quote.sentAt)}</span>
              </div>
            )}
            {quote.respondedAt && (
              <div className="flex items-center gap-2">
                <i className="ri-check-line"></i>
                <span>Responded: {formatDate(quote.respondedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions (for owner view) */}
        {viewMode === 'owner' && quote.status === 'sent' && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-xl flex gap-3">
            {onAskQuestion && (
              <button
                onClick={onAskQuestion}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-question-line mr-2"></i>
                Ask Question
              </button>
            )}
            {onDecline && (
              <button
                onClick={onDecline}
                className="flex-1 px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line mr-2"></i>
                Decline Quote
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-check-line mr-2"></i>
                Accept Quote
              </button>
            )}
          </div>
        )}

        {/* Close button for other views */}
        {(viewMode === 'contractor' || quote.status !== 'sent') && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
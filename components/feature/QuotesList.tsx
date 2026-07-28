import { useState } from 'react';

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
}

interface QuotesListProps {
  quotes: Quote[];
  onViewQuote: (quote: Quote) => void;
  onEditQuote?: (quote: Quote) => void;
  onDeleteQuote?: (quoteId: string) => void;
  viewMode?: 'contractor' | 'owner';
}

export default function QuotesList({ quotes, onViewQuote, onEditQuote, onDeleteQuote, viewMode = 'contractor' }: QuotesListProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'ri-draft-line';
      case 'sent': return 'ri-send-plane-line';
      case 'accepted': return 'ri-check-line';
      case 'declined': return 'ri-close-line';
      default: return 'ri-file-line';
    }
  };

  const filteredQuotes = filter === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-file-list-line text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotes Yet</h3>
        <p className="text-gray-600">
          {viewMode === 'contractor' 
            ? 'Create your first quote to get started.'
            : 'No quotes have been submitted for this job yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'draft', 'sent', 'accepted', 'declined'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 font-semibold text-sm capitalize transition-colors cursor-pointer whitespace-nowrap ${
              filter === status
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status}
            {status === 'all' && ` (${quotes.length})`}
            {status !== 'all' && ` (${quotes.filter(q => q.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {filteredQuotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{quote.jobTitle}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                    <i className={`${getStatusIcon(quote.status)} mr-1`}></i>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{quote.scopeSummary}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-teal-600">${quote.total.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Total Estimate</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line"></i>
                  <span>Created {formatDate(quote.createdAt)}</span>
                </div>
                {quote.sentAt && (
                  <div className="flex items-center gap-2">
                    <i className="ri-send-plane-line"></i>
                    <span>Sent {formatDate(quote.sentAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <i className="ri-file-list-line"></i>
                  <span>{quote.lineItems.length} line items</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewQuote(quote)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-eye-line mr-2"></i>
                  View Details
                </button>
                {viewMode === 'contractor' && quote.status === 'draft' && onEditQuote && (
                  <button
                    onClick={() => onEditQuote(quote)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit
                  </button>
                )}
                {viewMode === 'contractor' && quote.status === 'draft' && onDeleteQuote && (
                  <button
                    onClick={() => onDeleteQuote(quote.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {filter} quotes found.
        </div>
      )}
    </div>
  );
}
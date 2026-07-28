import { useState } from 'react';
import { generateReceiptPDF } from '../../../utils/receiptPdf';

interface PaymentRecord {
  id: string;
  confirmationId: string;
  date: string;
  description: string;
  jobTitle?: string;
  contractor?: string;
  milestone?: string;
  amount: number;
  method: string;
  cardLast4: string;
  status: 'completed' | 'refunded' | 'pending';
  type: 'milestone' | 'subscription' | 'service';
}

const paymentHistory: PaymentRecord[] = [
  {
    id: 'p1',
    confirmationId: 'EMP-M4K7X-9TBR',
    date: 'Jan 18, 2025',
    description: 'Milestone Payment — Vapor Barrier Installation',
    jobTitle: 'Crawlspace Moisture Remediation',
    contractor: 'Mike Thompson',
    milestone: 'Vapor Barrier Installation',
    amount: 1485,
    method: 'Visa',
    cardLast4: '4242',
    status: 'completed',
    type: 'milestone',
  },
  {
    id: 'p2',
    confirmationId: 'EMP-L2N8P-4FGH',
    date: 'Jan 16, 2025',
    description: 'Milestone Payment — Initial Assessment & Planning',
    jobTitle: 'Crawlspace Moisture Remediation',
    contractor: 'Mike Thompson',
    milestone: 'Initial Assessment & Planning',
    amount: 990,
    method: 'Visa',
    cardLast4: '4242',
    status: 'completed',
    type: 'milestone',
  },
  {
    id: 'p3',
    confirmationId: 'EMP-R9W3Q-7JKL',
    date: 'Jan 11, 2025',
    description: 'Service Payment — Water Heater Replacement',
    jobTitle: 'Water Heater Replacement',
    contractor: 'James Wilson',
    milestone: 'Water Heater Replacement',
    amount: 2100,
    method: 'Mastercard',
    cardLast4: '8888',
    status: 'completed',
    type: 'service',
  },
  {
    id: 'p4',
    confirmationId: 'EMP-A5D1V-2MNP',
    date: 'Jan 1, 2025',
    description: 'Homeowner Premium Plan — Monthly',
    amount: 12,
    method: 'Visa',
    cardLast4: '4242',
    status: 'completed',
    type: 'subscription',
  },
  {
    id: 'p5',
    confirmationId: 'EMP-B8E4W-6QRS',
    date: 'Dec 1, 2024',
    description: 'Homeowner Premium Plan — Monthly',
    amount: 12,
    method: 'Visa',
    cardLast4: '4242',
    status: 'completed',
    type: 'subscription',
  },
  {
    id: 'p6',
    confirmationId: 'EMP-C3F7X-1TUV',
    date: 'Nov 1, 2024',
    description: 'Homeowner Premium Plan — Monthly',
    amount: 12,
    method: 'Visa',
    cardLast4: '4242',
    status: 'completed',
    type: 'subscription',
  },
];

export default function PaymentHistory() {
  const [filter, setFilter] = useState<'all' | 'milestone' | 'subscription' | 'service'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    generateReceiptPDF({
      confirmationId: payment.confirmationId,
      date: payment.date,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.method,
      cardLast4: payment.cardLast4,
      type: payment.type,
      jobTitle: payment.jobTitle,
      contractor: payment.contractor,
      milestone: payment.milestone,
    });
  };

  const filtered = filter === 'all' ? paymentHistory : paymentHistory.filter((p) => p.type === filter);

  const totalSpent = paymentHistory.reduce((s, p) => s + p.amount, 0);
  const milestoneTotal = paymentHistory.filter((p) => p.type === 'milestone').reduce((s, p) => s + p.amount, 0);
  const subscriptionTotal = paymentHistory.filter((p) => p.type === 'subscription').reduce((s, p) => s + p.amount, 0);
  const serviceTotal = paymentHistory.filter((p) => p.type === 'service').reduce((s, p) => s + p.amount, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'ri-flag-line';
      case 'subscription':
        return 'ri-vip-crown-line';
      case 'service':
        return 'ri-tools-line';
      default:
        return 'ri-money-dollar-circle-line';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-[#00B8A9]/10 text-[#00B8A9]';
      case 'subscription':
        return 'bg-[#D4B483]/10 text-[#D4B483]';
      case 'service':
        return 'bg-[#0B1F33]/10 text-[#0B1F33]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100 text-green-700', label: 'Completed', icon: 'ri-check-line' };
      case 'refunded':
        return { bg: 'bg-orange-100 text-orange-700', label: 'Refunded', icon: 'ri-refund-2-line' };
      case 'pending':
        return { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: 'ri-time-line' };
      default:
        return { bg: 'bg-gray-100 text-gray-600', label: status, icon: 'ri-question-line' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Payment History
            </h2>
            <p className="text-white/70 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              All transactions, receipts, and confirmation IDs
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Total Spent</p>
            <p className="text-4xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-flag-line text-[#00B8A9]"></i>
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Job Payments</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${milestoneTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-tools-line text-white/60"></i>
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Service Payments</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${serviceTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-vip-crown-line text-[#D4B483]"></i>
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Subscriptions</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${subscriptionTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All Payments' },
          { id: 'milestone', label: 'Job Milestones' },
          { id: 'service', label: 'Services' },
          { id: 'subscription', label: 'Subscriptions' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === f.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-[#0B1F33]/30'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {filtered.map((payment) => {
          const statusBadge = getStatusBadge(payment.status);
          const isExpanded = expandedId === payment.id;

          return (
            <div
              key={payment.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all"
            >
              {/* Main Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors"
              >
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(payment.type)}`}>
                  <i className={`${getTypeIcon(payment.type)} text-xl`}></i>
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0B1F33] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {payment.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {payment.date}
                    </span>
                    {payment.contractor && (
                      <span className="text-xs text-[#6B7C8F] flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <i className="ri-user-line text-xs"></i>
                        {payment.contractor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  <div>
                    <p className="text-base font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      ${payment.amount.toLocaleString()}.00
                    </p>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {payment.method} ••{payment.cardLast4}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg}`}>
                    <i className={`${statusBadge.icon} text-xs`}></i>
                    {statusBadge.label}
                  </span>
                  <i className={`ri-arrow-down-s-line text-[#6B7C8F] text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 bg-[#F9F9FB]">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Confirmation ID</p>
                      <p className="text-sm font-bold text-[#0B1F33] font-mono">{payment.confirmationId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Payment Date</p>
                      <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{payment.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Payment Method</p>
                      <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {payment.method} ending in {payment.cardLast4}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Amount</p>
                      <p className="text-sm font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ${payment.amount.toLocaleString()}.00
                      </p>
                    </div>
                    {payment.jobTitle && (
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Job</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{payment.jobTitle}</p>
                      </div>
                    )}
                    {payment.contractor && (
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contractor</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{payment.contractor}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleDownloadReceipt(payment)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#0a1a2a] transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-download-line"></i>
                      Download Receipt
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B1F33] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-mail-send-line"></i>
                      Email Receipt
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(payment.confirmationId);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#6B7C8F] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-file-copy-line"></i>
                      Copy ID
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-lg font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            No payments found
          </p>
          <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            No transactions match the selected filter
          </p>
        </div>
      )}

      {/* Escrow Notice */}
      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-[#00B8A9] text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Emporva Payment Protection
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            All milestone payments are held in escrow until work is verified and approved. If there is a dispute, Emporva mediates to protect both parties. Subscription payments are covered by our 30-day refund policy.
          </p>
        </div>
      </div>
    </div>
  );
}

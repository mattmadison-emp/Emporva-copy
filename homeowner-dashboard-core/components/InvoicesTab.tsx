import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Invoice {
  id: string;
  invoiceNumber: string;
  contractorName: string;
  jobTitle: string;
  date: string;
  dueDate: string;
  total: number;
  balanceDue: number;
  status: 'pending' | 'paid' | 'overdue';
  contractorAvatar?: string;
  description?: string;
  issueDate?: string;
  amount?: number;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-001',
    contractorName: 'Elite Plumbing Solutions',
    contractorAvatar: 'https://readdy.ai/api/search-image?query=professional%20plumber%20headshot%20portrait%2C%20friendly%20smile%2C%20work%20uniform%2C%20high%20quality%20photo&width=100&height=100&seq=contractor1&orientation=squarish',
    jobTitle: 'Kitchen Faucet Leak Repair',
    description: 'Kitchen Faucet Leak Repair',
    date: 'Jan 15, 2025',
    issueDate: 'Jan 15, 2025',
    dueDate: 'Jan 30, 2025',
    total: 850,
    amount: 850,
    balanceDue: 850,
    status: 'pending'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-002',
    contractorName: 'ProTile Masters',
    contractorAvatar: 'https://readdy.ai/api/search-image?query=professional%20tile%20contractor%20headshot%20portrait%2C%20friendly%20smile%2C%20work%20uniform%2C%20high%20quality%20photo&width=100&height=100&seq=contractor2&orientation=squarish',
    jobTitle: 'Bathroom Tile Repair',
    description: 'Bathroom Tile Repair',
    date: 'Jan 10, 2025',
    issueDate: 'Jan 10, 2025',
    dueDate: 'Jan 25, 2025',
    total: 1200,
    amount: 1200,
    balanceDue: 1200,
    status: 'pending'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-089',
    contractorName: 'Apex Electrical',
    contractorAvatar: 'https://readdy.ai/api/search-image?query=professional%20electrician%20headshot%20portrait%2C%20friendly%20smile%2C%20work%20uniform%2C%20high%20quality%20photo&width=100&height=100&seq=contractor3&orientation=squarish',
    jobTitle: 'Outlet Installation',
    description: 'Outlet Installation',
    date: 'Dec 20, 2024',
    issueDate: 'Dec 20, 2024',
    dueDate: 'Jan 5, 2025',
    total: 450,
    amount: 450,
    balanceDue: 0,
    status: 'paid'
  }
];

const mockPaymentHistory = [
  {
    id: 'pay-1',
    date: 'Dec 28, 2024',
    description: 'Outlet Installation',
    contractor: 'Apex Electrical',
    amount: 450,
    confirmationId: 'EMP-X7K9M-2TBR'
  },
  {
    id: 'pay-2',
    date: 'Dec 15, 2024',
    description: 'Water Heater Replacement',
    contractor: 'James Wilson Plumbing',
    amount: 2100,
    confirmationId: 'EMP-R9W3Q-7JKL'
  }
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function InvoicesTab() {
  const navigate = useNavigate();
  const [_filter, _setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [_expandedId, _setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);

  // Filter invoices based on search and status
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalOwed = mockInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.balanceDue, 0);
  const totalPaid = mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pendingCount = mockInvoices.filter(i => i.status === 'pending').length;

  const handlePayInvoice = (invoice: Invoice) => {
    navigate(`/checkout?type=invoice-payment&invoiceId=${invoice.id}&amount=${invoice.balanceDue}&invoiceNumber=${encodeURIComponent(invoice.invoiceNumber)}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Invoices
            </h2>
            <p className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              View and pay invoices from your contractors
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-3 flex items-center gap-3">
              <i className="ri-notification-3-line text-orange-400 text-xl"></i>
              <div>
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {pendingCount} invoice{pendingCount > 1 ? 's' : ''} awaiting payment
                </p>
                <p className="text-xs text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total: {formatCurrency(totalOwed)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-time-line text-orange-400"></i>
              <p className="text-xs text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Amount Owed</p>
            </div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {formatCurrency(totalOwed)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-check-double-line text-green-400"></i>
              <p className="text-xs text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Total Paid</p>
            </div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-file-text-line text-white"></i>
              <p className="text-xs text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Total Invoices</p>
            </div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockInvoices.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{invoice.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={invoice.contractorAvatar}
                        alt={invoice.contractorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-900">{invoice.contractorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">${invoice.amount?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700">{invoice.dueDate}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowInvoiceDetail(true);
                        }}
                        className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                        title="View Details"
                      >
                        <i className="ri-eye-line text-lg"></i>
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-1">{invoice.invoiceNumber}</p>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">{invoice.description}</p>
                <div className="flex items-center gap-2">
                  <img
                    src={invoice.contractorAvatar}
                    alt={invoice.contractorName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-700">{invoice.contractorName}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div>
                <p className="text-lg font-bold text-gray-900">${invoice.amount?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Due {invoice.dueDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setShowInvoiceDetail(true);
                  }}
                  className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                >
                  <i className="ri-eye-line text-lg"></i>
                </button>
                {invoice.status !== 'paid' && (
                  <button 
                    onClick={() => handlePayInvoice(invoice)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium whitespace-nowrap"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-gray-600 mb-2">No invoices found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Invoice Details</h3>
              <button
                onClick={() => setShowInvoiceDetail(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                </div>
                <span className={`self-start px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                  selectedInvoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </span>
              </div>

              {/* Contractor Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={selectedInvoice.contractorAvatar}
                  alt={selectedInvoice.contractorName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedInvoice.contractorName}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Description</p>
                <p className="text-sm text-gray-700">{selectedInvoice.description}</p>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ${selectedInvoice.amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedInvoice.status !== 'paid' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Download PDF
                  </button>
                  <button 
                    onClick={() => {
                      setShowInvoiceDetail(false);
                      handlePayInvoice(selectedInvoice);
                    }}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Pay Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History - Gated Section */}
      <div className="relative">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#F9F9FB]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Payment History
                </h3>
                <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  View all past transactions and download receipts
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-lg">
                <i className="ri-vip-crown-line text-[#D4B483]"></i>
                <span className="text-xs font-bold text-[#D4B483]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Premium</span>
              </div>
            </div>
          </div>

          {/* Preview of 2 records */}
          <div className="p-4 space-y-2 opacity-60 pointer-events-none">
            {mockPaymentHistory.slice(0, 2).map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4 bg-[#F9F9FB] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-green-600 text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {payment.description}
                  </p>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {payment.date} &middot; {payment.contractor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-[#6B7C8F] font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {payment.confirmationId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Lock Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent flex items-center justify-center">
          <div className="text-center px-6 py-8 bg-white rounded-xl shadow-lg border-2 border-[#D4B483]/30 max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4B483] to-[#b89563] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-white text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Unlock Payment History
            </h3>
            <p className="text-sm text-[#6B7C8F] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Upgrade to Premium to access full transaction history, download receipts, and track all payments in one place.
            </p>
            <a
              href="/homeowner-plans"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4B483] to-[#b89563] text-white rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-vip-crown-line"></i>
              Unlock with Premium
            </a>
          </div>
        </div>
      </div>

      {/* Escrow Notice */}
      <div className="bg-[#14B8A6]/5 border border-[#14B8A6]/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-[#14B8A6] text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Emporva Payment Protection
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            All invoice payments are processed through Emporva's secure escrow system. Funds are held until work is verified and approved.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { receivedInvoices as initialReceivedInvoices } from '../../../mocks/receivedInvoices';
import type { ReceivedInvoice } from '../../../mocks/receivedInvoices';
import EmailPreview from '../../../components/feature/EmailPreview';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function InvoicesReceived() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'disputed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<ReceivedInvoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ReceivedInvoice[]>(initialReceivedInvoices);
  const [emailPreview, setEmailPreview] = useState<{ type: 'invoice-sent' | 'invoice-paid'; invoice: ReceivedInvoice } | null>(null);

  // Check for paid invoices from sessionStorage
  useEffect(() => {
    const paidRaw = sessionStorage.getItem('emporva_paid_invoices');
    if (paidRaw) {
      try {
        const paidList = JSON.parse(paidRaw) as Array<{ invoiceId: string; invoiceNumber: string; confirmationId: string; amount: number; paidDate: string }>;
        if (paidList.length > 0) {
          setInvoices(prev => prev.map(inv => {
            const match = paidList.find(p => p.invoiceId === inv.id || p.invoiceNumber === inv.invoiceNumber);
            if (match) {
              return { ...inv, status: 'paid' as const, balanceDue: 0, amountPaid: inv.total };
            }
            return inv;
          }));
        }
      } catch { /* ignore */ }
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const totalOwed = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.balanceDue, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  void invoices.filter(i => i.status === 'overdue').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-green-100 text-green-700', label: 'Paid', icon: 'ri-check-line' };
      case 'pending': return { bg: 'bg-orange-100 text-orange-700', label: 'Pending', icon: 'ri-time-line' };
      case 'overdue': return { bg: 'bg-red-100 text-red-700', label: 'Overdue', icon: 'ri-alarm-warning-line' };
      case 'disputed': return { bg: 'bg-purple-100 text-purple-700', label: 'Disputed', icon: 'ri-discuss-line' };
      default: return { bg: 'bg-gray-100 text-gray-600', label: status, icon: 'ri-question-line' };
    }
  };

  const handlePayInvoice = (invoice: ReceivedInvoice) => {
    navigate(`/checkout?type=invoice-payment&invoiceId=${invoice.id}&amount=${invoice.balanceDue}&invoiceNumber=${encodeURIComponent(invoice.invoiceNumber)}`);
  };

  if (viewingInvoice) {
    return (
      <InvoiceDetailView
        invoice={viewingInvoice}
        onBack={() => setViewingInvoice(null)}
        onPay={() => handlePayInvoice(viewingInvoice)}
        onPreviewEmail={(type) => setEmailPreview({ type, invoice: viewingInvoice })}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-green-50 border-green-200 text-green-800">
            <i className="ri-check-line text-green-600 text-lg"></i>
            <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{toast}</span>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreview && (
        <EmailPreview
          type={emailPreview.type}
          data={{
            recipientName: emailPreview.type === 'invoice-sent' ? 'Jennifer Martinez' : emailPreview.invoice.contractorName,
            recipientEmail: emailPreview.type === 'invoice-sent' ? 'jennifer@email.com' : emailPreview.invoice.contractorEmail,
            senderName: emailPreview.type === 'invoice-sent' ? emailPreview.invoice.contractorName : 'Jennifer Martinez',
            invoiceNumber: emailPreview.invoice.invoiceNumber,
            jobTitle: emailPreview.invoice.jobTitle,
            amount: emailPreview.invoice.total,
            dueDate: emailPreview.invoice.dueDate,
            paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            confirmationId: `EMP-${Date.now().toString(36).toUpperCase().slice(0, 6)}`,
            propertyAddress: emailPreview.invoice.propertyAddress,
          }}
          onClose={() => setEmailPreview(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Invoices
            </h2>
            <p className="text-white/70 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              View and pay invoices from your contractors
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-3 flex items-center gap-3">
              <i className="ri-notification-3-line text-orange-400 text-xl"></i>
              <div>
                <p className="text-sm font-bold text-orange-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {pendingCount} invoice{pendingCount > 1 ? 's' : ''} awaiting payment
                </p>
                <p className="text-xs text-orange-200/70" style={{ fontFamily: 'Inter, sans-serif' }}>
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
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Amount Owed</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {formatCurrency(totalOwed)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-check-double-line text-green-400"></i>
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Total Paid</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-file-text-line text-white/60"></i>
              <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>Total Invoices</p>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {invoices.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {([
          { id: 'all', label: 'All Invoices' },
          { id: 'pending', label: 'Pending' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'paid', label: 'Paid' },
          { id: 'disputed', label: 'Disputed' },
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === f.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-[#0B1F33]/30'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {f.label}
            <span className="ml-1 opacity-70">
              ({f.id === 'all' ? invoices.length : invoices.filter(i => i.status === f.id).length})
            </span>
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-file-text-line text-[#6B7C8F] text-2xl"></i>
            </div>
            <p className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>No invoices found</p>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>No invoices match this filter.</p>
          </div>
        ) : (
          filtered.map(invoice => {
            const statusBadge = getStatusBadge(invoice.status);
            const isExpanded = expandedId === invoice.id;

            return (
              <div key={invoice.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Main Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    invoice.status === 'paid' ? 'bg-green-100' :
                    invoice.status === 'overdue' ? 'bg-red-100' :
                    invoice.status === 'pending' ? 'bg-orange-100' : 'bg-purple-100'
                  }`}>
                    <i className={`text-lg ${
                      invoice.status === 'paid' ? 'ri-check-line text-green-600' :
                      invoice.status === 'overdue' ? 'ri-alarm-warning-line text-red-600' :
                      invoice.status === 'pending' ? 'ri-file-text-line text-orange-600' : 'ri-discuss-line text-purple-600'
                    }`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0B1F33] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {invoice.invoiceNumber}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg}`}>
                        <i className={`${statusBadge.icon} text-xs`}></i>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {invoice.contractorName} &middot; {invoice.jobTitle}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-4">
                    <div>
                      <p className="text-base font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {invoice.balanceDue > 0 ? `Due: ${formatCurrency(invoice.balanceDue)}` : 'Paid in full'}
                      </p>
                    </div>
                    {invoice.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePayInvoice(invoice); }}
                        className="px-4 py-2 bg-[#00B8A9] text-white rounded-lg text-xs font-bold hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Pay Now
                      </button>
                    )}
                    <i className={`ri-arrow-down-s-line text-[#6B7C8F] text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-[#F9F9FB]">
                    {/* Paid confirmation banner */}
                    {invoice.status === 'paid' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-check-double-line text-green-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment confirmed — funds in escrow</p>
                          <p className="text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>This invoice has been paid in full. The contractor has been notified.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEmailPreview({ type: 'invoice-paid', invoice }); }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-mail-line mr-1"></i>Contractor Email
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEmailPreview({ type: 'invoice-sent', invoice }); }}
                            className="px-3 py-1.5 bg-white text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-50 cursor-pointer whitespace-nowrap"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-mail-open-line mr-1"></i>Your Receipt Email
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending email preview */}
                    {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                      <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/10 rounded-lg p-3 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0B1F33]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-mail-line text-[#0B1F33]"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Invoice notification received</p>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>You were notified about this invoice via email.</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEmailPreview({ type: 'invoice-sent', invoice }); }}
                          className="px-3 py-1.5 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-eye-line mr-1"></i>View Email
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice Date</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</p>
                        <p className={`text-sm font-semibold ${invoice.status === 'overdue' ? 'text-red-600' : 'text-[#0B1F33]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {invoice.dueDate}
                          {invoice.status === 'overdue' && <span className="ml-1 text-xs text-red-500">(Overdue)</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Contractor</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.contractorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Property</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.propertyAddress}</p>
                      </div>
                    </div>

                    {/* Line Items Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Item</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.lineItems.map((item, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                              <td className="px-4 py-2 text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.description}</td>
                              <td className="px-3 py-2 text-xs text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.quantity} {item.unit}</td>
                              <td className="px-3 py-2 text-xs text-right text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(item.unitCost)}</td>
                              <td className="px-4 py-2 text-xs text-right font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t border-gray-200 px-4 py-3 flex justify-end">
                        <div className="w-48 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6B7C8F]">Subtotal</span>
                            <span className="font-semibold text-[#0B1F33]">{formatCurrency(invoice.subtotal)}</span>
                          </div>
                          {invoice.discount > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">Discount</span>
                              <span className="font-semibold text-green-600">-{formatCurrency(invoice.discount)}</span>
                            </div>
                          )}
                          {invoice.tax > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-[#6B7C8F]">Tax</span>
                              <span className="font-semibold text-[#0B1F33]">{formatCurrency(invoice.tax)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                            <span className="font-bold text-[#0B1F33]">Total</span>
                            <span className="font-bold text-[#00B8A9]">{formatCurrency(invoice.total)}</span>
                          </div>
                          {invoice.amountPaid > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">Paid</span>
                              <span className="font-semibold text-green-600">-{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                          )}
                          {invoice.balanceDue > 0 && (
                            <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                              <span className="font-bold text-[#0B1F33]">Balance Due</span>
                              <span className="font-bold text-orange-600">{formatCurrency(invoice.balanceDue)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {invoice.notes && (
                      <div className="bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <i className="ri-sticky-note-line text-[#D4B483] text-sm mt-0.5"></i>
                        <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {invoice.balanceDue > 0 && (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg text-sm font-bold hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-secure-payment-line"></i>
                          Pay {formatCurrency(invoice.balanceDue)}
                        </button>
                      )}
                      <button
                        onClick={() => setViewingInvoice(invoice)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-eye-line"></i>
                        View Full Invoice
                      </button>
                      <button
                        onClick={() => showToast('Invoice downloaded')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0B1F33] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-download-line"></i>
                        Download
                      </button>
                      {invoice.status !== 'paid' && invoice.status !== 'disputed' && (
                        <button
                          onClick={() => showToast('Dispute submitted — Emporva will review within 48 hours')}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap ml-auto"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-discuss-line"></i>
                          Dispute
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
            All invoice payments are processed through Emporva&apos;s secure escrow system. Funds are held until work is verified and approved. If you believe an invoice is incorrect, use the Dispute button to initiate a review.
          </p>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   INVOICE DETAIL VIEW
   ============================================================ */
function InvoiceDetailView({ invoice, onBack, onPay, onPreviewEmail }: {
  invoice: ReceivedInvoice;
  onBack: () => void;
  onPay: () => void;
  onPreviewEmail: (type: 'invoice-sent' | 'invoice-paid') => void;
}) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#6B7C8F] hover:text-[#0B1F33] font-semibold text-sm cursor-pointer transition-colors"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <i className="ri-arrow-left-line"></i>
        Back to Invoices
      </button>

      {/* Paid Banner */}
      {invoice.status === 'paid' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-check-double-line text-green-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Invoice Paid in Full
            </p>
            <p className="text-xs text-green-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Payment has been processed and the contractor has been notified. Funds are held in Emporva escrow until work is verified.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPreviewEmail('invoice-paid')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-mail-line"></i>
                View Contractor Notification
              </button>
              <button
                onClick={() => onPreviewEmail('invoice-sent')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-mail-open-line"></i>
                View Your Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-[#0B1F33] p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
                alt="Emporva"
                className="w-10 h-10"
              />
              <div>
                <p className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>INVOICE</p>
                <p className="text-xs text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {invoice.status === 'paid' ? 'Amount Paid' : 'Balance Due'}
              </p>
              <p className={`text-3xl font-bold ${invoice.status === 'paid' ? 'text-green-400' : 'text-[#5eead4]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                {formatCurrency(invoice.status === 'paid' ? invoice.total : invoice.balanceDue)}
              </p>
              {invoice.status === 'paid' && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                  <i className="ri-check-line text-xs"></i> Paid
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice Date</p>
              <p className="text-sm font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{invoice.date}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</p>
              <p className="text-sm font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{invoice.dueDate}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Terms</p>
              <p className="text-sm font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {invoice.paymentTerms.split('—')[0].trim()}
              </p>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="p-6 grid grid-cols-2 gap-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>From</p>
            <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{invoice.contractorName}</p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.contractorEmail}</p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.contractorPhone}</p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>License: {invoice.contractorLicense}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Project</p>
            <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{invoice.jobTitle}</p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.propertyAddress}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6">
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-3 text-left text-xs font-semibold text-[#6B7C8F] uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</th>
                <th className="pb-3 text-center text-xs font-semibold text-[#6B7C8F] uppercase w-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Qty</th>
                <th className="pb-3 text-right text-xs font-semibold text-[#6B7C8F] uppercase w-28" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate</th>
                <th className="pb-3 text-right text-xs font-semibold text-[#6B7C8F] uppercase w-28" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.description}</td>
                  <td className="py-3 text-sm text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.quantity} {item.unit}</td>
                  <td className="py-3 text-sm text-right text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(item.unitCost)}</td>
                  <td className="py-3 text-sm text-right font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7C8F]">Subtotal</span>
                <span className="font-semibold text-[#0B1F33]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount {invoice.discountLabel && `(${invoice.discountLabel})`}</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7C8F]">Tax ({invoice.taxRate}%)</span>
                  <span className="font-semibold text-[#0B1F33]">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base pt-2 border-t-2 border-gray-200">
                <span className="font-bold text-[#0B1F33]">Total</span>
                <span className="font-bold text-[#0B1F33]">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Amount Paid</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2 border-t-2 border-[#00B8A9]">
                <span className="font-bold text-[#0B1F33]">Balance Due</span>
                <span className={`font-bold ${invoice.balanceDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 pb-6">
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <p className="text-xs font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>NOTES</p>
              <p className="text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {invoice.balanceDue > 0 && (
            <button
              onClick={onPay}
              className="flex items-center gap-2 px-6 py-3 bg-[#00B8A9] text-white rounded-lg font-bold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-secure-payment-line text-lg"></i>
              Pay {formatCurrency(invoice.balanceDue)}
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-3 bg-white text-[#0B1F33] border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-download-line"></i>
            Download PDF
          </button>
          <button
            className="flex items-center gap-2 px-4 py-3 bg-white text-[#0B1F33] border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-printer-line"></i>
            Print
          </button>
          {(invoice.status === 'pending' || invoice.status === 'overdue') && (
            <button
              onClick={() => onPreviewEmail('invoice-sent')}
              className="flex items-center gap-2 px-4 py-3 bg-white text-[#0B1F33] border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-mail-open-line"></i>
              View Email
            </button>
          )}
        </div>
      </div>

      {/* Escrow Notice */}
      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-[#00B8A9] text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Secure Escrow Payment
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            When you pay this invoice, funds are held in Emporva&apos;s escrow until the associated work is verified and approved by you. This protects you from paying for incomplete or unsatisfactory work.
          </p>
        </div>
      </div>
    </div>
  );
}

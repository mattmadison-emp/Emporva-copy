import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { generateInvoicePDF } from '../../../utils/invoicePdf';
import type { InvoiceData, InvoiceLineItem } from '../../../utils/invoicePdf';
import EmailPreview from '../../../components/feature/EmailPreview';

interface InvoiceHistoryItem {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  jobTitle: string;
  amount: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoiceBuilderProps {
  jobId: number;
  jobTitle: string;
  homeowner: string;
  homeownerEmail: string;
  propertyAddress: string;
  confirmedQuote: string;
  onClose: () => void;
  onSend: (invoice: InvoiceData) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function generateInvoiceNumber(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `EMP-INV-2025-${num}`;
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDueDateFormatted(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InvoiceBuilder({ jobId: _jobId, jobTitle, homeowner, homeownerEmail, propertyAddress, confirmedQuote, onClose, onSend }: InvoiceBuilderProps) {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<{ type: 'invoice-sent' | 'invoice-paid'; inv: InvoiceHistoryItem } | null>(null);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceHistoryItem[]>([]);

  // Form state
  const [contractorName, setContractorName] = useState('');
  const [contractorEmail, setContractorEmail] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorAddress, setContractorAddress] = useState('');
  const [contractorLicense, setContractorLicense] = useState('');

  // Load contractor profile from DB
  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', user.id).single(),
      supabase.from('contractor_profiles').select('business_name, licensing_status').eq('user_id', user.id).single(),
    ]).then(([profileRes, cpRes]) => {
      if (profileRes.data) {
        setContractorName(cpRes.data?.business_name || `${profileRes.data.first_name} ${profileRes.data.last_name}`);
        setContractorEmail(profileRes.data.email);
        setContractorPhone(profileRes.data.phone || '');
      }
    });
  }, [user]);
  const [clientName, setClientName] = useState(homeowner);
  const [clientEmail, setClientEmail] = useState(homeownerEmail);
  const [clientAddress, setClientAddress] = useState(propertyAddress);
  const [dueDays, setDueDays] = useState(15);
  const [paymentTerms, setPaymentTerms] = useState('Net 15 — Payment due within 15 days of invoice date');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountLabel, setDiscountLabel] = useState('');

  const quoteNum = parseFloat(confirmedQuote.replace(/[$,]/g, ''));
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: 'Labor — Project execution', quantity: 1, unit: 'lot', unitCost: Math.round(quoteNum * 0.6), total: Math.round(quoteNum * 0.6) },
    { description: 'Materials & supplies', quantity: 1, unit: 'lot', unitCost: Math.round(quoteNum * 0.3), total: Math.round(quoteNum * 0.3) },
    { description: 'Permits, cleanup & disposal', quantity: 1, unit: 'lot', unitCost: Math.round(quoteNum * 0.1), total: Math.round(quoteNum * 0.1) },
  ]);

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * taxRate) / 100;
  const total = subtotal + tax - discountAmount;

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(lineItems.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitCost') {
        updated.total = Number(updated.quantity) * Number(updated.unitCost);
      }
      return updated;
    }));
  };

  const buildInvoiceData = (status: 'draft' | 'sent'): InvoiceData => ({
    invoiceNumber: generateInvoiceNumber(),
    date: getTodayFormatted(),
    dueDate: getDueDateFormatted(dueDays),
    status,
    contractorName,
    contractorEmail,
    contractorPhone,
    contractorAddress,
    contractorLicense,
    clientName,
    clientEmail,
    clientAddress,
    jobTitle,
    lineItems,
    subtotal,
    tax,
    taxRate,
    discount: discountAmount,
    discountLabel,
    total,
    amountPaid: 0,
    balanceDue: total,
    paymentTerms,
    notes: notes || undefined,
  });

  const handlePreview = () => {
    generateInvoicePDF(buildInvoiceData('draft'));
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      const invoice = buildInvoiceData('sent');
      onSend(invoice);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2500);
    }, 1800);
  };

  const handleSaveDraft = () => {
    onSend(buildInvoiceData('draft'));
    onClose();
  };

  const handleViewHistoryInvoice = (item: InvoiceHistoryItem) => {
    const mockInvoice: InvoiceData = {
      invoiceNumber: item.invoiceNumber,
      date: item.date,
      dueDate: item.dueDate,
      status: item.status,
      contractorName: 'ProFlow Plumbing & Repair',
      contractorEmail: 'contact@proflowplumbing.com',
      contractorPhone: '(704) 555-0192',
      contractorAddress: '1847 Trade Center Blvd, Charlotte, NC 28203',
      contractorLicense: 'NC-PLB-29471',
      clientName: item.clientName,
      clientEmail: 'client@email.com',
      clientAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
      jobTitle: item.jobTitle,
      lineItems: [
        { description: 'Labor', quantity: 1, unit: 'lot', unitCost: Math.round(item.total * 0.6), total: Math.round(item.total * 0.6) },
        { description: 'Materials', quantity: 1, unit: 'lot', unitCost: Math.round(item.total * 0.3), total: Math.round(item.total * 0.3) },
        { description: 'Other', quantity: 1, unit: 'lot', unitCost: item.total - Math.round(item.total * 0.6) - Math.round(item.total * 0.3), total: item.total - Math.round(item.total * 0.6) - Math.round(item.total * 0.3) },
      ],
      subtotal: item.total,
      tax: 0,
      taxRate: 0,
      discount: 0,
      total: item.total,
      amountPaid: item.total - item.balanceDue,
      balanceDue: item.balanceDue,
      paymentTerms: 'Net 15',
    };
    generateInvoicePDF(mockInvoice);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'sent': return 'bg-[#0B1F33]/10 text-[#0B1F33]';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredHistory = historyFilter === 'all' ? invoiceHistory : invoiceHistory.filter(i => i.status === historyFilter);

  const totalOutstanding = invoiceHistory.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.balanceDue, 0);
  const totalPaid = invoiceHistory.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoiceHistory.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balanceDue, 0);

  // ---- LIST VIEW ----
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Email Preview Modal */}
        {emailPreview && (
          <EmailPreview
            type={emailPreview.type}
            data={{
              recipientName: emailPreview.type === 'invoice-sent' ? emailPreview.inv.clientName : contractorName,
              recipientEmail: emailPreview.type === 'invoice-sent' ? 'homeowner@email.com' : contractorEmail,
              senderName: emailPreview.type === 'invoice-sent' ? contractorName : emailPreview.inv.clientName,
              invoiceNumber: emailPreview.inv.invoiceNumber,
              jobTitle: emailPreview.inv.jobTitle,
              amount: emailPreview.type === 'invoice-sent' ? emailPreview.inv.balanceDue || emailPreview.inv.total : emailPreview.inv.total,
              dueDate: emailPreview.inv.dueDate,
              paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              confirmationId: `EMP-${Date.now().toString(36).toUpperCase().slice(0, 6)}`,
              propertyAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
            }}
            onClose={() => setEmailPreview(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Invoices</h3>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Create, send, and track invoices for your jobs</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-add-line"></i>
            New Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-double-line text-green-600"></i>
              </div>
              <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Total Paid</span>
            </div>
            <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-[#0B1F33]"></i>
              </div>
              <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Outstanding</span>
            </div>
            <p className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-error-warning-line text-red-600"></i>
              </div>
              <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Overdue</span>
            </div>
            <p className="text-xl font-bold text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(totalOverdue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setHistoryFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                historyFilter === f ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1 opacity-70">
                ({f === 'all' ? invoiceHistory.length : invoiceHistory.filter(i => i.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-14 h-14 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-file-text-line text-[#6B7C8F] text-2xl"></i>
              </div>
              <p className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>No invoices found</p>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>No invoices match this filter.</p>
            </div>
          ) : (
            filteredHistory.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#F9F9FB] transition-colors"
                  onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    inv.status === 'paid' ? 'bg-green-100' :
                    inv.status === 'overdue' ? 'bg-red-100' :
                    inv.status === 'sent' ? 'bg-[#0B1F33]/10' : 'bg-gray-100'
                  }`}>
                    <i className={`text-lg ${
                      inv.status === 'paid' ? 'ri-check-line text-green-600' :
                      inv.status === 'overdue' ? 'ri-alarm-warning-line text-red-600' :
                      inv.status === 'sent' ? 'ri-send-plane-line text-[#0B1F33]' : 'ri-draft-line text-gray-500'
                    }`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0B1F33] text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{inv.invoiceNumber}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {inv.clientName} &middot; {inv.jobTitle}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(inv.total)}</p>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {inv.balanceDue > 0 ? `Due: ${formatCurrency(inv.balanceDue)}` : 'Paid in full'}
                    </p>
                  </div>
                  <i className={`ri-arrow-${expandedInvoice === inv.id ? 'up' : 'down'}-s-line text-[#6B7C8F]`}></i>
                </div>
                {expandedInvoice === inv.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Issued</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{inv.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</p>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{inv.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Balance Due</p>
                        <p className={`text-sm font-semibold ${inv.balanceDue > 0 ? 'text-orange-600' : 'text-green-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {formatCurrency(inv.balanceDue)}
                        </p>
                      </div>
                    </div>

                    {/* Paid confirmation banner */}
                    {inv.status === 'paid' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-check-double-line text-green-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment received — funds in escrow</p>
                          <p className="text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>Homeowner paid in full. Funds will be released upon work verification.</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEmailPreview({ type: 'invoice-paid', inv }); }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-mail-line mr-1"></i>View Email
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewHistoryInvoice(inv)}
                        className="px-3 py-1.5 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-eye-line mr-1"></i>View PDF
                      </button>
                      {inv.status === 'sent' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEmailPreview({ type: 'invoice-sent', inv }); }}
                          className="px-3 py-1.5 bg-[#00B8A9]/10 text-[#00B8A9] rounded-lg text-xs font-semibold hover:bg-[#00B8A9]/20 cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-mail-open-line mr-1"></i>Preview Email Sent
                        </button>
                      )}
                      {inv.status === 'draft' && (
                        <button className="px-3 py-1.5 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-send-plane-line mr-1"></i>Send
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'overdue') && (
                        <button className="px-3 py-1.5 bg-[#D4B483] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-[#c5a574] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-mail-send-line mr-1"></i>Resend
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <i className="ri-file-copy-line mr-1"></i>Duplicate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ---- CREATE VIEW ----
  if (sentSuccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-check-double-line text-green-600 text-4xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Invoice Sent!</h3>
          <p className="text-sm text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Invoice has been sent to <strong>{clientName}</strong> at {clientEmail}
          </p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            They will receive an email with a link to view and pay.
          </p>
        </div>
      </div>
    );
  }

  if (sending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Sending Invoice...</h3>
          <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Generating branded PDF and emailing to {clientName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F9F9FB] hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-[#0B1F33] text-lg"></i>
          </button>
          <div>
            <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Invoice</h3>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-[#00B8A9] text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <i className="ri-check-line"></i> : s}
              </div>
              <span className={`text-xs font-semibold hidden md:inline ${step >= s ? 'text-[#0B1F33]' : 'text-gray-400'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {s === 1 ? 'Details' : s === 2 ? 'Line Items' : 'Review'}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-5">
          {/* From */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-[#0B1F33] text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <i className="ri-building-line text-[#00B8A9]"></i> From (Your Business)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Business Name</label>
                <input type="text" value={contractorName} onChange={e => setContractorName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email</label>
                <input type="email" value={contractorEmail} onChange={e => setContractorEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Phone</label>
                <input type="text" value={contractorPhone} onChange={e => setContractorPhone(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>License #</label>
                <input type="text" value={contractorLicense} onChange={e => setContractorLicense(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Address</label>
                <input type="text" value={contractorAddress} onChange={e => setContractorAddress(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>
          </div>

          {/* To */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-[#0B1F33] text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <i className="ri-user-line text-[#00B8A9]"></i> Bill To (Client)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Client Name</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Client Email</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Property Address</label>
                <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-[#0B1F33] text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <i className="ri-calendar-check-line text-[#00B8A9]"></i> Payment Terms
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Due In (Days)</label>
                <select value={dueDays} onChange={e => { setDueDays(Number(e.target.value)); setPaymentTerms(`Net ${e.target.value} — Payment due within ${e.target.value} days of invoice date`); }} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] cursor-pointer bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <option value={7}>Net 7</option>
                  <option value={15}>Net 15</option>
                  <option value={30}>Net 30</option>
                  <option value={45}>Net 45</option>
                  <option value={60}>Net 60</option>
                  <option value={0}>Due on Receipt</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Tax Rate (%)</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min={0} max={25} step={0.25} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Notes (Optional)</label>
                <textarea value={notes} onChange={e => { if (e.target.value.length <= 500) setNotes(e.target.value); }} placeholder="Thank you for your business..." rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent resize-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                <p className="text-xs text-[#6B7C8F] text-right mt-1">{notes.length}/500</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Line Items */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-bold text-[#0B1F33] text-sm flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <i className="ri-list-check text-[#00B8A9]"></i> Line Items
              </h4>
              <button onClick={addLineItem} className="flex items-center gap-1 text-sm text-[#00B8A9] font-semibold hover:text-[#00a89a] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <i className="ri-add-line"></i> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9F9FB]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider w-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Qty</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider w-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Unit</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider w-28" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider w-28" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount</th>
                    <th className="px-2 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-[#F9F9FB]/50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="text" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} placeholder="Item description" className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))} min={0} step={0.5} className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
                      </td>
                      <td className="px-3 py-3">
                        <select value={item.unit} onChange={e => updateLineItem(idx, 'unit', e.target.value)} className="w-full px-1 py-1.5 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00B8A9] cursor-pointer bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {['ea', 'hours', 'days', 'sqft', 'lf', 'lot'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                          <input type="number" value={item.unitCost} onChange={e => updateLineItem(idx, 'unitCost', Number(e.target.value))} min={0} step={0.01} className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-2 py-3">
                        {lineItems.length > 1 && (
                          <button onClick={() => removeLineItem(idx)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer">
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Subtotal</span>
                    <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(subtotal)}</span>
                  </div>
                  {/* Discount */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6B7C8F] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>Discount</span>
                    <div className="flex-1 flex gap-1">
                      <input type="text" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00B8A9]" style={{ fontFamily: 'Inter, sans-serif' }} />
                      <div className="relative w-20">
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input type="number" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} min={0} className="w-full pl-4 pr-1 py-1 border border-gray-200 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#00B8A9]" style={{ fontFamily: 'Inter, sans-serif' }} />
                      </div>
                    </div>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Tax ({taxRate}%)</span>
                      <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                    <span className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Total</span>
                    <span className="font-bold text-[#00B8A9] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Preview Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <img src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" alt="Emporva" className="w-10 h-10" />
                <div>
                  <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>INVOICE</p>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Preview</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Date: {getTodayFormatted()}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Due: {getDueDateFormatted(dueDays)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>From</p>
                <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{contractorName}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{contractorEmail}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{contractorPhone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bill To</p>
                <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{clientName}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{clientEmail}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{clientAddress}</p>
              </div>
            </div>

            <div className="bg-[#0B1F33] rounded-lg p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">Project</p>
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{jobTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Balance Due</p>
                <p className="text-xl font-bold text-[#5eead4]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(total)}</p>
              </div>
            </div>

            {/* Line Items Summary */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9F9FB]">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Qty</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.filter(i => i.description.trim()).map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-sm text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.description}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.quantity} {item.unit}</td>
                      <td className="px-3 py-2.5 text-sm text-right text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{formatCurrency(item.unitCost)}</td>
                      <td className="px-4 py-2.5 text-sm text-right font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-56 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7C8F]">Subtotal</span>
                  <span className="font-semibold text-[#0B1F33]">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-semibold text-green-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7C8F]">Tax ({taxRate}%)</span>
                    <span className="font-semibold text-[#0B1F33]">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                  <span className="font-bold text-[#0B1F33]">Total</span>
                  <span className="font-bold text-[#00B8A9]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-xl p-4 flex items-start gap-3">
            <i className="ri-mail-send-line text-[#00B8A9] text-xl mt-0.5"></i>
            <div>
              <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Invoice will be sent to:</p>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {clientName} &mdash; {clientEmail}
              </p>
              <p className="text-xs text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                A branded PDF will be generated and emailed. The homeowner can view and pay directly through Emporva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-4 py-2.5 text-[#6B7C8F] hover:text-[#0B1F33] font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <i className="ri-arrow-left-line"></i> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step === 3 && (
            <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <i className="ri-eye-line"></i> Preview PDF
            </button>
          )}
          {step === 3 && (
            <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <i className="ri-save-line"></i> Save Draft
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Next <i className="ri-arrow-right-line"></i>
            </button>
          ) : (
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-send-plane-line"></i> Send Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

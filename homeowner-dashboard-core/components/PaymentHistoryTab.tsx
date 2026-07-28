import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Payment, PaymentType, PaymentStatus } from '../../../types/payment';

interface PaymentRow extends Payment {
  job_title: string;
  contractor_name: string | null;
  work_item_title: string | null;
}

const paymentTypeLabel: Record<PaymentType, string> = {
  deposit: 'Deposit',
  milestone: 'Milestone',
  final: 'Final Payment',
  full: 'Full Payment',
};

const paymentMethodLabel: Record<string, string> = {
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  other: 'Other',
};

const getTypeIcon = (type: PaymentType) => {
  switch (type) {
    case 'deposit': return 'ri-safe-2-line';
    case 'milestone': return 'ri-flag-line';
    case 'final': return 'ri-checkbox-circle-line';
    case 'full': return 'ri-money-dollar-circle-line';
  }
};

const getTypeColor = (type: PaymentType) => {
  switch (type) {
    case 'deposit': return 'bg-blue-100 text-blue-600';
    case 'milestone': return 'bg-[#00B8A9]/10 text-[#00B8A9]';
    case 'final': return 'bg-green-100 text-green-600';
    case 'full': return 'bg-[#0B1F33]/10 text-[#0B1F33]';
  }
};

const getStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100 text-green-700', label: 'Completed', icon: 'ri-check-line' };
    case 'refunded':
      return { bg: 'bg-orange-100 text-orange-700', label: 'Refunded', icon: 'ri-refund-2-line' };
    case 'pending':
      return { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: 'ri-time-line' };
    case 'failed':
      return { bg: 'bg-red-100 text-red-700', label: 'Failed', icon: 'ri-close-circle-line' };
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type FilterType = 'all' | PaymentType;

export default function PaymentHistoryTab() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [userJobs, setUserJobs] = useState<{ id: string; title: string }[]>([]);
  const [recordForm, setRecordForm] = useState({
    jobId: '',
    amount: '',
    description: '',
    paymentType: 'full' as PaymentType,
    paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'other',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchPayments = useCallback(async () => {
    if (!user) return;

    const { data: rawPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('payer_id', user.id)
      .order('created_at', { ascending: false });

    if (!rawPayments || rawPayments.length === 0) {
      setPayments([]);
      setLoading(false);
      return;
    }

    // Collect unique IDs for batch lookups
    const jobIds = [...new Set(rawPayments.map(p => p.job_id))];
    const payeeIds = [...new Set(rawPayments.map(p => p.payee_id))];
    const workItemIds = rawPayments
      .map(p => p.work_item_id)
      .filter((id): id is string => id !== null);

    // Batch fetch jobs, profiles, work items
    const [jobsRes, profilesRes, workItemsRes] = await Promise.all([
      supabase.from('jobs').select('id, title').in('id', jobIds),
      supabase.from('profiles').select('id, first_name, last_name').in('id', payeeIds),
      workItemIds.length > 0
        ? supabase.from('work_items').select('id, title').in('id', workItemIds)
        : Promise.resolve({ data: [] }),
    ]);

    const jobMap = Object.fromEntries((jobsRes.data || []).map(j => [j.id, j.title]));
    const profileMap = Object.fromEntries(
      (profilesRes.data || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
    );
    const workItemMap = Object.fromEntries(
      (workItemsRes.data || []).map(w => [w.id, w.title])
    );

    const rows: PaymentRow[] = rawPayments.map((p: Payment) => ({
      ...p,
      job_title: jobMap[p.job_id] || 'Unknown Job',
      contractor_name: profileMap[p.payee_id] || null,
      work_item_title: p.work_item_id ? workItemMap[p.work_item_id] || null : null,
    }));

    setPayments(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Fetch user's jobs for the record payment dropdown
  const fetchUserJobs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setUserJobs(data || []);
  }, [user]);

  const handleRecordPayment = async () => {
    if (!user || !recordForm.jobId || !recordForm.amount || !recordForm.description) return;
    setRecordSaving(true);

    if (editingPayment) {
      // Update existing manual payment
      const { error } = await supabase.from('payments').update({
        job_id: recordForm.jobId,
        amount: Number(recordForm.amount),
        description: recordForm.description.trim(),
        payment_type: recordForm.paymentType,
        payment_method: recordForm.paymentMethod,
        created_at: new Date(recordForm.date).toISOString(),
      }).eq('id', editingPayment.id);

      setRecordSaving(false);
      if (!error) {
        setShowRecordModal(false);
        setEditingPayment(null);
        setRecordForm({ jobId: '', amount: '', description: '', paymentType: 'full', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
        fetchPayments();
      }
    } else {
      // Create new manual payment
      const { data: workItem } = await supabase
        .from('work_items')
        .select('contractor_id')
        .eq('job_id', recordForm.jobId)
        .limit(1)
        .single();

      const { error } = await supabase.from('payments').insert({
        job_id: recordForm.jobId,
        payer_id: user.id,
        payee_id: workItem?.contractor_id || user.id,
        amount: Number(recordForm.amount),
        description: recordForm.description.trim(),
        payment_type: recordForm.paymentType,
        payment_method: recordForm.paymentMethod,
        status: 'completed',
        confirmation_id: `MANUAL-${Date.now()}`,
        created_at: new Date(recordForm.date).toISOString(),
      });

      setRecordSaving(false);
      if (!error) {
        setShowRecordModal(false);
        setRecordForm({ jobId: '', amount: '', description: '', paymentType: 'full', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
        fetchPayments();
      }
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    await supabase.from('payments').delete().eq('id', paymentId);
    setShowDeleteConfirm(null);
    setExpandedId(null);
    fetchPayments();
  };

  const filtered = filter === 'all' ? payments : payments.filter(p => p.payment_type === filter);

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0);
  const depositTotal = payments
    .filter(p => p.payment_type === 'deposit' && p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0);
  const milestoneTotal = payments
    .filter(p => p.payment_type === 'milestone' && p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0);
  const finalFullTotal = payments
    .filter(p => (p.payment_type === 'final' || p.payment_type === 'full') && p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-white">
              Payment History
            </h2>
            <p className="text-white text-sm sm:text-base lg:text-lg">
              All transactions and receipts
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-white mb-1">Total Spent</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <button
              onClick={() => { setShowRecordModal(true); fetchUserJobs(); }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              Record Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white/10 rounded-lg p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <i className="ri-safe-2-line text-blue-300 text-sm sm:text-base"></i>
              <p className="text-[10px] sm:text-xs text-white">Deposits</p>
            </div>
            <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
              {formatCurrency(depositTotal)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <i className="ri-flag-line text-[#00B8A9] text-sm sm:text-base"></i>
              <p className="text-[10px] sm:text-xs text-white">Milestones</p>
            </div>
            <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
              {formatCurrency(milestoneTotal)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <i className="ri-checkbox-circle-line text-green-300 text-sm sm:text-base"></i>
              <p className="text-[10px] sm:text-xs text-white">Final / Full</p>
            </div>
            <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
              {formatCurrency(finalFullTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { id: 'all' as FilterType, label: 'All Payments' },
          { id: 'deposit' as FilterType, label: 'Deposits' },
          { id: 'milestone' as FilterType, label: 'Milestones' },
          { id: 'final' as FilterType, label: 'Final' },
          { id: 'full' as FilterType, label: 'Full' },
        ]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === f.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-[#0B1F33]/30'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto text-xs sm:text-sm text-[#6B7C8F]">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Payment Info Notice */}
      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-information-line text-[#00B8A9] text-lg sm:text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0B1F33] mb-1">
            Payment Tracking
          </p>
          <p className="text-xs text-[#6B7C8F]">
            Payments are processed through your contractor&apos;s preferred payment method. You can also manually record payments made outside the platform (check, cash, bank transfer) using the &quot;Record Payment&quot; button above. Manually recorded payments can be edited or deleted, but platform-processed payments cannot be modified.
          </p>
        </div>
      </div>

      {/* Payment List */}
      {filtered.length > 0 ? (
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
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors"
                >
                  {/* Type Icon */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(payment.payment_type)}`}>
                    <i className={`${getTypeIcon(payment.payment_type)} text-lg sm:text-xl`}></i>
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B1F33] truncate">
                      {payment.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="text-xs text-[#6B7C8F]">
                        {formatDate(payment.created_at)}
                      </span>
                      {payment.contractor_name && (
                        <span className="text-xs text-[#6B7C8F] flex items-center gap-1">
                          <i className="ri-user-line text-xs"></i>
                          {payment.contractor_name}
                        </span>
                      )}
                      <span className="text-xs text-[#6B7C8F] flex items-center gap-1">
                        <i className="ri-briefcase-line text-xs"></i>
                        <span className="truncate max-w-[120px] sm:max-w-none">{payment.job_title}</span>
                      </span>
                    </div>
                  </div>

                  {/* Amount & Status — desktop */}
                  <div className="hidden sm:flex text-right flex-shrink-0 items-center gap-4">
                    <div>
                      <p className="text-base font-bold text-[#0B1F33]">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                      {payment.payment_method && (
                        <p className="text-xs text-[#6B7C8F]">
                          {paymentMethodLabel[payment.payment_method] || payment.payment_method}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg}`}>
                      <i className={`${statusBadge.icon} text-xs`}></i>
                      {statusBadge.label}
                    </span>
                    <i className={`ri-arrow-down-s-line text-[#6B7C8F] text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </div>

                  {/* Amount & chevron — mobile */}
                  <div className="sm:hidden flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="text-sm font-bold text-[#0B1F33]">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.bg}`}>
                      <i className={`${statusBadge.icon} text-[10px]`}></i>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-3 sm:px-5 py-3 sm:py-4 bg-[#F9F9FB]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {payment.confirmation_id && (
                        <div>
                          <p className="text-xs text-[#6B7C8F] mb-1">Confirmation ID</p>
                          <p className="text-sm font-bold text-[#0B1F33] font-mono">{payment.confirmation_id}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1">Payment Date</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{formatDate(payment.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1">Payment Type</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{paymentTypeLabel[payment.payment_type]}</p>
                      </div>
                      {payment.payment_method && (
                        <div>
                          <p className="text-xs text-[#6B7C8F] mb-1">Payment Method</p>
                          <p className="text-sm font-semibold text-[#0B1F33]">
                            {paymentMethodLabel[payment.payment_method] || payment.payment_method}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1">Amount</p>
                        <p className="text-sm font-bold text-[#00B8A9]">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7C8F] mb-1">Job</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{payment.job_title}</p>
                      </div>
                      {payment.work_item_title && (
                        <div>
                          <p className="text-xs text-[#6B7C8F] mb-1">Work Item</p>
                          <p className="text-sm font-semibold text-[#0B1F33]">{payment.work_item_title}</p>
                        </div>
                      )}
                      {payment.contractor_name && (
                        <div>
                          <p className="text-xs text-[#6B7C8F] mb-1">Contractor</p>
                          <p className="text-sm font-semibold text-[#0B1F33]">{payment.contractor_name}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 border-t border-gray-200">
                      {payment.confirmation_id && (
                        <button
                          onClick={() => navigator.clipboard.writeText(payment.confirmation_id!)}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-[#6B7C8F] border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-file-copy-line"></i>
                          Copy ID
                        </button>
                      )}
                      {payment.confirmation_id?.startsWith('MANUAL-') && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setRecordForm({
                                jobId: payment.job_id,
                                amount: String(payment.amount),
                                description: payment.description,
                                paymentType: payment.payment_type,
                                paymentMethod: (payment.payment_method || 'cash') as 'cash' | 'card' | 'bank_transfer' | 'other',
                                date: payment.created_at.split('T')[0],
                                notes: '',
                              });
                              fetchUserJobs();
                              setShowRecordModal(true);
                            }}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-[#0B1F33] border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-edit-line"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(payment.id)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-delete-bin-line"></i>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-secure-payment-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-base sm:text-lg font-semibold text-[#0B1F33] mb-1">
            No payments found
          </p>
          <p className="text-sm text-[#6B7C8F]">
            {filter === 'all'
              ? 'Payments will appear here once you make your first payment on a job'
              : 'No transactions match the selected filter'}
          </p>
        </div>
      )}


      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">{editingPayment ? 'Edit Payment' : 'Record a Payment'}</h3>
                  <p className="text-xs text-[#6B7C8F] mt-1">{editingPayment ? 'Update this manual payment record' : 'Log payments made outside the platform'}</p>
                </div>
                <button onClick={() => { setShowRecordModal(false); setEditingPayment(null); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Job / Project *</label>
                  <select
                    value={recordForm.jobId}
                    onChange={e => setRecordForm(prev => ({ ...prev, jobId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select a job...</option>
                    {userJobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Amount ($) *</label>
                    <input
                      type="number"
                      value={recordForm.amount}
                      onChange={e => setRecordForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="500.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={recordForm.date}
                      onChange={e => setRecordForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Description *</label>
                  <input
                    type="text"
                    value={recordForm.description}
                    onChange={e => setRecordForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Final payment by check"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Payment Type</label>
                    <select
                      value={recordForm.paymentType}
                      onChange={e => setRecordForm(prev => ({ ...prev, paymentType: e.target.value as PaymentType }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent cursor-pointer"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="milestone">Milestone</option>
                      <option value="final">Final Payment</option>
                      <option value="full">Full Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Payment Method</label>
                    <select
                      value={recordForm.paymentMethod}
                      onChange={e => setRecordForm(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' | 'bank_transfer' | 'other' }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent cursor-pointer"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="bank_transfer">Bank Transfer / Check</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={recordSaving || !recordForm.jobId || !recordForm.amount || !recordForm.description}
                  className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  {recordSaving ? 'Saving...' : editingPayment ? 'Save Changes' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Delete Payment?</h3>
              <p className="text-sm text-[#6B7C8F]">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayment(showDeleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

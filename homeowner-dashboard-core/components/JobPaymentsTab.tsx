import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { stripeApi } from '../../../lib/stripeApi';
import type { WorkItem } from '../../../types/workItem';
import type { Payment, PaymentType, PaymentMethod, PaymentStatus } from '../../../types/payment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentWithMeta extends Payment {
  payee_name: string | null;
}

interface JobPaymentsTabProps {
  jobId: string;
  jobTitle: string;
  contractorId: string;
  contractorName: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'completed': return { bg: 'bg-green-100 text-green-700', icon: 'ri-check-line', label: 'Completed' };
    case 'pending': return { bg: 'bg-yellow-100 text-yellow-700', icon: 'ri-time-line', label: 'Pending' };
    case 'refunded': return { bg: 'bg-orange-100 text-orange-700', icon: 'ri-refund-2-line', label: 'Refunded' };
    case 'failed': return { bg: 'bg-red-100 text-red-700', icon: 'ri-close-circle-line', label: 'Failed' };
  }
};

const workItemStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'in-progress': return 'bg-blue-100 text-blue-700';
    case 'assigned': return 'bg-purple-100 text-purple-700';
    case 'quoted': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

function generateConfirmationId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg1 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `EMP-${seg1}-${seg2}`;
}

interface CardPaymentFormProps {
  amount: number;
  description: string;
  jobId: string;
  workItemId: string | null;
  payeeId: string;
  paymentType: PaymentType;
  paying: boolean;
  setPaying: (v: boolean) => void;
  cardError: string | null;
  setCardError: (v: string | null) => void;
  onSuccess: (stripePaymentIntentId: string) => void;
  onCancel: () => void;
  formatCurrency: (n: number) => string;
}

function CardPaymentForm({
  amount, description, jobId, workItemId, payeeId, paymentType,
  paying, setPaying, cardError, setCardError, onSuccess, onCancel, formatCurrency,
}: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements || !amount || amount <= 0) return;
    setPaying(true);
    setCardError(null);

    const { data, error: apiError } = await stripeApi<{ clientSecret: string }>('create-payment-intent', {
      amount,
      description,
      metadata: {
        job_id: jobId,
        work_item_id: workItemId,
        payee_id: payeeId,
        payment_type: paymentType,
      },
    });

    if (apiError || !data?.clientSecret) {
      setCardError(apiError || 'Failed to initialize payment');
      setPaying(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not found');
      setPaying(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: { card: cardElement },
    });

    if (confirmError) {
      setCardError(confirmError.message || 'Payment failed');
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setCardError('Payment was not completed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#14B8A6] focus-within:border-transparent">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0B1F33',
                  '::placeholder': { color: '#9CA3AF' },
                },
                invalid: { color: '#EF4444' },
              },
            }}
          />
        </div>
      </div>

      {cardError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <i className="ri-error-warning-line text-red-500 mt-0.5"></i>
          <p className="text-sm text-red-600">{cardError}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={paying || !stripe || !amount || amount <= 0}
          className="flex-1 px-4 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            <>
              <i className="ri-secure-payment-line mr-2"></i>
              Pay {amount > 0 ? formatCurrency(amount) : ''}
            </>
          )}
        </button>
      </div>
    </>
  );
}

export default function JobPaymentsTab({ jobId, jobTitle, contractorId, contractorName }: JobPaymentsTabProps) {
  const { user } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [payments, setPayments] = useState<PaymentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<{ workItem?: WorkItem; type: 'job' | 'work_item' } | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState<PaymentType>('deposit');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card');
  const [payDescription, setPayDescription] = useState('');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [wiRes, payRes] = await Promise.all([
      supabase
        .from('work_items')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true }),
      supabase
        .from('payments')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false }),
    ]);

    setWorkItems(wiRes.data || []);

    // Resolve payee names
    const rawPayments = payRes.data || [];
    if (rawPayments.length > 0) {
      const payeeIds = [...new Set(rawPayments.map((p: Payment) => p.payee_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', payeeIds);
      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
      );
      setPayments(rawPayments.map((p: Payment) => ({ ...p, payee_name: profileMap[p.payee_id] || null })));
    } else {
      setPayments([]);
    }

    setLoading(false);
  }, [user, jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getWorkItemPayments = (workItemId: string) =>
    payments.filter(p => p.work_item_id === workItemId);

  const getJobLevelPayments = () =>
    payments.filter(p => p.work_item_id === null);

  const getTotalPaid = (paymentList: PaymentWithMeta[]) =>
    paymentList.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);

  const openPayModal = (workItem?: WorkItem) => {
    setPayTarget(workItem ? { workItem, type: 'work_item' } : { type: 'job' });
    setPayAmount(workItem?.agreed_price ? String(workItem.agreed_price) : '');
    setPayType('deposit');
    setPayMethod('card');
    setPayDescription(
      workItem
        ? `Payment for: ${workItem.title}`
        : `Payment for: ${jobTitle}`
    );
    setPaySuccess(false);
    setShowPayModal(true);
  };

  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmitNonCardPayment = async () => {
    if (!user || !payTarget || !payAmount || Number(payAmount) <= 0) return;
    setPaying(true);

    const payeeId = payTarget.workItem?.contractor_id || contractorId;
    if (!payeeId) {
      setPaying(false);
      return;
    }

    const { error } = await supabase.from('payments').insert({
      job_id: jobId,
      work_item_id: payTarget.workItem?.id || null,
      payer_id: user.id,
      payee_id: payeeId,
      amount: Number(payAmount),
      description: payDescription,
      payment_type: payType,
      payment_method: payMethod,
      status: 'completed',
      confirmation_id: generateConfirmationId(),
    });

    if (error) {
      console.error('Payment error:', error);
      setPaying(false);
      return;
    }

    setPaying(false);
    setPaySuccess(true);

    setTimeout(() => {
      setShowPayModal(false);
      setPayTarget(null);
      setPaySuccess(false);
      fetchData();
    }, 1500);
  };

  const handleCardPaymentSuccess = async (stripePaymentIntentId: string) => {
    if (!user || !payTarget) return;

    const payeeId = payTarget.workItem?.contractor_id || contractorId;
    if (!payeeId) return;

    await supabase.from('payments').insert({
      job_id: jobId,
      work_item_id: payTarget.workItem?.id || null,
      payer_id: user.id,
      payee_id: payeeId,
      amount: Number(payAmount),
      description: payDescription,
      payment_type: payType,
      payment_method: 'card',
      status: 'completed',
      confirmation_id: generateConfirmationId(),
      stripe_payment_intent_id: stripePaymentIntentId,
    });

    setPaying(false);
    setPaySuccess(true);

    setTimeout(() => {
      setShowPayModal(false);
      setPayTarget(null);
      setPaySuccess(false);
      fetchData();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const allPayments = payments;
  const totalPaid = getTotalPaid(allPayments);
  const totalAgreed = workItems.reduce((s, wi) => s + (wi.agreed_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Total Agreed</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">
            {totalAgreed > 0 ? formatCurrency(totalAgreed) : '—'}
          </p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Total Paid</p>
          <p className="text-lg sm:text-xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Remaining</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">
            {totalAgreed > 0 ? formatCurrency(Math.max(0, totalAgreed - totalPaid)) : '—'}
          </p>
        </div>
      </div>

      {/* Work Items with Payments */}
      {workItems.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Work Items</h3>
          {workItems.map((wi) => {
            const wiPayments = getWorkItemPayments(wi.id);
            const wiPaid = getTotalPaid(wiPayments);
            const wiRemaining = wi.agreed_price ? Math.max(0, wi.agreed_price - wiPaid) : 0;

            return (
              <div key={wi.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Work Item Header */}
                <div className="p-3 sm:p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-[#0B1F33]">{wi.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${workItemStatusColor(wi.status)}`}>
                          {wi.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7C8F]">
                        <span className="flex items-center gap-1">
                          <i className="ri-tools-line"></i>
                          {wi.trade}
                        </span>
                        {wi.agreed_price && (
                          <span className="flex items-center gap-1">
                            <i className="ri-money-dollar-circle-line"></i>
                            {formatCurrency(wi.agreed_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Payment Summary + Action */}
                    <div className="flex items-center gap-3">
                      {wi.agreed_price && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-[#6B7C8F]">Paid</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(wiPaid)} / {formatCurrency(wi.agreed_price)}
                          </p>
                        </div>
                      )}
                      {wiRemaining > 0 && wi.contractor_id && (
                        <button
                          onClick={() => openPayModal(wi)}
                          className="px-3 sm:px-4 py-2 bg-[#14B8A6] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-secure-payment-line mr-1"></i>
                          Record Payment
                        </button>
                      )}
                      {wi.agreed_price && wiRemaining === 0 && wiPaid > 0 && (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <i className="ri-check-double-line"></i>
                          Paid in Full
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for payment */}
                  {wi.agreed_price && wi.agreed_price > 0 && (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (wiPaid / wi.agreed_price) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment History for this work item */}
                {wiPayments.length > 0 && (
                  <div className="bg-[#F9F9FB] p-3 sm:p-4">
                    <p className="text-xs font-semibold text-[#6B7C8F] mb-2">Payment History</p>
                    <div className="space-y-2">
                      {wiPayments.map((p) => {
                        const badge = statusBadge(p.status);
                        return (
                          <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-[#0B1F33] truncate">{p.description}</p>
                              <p className="text-[10px] sm:text-xs text-[#6B7C8F]">{formatDate(p.created_at)}</p>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">{formatCurrency(Number(p.amount))}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${badge.bg}`}>
                              <i className={`${badge.icon} text-[10px]`}></i>
                              {badge.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Simple job — no work items, pay at job level */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Job Payment</h3>
              <p className="text-xs sm:text-sm text-[#6B7C8F]">
                Pay {contractorName} for {jobTitle}
              </p>
            </div>
            {contractorId && (
              <button
                onClick={() => openPayModal()}
                className="px-4 sm:px-6 py-2.5 bg-[#14B8A6] text-white rounded-lg text-sm font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-secure-payment-line mr-2"></i>
                Record Payment
              </button>
            )}
          </div>

          {/* Job-level payment history */}
          {getJobLevelPayments().length > 0 && (
            <div className="space-y-2">
              {getJobLevelPayments().map((p) => {
                const badge = statusBadge(p.status);
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0B1F33] truncate">{p.description}</p>
                      <p className="text-xs text-[#6B7C8F]">
                        {formatDate(p.created_at)}
                        {p.confirmation_id && <span className="ml-2 font-mono">{p.confirmation_id}</span>}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#0B1F33]">{formatCurrency(Number(p.amount))}</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                      <i className={`${badge.icon} text-xs`}></i>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {allPayments.length === 0 && (
            <div className="bg-[#F9F9FB] rounded-xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-secure-payment-line text-2xl text-gray-400"></i>
              </div>
              <p className="text-sm text-[#6B7C8F]">No payments made yet for this job</p>
            </div>
          )}
        </div>
      )}

      {/* Job-level payments (shown when there ARE work items too, for any job-level payments) */}
      {workItems.length > 0 && getJobLevelPayments().length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Job-Level Payments</h3>
          {getJobLevelPayments().map((p) => {
            const badge = statusBadge(p.status);
            return (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0B1F33] truncate">{p.description}</p>
                  <p className="text-xs text-[#6B7C8F]">{formatDate(p.created_at)}</p>
                </div>
                <p className="text-sm font-bold text-[#0B1F33]">{formatCurrency(Number(p.amount))}</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                  <i className={`${badge.icon} text-xs`}></i>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Escrow Notice */}
      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-xl p-3 sm:p-4 flex items-start gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-[#00B8A9] text-base sm:text-lg"></i>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-[#0B1F33] mb-0.5">Payment Protection</p>
          <p className="text-[10px] sm:text-xs text-[#6B7C8F]">
            All payments are held in escrow until work is verified and approved.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && payTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {paySuccess ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-3xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Payment Successful</h3>
                  <p className="text-sm text-[#6B7C8F]">
                    {formatCurrency(Number(payAmount))} has been sent to {contractorName}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Record Payment</h3>
                    <button
                      onClick={() => { setShowPayModal(false); setPayTarget(null); }}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-xl sm:text-2xl"></i>
                    </button>
                  </div>

                  {/* Pay to */}
                  <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs text-[#6B7C8F] mb-1">Paying</p>
                    <p className="text-sm font-bold text-[#0B1F33]">{contractorName}</p>
                    <p className="text-xs text-[#6B7C8F] mt-1">
                      {payTarget.workItem
                        ? `Work Item: ${payTarget.workItem.title}`
                        : `Job: ${jobTitle}`}
                    </p>
                    {payTarget.workItem?.agreed_price && (
                      <p className="text-xs text-[#6B7C8F] mt-1">
                        Agreed Price: {formatCurrency(payTarget.workItem.agreed_price)}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F] font-semibold">$</span>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent text-sm sm:text-base font-semibold"
                      />
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Payment Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'deposit' as PaymentType, label: 'Deposit', icon: 'ri-safe-2-line' },
                        { id: 'milestone' as PaymentType, label: 'Milestone', icon: 'ri-flag-line' },
                        { id: 'final' as PaymentType, label: 'Final', icon: 'ri-checkbox-circle-line' },
                        { id: 'full' as PaymentType, label: 'Full Payment', icon: 'ri-money-dollar-circle-line' },
                      ]).map(t => (
                        <button
                          key={t.id}
                          onClick={() => setPayType(t.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all cursor-pointer ${
                            payType === t.id
                              ? 'border-[#14B8A6] bg-[#14B8A6]/5 text-[#0B1F33]'
                              : 'border-gray-200 text-[#6B7C8F] hover:border-gray-300'
                          }`}
                        >
                          <i className={`${t.icon} text-base`}></i>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'card' as PaymentMethod, label: 'Card (Stripe)', icon: 'ri-bank-card-line' },
                        { id: 'bank_transfer' as PaymentMethod, label: 'Bank Transfer', icon: 'ri-bank-line' },
                        { id: 'cash' as PaymentMethod, label: 'Cash / Check', icon: 'ri-cash-line' },
                        { id: 'other' as PaymentMethod, label: 'Other', icon: 'ri-more-line' },
                      ]).map(m => (
                        <button
                          key={m.id}
                          onClick={() => setPayMethod(m.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all cursor-pointer ${
                            payMethod === m.id
                              ? 'border-[#14B8A6] bg-[#14B8A6]/5 text-[#0B1F33]'
                              : 'border-gray-200 text-[#6B7C8F] hover:border-gray-300'
                          }`}
                        >
                          <i className={`${m.icon} text-base`}></i>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Description</label>
                    <input
                      type="text"
                      value={payDescription}
                      onChange={e => setPayDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Card payment via Stripe or manual record for other methods */}
                  {payMethod === 'card' ? (
                    <Elements stripe={stripePromise}>
                      <CardPaymentForm
                        amount={Number(payAmount)}
                        description={payDescription}
                        jobId={jobId}
                        workItemId={payTarget.workItem?.id || null}
                        payeeId={payTarget.workItem?.contractor_id || contractorId}
                        paymentType={payType}
                        paying={paying}
                        setPaying={setPaying}
                        cardError={cardError}
                        setCardError={setCardError}
                        onSuccess={handleCardPaymentSuccess}
                        onCancel={() => { setShowPayModal(false); setPayTarget(null); }}
                        formatCurrency={formatCurrency}
                      />
                    </Elements>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800"><i className="ri-information-line mr-1"></i>Record payments made outside of Stripe to keep your project costs organized.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowPayModal(false); setPayTarget(null); }}
                          className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitNonCardPayment}
                          disabled={paying || !payAmount || Number(payAmount) <= 0}
                          className="flex-1 px-4 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paying ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </span>
                          ) : (
                            <>
                              <i className="ri-check-line mr-2"></i>
                              Record {payAmount ? formatCurrency(Number(payAmount)) : 'Payment'}
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { stripeApi } from '../../../lib/stripeApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CreditPaymentFormProps {
  buyAmount: number;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
  error: string | null;
}

function CreditPaymentForm({ buyAmount, clientSecret, onSuccess, onCancel, onError, error }: CreditPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setConfirming(true);
    onError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found.');
      setConfirming(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      onError(stripeError.message || 'Payment failed.');
      setConfirming(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      onError('Payment was not completed. Please try again.');
    }
    setConfirming(false);
  };

  return (
    <>
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
            <i className="ri-error-warning-line"></i>
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-[#0B1F33] mb-2">Card Details</label>
          <div className="px-4 py-3 border border-gray-300 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#0B1F33',
                    '::placeholder': { color: '#9CA3AF' },
                  },
                  invalid: { color: '#ef4444' },
                },
              }}
            />
          </div>
          <p className="text-xs text-[#6B7C8F] mt-1">Card details are handled securely by Stripe</p>
        </div>
      </div>
      <div className="p-6 border-t border-gray-100 flex gap-3">
        <button
          onClick={onCancel}
          disabled={confirming}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap disabled:opacity-60"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirming || !stripe}
          className="flex-1 px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-[#c4a473] cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {confirming ? (
            <i className="ri-loader-4-line animate-spin text-lg"></i>
          ) : (
            `Pay & Get ${buyAmount} Credits`
          )}
        </button>
      </div>
    </>
  );
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  credits: number;
  description: string;
  job_id: string | null;
  created_at: string;
}

interface LeadRecord {
  id: string;
  jobTitle: string;
  homeowner: string;
  date: string;
  creditCost: number;
  status: 'quoted' | 'won' | 'lost' | 'expired';
}

export default function CreditBalance() {
  const { user } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState(10);
  const [activeHistoryTab, setActiveHistoryTab] = useState<
    'purchases' | 'leads'
  >('leads');
  const [toast, setToast] = useState<string | null>(null);

  const [creditBalance, setCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Fetch credit balance from contractor_profiles
    const { data: cp } = await supabase
      .from('contractor_profiles')
      .select('id, credit_balance')
      .eq('user_id', user.id)
      .single();

    if (cp) {
      setCreditBalance(cp.credit_balance || 0);

      // Fetch credit transactions
      const { data: txns } = await supabase
        .from('credit_transactions')
        .select('id, type, credits, description, job_id, created_at')
        .eq('contractor_profile_id', cp.id)
        .order('created_at', { ascending: false });

      setTransactions((txns as CreditTransaction[]) || []);

      // Build leads from usage transactions that reference a job
      const usageTxns = (txns || []).filter(t => t.type === 'usage' && t.job_id);
      if (usageTxns.length > 0) {
        const jobIds = usageTxns.map(t => t.job_id).filter(Boolean) as string[];
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, status, user_id')
          .in('id', jobIds);

        // Get homeowner names
        const homeownerIds = [...new Set((jobs || []).map(j => j.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', homeownerIds);

        const profileMap = Object.fromEntries(
          (profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
        );
        const jobMap = Object.fromEntries(
          (jobs || []).map(j => [j.id, j])
        );

        const builtLeads: LeadRecord[] = usageTxns.map(t => {
          const job = jobMap[t.job_id!];
          const leadStatus = job
            ? job.status === 'completed' ? 'won'
              : job.status === 'cancelled' ? 'lost'
              : job.status === 'in-progress' ? 'won'
              : 'quoted'
            : 'expired';
          return {
            id: t.id,
            jobTitle: job?.title || 'Unknown Job',
            homeowner: job ? profileMap[job.user_id] || 'Unknown' : 'Unknown',
            date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            creditCost: Math.abs(t.credits),
            status: leadStatus as LeadRecord['status'],
          };
        });
        setLeads(builtLeads);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const costPerCredit = 15;

  const buyOptions = [
    { credits: 5, price: 5 * costPerCredit, label: '5 Credits', popular: false },
    {
      credits: 10,
      price: 10 * costPerCredit,
      label: '10 Credits',
      popular: true,
    },
    {
      credits: 25,
      price: 25 * costPerCredit,
      savings: '5%',
      label: '25 Credits',
      popular: false,
    },
    {
      credits: 50,
      price: 50 * costPerCredit * 0.9,
      savings: '10%',
      label: '50 Credits',
      popular: false,
    },
  ];

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const usedThisMonth = transactions
    .filter(t => t.type === 'usage' && new Date(t.created_at) >= thisMonthStart)
    .reduce((s, t) => s + Math.abs(t.credits), 0);
  const usedAllTime = transactions
    .filter(t => t.type === 'usage')
    .reduce((s, t) => s + Math.abs(t.credits), 0);

  const balance = {
    credits: creditBalance,
    costPerCredit,
    creditsUsedThisMonth: usedThisMonth,
    creditsUsedAllTime: usedAllTime,
  };

  const purchaseHistory = transactions
    .filter(t => t.type === 'purchase')
    .map(t => ({
      id: t.id,
      date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      credits: t.credits,
      amount: t.credits * costPerCredit,
      method: 'Card',
    }));

  const leadsPurchased = leads;

  const wonLeads = leadsPurchased.filter((l) => l.status === 'won').length;
  const totalLeads = leadsPurchased.length;
  const winRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'quoted':
        return 'bg-teal-100 text-teal-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const [buyStep, setBuyStep] = useState<'select' | 'pay'>('select');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleBuyNext = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    const { data, error } = await stripeApi<{ clientSecret: string }>('purchase-credits', { credits: buyAmount });
    if (error || !data?.clientSecret) {
      setPaymentError(error || 'Failed to initiate payment.');
      setPaymentLoading(false);
      return;
    }
    setClientSecret(data.clientSecret);
    setBuyStep('pay');
    setPaymentLoading(false);
  };

  const handleBuyClose = () => {
    setShowBuyModal(false);
    setBuyStep('select');
    setClientSecret(null);
    setPaymentError(null);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[100]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-green-50 border-green-200 text-green-800">
            <i className="ri-check-line text-green-600 text-lg"></i>
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}

      {/* Credit Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4B483]/15 rounded-lg flex items-center justify-center">
              <i className="ri-copper-coin-line text-[#D4B483] text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B1F33]">
                Lead Credits
              </h3>
              <p className="text-xs text-[#6B7C8F]">
                Pay only for leads you want
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap"
          >
            View History <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] rounded-xl p-4 text-white">
            <p className="text-xs text-white/70 mb-1">Available</p>
            <p className="text-3xl font-bold">{balance.credits}</p>
            <p className="text-xs text-white/60 mt-1">credits</p>
          </div>
          <div className="bg-[#F9F9FB] rounded-xl p-4">
            <p className="text-xs text-[#6B7C8F] mb-1">
              Used This Month
            </p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {balance.creditsUsedThisMonth}
            </p>
            <p className="text-xs text-[#6B7C8F] mt-1">
              leads unlocked
            </p>
          </div>
          <div className="bg-[#F9F9FB] rounded-xl p-4">
            <p className="text-xs text-[#6B7C8F] mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {winRate}%
            </p>
            <p className="text-xs text-[#6B7C8F] mt-1">
              {wonLeads} of {totalLeads} won
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-[#c4a473] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-circle-line text-lg"></i>
            Buy Credits
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-history-line text-lg"></i>
          </button>
        </div>

        {/* Premium Upsell */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-start gap-3 bg-gradient-to-r from-[#D4B483]/10 to-transparent rounded-lg p-3">
            <i className="ri-vip-crown-line text-[#D4B483] text-lg mt-0.5"></i>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#0B1F33] mb-0.5">
                Stop paying per lead
              </p>
              <p className="text-xs text-[#6B7C8F]">
                Premium members get unlimited marketplace access,
                CRM, pipeline tools, and more for $99/mo.
              </p>
              <a
                href="/contractor-plans"
                className="text-xs font-semibold text-[#D4B483] hover:underline cursor-pointer mt-1 inline-block"
              >
                Compare Plans <i className="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Credits Modal */}
      {showBuyModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBuyClose}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0B1F33]">
                  {buyStep === 'select' ? 'Buy Lead Credits' : 'Payment Details'}
                </h3>
                <p className="text-xs text-[#6B7C8F] mt-1">
                  {buyStep === 'select'
                    ? `$${costPerCredit} per credit \u2022 1 credit = 1 lead unlock`
                    : `${buyAmount} credits \u2022 $${buyOptions.find(o => o.credits === buyAmount)?.price.toFixed(0)}`}
                </p>
              </div>
              <button
                onClick={handleBuyClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            {buyStep === 'select' && (
              <>
                <div className="p-6 space-y-3">
                  {buyOptions.map((opt) => (
                    <button
                      key={opt.credits}
                      onClick={() => setBuyAmount(opt.credits)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        buyAmount === opt.credits
                          ? 'border-[#D4B483] bg-[#D4B483]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            buyAmount === opt.credits
                              ? 'border-[#D4B483] bg-[#D4B483]'
                              : 'border-gray-300'
                          }`}
                        >
                          {buyAmount === opt.credits && (
                            <i className="ri-check-line text-white text-xs"></i>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-[#0B1F33] text-sm">
                            {opt.label}
                          </p>
                          {opt.savings && (
                            <p className="text-xs text-green-600 font-semibold">
                              Save {opt.savings}
                            </p>
                          )}
                        </div>
                        {opt.popular && (
                          <span className="px-2 py-0.5 bg-[#D4B483] text-[#0B1F33] text-xs font-bold rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-[#0B1F33]">
                        ${opt.price.toFixed(0)}
                      </p>
                    </button>
                  ))}

                  <div className="bg-[#F9F9FB] rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <i className="ri-information-line text-[#6B7C8F] mt-0.5"></i>
                      <p className="text-xs text-[#6B7C8F]">
                        Credits never expire. Use them to unlock leads in the
                        Job Marketplace and submit quotes directly to homeowners.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#D4B483]/10 to-transparent rounded-lg p-3 border border-[#D4B483]/20">
                    <div className="flex items-center gap-2">
                      <i className="ri-vip-crown-line text-[#D4B483]"></i>
                      <p className="text-xs text-[#0B1F33]">
                        <strong>Premium tip:</strong> At 7+ leads/month,
                        Premium ($99/mo) saves you money with unlimited access.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handleBuyClose}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuyNext}
                    disabled={paymentLoading}
                    className="flex-1 px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-[#c4a473] cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      `Buy ${buyAmount} Credits — $${buyOptions.find(
                        (o) => o.credits === buyAmount
                      )?.price.toFixed(0)}`
                    )}
                  </button>
                </div>
              </>
            )}

            {buyStep === 'pay' && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CreditPaymentForm
                  buyAmount={buyAmount}
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    handleBuyClose();
                    // Optimistically update credit balance
                    setCreditBalance(prev => prev + buyAmount);
                    setToast(`${buyAmount} credits purchased successfully!`);
                    setTimeout(() => setToast(null), 3000);
                    // Refetch to get authoritative balance from DB
                    fetchData();
                  }}
                  onCancel={() => {
                    setBuyStep('select');
                    setClientSecret(null);
                  }}
                  onError={(msg) => {
                    setPaymentError(msg);
                  }}
                  error={paymentError}
                />
              </Elements>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0B1F33]">
                Credit History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            <div className="px-6 pt-4 flex gap-2">
              <button
                onClick={() => setActiveHistoryTab('leads')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  activeHistoryTab === 'leads'
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
              >
                Leads Unlocked ({leadsPurchased.length})
              </button>
              <button
                onClick={() => setActiveHistoryTab('purchases')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  activeHistoryTab === 'purchases'
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
              >
                Credit Purchases ({purchaseHistory.length})
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {activeHistoryTab === 'leads' && (
                <div className="space-y-2">
                  {leadsPurchased.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0B1F33] truncate">
                          {lead.jobTitle}
                        </p>
                        <p className="text-xs text-[#6B7C8F]">
                          {lead.homeowner} &bull; {lead.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {lead.quoteAmount && (
                          <span className="text-sm font-bold text-[#0B1F33]">
                            {lead.quoteAmount}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            lead.status
                          )}`}
                        >
                          {lead.status.charAt(0).toUpperCase() +
                            lead.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeHistoryTab === 'purchases' && (
                <div className="space-y-2">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]">
                          {purchase.credits} Credits
                        </p>
                        <p className="text-xs text-[#6B7C8F]">
                          {purchase.date} &bull; {purchase.method}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#0B1F33]">
                        ${purchase.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

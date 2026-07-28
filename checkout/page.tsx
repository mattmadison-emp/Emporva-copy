
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import OrderSummary from './components/OrderSummary';
import PaymentForm from './components/PaymentForm';
import { redirectToCheckout, stripeApi } from '../../lib/stripeApi';
import { generateReceiptPDF } from '../../utils/receiptPdf';
import EmailPreview from '../../components/feature/EmailPreview';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type CheckoutStep = 'payment' | 'processing' | 'confirmation';

interface CheckoutConfig {
  title: string;
  subtitle: string;
  lineItems: { id: string; label: string; description?: string; amount: number }[];
  tax: number;
  discount: number;
  returnPath: string;
  returnLabel: string;
}

const SUBSCRIPTION_TYPES = ['homeowner-premium', 'contractor-premium', 'contractor-pro'];

const checkoutConfigs: Record<string, CheckoutConfig> = {
  'homeowner-premium': {
    title: 'Homeowner Premium Plan',
    subtitle: 'Monthly subscription',
    lineItems: [
      {
        id: '1',
        label: 'Premium Plan — Monthly',
        description: 'Property Memory, Utility Insights, unlimited AI diagnostics & more',
        amount: 12.0,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/homeowner-plans',
    returnLabel: 'Back to Plans',
  },
  'contractor-pro': {
    title: 'Contractor Pro Plan',
    subtitle: 'Monthly subscription',
    lineItems: [
      {
        id: '1',
        label: 'Pro Plan — Monthly',
        description: 'Full CRM, pipeline tracking, marketing automation & analytics',
        amount: 99.0,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/contractor-plans',
    returnLabel: 'Back to Plans',
  },
  'contractor-premium': {
    title: 'Contractor Premium Plan',
    subtitle: 'Monthly subscription',
    lineItems: [
      {
        id: '1',
        label: 'Premium Plan — Monthly',
        description: 'Unlimited leads, CRM, marketing automation & more',
        amount: 99.0,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/contractor-plans',
    returnLabel: 'Back to Plans',
  },
  'milestone-payment': {
    title: 'Milestone Payment',
    subtitle: 'Job payment release',
    lineItems: [
      {
        id: '1',
        label: 'Dehumidifier Setup & Calibration',
        description: 'Crawlspace Moisture Remediation — Mike Thompson',
        amount: 990.0,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/homeowner-dashboard',
    returnLabel: 'Back to Dashboard',
  },
  'service-payment': {
    title: 'Service Payment',
    subtitle: 'One-time payment',
    lineItems: [
      {
        id: '1',
        label: 'HVAC System Diagnostic & Repair',
        description: 'Climate Control Experts — Sarah Martinez',
        amount: 1150.0,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/homeowner-dashboard',
    returnLabel: 'Back to Dashboard',
  },
};


export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'homeowner-premium';
  const invoiceId = searchParams.get('invoiceId') || '';
  const invoiceNumber = searchParams.get('invoiceNumber') || '';
  const invoiceAmount = parseFloat(searchParams.get('amount') || '0');

  const isSubscription = SUBSCRIPTION_TYPES.includes(type);

  // Build dynamic config for invoice payments
  const config: CheckoutConfig = type === 'invoice-payment' ? {
    title: 'Invoice Payment',
    subtitle: `Invoice ${decodeURIComponent(invoiceNumber)}`,
    lineItems: [
      {
        id: '1',
        label: `Invoice ${decodeURIComponent(invoiceNumber)}`,
        description: 'Contractor invoice payment via Emporva escrow',
        amount: invoiceAmount || 990,
      },
    ],
    tax: 0,
    discount: 0,
    returnPath: '/homeowner-dashboard',
    returnLabel: 'Back to Dashboard',
  } : (checkoutConfigs[type] ?? checkoutConfigs['homeowner-premium']);

  const [step, setStep] = useState<CheckoutStep>('payment');
  const [discount, setDiscount] = useState(config.discount);
  const [promoApplied, setPromoApplied] = useState('');
  const [confirmationId, setConfirmationId] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const subtotal = config.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + config.tax - discount;

  const handleApplyPromo = (code: string) => {
    if (code.trim().toUpperCase() === 'EMPORVA20') {
      const newDiscount = Number((subtotal * 0.2).toFixed(2));
      setDiscount(newDiscount);
      setPromoApplied('EMPORVA20');
    }
  };

  // Fetch clientSecret for one-time payments
  useEffect(() => {
    if (isSubscription) return;

    let cancelled = false;

    async function createIntent() {
      const amountInCents = Math.round(total * 100);
      const { data, error } = await stripeApi<{ clientSecret: string }>('create-payment-intent', {
        amount: amountInCents,
        description: config.title,
        metadata: {
          type,
          ...(invoiceId ? { invoiceId } : {}),
          ...(invoiceNumber ? { invoiceNumber: decodeURIComponent(invoiceNumber) } : {}),
        },
      });

      if (cancelled) return;

      if (error || !data?.clientSecret) {
        setPaymentError(error || 'Failed to initialize payment. Please refresh.');
        return;
      }

      setClientSecret(data.clientSecret);
    }

    createIntent();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, total]);

  // Handle subscription redirect
  const handleSubscription = async () => {
    setRedirecting(true);
    setPaymentError(null);
    setStep('processing');

    const error = await redirectToCheckout(type);
    if (error) {
      setStep('payment');
      setRedirecting(false);
      setPaymentError(error);
    }
  };

  // Handle successful one-time payment
  const handlePaymentSuccess = (paymentIntentId: string) => {
    setConfirmationId(paymentIntentId);

    // Mark invoice as paid in sessionStorage so contractor dashboard picks it up
    if (type === 'invoice-payment' && invoiceId) {
      const paidInvoices = JSON.parse(sessionStorage.getItem('emporva_paid_invoices') || '[]');
      paidInvoices.push({
        invoiceId,
        invoiceNumber: decodeURIComponent(invoiceNumber),
        confirmationId: paymentIntentId,
        amount: total,
        paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      sessionStorage.setItem('emporva_paid_invoices', JSON.stringify(paidInvoices));
    }

    setStep('confirmation');
  };

  const handleDownloadReceipt = () => {
    generateReceiptPDF({
      confirmationId,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      description: config.title,
      amount: total,
      subtotal,
      tax: config.tax,
      discount,
      paymentMethod: 'Visa',
      cardLast4: '4242',
      type: type === 'invoice-payment' ? 'service' : type.includes('milestone') ? 'milestone' : type.includes('service') ? 'service' : 'subscription',
      jobTitle: type === 'invoice-payment' ? `Invoice ${decodeURIComponent(invoiceNumber)}` : type.includes('milestone') || type.includes('service') ? config.lineItems[0]?.description?.split(' — ')[0] : undefined,
      contractor: type === 'invoice-payment' ? 'Via Emporva Escrow' : type.includes('milestone') || type.includes('service') ? config.lineItems[0]?.description?.split(' — ')[1] : undefined,
      milestone: type.includes('milestone') ? config.lineItems[0]?.label : undefined,
      promoCode: promoApplied || undefined,
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isInvoicePayment = type === 'invoice-payment';

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Email Preview Modal */}
      {showEmailPreview && (
        <EmailPreview
          type="invoice-paid"
          data={{
            recipientName: 'ProFlow Plumbing & Repair',
            recipientEmail: 'contact@proflowplumbing.com',
            senderName: 'Jennifer Martinez',
            invoiceNumber: decodeURIComponent(invoiceNumber) || 'EMP-INV-2025-0042',
            jobTitle: 'Crawlspace Moisture Remediation',
            amount: total,
            paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            confirmationId,
          }}
          onClose={() => setShowEmailPreview(false)}
        />
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo"
              className="w-10 h-10"
            />
            <span
              className="text-2xl font-bold text-[#0B1F33]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Emporva
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 text-sm text-[#6B7C8F]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <i className="ri-shield-check-fill text-green-500"></i>
              Secure Checkout
            </div>
            <Link
              to={config.returnPath}
              className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <i className="ri-arrow-left-line"></i>
              {config.returnLabel}
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-8">
            {[
              { id: 'payment', label: 'Payment', icon: 'ri-bank-card-line' },
              { id: 'processing', label: 'Processing', icon: 'ri-loader-4-line' },
              { id: 'confirmation', label: 'Confirmation', icon: 'ri-check-line' },
            ].map((s, i) => {
              const isActive = s.id === step;
              const isComplete =
                (step === 'processing' && i === 0) || (step === 'confirmation' && i < 2);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  {i > 0 && (
                    <div
                      className={`w-12 h-0.5 ${isComplete ? 'bg-[#00B8A9]' : 'bg-gray-200'}`}
                    ></div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isComplete
                          ? 'bg-[#00B8A9] text-white'
                          : isActive
                          ? 'bg-[#0B1F33] text-white'
                          : 'bg-gray-200 text-[#6B7C8F]'
                      }`}
                    >
                      {isComplete ? <i className="ri-check-line"></i> : <i className={s.icon}></i>}
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        isActive || isComplete ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {isSubscription ? (
                /* Subscription: show summary card with redirect button */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                  <div>
                    <h3
                      className="text-lg font-bold text-[#0B1F33] mb-1"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Subscribe to {config.title}
                    </h3>
                    <p
                      className="text-sm text-[#6B7C8F]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      You&apos;ll be redirected to Stripe&apos;s secure checkout to enter your payment details
                    </p>
                  </div>

                  <div className="bg-[#F9F9FB] rounded-xl p-5 space-y-3">
                    {config.lineItems.map((item) => (
                      <div key={item.id}>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Total
                      </span>
                      <span className="text-lg font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ${total.toFixed(2)}/mo
                      </span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <i className="ri-error-warning-line text-red-500"></i>
                      <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {paymentError}
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-shield-check-line text-green-600"></i>
                    </div>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Your payment is processed securely by Stripe. Card details never touch our servers.
                    </p>
                  </div>

                  <button
                    onClick={handleSubscription}
                    disabled={redirecting}
                    className={`w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      redirecting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {redirecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <i className="ri-lock-line"></i>
                        Subscribe Now — ${total.toFixed(2)}/mo
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* One-time payment: show card form */
                <>
                  {paymentError && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl">
                      <i className="ri-error-warning-line text-red-500"></i>
                      <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {paymentError}
                      </p>
                    </div>
                  )}
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      amount={total}
                      clientSecret={clientSecret || ''}
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setPaymentError(msg)}
                    />
                  </Elements>
                </>
              )}
            </div>
            <div className="lg:col-span-2">
              <OrderSummary
                title={config.title}
                subtitle={config.subtitle}
                lineItems={config.lineItems}
                tax={config.tax}
                discount={discount}
                promoApplied={promoApplied}
                onApplyPromo={handleApplyPromo}
              />

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-lock-line text-green-600"></i>
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold text-[#0B1F33]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      256-bit SSL Encryption
                    </p>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Bank-level security
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-shield-star-line text-[#00B8A9]"></i>
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold text-[#0B1F33]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Emporva Payment Protection
                    </p>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Milestone-based escrow for job payments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-refund-2-line text-[#D4B483]"></i>
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold text-[#0B1F33]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Money-Back Guarantee
                    </p>
                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      30-day refund policy on subscriptions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 border-4 border-[#00B8A9]/20 border-t-[#00B8A9] rounded-full animate-spin mx-auto mb-8"></div>
            <h2
              className="text-2xl font-bold text-[#0B1F33] mb-3"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isSubscription ? 'Redirecting to Secure Checkout' : 'Processing Your Payment'}
            </h2>
            <p className="text-[#6B7C8F] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              {isSubscription
                ? 'Redirecting to Stripe\u2019s secure checkout...'
                : `Securely processing $${total.toFixed(2)}...`
              }
            </p>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Please don&apos;t close this window
            </p>
          </div>
        )}

        {/* CONFIRMATION STEP */}
        {step === 'confirmation' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-[#00B8A9] to-[#00a89a] p-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <i className="ri-check-double-line text-4xl"></i>
                </div>
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Payment Successful!
                </h2>
                <p className="text-white/90 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your payment of <strong>${total.toFixed(2)}</strong> has been processed
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Confirmation Details */}
                <div className="bg-[#F9F9FB] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Confirmation ID
                    </span>
                    <span className="text-sm font-bold text-[#0B1F33] font-mono">{confirmationId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Date
                    </span>
                    <span className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Amount
                    </span>
                    <span className="text-sm font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Description
                    </span>
                    <span className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {config.title}
                    </span>
                  </div>
                  {isInvoicePayment && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Invoice
                      </span>
                      <span className="text-sm font-semibold text-[#0B1F33] font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {decodeURIComponent(invoiceNumber)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Invoice Payment Notification Banner */}
                {isInvoicePayment && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-mail-check-line text-green-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Notifications Sent
                        </p>
                        <p className="text-xs text-green-700 leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                          The contractor has been notified that this invoice has been paid. A payment confirmation email has been sent to both parties. The invoice status has been updated to &quot;Paid&quot; on both dashboards.
                        </p>
                        <button
                          onClick={() => setShowEmailPreview(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-eye-line"></i>
                          Preview Contractor Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* What Happens Next */}
                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    What Happens Next
                  </h4>
                  <div className="space-y-3">
                    {isInvoicePayment ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Payment deposited into Emporva escrow — contractor has been notified
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Invoice {decodeURIComponent(invoiceNumber)} marked as &quot;Paid&quot; on both dashboards
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Funds released to contractor once work milestone is verified by you
                          </p>
                        </div>
                      </>
                    ) : type.includes('milestone') || type.includes('service') ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Payment has been released to the contractor&apos;s escrow account
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Your contractor has been notified of the approved payment
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Track the next milestone from your dashboard
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Your plan has been activated immediately
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            A confirmation email has been sent to your inbox
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#00B8A9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            All premium features are now unlocked in your dashboard
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Link
                    to={config.returnPath}
                    className="flex-1 px-5 py-3 bg-[#0B1F33] text-white rounded-xl font-semibold text-center hover:bg-[#0a1a2a] transition-colors cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleDownloadReceipt}
                    className="px-5 py-3 bg-[#F9F9FB] text-[#0B1F33] rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-download-line"></i>
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

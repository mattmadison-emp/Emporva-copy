import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError?: (message: string) => void;
}

export default function PaymentForm({
  amount,
  clientSecret,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Name required';
    }
    if (!billingZip.trim()) {
      newErrors.billingZip = 'ZIP required';
    }
    if (!stripe || !elements) {
      newErrors.stripe = 'Payment system not loaded. Please refresh.';
    }
    if (!clientSecret) {
      newErrors.stripe = 'Payment not ready. Please wait or refresh.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cardElement = elements!.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not found. Please refresh.');
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName,
          address: { postal_code: billingZip },
        },
      },
    });

    if (error) {
      const message = error.message || 'An error occurred with your card.';
      setCardError(message);
      onError?.(message);
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setCardError('Payment was not completed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div>
        <h3
          className="text-lg font-bold text-[#0B1F33] mb-1"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Payment Method
        </h3>
        <p
          className="text-sm text-[#6B7C8F]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          All transactions are secure and encrypted via Stripe
        </p>
      </div>

      <div className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label
            className="block text-sm font-semibold text-[#0B1F33] mb-1.5"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-200'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          {errors.cardholderName && (
            <p className="text-xs text-red-500 mt-1">{errors.cardholderName}</p>
          )}
        </div>

        {/* Stripe Card Element */}
        <div>
          <label
            className="block text-sm font-semibold text-[#0B1F33] mb-1.5"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Card Details
          </label>
          <div
            className={`px-4 py-3 border rounded-xl ${
              cardError ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0B1F33',
                    '::placeholder': {
                      color: '#6B7C8F',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
              onChange={(event) => {
                if (event.error) {
                  setCardError(event.error.message);
                } else {
                  setCardError('');
                }
              }}
            />
          </div>
          {cardError && (
            <p className="text-xs text-red-500 mt-1">{cardError}</p>
          )}
        </div>

        {/* Billing ZIP */}
        <div>
          <label
            className="block text-sm font-semibold text-[#0B1F33] mb-1.5"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Billing ZIP Code
          </label>
          <input
            type="text"
            value={billingZip}
            onChange={(e) => setBillingZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="28203"
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] ${
              errors.billingZip ? 'border-red-300' : 'border-gray-200'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          {errors.billingZip && (
            <p className="text-xs text-red-500 mt-1">{errors.billingZip}</p>
          )}
        </div>
      </div>

      {errors.stripe && (
        <p className="text-sm text-red-500 text-center">{errors.stripe}</p>
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

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={processing || !stripe || !clientSecret}
        className={`w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
          processing || !stripe || !clientSecret
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer'
        }`}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : !clientSecret ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
            Preparing payment...
          </>
        ) : (
          <>
            <i className="ri-lock-line"></i>
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}

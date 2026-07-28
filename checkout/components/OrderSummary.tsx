
import { useState } from 'react';

interface LineItem {
  id: string;
  label: string;
  description?: string;
  amount: number;
}

interface OrderSummaryProps {
  title: string;
  subtitle?: string;
  lineItems: LineItem[];
  tax?: number;
  discount?: number;
  promoApplied?: string;
  onApplyPromo?: (code: string) => void;
}

export default function OrderSummary({
  title,
  subtitle,
  lineItems,
  tax = 0,
  discount = 0,
  promoApplied,
  onApplyPromo,
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + tax - discount;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    setPromoError('');
    onApplyPromo?.(promoCode.trim());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B1F33] p-6 text-white">
        <h3 className="text-lg font-bold mb-1 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Line Items */}
      <div className="p-6 space-y-4">
        {lineItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.description}
                </p>
              )}
            </div>
            <span className="text-sm font-bold text-[#0B1F33] ml-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${item.amount.toFixed(2)}
            </span>
          </div>
        ))}

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Subtotal
            </span>
            <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {tax > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Tax
              </span>
              <span className="text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                ${tax.toFixed(2)}
              </span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <i className="ri-coupon-line"></i>
                Discount {promoApplied && `(${promoApplied})`}
              </span>
              <span className="text-green-600 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                -${discount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Promo Code */}
        {onApplyPromo && !promoApplied && (
          <div className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError('');
                }}
                placeholder="Promo code"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {promoError}
              </p>
            )}
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-[#0B1F33]/10 pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Total
          </span>
          <span className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

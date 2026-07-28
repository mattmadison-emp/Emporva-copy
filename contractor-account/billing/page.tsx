import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../../../hooks/useProfile';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { redirectToCustomerPortal, redirectToCheckout } from '../../../lib/stripeApi';

export default function ContractorAccountBilling() {
  const { profile, loading } = useProfile();
  const routes = useRoleRoutes();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tier = profile?.tier || 'core';
  const planDetails = tier === 'premium'
    ? { name: 'Premium', price: 99 }
    : { name: 'Core', price: 0 };

  const handleManageBilling = async () => {
    setActionLoading('portal');
    setError(null);
    const returnUrl = window.location.origin + routes.billing;
    const err = await redirectToCustomerPortal(returnUrl);
    if (err) {
      setError(err);
      setActionLoading(null);
    }
  };

  const handleUpgrade = async () => {
    setActionLoading('upgrade');
    setError(null);
    const err = await redirectToCheckout('contractor-premium');
    if (err) {
      setError(err);
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>
          <Link
            to={routes.dashboard}
            className="flex items-center gap-2 text-[#0B1F33] hover:text-[#D4B483] transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Billing & Plans
            </h1>
            <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage your subscription and payment methods
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
              <i className="ri-error-warning-line text-lg"></i>
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          )}

          {/* Current Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Current Plan
                </h2>
                <p className="text-[#6B7C8F] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your subscription details
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full">
                  <i className={tier === 'premium' ? 'ri-vip-crown-line' : 'ri-shield-check-line'}></i>
                  <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{planDetails.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {planDetails.price === 0 ? 'Free' : `$${planDetails.price}`}
              </span>
              {planDetails.price > 0 && (
                <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>/month</span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Manage Billing — available to Premium subscribers */}
                {tier === 'premium' && (
                  <button
                    onClick={handleManageBilling}
                    disabled={actionLoading === 'portal'}
                    className="w-full px-5 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-medium whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {actionLoading === 'portal' ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      <i className="ri-bank-card-line text-lg"></i>
                    )}
                    Manage Billing
                  </button>
                )}

                {/* Upgrade — available to Core subscribers */}
                {tier === 'core' && (
                  <button
                    onClick={handleUpgrade}
                    disabled={actionLoading === 'upgrade'}
                    className="w-full px-5 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c4a473] transition-colors font-medium whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {actionLoading === 'upgrade' ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      <i className="ri-arrow-up-circle-line text-lg"></i>
                    )}
                    Upgrade to Premium — $99/month
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Support */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#D4B483]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-customer-service-2-line text-[#D4B483] text-2xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Need Help?
                </h3>
                <p className="text-sm text-[#6B7C8F] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Have questions about billing or your subscription? Our support team is here to help.
                </p>
                <Link
                  to={routes.help}
                  className="inline-flex items-center gap-2 text-sm text-[#D4B483] hover:text-[#c4a473] font-medium cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Contact Support
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

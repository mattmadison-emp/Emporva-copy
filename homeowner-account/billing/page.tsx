import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { useProfile } from '../../../hooks/useProfile';
import { redirectToCustomerPortal, redirectToCheckout } from '../../../lib/stripeApi';

export default function HomeownerBillingPage() {
  const routes = useRoleRoutes();
  const { profile, loading } = useProfile();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tier = profile?.tier || 'core';
  const isPremium = tier === 'premium';
  const planDetails = isPremium
    ? { name: 'Premium', price: 12 }
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
    const err = await redirectToCheckout('homeowner-premium');
    if (err) {
      setError(err);
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to={routes.dashboard}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your subscription and payment methods</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <i className="ri-error-warning-line text-lg"></i>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-8 bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 bg-white/20 backdrop-blur-sm text-white">
                  <i className={isPremium ? 'ri-vip-crown-fill' : 'ri-shield-check-fill'}></i>
                  Current Plan
                </div>
                <h2 className="text-3xl font-bold mb-2 text-white">{planDetails.name} Plan</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {planDetails.price === 0 ? 'Free' : `$${planDetails.price}`}
                  </span>
                  {planDetails.price > 0 && <span className="text-lg opacity-90">/month</span>}
                </div>
              </div>
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <i className={`${isPremium ? 'ri-star-fill' : 'ri-home-4-fill'} text-3xl`}></i>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Manage Billing — available to Premium subscribers */}
              {tier === 'premium' && (
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'portal'}
                  className="w-full px-4 py-3 bg-[#0B1F33] text-white rounded-lg font-medium hover:bg-[#1a3a52] transition-colors text-center cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
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
                  className="w-full px-4 py-3 bg-[#0B1F33] text-white rounded-lg font-medium hover:bg-[#1a3a52] transition-colors text-center cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'upgrade' ? (
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                  ) : (
                    <i className="ri-arrow-up-circle-line text-lg"></i>
                  )}
                  Upgrade to Premium — $12/month
                </button>
              )}
            </div>
          )}
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-[#0B1F33]/5 to-blue-50 rounded-xl border border-[#0B1F33]/10 p-6">
          <div className="w-12 h-12 flex items-center justify-center bg-[#0B1F33] text-white rounded-lg mb-4">
            <i className="ri-customer-service-2-line text-2xl"></i>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Have questions about billing or your subscription? Our support team is here to help.
          </p>
          <Link
            to={routes.help}
            className="inline-flex items-center gap-2 text-sm text-[#0B1F33] hover:text-[#1a3a52] font-medium cursor-pointer whitespace-nowrap"
          >
            Contact Support
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

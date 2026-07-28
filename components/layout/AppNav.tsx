import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

import type { Tier } from '../../types/profile';

const roleRoutes: Record<string, { dashboard: string; account: string }> = {
  homeowner: { dashboard: '/homeowner-dashboard-core', account: '/homeowner-account' },
  'multi-unit': { dashboard: '/multi-unit-dashboard-core', account: '/homeowner-account' },
  contractor: { dashboard: '/contractor-dashboard-core', account: '/contractor-account' },
};

const premiumDashboards: Record<string, string> = {
  homeowner: '/homeowner-dashboard-premium',
  'multi-unit': '/multi-unit-dashboard-premium',
  contractor: '/contractor-dashboard-premium',
};

const tierLabels: Record<Tier, string> = {
  core: 'Core Plan',
  premium: 'Premium Plan',
};

const planUpgradeRoutes: Record<string, string> = {
  homeowner: '/homeowner-plans',
  'multi-unit': '/multi-unit-plans',
  contractor: '/contractor-plans',
};

export default function AppNav() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, displayName, initials } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = profile?.role || 'homeowner';
  const tier: Tier = profile?.tier || 'core';
  const routes = roleRoutes[role] || roleRoutes.homeowner;
  const dashboardPath = tier !== 'core' ? (premiumDashboards[role] || routes.dashboard) : routes.dashboard;
  const isPremium = tier !== 'core';

  const handleSignOut = async () => {
    // Navigate first to prevent ProtectedRoute from redirecting with
    // stale `from` state (the current dashboard path) before signOut completes
    navigate('/', { replace: true });
    await signOut();
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-nav-dropdown]')) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notificationsOpen, profileOpen]);

  const Avatar = ({ size = 'w-10 h-10', textSize = 'text-sm' }: { size?: string; textSize?: string }) => (
    profile?.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={displayName}
        className={`${size} rounded-full object-cover`}
      />
    ) : (
      <div className={`${size} rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-semibold ${textSize}`}>
        {initials || <i className="ri-user-line"></i>}
      </div>
    )
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo"
              className="w-9 h-9 sm:w-10 sm:h-10"
            />
            <span className="text-xl sm:text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href={dashboardPath} className="text-[#0B1F33] font-semibold cursor-pointer text-sm">
              Dashboard
            </a>

            {/* Homeowner-specific links */}
            {role === 'homeowner' && (
              <>
                {/* PHASE_1_GTM: contractor marketplace paused — restore Find Contractors for Phase 2
                <a href="/providers" className="text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer text-sm">
                  Find Contractors
                </a>
                */}
                <a href="/ai-intake" className="text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer text-sm">
                  Start a Project
                </a>
              </>
            )}

            {/* Multi-unit-specific links */}
            {role === 'multi-unit' && (
              <a href="/ai-intake" className="text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer text-sm flex items-center gap-2">
                <i className="ri-robot-line"></i>
                AI Diagnosis
              </a>
            )}

            {/* Contractor-specific links - Job Marketplace commented out for now */}
            {/* {role === 'contractor' && (
              <>
                <a href={`${dashboardPath}#marketplace`} className="text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer text-sm">
                  Job Marketplace
                </a>
              </>
            )} */}

            {/* Tier badge / upgrade link */}
            {isPremium ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full">
                <i className="ri-vip-crown-line text-[#0B1F33] text-sm"></i>
                <span className="text-xs font-bold text-[#0B1F33]">Premium</span>
              </div>
            ) : (
              <a
                href={planUpgradeRoutes[role] || '/homeowner-plans'}
                className="text-[#D4B483] font-semibold hover:text-[#c4a473] transition-colors cursor-pointer text-sm"
              >
                Upgrade to Premium
              </a>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4" data-nav-dropdown>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="w-10 h-10 bg-[#F9F9FB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer relative"
              >
                <i className="ri-notification-line text-[#0B1F33] text-xl"></i>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-[#0B1F33]">Notifications</h3>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <i className="ri-notification-off-line text-3xl text-gray-300 mb-2"></i>
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2 transition-colors cursor-pointer"
              >
                <Avatar />
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-[#0B1F33] whitespace-nowrap">{displayName || 'Loading...'}</p>
                  <p className={`text-xs whitespace-nowrap ${isPremium ? 'text-[#D4B483]' : 'text-[#6B7C8F]'}`}>
                    {tierLabels[tier]}
                  </p>
                </div>
                <i className="ri-arrow-down-s-line text-[#6B7C8F] hidden lg:block"></i>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-[#0B1F33]">{displayName}</p>
                    <p className="text-xs text-[#6B7C8F]">{profile?.email}</p>
                    <div className="mt-2">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full text-xs font-medium text-[#0B1F33]">
                          <i className="ri-vip-crown-line"></i>
                          Premium Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F9F9FB] rounded-full text-xs font-medium text-[#0B1F33]">
                          <i className="ri-shield-check-line text-[#14B8A6]"></i>
                          Core Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to={`${routes.account}/profile`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-user-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#0B1F33]">My Profile</span>
                    </Link>
                    <Link
                      to={dashboardPath}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-dashboard-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#0B1F33]">Dashboard</span>
                    </Link>
                    <Link
                      to={`${routes.account}/billing`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-bank-card-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#0B1F33]">Billing &amp; Plans</span>
                    </Link>
                    <Link
                      to={`${routes.account}/settings`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-settings-3-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#0B1F33]">Settings</span>
                    </Link>
                    <Link
                      to={`${routes.account}/help`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-question-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#0B1F33]">Help &amp; Support</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer w-full text-left"
                    >
                      <i className="ri-logout-box-line text-red-500"></i>
                      <span className="text-sm text-red-500">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl text-[#0B1F33]`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Avatar size="w-12 h-12" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F33]">{displayName || 'Loading...'}</p>
                <p className={`text-xs ${isPremium ? 'text-[#D4B483]' : 'text-[#6B7C8F]'}`}>
                  {tierLabels[tier]}
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <a href={dashboardPath} className="block text-[#0B1F33] font-semibold cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </a>

            {role === 'homeowner' && (
              <>
                {/* PHASE_1_GTM: contractor marketplace paused — restore Find Contractors for Phase 2
                <a href="/providers" className="block text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                  Find Contractors
                </a>
                */}
                <a href="/ai-intake" className="block text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                  Start a Project
                </a>
              </>
            )}

            {role === 'multi-unit' && (
              <a href="/ai-intake" className="block text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                AI Diagnosis
              </a>
            )}

            {/* {role === 'contractor' && (
              <a href={`${dashboardPath}#marketplace`} className="block text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                Job Marketplace
              </a>
            )} */}

            {!isPremium && (
              <a
                href={planUpgradeRoutes[role] || '/homeowner-plans'}
                className="block text-[#D4B483] font-semibold cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Upgrade to Premium
              </a>
            )}

            {/* Account Links */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link to={`${routes.account}/profile`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                <i className="ri-user-line"></i>
                <span>My Profile</span>
              </Link>
              <Link to={`${routes.account}/billing`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                <i className="ri-bank-card-line"></i>
                <span>Billing &amp; Plans</span>
              </Link>
              <Link to={`${routes.account}/settings`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                <i className="ri-settings-3-line"></i>
                <span>Settings</span>
              </Link>
              <Link to={`${routes.account}/help`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                <i className="ri-question-line"></i>
                <span>Help &amp; Support</span>
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-3 text-red-500 cursor-pointer">
                <i className="ri-logout-box-line"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

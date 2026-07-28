
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../hooks/useProfile';

const dashboardRoutes: Record<string, string> = {
  homeowner: '/homeowner-dashboard-core',
  'multi-unit': '/multi-unit-dashboard-core',
  contractor: '/contractor-dashboard-core',
};

const premiumDashboardRoutes: Record<string, string> = {
  homeowner: '/homeowner-dashboard-premium',
  'multi-unit': '/multi-unit-dashboard-premium',
  contractor: '/contractor-dashboard-premium',
};

const accountRoutes: Record<string, string> = {
  homeowner: '/homeowner-account',
  'multi-unit': '/homeowner-account',
  contractor: '/contractor-account',
};

const tierLabels: Record<string, string> = {
  core: 'Core Plan',
  premium: 'Premium Plan',
};

interface NavbarProps {
  activePage?: 'how-it-works' | 'providers' | 'blog' | 'services' | 'solutions';
}

export default function Navbar({ activePage }: NavbarProps = {}) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, displayName, initials } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);

  const isLoggedIn = !!user;
  const role = profile?.role || 'homeowner';
  const tier = profile?.tier || 'core';
  const isPremium = tier === 'premium';
  const dashboardPath = isPremium
    ? (premiumDashboardRoutes[role] || dashboardRoutes.homeowner)
    : (dashboardRoutes[role] || dashboardRoutes.homeowner);
  const accountPath = accountRoutes[role] || accountRoutes.homeowner;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const Avatar = ({ size = 'w-9 h-9', textSize = 'text-xs' }: { size?: string; textSize?: string }) => (
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Emporva - Home">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo - AI Property Services Platform"
              title="Emporva - AI-Powered Property Services"
              className="w-10 h-10"
              width="40"
              height="40"
            />
            <span className="text-2xl font-bold text-primary-navy" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className={`font-medium transition-colors cursor-pointer ${activePage === 'how-it-works' ? 'text-accent-sand' : 'text-neutral-dark hover:text-accent-sand'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              How It Works
            </Link>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button
                className="font-medium text-neutral-dark hover:text-accent-sand transition-colors cursor-pointer flex items-center gap-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-expanded={isSolutionsOpen}
                aria-haspopup="true"
              >
                Solutions
                <i className={`ri-arrow-down-s-line text-lg ${isSolutionsOpen ? 'rotate-180' : ''} transition-transform`} aria-hidden="true"></i>
              </button>

              {isSolutionsOpen && (
                <div className="absolute top-full left-0 pt-4 -mt-2" role="menu">
                  <div className="bg-white rounded-lg shadow-xl py-2 border border-neutral-light w-80">
                    <Link
                      to="/for-homeowners"
                      className="block px-6 py-3 hover:bg-neutral-light/50 transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <div className="font-semibold text-primary-navy" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Homeowners
                      </div>
                      <div className="text-sm text-neutral-dark mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Property organization and intelligence
                      </div>
                    </Link>

                    {/* Multi-Unit Owners - commented out for now
                    <Link
                      to="/for-multi-unit"
                      className="block px-6 py-3 hover:bg-neutral-light/50 transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <div className="font-semibold text-primary-navy" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Multi-Unit Owners
                      </div>
                      <div className="text-sm text-neutral-dark mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Portfolio operations and utility analytics
                      </div>
                    </Link>
                    */}

                    <Link
                      to="/early-access-contractors"
                      className="block px-6 py-3 hover:bg-neutral-light/50 transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <div className="font-semibold text-primary-navy" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Contractors
                      </div>
                      <div className="text-sm text-neutral-dark mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        CRM, scheduling, and client growth
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Find Pros — hidden until phase 2
            <Link to="/providers" className={`font-medium transition-colors cursor-pointer ${activePage === 'providers' ? 'text-accent-sand' : 'text-neutral-dark hover:text-accent-sand'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Find Pros
            </Link>
            */}
            <Link to="/services" className={`font-medium transition-colors cursor-pointer ${activePage === 'services' ? 'text-accent-sand' : 'text-neutral-dark hover:text-accent-sand'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Services
            </Link>

            <Link to="/blog" className={`font-medium transition-colors cursor-pointer ${activePage === 'blog' ? 'text-accent-sand' : 'text-neutral-dark hover:text-accent-sand'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Blog
            </Link>

            {isLoggedIn ? (
              <div className="relative" data-profile-dropdown>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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
                        to={dashboardPath}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-dashboard-line text-[#6B7C8F]"></i>
                        <span className="text-sm text-[#0B1F33]">Dashboard</span>
                      </Link>
                      <Link
                        to={`${accountPath}/profile`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-user-line text-[#6B7C8F]"></i>
                        <span className="text-sm text-[#0B1F33]">My Profile</span>
                      </Link>
                      <Link
                        to={`${accountPath}/billing`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-bank-card-line text-[#6B7C8F]"></i>
                        <span className="text-sm text-[#0B1F33]">Billing &amp; Plans</span>
                      </Link>
                      <Link
                        to={`${accountPath}/settings`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-settings-3-line text-[#6B7C8F]"></i>
                        <span className="text-sm text-[#0B1F33]">Settings</span>
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
            ) : (
              <Link to="/login" className="btn-primary whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl text-primary-navy`} aria-hidden="true"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 bg-white rounded-lg shadow-lg" role="menu">
            <div className="flex flex-col gap-4 p-4">
              {isLoggedIn && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Avatar size="w-10 h-10" />
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F33]">{displayName || 'Loading...'}</p>
                    <p className={`text-xs ${isPremium ? 'text-[#D4B483]' : 'text-[#6B7C8F]'}`}>
                      {tierLabels[tier]}
                    </p>
                  </div>
                </div>
              )}

              <Link to="/how-it-works" className="text-neutral-dark font-medium hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }} role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                How It Works
              </Link>

              {/* Solutions Expandable */}
              <div>
                <button
                  onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                  className="w-full text-left text-neutral-dark font-medium hover:text-accent-sand transition-colors cursor-pointer flex items-center justify-between"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  aria-expanded={isSolutionsOpen}
                >
                  Solutions
                  <i className={`ri-arrow-down-s-line text-lg ${isSolutionsOpen ? 'rotate-180' : ''} transition-transform`} aria-hidden="true"></i>
                </button>

                {isSolutionsOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-3">
                    <Link to="/for-homeowners" className="cursor-pointer" role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="font-semibold text-primary-navy text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Homeowners
                      </div>
                      <div className="text-xs text-neutral-dark" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Property organization and intelligence
                      </div>
                    </Link>

                    {/* Multi-Unit Owners - commented out for now
                    <Link to="/for-multi-unit" className="cursor-pointer" role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="font-semibold text-primary-navy text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Multi-Unit Owners
                      </div>
                      <div className="text-xs text-neutral-dark" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Portfolio operations and utility analytics
                      </div>
                    </Link>
                    */}

                    <Link to="/early-access-contractors" className="cursor-pointer" role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="font-semibold text-primary-navy text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Contractors
                      </div>
                      <div className="text-xs text-neutral-dark" style={{ fontFamily: 'Inter, sans-serif' }}>
                        CRM, scheduling, and client growth
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Find Pros — hidden until phase 2
              <Link to="/providers" className="text-neutral-dark font-medium hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }} role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                Find Pros
              </Link>
              */}
              <Link to="/services" className="text-neutral-dark font-medium hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }} role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </Link>

              <Link to="/blog" className="text-neutral-dark font-medium hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }} role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                Blog
              </Link>

              {isLoggedIn ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link to={dashboardPath} className="flex items-center gap-3 text-[#0B1F33] font-semibold cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="ri-dashboard-line"></i>
                    <span>Dashboard</span>
                  </Link>
                  <Link to={`${accountPath}/profile`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="ri-user-line"></i>
                    <span>My Profile</span>
                  </Link>
                  <Link to={`${accountPath}/billing`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="ri-bank-card-line"></i>
                    <span>Billing &amp; Plans</span>
                  </Link>
                  <Link to={`${accountPath}/settings`} className="flex items-center gap-3 text-[#6B7C8F] cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="ri-settings-3-line"></i>
                    <span>Settings</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-3 text-red-500 cursor-pointer">
                    <i className="ri-logout-box-line"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary whitespace-nowrap text-center" style={{ fontFamily: 'Montserrat, sans-serif' }} role="menuitem" onClick={() => setIsMobileMenuOpen(false)}>
                  Log In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

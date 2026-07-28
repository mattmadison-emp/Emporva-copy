import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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

const enrollRoutes: Record<string, string> = {
  homeowner: '/enroll-homeowner',
  'multi-unit': '/enroll-multi-unit',
  contractor: '/enroll-contractor',
};

function getDashboardPath(role: string, tier: string): string {
  if (tier === 'premium') {
    return premiumDashboardRoutes[role] || dashboardRoutes.homeowner;
  }
  return dashboardRoutes[role] || dashboardRoutes.homeowner;
}

async function getPostLoginRedirect(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tier, onboarding_completed')
    .eq('id', userId)
    .single();

  if (!profile || !profile.role) {
    return '/role-selection';
  }

  if (!profile.onboarding_completed) {
    return enrollRoutes[profile.role] || '/role-selection';
  }

  return getDashboardPath(profile.role, profile.tier || 'core');
}

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [teamEmail, setTeamEmail] = useState('');
  const [teamSending, setTeamSending] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [teamError, setTeamError] = useState('');

  // Redirect authenticated users away from login to their dashboard
  useEffect(() => {
    if (!loading && user && !isSubmitting) {
      getPostLoginRedirect(user.id).then((redirect) => {
        navigate(redirect, { replace: true });
      });
    }
  }, [loading, user, isSubmitting, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        // Always compute redirect from the user's profile to avoid stale
        // location state from a previous user's session (e.g. ProtectedRoute
        // saves `from` on sign-out, which leaks into the next login).
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const redirect = await getPostLoginRedirect(authUser.id);
          navigate(redirect, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setTeamMessage('');
    if (!teamEmail.trim()) {
      setTeamError('Please enter your team email address.');
      return;
    }
    setTeamSending(true);
    try {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: teamEmail.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${siteUrl}/team-member-dashboard`,
        },
      });
      if (otpError) {
        // Don't leak whether the email is in the system — generic message.
        console.warn('[team-magic-link] otp error:', otpError);
      }
      setTeamMessage('If your email is registered as a team member, a sign-in link is on its way.');
      setTeamEmail('');
    } finally {
      setTeamSending(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      // Always show same message regardless of whether account exists (prevents enumeration)
      setMessage('If an account exists with that email, you will receive a password reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Log in to your Emporva account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-11 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C8F] hover:text-[#0B1F33]"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-end text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  className="text-[#D4B483] hover:text-[#C4A473] font-medium disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Forgot password?
                </button>
              </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0B1F33] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {isSubmitting ? 'Please wait...' : 'Log In'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#D4B483] hover:text-[#C4A473] font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#E5E7EB]">
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-[#D4B483]/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-team-line text-[#D4B483]"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Team member?
                  </h3>
                  <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    If your contractor invited you, enter your work email and we'll send a one-click sign-in link.
                  </p>
                </div>
              </div>

              {teamError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {teamError}
                </div>
              )}
              {teamMessage && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {teamMessage}
                </div>
              )}

              <form onSubmit={handleTeamMagicLink} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  placeholder="you@yourcrew.com"
                  disabled={teamSending}
                  required
                  className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm bg-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={teamSending}
                  className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {teamSending ? 'Sending…' : 'Send sign-in link'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-[#6B7C8F] mt-4 sm:mt-6 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          By continuing, you agree to Emporva's{' '}
          <Link to="/terms" className="text-[#D4B483] hover:text-[#C4A473]">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-[#D4B483] hover:text-[#C4A473]">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

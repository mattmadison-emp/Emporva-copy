import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface NavProfile {
  name: string;
  email: string;
  avatar: string | null;
  plan: string;
}

export default function ContractorNav() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profile, setProfile] = useState<NavProfile>({ name: '', email: '', avatar: null, plan: 'Core' });
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; unread: boolean }>>([]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const [profileRes, cpRes] = await Promise.all([
      supabase.from('profiles').select('first_name, last_name, email, avatar_url').eq('id', user.id).single(),
      supabase.from('contractor_profiles').select('business_name, selected_plan').eq('user_id', user.id).single(),
    ]);
    if (profileRes.data) {
      setProfile({
        name: cpRes.data?.business_name || `${profileRes.data.first_name} ${profileRes.data.last_name}`,
        email: profileRes.data.email,
        avatar: profileRes.data.avatar_url,
        plan: cpRes.data?.selected_plan === 'premium' ? 'Premium' : 'Core',
      });
    }

    // Build notifications from recent activity
    const recentNotifs: Array<{ id: string; text: string; time: string; unread: boolean }> = [];

    // Recent payments received
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('id, amount, created_at')
      .eq('payee_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    (recentPayments || []).forEach(p => {
      const diffMs = Date.now() - new Date(p.created_at).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const timeStr = diffHrs < 1 ? 'Just now' : diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs / 24)}d ago`;
      recentNotifs.push({
        id: p.id,
        text: `Payment received: $${Number(p.amount).toLocaleString()}`,
        time: timeStr,
        unread: diffHrs < 24,
      });
    });

    setNotifications(recentNotifs);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
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

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-notification-3-line text-xl text-gray-700"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                        notif.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notif.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap cursor-pointer">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-bold text-sm">
                  {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{profile.name || 'Contractor'}</p>
                <p className="text-xs text-gray-500">{profile.plan} Plan</p>
              </div>
              <i className="ri-arrow-down-s-line text-gray-600 hidden md:block"></i>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium mt-1">
                    <i className="ri-vip-crown-line text-xs"></i>
                    {profile.plan} Active
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    to="/contractor-account/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-user-line text-lg"></i>
                    My Profile
                  </Link>
                  <Link
                    to="/contractor-dashboard-core"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-dashboard-line text-lg"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/contractor-account/billing"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-bank-card-line text-lg"></i>
                    Billing & Plans
                  </Link>
                  <Link
                    to="/contractor-account/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-settings-3-line text-lg"></i>
                    Settings
                  </Link>
                  <Link
                    to="/contractor-account/help"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-question-line text-lg"></i>
                    Help & Support
                  </Link>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={async () => { await signOut(); navigate('/login', { replace: true }); }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer w-full text-left"
                  >
                    <i className="ri-logout-box-line text-lg"></i>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

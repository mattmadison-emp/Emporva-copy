
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface ContractorNavProps {
  answeredQuestionsCount?: number;
}

export default function ContractorNav({ answeredQuestionsCount = 0 }: ContractorNavProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    ...(answeredQuestionsCount > 0 ? [
      { id: 10, text: `${answeredQuestionsCount} homeowner${answeredQuestionsCount > 1 ? 's' : ''} responded to your questions`, time: '15m ago', unread: true, type: 'qa' as const },
      { id: 11, text: 'Jennifer Martinez answered your question about crawlspace access', time: '20m ago', unread: true, type: 'qa' as const },
      { id: 12, text: 'Tom Bradley confirmed Feb 3 start date for roof replacement', time: '5h ago', unread: true, type: 'qa' as const },
    ] : []),
    { id: 1, text: 'New quote request from Sarah Johnson', time: '5m ago', unread: true, type: 'general' as const },
    { id: 2, text: 'Job "Kitchen Remodel" marked complete', time: '2h ago', unread: true, type: 'general' as const },
    { id: 3, text: 'Payment received: $2,450', time: '1d ago', unread: false, type: 'general' as const },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotifIcon = (type: string) => {
    if (type === 'qa') return 'ri-chat-check-line text-green-500';
    return 'ri-notification-3-line text-gray-400';
  };

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
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {answeredQuestionsCount > 0 && (
                  <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-question-answer-line text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {answeredQuestionsCount} Q&amp;A Response{answeredQuestionsCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Homeowners answered your pre-quote questions
                        </p>
                      </div>
                      <i className="ri-arrow-right-s-line text-green-600"></i>
                    </div>
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex items-start gap-3 ${
                        notif.unread ? 'bg-[#F9F9FB]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`${getNotifIcon(notif.type)} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0B1F33] leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {notif.text}
                        </p>
                        <p className="text-xs text-[#6B7C8F] mt-1">{notif.time}</p>
                      </div>
                      {notif.unread && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
              <img
                src="https://readdy.ai/api/search-image?query=professional%20contractor%20headshot%20portrait%20male%20wearing%20work%20shirt%20friendly%20smile%20clean%20background%20high%20quality%20professional%20photography&width=100&height=100&seq=contractor-profile-nav-001&orientation=squarish"
                alt="Mike Anderson"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900">Mike Anderson</p>
                <p className="text-xs text-gray-500">Premium Plan</p>
              </div>
              <i className="ri-arrow-down-s-line text-gray-600 hidden md:block"></i>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">mike.anderson@email.com</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-md text-xs font-medium mt-1">
                    <i className="ri-vip-crown-fill text-xs"></i>
                    Premium Active
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
                    to="/contractor-dashboard-premium"
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
                    Billing &amp; Plans
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
                    Help &amp; Support
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

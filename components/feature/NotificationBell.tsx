
import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'approval' | 'payment' | 'milestone' | 'change_order' | 'message' | 'material' | 'progress';
  title: string;
  description: string;
  time: string;
  read: boolean;
  jobId: number;
  jobTitle: string;
  actionBy: string;
  actionByRole: 'homeowner' | 'contractor' | 'system';
  icon: string;
  color: string;
}

const contractorNotifications: Notification[] = [
  {
    id: 'cn1',
    type: 'approval',
    title: 'Milestone Approved',
    description: 'Homeowner approved "Vapor Barrier Installation" — $1,485.00 released to your account.',
    time: '12 min ago',
    read: false,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'Homeowner',
    actionByRole: 'homeowner',
    icon: 'ri-check-double-line',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'cn2',
    type: 'change_order',
    title: 'Change Order Approved',
    description: 'Homeowner approved "Additional Insulation Coverage" (+$300.00). Budget updated.',
    time: '45 min ago',
    read: false,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'Homeowner',
    actionByRole: 'homeowner',
    icon: 'ri-file-edit-line',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'cn3',
    type: 'message',
    title: 'New Message',
    description: 'Homeowner asked about the dehumidifier outlet requirements.',
    time: '3 hours ago',
    read: true,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'Homeowner',
    actionByRole: 'homeowner',
    icon: 'ri-message-3-line',
    color: 'bg-[#00B8A9]/10 text-[#00B8A9]'
  },
  {
    id: 'cn4',
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment of $990.00 for "Initial Assessment & Planning" has been deposited.',
    time: '1 day ago',
    read: true,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'System',
    actionByRole: 'system',
    icon: 'ri-money-dollar-circle-line',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'cn5',
    type: 'milestone',
    title: 'Milestone Awaiting Approval',
    description: 'You submitted "Dehumidifier Setup & Calibration" for homeowner review.',
    time: '2 hours ago',
    read: false,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'You',
    actionByRole: 'contractor',
    icon: 'ri-time-line',
    color: 'bg-orange-100 text-orange-600'
  }
];

const homeownerNotifications: Notification[] = [
  {
    id: 'hn1',
    type: 'milestone',
    title: 'Milestone Submitted for Approval',
    description: 'Mike Thompson submitted "Dehumidifier Setup & Calibration" for your review. Payment of $990.00 pending.',
    time: '2 hours ago',
    read: false,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'Mike Thompson',
    actionByRole: 'contractor',
    icon: 'ri-notification-3-line',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'hn2',
    type: 'progress',
    title: 'Progress Photos Added',
    description: 'Mike Thompson uploaded 4 new progress photos for the vapor barrier installation.',
    time: '4 hours ago',
    read: false,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'Mike Thompson',
    actionByRole: 'contractor',
    icon: 'ri-camera-line',
    color: 'bg-[#00B8A9]/10 text-[#00B8A9]'
  },
  {
    id: 'hn3',
    type: 'material',
    title: 'Material Shipped',
    description: 'Spray Foam Insulation (12 cans) is now in transit. ETA: Jan 22.',
    time: '6 hours ago',
    read: true,
    jobId: 1,
    jobTitle: 'Crawlspace Moisture Remediation',
    actionBy: 'System',
    actionByRole: 'system',
    icon: 'ri-truck-line',
    color: 'bg-[#00B8A9]/10 text-[#00B8A9]'
  },
  {
    id: 'hn4',
    type: 'approval',
    title: 'Inspection Submitted',
    description: 'David Chen submitted "Roof Inspection & Prep" for your approval. Payment of $800.00 pending.',
    time: '3 hours ago',
    read: false,
    jobId: 3,
    jobTitle: 'Roof Shingle Replacement',
    actionBy: 'David Chen',
    actionByRole: 'contractor',
    icon: 'ri-shield-check-line',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'hn5',
    type: 'change_order',
    title: 'New Change Order',
    description: 'Sarah Martinez submitted a change order for additional ductwork cleaning (+$185.00).',
    time: '1 day ago',
    read: true,
    jobId: 2,
    jobTitle: 'HVAC System Diagnostic',
    actionBy: 'Sarah Martinez',
    actionByRole: 'contractor',
    icon: 'ri-file-edit-line',
    color: 'bg-[#D4B483]/20 text-[#D4B483]'
  }
];

interface NotificationBellProps {
  role: 'homeowner' | 'contractor';
  theme?: 'light' | 'dark';
}

export default function NotificationBell({ role, theme = 'dark' }: NotificationBellProps) {
  const notifications = role === 'contractor' ? contractorNotifications : homeownerNotifications;
  const [items, setItems] = useState<Notification[]>(notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = items.filter(n => !n.read).length;
  const filtered = filter === 'all' ? items : items.filter(n => !n.read);

  const markAsRead = useCallback((id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Simulate a new notification arriving
  const [newNotif, setNewNotif] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (role === 'contractor') {
        setItems(prev => [{
          id: 'cn_live',
          type: 'approval',
          title: 'Inspection Approved',
          description: 'Homeowner approved "Roof Inspection & Prep" for Roof Shingle Replacement. $800.00 released.',
          time: 'Just now',
          read: false,
          jobId: 3,
          jobTitle: 'Roof Shingle Replacement',
          actionBy: 'Homeowner',
          actionByRole: 'homeowner',
          icon: 'ri-check-double-line',
          color: 'bg-green-100 text-green-600'
        }, ...prev]);
        setNewNotif(true);
        setTimeout(() => setNewNotif(false), 3000);
      } else {
        setItems(prev => [{
          id: 'hn_live',
          type: 'progress',
          title: 'Task Completed',
          description: 'Mike Thompson marked "Position dehumidifier unit" as complete.',
          time: 'Just now',
          read: false,
          jobId: 1,
          jobTitle: 'Crawlspace Moisture Remediation',
          actionBy: 'Mike Thompson',
          actionByRole: 'contractor',
          icon: 'ri-checkbox-circle-line',
          color: 'bg-green-100 text-green-600'
        }, ...prev]);
        setNewNotif(true);
        setTimeout(() => setNewNotif(false), 3000);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [role]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-panel]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0B1F33]';
  const hoverColor = theme === 'dark' ? 'hover:text-[#D4B483]' : 'hover:text-[#00B8A9]';

  return (
    <div className="relative" data-notification-panel>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 ${textColor} ${hoverColor} transition-colors cursor-pointer`}
      >
        <i className={`ri-notification-3-line text-xl ${newNotif ? 'animate-bounce' : ''}`}></i>
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] ${
            role === 'contractor' ? 'bg-[#D4B483]' : 'bg-red-500'
          } text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${
            newNotif ? 'animate-pulse' : ''
          }`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#F9F9FB] rounded-lg p-0.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    filter === 'all' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    filter === 'unread' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#00B8A9] font-semibold hover:text-[#00a89a] cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-notification-off-line text-[#6B7C8F] text-xl"></i>
                </div>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              filtered.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-[#F9F9FB] ${
                    !notif.read ? 'bg-[#00B8A9]/3' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                      <i className={`${notif.icon} text-base`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-[#0B1F33]' : 'font-semibold text-[#6B7C8F]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-[#00B8A9] rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7C8F] mt-0.5 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {notif.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-[#6B7C8F] bg-[#F9F9FB] px-1.5 py-0.5 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {notif.jobTitle}
                        </span>
                        <span className="text-[10px] text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-[#F9F9FB]">
            <button className="w-full text-center text-xs font-semibold text-[#00B8A9] hover:text-[#00a89a] cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Live Toast */}
      {newNotif && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 flex items-start gap-3 max-w-sm animate-slide-up">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            role === 'contractor' ? 'bg-green-100' : 'bg-green-100'
          }`}>
            <i className={`${role === 'contractor' ? 'ri-check-double-line text-green-600' : 'ri-checkbox-circle-line text-green-600'} text-base`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {role === 'contractor' ? 'Inspection Approved' : 'Task Completed'}
            </p>
            <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              {role === 'contractor'
                ? 'Homeowner approved "Roof Inspection & Prep" — $800.00 released.'
                : 'Mike Thompson marked a task as complete.'}
            </p>
          </div>
          <span className="text-[10px] text-[#00B8A9] font-semibold whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Just now</span>
        </div>
      )}
    </div>
  );
}

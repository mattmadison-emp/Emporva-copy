
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: string;
  role: 'Homeowner' | 'Contractor' | 'System' | 'Trade';
  message: string;
  time: string;
  date: string;
  hasAttachment: boolean;
  attachmentCount?: number;
  attachments?: Array<{ name: string; type: string; size: string }>;
  isRead: boolean;
}

interface JobMessagingProps {
  jobId: number;
  jobTitle: string;
  homeowner: string;
  homeownerEmail: string;
  isMultiTrade?: boolean;
}

const allMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: 'Jennifer Martinez',
      role: 'Homeowner',
      message: 'Great progress! Quick question - will the dehumidifier need a dedicated outlet?',
      time: '10:45 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: false
    },
    {
      id: 2,
      sender: 'You',
      role: 'Contractor',
      message: 'Yes, we will use the existing outlet near the sump pump. It is on a dedicated 20A circuit, which is perfect for this unit.',
      time: '10:02 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 3,
      sender: 'You',
      role: 'Contractor',
      message: 'Vapor barrier installation complete. Added photos to the job room. Dehumidifier arrives tomorrow morning.',
      time: '8:30 AM',
      date: 'Today',
      hasAttachment: true,
      attachmentCount: 4,
      attachments: [
        { name: 'vapor_barrier_north.jpg', type: 'image', size: '2.4 MB' },
        { name: 'vapor_barrier_south.jpg', type: 'image', size: '2.1 MB' },
        { name: 'seam_detail.jpg', type: 'image', size: '1.8 MB' },
        { name: 'drainage_connection.jpg', type: 'image', size: '3.0 MB' }
      ],
      isRead: true
    },
    {
      id: 4,
      sender: 'Emporva System',
      role: 'System',
      message: 'Milestone approved by homeowner: Vapor Barrier Installation. Payment released: $1,485',
      time: '7:15 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 5,
      sender: 'Jennifer Martinez',
      role: 'Homeowner',
      message: 'The photos look great! I can see the vapor barrier is really well sealed. Approving the milestone now.',
      time: '6:50 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 6,
      sender: 'You',
      role: 'Contractor',
      message: 'Good morning Jennifer! Just wanted to confirm we are on schedule. The drainage matting is fully installed and we are starting the vapor barrier today. I will send photos once complete.',
      time: '4:30 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 7,
      sender: 'Jennifer Martinez',
      role: 'Homeowner',
      message: 'Sounds perfect. Will anyone need access to the house or just the crawlspace entrance on the side?',
      time: '3:15 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 8,
      sender: 'You',
      role: 'Contractor',
      message: 'Just the crawlspace entrance on the side. No need to be home - we have the access code you provided.',
      time: '3:22 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 9,
      sender: 'Emporva System',
      role: 'System',
      message: 'Milestone approved by homeowner: Initial Assessment & Planning. Payment released: $990',
      time: '11:00 AM',
      date: 'Jan 16',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 10,
      sender: 'You',
      role: 'Contractor',
      message: 'Hi Jennifer, assessment is complete. Found moderate moisture levels (68% RH) with some standing water near the north wall. Attached the full report with photos and our remediation plan. The scope we discussed covers everything needed.',
      time: '9:45 AM',
      date: 'Jan 16',
      hasAttachment: true,
      attachmentCount: 2,
      attachments: [
        { name: 'moisture_assessment_report.pdf', type: 'document', size: '1.2 MB' },
        { name: 'remediation_plan.pdf', type: 'document', size: '850 KB' }
      ],
      isRead: true
    }
  ],
  2: [
    {
      id: 1,
      sender: 'Robert Chen',
      role: 'Homeowner',
      message: 'Looking forward to the diagnostic on the 22nd. The system has been making a rattling noise when the heat kicks on.',
      time: '2:30 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 2,
      sender: 'You',
      role: 'Contractor',
      message: 'Thanks Robert. That rattling could be a loose blower wheel or a failing inducer motor. We will diagnose it thoroughly. Can you confirm the system model? Should be on a label on the unit.',
      time: '3:10 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 3,
      sender: 'Robert Chen',
      role: 'Homeowner',
      message: 'It is a Carrier 59TP6B. About 8 years old. I attached a photo of the label.',
      time: '3:45 PM',
      date: 'Yesterday',
      hasAttachment: true,
      attachmentCount: 1,
      attachments: [
        { name: 'hvac_label.jpg', type: 'image', size: '1.5 MB' }
      ],
      isRead: true
    },
    {
      id: 4,
      sender: 'You',
      role: 'Contractor',
      message: 'Perfect, that helps a lot. We will bring the right parts just in case. See you on the 22nd at 9 AM.',
      time: '4:00 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 5,
      sender: 'Emporva System',
      role: 'System',
      message: 'Job scheduled: HVAC System Diagnostic & Repair. Start date: Jan 22, 2025 at 9:00 AM.',
      time: '10:00 AM',
      date: 'Jan 18',
      hasAttachment: false,
      isRead: true
    }
  ],
  3: [
    {
      id: 1,
      sender: 'Sarah Thompson',
      role: 'Homeowner',
      message: 'Hi! I noticed the electrical team is running a bit behind. Will that affect the drywall schedule?',
      time: '11:30 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: false
    },
    {
      id: 2,
      sender: 'Sarah Thompson',
      role: 'Homeowner',
      message: 'Also, I wanted to confirm - the cabinet color we picked was Shaker White, correct? I want to make sure before they ship.',
      time: '11:32 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: false
    },
    {
      id: 3,
      sender: 'BrightSpark Electric',
      role: 'Trade',
      message: 'Update: Under-cabinet lighting is in transit, arriving tomorrow. We should be wrapped up by Jan 27 as planned.',
      time: '9:15 AM',
      date: 'Today',
      hasAttachment: false,
      isRead: false
    },
    {
      id: 4,
      sender: 'You',
      role: 'Contractor',
      message: 'Good news - our plumbing work is fully complete and passed inspection. All fixtures tested and working perfectly. Attached the inspection report.',
      time: '5:00 PM',
      date: 'Yesterday',
      hasAttachment: true,
      attachmentCount: 1,
      attachments: [
        { name: 'plumbing_inspection_pass.pdf', type: 'document', size: '920 KB' }
      ],
      isRead: true
    },
    {
      id: 5,
      sender: 'Sarah Thompson',
      role: 'Homeowner',
      message: 'Wonderful! The new sink fixtures look amazing. Thank you for the clean work!',
      time: '5:30 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 6,
      sender: 'Emporva System',
      role: 'System',
      message: 'Trade milestone complete: Plumbing phase finished. Payment of $3,200 released to ProFlow Plumbing.',
      time: '5:15 PM',
      date: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 7,
      sender: 'Elite Cabinetry',
      role: 'Trade',
      message: 'Cabinets are fabricated and ready. Shipping scheduled for Jan 30. We are on track for Feb 1 install.',
      time: '2:00 PM',
      date: 'Yesterday',
      hasAttachment: true,
      attachmentCount: 3,
      attachments: [
        { name: 'cabinet_preview_1.jpg', type: 'image', size: '3.2 MB' },
        { name: 'cabinet_preview_2.jpg', type: 'image', size: '2.8 MB' },
        { name: 'shipping_confirmation.pdf', type: 'document', size: '450 KB' }
      ],
      isRead: true
    }
  ]
};

const quickReplies = [
  'On my way to the job site now',
  'Work is complete for today, will resume tomorrow',
  'I will send photos shortly',
  'Can we schedule a quick call to discuss?',
  'Milestone is ready for your review',
  'Materials have arrived and we are ready to proceed'
];

export default function JobMessaging({ jobId, jobTitle: _jobTitle, homeowner, homeownerEmail, isMultiTrade }: JobMessagingProps) {
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>(allMessages[jobId] || []);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'Homeowner' | 'Contractor' | 'System' | 'Trade'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedAttachment, setExpandedAttachment] = useState<number | null>(null);
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setChatMessages(allMessages[jobId] || []);
    setFilterRole('all');
    setSearchQuery('');
    setShowSearch(false);
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const newMsg: Message = {
      id: chatMessages.length + 100,
      sender: 'You',
      role: 'Contractor',
      message: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      hasAttachment: false,
      isRead: true
    };
    setChatMessages([newMsg, ...chatMessages]);
    setMessageText('');
    setShowQuickReplies(false);
    setSentConfirmation(true);
    setTimeout(() => setSentConfirmation(false), 2500);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => {
    setMessageText(text);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  const filteredMessages = chatMessages.filter(msg => {
    const roleMatch = filterRole === 'all' || msg.role === filterRole;
    const searchMatch = !searchQuery || msg.message.toLowerCase().includes(searchQuery.toLowerCase()) || msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch && searchMatch;
  });

  const groupedMessages: Record<string, Message[]> = {};
  filteredMessages.forEach(msg => {
    if (!groupedMessages[msg.date]) groupedMessages[msg.date] = [];
    groupedMessages[msg.date].push(msg);
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Homeowner': return 'ri-home-heart-line';
      case 'Contractor': return 'ri-tools-line';
      case 'System': return 'ri-robot-line';
      case 'Trade': return 'ri-team-line';
      default: return 'ri-user-line';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Homeowner': return 'bg-[#00B8A9]';
      case 'Contractor': return 'bg-[#0B1F33]';
      case 'System': return 'bg-[#D4B483]';
      case 'Trade': return 'bg-[#6B7C8F]';
      default: return 'bg-gray-400';
    }
  };

  const getAttachIcon = (type: string) => {
    switch (type) {
      case 'image': return 'ri-image-line';
      case 'document': return 'ri-file-text-line';
      default: return 'ri-attachment-line';
    }
  };

  const unreadCount = chatMessages.filter(m => !m.isRead && m.role !== 'Contractor').length;

  return (
    <div className="space-y-4">
      {/* Messaging Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00B8A9] rounded-full flex items-center justify-center">
            <i className="ri-home-heart-line text-white text-lg"></i>
          </div>
          <div>
            <h4 className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {homeowner}
            </h4>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {homeownerEmail}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${showSearch ? 'bg-[#00B8A9] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
          >
            <i className="ri-search-line text-lg"></i>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200 transition-all cursor-pointer">
            <i className="ri-phone-line text-lg"></i>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200 transition-all cursor-pointer">
            <i className="ri-video-chat-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F]"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9FB] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all' as const, label: 'All', count: chatMessages.length },
          { id: 'Homeowner' as const, label: 'Homeowner', count: chatMessages.filter(m => m.role === 'Homeowner').length },
          { id: 'Contractor' as const, label: 'You', count: chatMessages.filter(m => m.role === 'Contractor').length },
          ...(isMultiTrade ? [{ id: 'Trade' as const, label: 'Trades', count: chatMessages.filter(m => m.role === 'Trade').length }] : []),
          { id: 'System' as const, label: 'System', count: chatMessages.filter(m => m.role === 'System').length }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterRole(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              filterRole === f.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {f.label}
            <span className="ml-1 opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="bg-[#F9F9FB] rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-[420px] overflow-y-auto p-4 space-y-1 flex flex-col-reverse">
          <div ref={messagesEndRef} />
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-[#6B7C8F] font-semibold px-3 py-1 bg-white rounded-full border border-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {date}
                </span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {msgs.map((msg) => (
                <div key={msg.id}>
                  {/* System Messages */}
                  {msg.role === 'System' ? (
                    <div className="flex justify-center my-2">
                      <div className="bg-[#D4B483]/15 border border-[#D4B483]/30 rounded-lg px-4 py-2.5 max-w-md text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <i className="ri-robot-line text-[#D4B483] text-sm"></i>
                          <span className="text-xs font-bold text-[#D4B483]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Emporva System</span>
                        </div>
                        <p className="text-xs text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {msg.message}
                        </p>
                        <p className="text-xs text-[#6B7C8F] mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex gap-3 ${msg.role === 'Contractor' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(msg.role)}`}>
                        <i className={`${getRoleIcon(msg.role)} text-white text-sm`}></i>
                      </div>

                      {/* Message Bubble */}
                      <div className={`max-w-[75%] ${msg.role === 'Contractor' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#2D2A74]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {msg.sender}
                          </span>
                          {msg.role === 'Trade' && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#6B7C8F]/10 text-[#6B7C8F] rounded font-semibold">
                              Trade
                            </span>
                          )}
                          <span className="text-xs text-[#6B7C8F]">{msg.time}</span>
                          {!msg.isRead && msg.role !== 'Contractor' && (
                            <span className="w-2 h-2 bg-[#00B8A9] rounded-full"></span>
                          )}
                        </div>
                        <div className={`rounded-xl px-4 py-3 ${
                          msg.role === 'Contractor'
                            ? 'bg-[#0B1F33] text-white rounded-tr-sm'
                            : msg.role === 'Trade'
                            ? 'bg-white border border-[#6B7C8F]/20 text-[#333645] rounded-tl-sm'
                            : 'bg-white border border-gray-200 text-[#333645] rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {msg.message}
                          </p>
                        </div>

                        {/* Attachments */}
                        {msg.hasAttachment && msg.attachments && (
                          <div className="mt-2 space-y-1.5">
                            <button
                              onClick={() => setExpandedAttachment(expandedAttachment === msg.id ? null : msg.id)}
                              className="flex items-center gap-1.5 text-xs text-[#00B8A9] font-semibold cursor-pointer hover:underline"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <i className="ri-attachment-line"></i>
                              {msg.attachmentCount} attachment{(msg.attachmentCount || 0) > 1 ? 's' : ''}
                              <i className={`ri-arrow-${expandedAttachment === msg.id ? 'up' : 'down'}-s-line`}></i>
                            </button>
                            {expandedAttachment === msg.id && (
                              <div className="space-y-1.5 pl-1">
                                {msg.attachments.map((att, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-[#00B8A9]/50 transition-all cursor-pointer">
                                    <div className={`w-7 h-7 rounded flex items-center justify-center ${att.type === 'image' ? 'bg-[#00B8A9]/10' : 'bg-[#D4B483]/10'}`}>
                                      <i className={`${getAttachIcon(att.type)} text-sm ${att.type === 'image' ? 'text-[#00B8A9]' : 'text-[#D4B483]'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-[#2D2A74] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{att.name}</p>
                                      <p className="text-xs text-[#6B7C8F]">{att.size}</p>
                                    </div>
                                    <i className="ri-download-line text-[#6B7C8F] text-sm hover:text-[#00B8A9] cursor-pointer"></i>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <i className="ri-chat-3-line text-5xl text-[#6B7C8F]/30 mb-3"></i>
              <p className="text-sm text-[#6B7C8F] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {searchQuery ? 'No messages match your search' : 'No messages in this filter'}
              </p>
            </div>
          )}
        </div>

        {/* Sent Confirmation */}
        {sentConfirmation && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2">
            <i className="ri-check-double-line text-green-600"></i>
            <span className="text-xs text-green-700 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Message sent successfully
            </span>
          </div>
        )}

        {/* Quick Replies */}
        {showQuickReplies && (
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-flashlight-line text-[#D4B483] text-sm"></i>
              <span className="text-xs font-bold text-[#2D2A74]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Replies</span>
              <button onClick={() => setShowQuickReplies(false)} className="ml-auto text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer">
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(qr)}
                  className="px-3 py-1.5 bg-[#F9F9FB] border border-gray-200 rounded-full text-xs text-[#333645] hover:bg-[#00B8A9]/10 hover:border-[#00B8A9]/30 transition-all cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            {/* Attach Button */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200 transition-all cursor-pointer flex-shrink-0"
              >
                <i className="ri-add-line text-xl"></i>
              </button>
              {showAttachMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)}></div>
                  <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-20">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left" onClick={() => setShowAttachMenu(false)}>
                      <i className="ri-image-line text-[#00B8A9]"></i>
                      <span className="text-sm text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Photo</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left" onClick={() => setShowAttachMenu(false)}>
                      <i className="ri-file-text-line text-[#D4B483]"></i>
                      <span className="text-sm text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Document</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left" onClick={() => setShowAttachMenu(false)}>
                      <i className="ri-camera-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Take Photo</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left" onClick={() => setShowAttachMenu(false)}>
                      <i className="ri-bill-line text-[#0B1F33]"></i>
                      <span className="text-sm text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick Reply Toggle */}
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                showQuickReplies ? 'bg-[#D4B483] text-[#0B1F33]' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
              }`}
            >
              <i className="ri-flashlight-line text-xl"></i>
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${homeowner}...`}
                rows={1}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-[#F9F9FB] border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                style={{ fontFamily: 'Inter, sans-serif', minHeight: '42px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                messageText.trim()
                  ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Press Enter to send, Shift+Enter for new line
            </p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {messageText.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Encryption Notice */}
      <div className="flex items-center justify-center gap-2 py-2">
        <i className="ri-lock-line text-[#6B7C8F] text-xs"></i>
        <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Messages are encrypted and synced with the homeowner\u0027s dashboard in real-time
        </span>
      </div>
    </div>
  );
}

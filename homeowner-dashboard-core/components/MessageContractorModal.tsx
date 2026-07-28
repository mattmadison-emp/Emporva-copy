
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: string;
  role: 'Homeowner' | 'Contractor' | 'System';
  message: string;
  time: string;
  date: string;
  hasAttachment: boolean;
  attachmentCount?: number;
  attachments?: Array<{ name: string; type: string; size: string }>;
}

interface MessageContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  contractor: string;
  contractorAvatar: string;
}

const allMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 1,
      sender: 'You',
      role: 'Homeowner',
      message: 'Great progress! Quick question - will the dehumidifier need a dedicated outlet?',
      time: '10:45 AM',
      date: 'Today',
      hasAttachment: false,
    },
    {
      id: 2,
      sender: 'Elite Home Builders',
      role: 'Contractor',
      message: 'Yes, we will use the existing outlet near the sump pump. It is on a dedicated 20A circuit, which is perfect for this unit.',
      time: '10:02 AM',
      date: 'Today',
      hasAttachment: false,
    },
    {
      id: 3,
      sender: 'Elite Home Builders',
      role: 'Contractor',
      message: 'Cabinet installation is going well. We finished the upper cabinets today and will start on the lowers tomorrow morning. Attached some progress photos.',
      time: '8:30 AM',
      date: 'Today',
      hasAttachment: true,
      attachmentCount: 3,
      attachments: [
        { name: 'upper_cabinets_done.jpg', type: 'image', size: '2.4 MB' },
        { name: 'cabinet_alignment.jpg', type: 'image', size: '2.1 MB' },
        { name: 'hardware_installed.jpg', type: 'image', size: '1.8 MB' },
      ],
    },
    {
      id: 4,
      sender: 'Emporva System',
      role: 'System',
      message: 'Milestone approved: Drywall Installation. Payment released: $4,500',
      time: '7:15 AM',
      date: 'Today',
      hasAttachment: false,
    },
    {
      id: 5,
      sender: 'You',
      role: 'Homeowner',
      message: 'The drywall looks great! Approving the milestone now. When do you expect to start on the cabinets?',
      time: '6:50 AM',
      date: 'Today',
      hasAttachment: false,
    },
    {
      id: 6,
      sender: 'Elite Home Builders',
      role: 'Contractor',
      message: 'Good morning! Just wanted to confirm we are on schedule. The electrical and plumbing rough-in passed inspection. We are starting drywall today.',
      time: '4:30 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 7,
      sender: 'You',
      role: 'Homeowner',
      message: 'Sounds perfect. Will anyone need access to the house or just the kitchen area?',
      time: '3:15 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 8,
      sender: 'Elite Home Builders',
      role: 'Contractor',
      message: 'Just the kitchen area. We have the access code you provided. No need to be home.',
      time: '3:22 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 9,
      sender: 'Emporva System',
      role: 'System',
      message: 'Milestone approved: Demolition Complete. Payment released: $6,750',
      time: '11:00 AM',
      date: 'Jan 20',
      hasAttachment: false,
    },
    {
      id: 10,
      sender: 'Elite Home Builders',
      role: 'Contractor',
      message: 'Hi! Demolition is complete. Everything went smoothly — no surprises behind the walls. Attached the inspection photos and our updated timeline.',
      time: '9:45 AM',
      date: 'Jan 20',
      hasAttachment: true,
      attachmentCount: 2,
      attachments: [
        { name: 'demolition_complete.pdf', type: 'document', size: '1.2 MB' },
        { name: 'updated_timeline.pdf', type: 'document', size: '850 KB' },
      ],
    },
  ],
  '2': [
    {
      id: 1,
      sender: 'You',
      role: 'Homeowner',
      message: 'Hi! I wanted to check on the tile selection. Did you receive the samples I picked out?',
      time: '2:30 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 2,
      sender: 'Precision Plumbing & Tile',
      role: 'Contractor',
      message: 'Yes, we got them! The white subway tile with the gray grout will look fantastic. Great choice. We will start tile work once the waterproofing cures — should be ready by the 18th.',
      time: '3:10 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 3,
      sender: 'You',
      role: 'Homeowner',
      message: 'Perfect! Also, is there a second bathroom I can use during the plumbing phase? You mentioned shutting off water for 2-3 days.',
      time: '3:45 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 4,
      sender: 'Precision Plumbing & Tile',
      role: 'Contractor',
      message: 'Yes, the half bath on the first floor will remain fully functional throughout the remodel. Only the master bath water lines will be affected.',
      time: '4:00 PM',
      date: 'Yesterday',
      hasAttachment: false,
    },
    {
      id: 5,
      sender: 'Emporva System',
      role: 'System',
      message: 'Job milestone: Plumbing Rough-In Complete. Awaiting your approval.',
      time: '10:00 AM',
      date: 'Feb 10',
      hasAttachment: false,
    },
    {
      id: 6,
      sender: 'Precision Plumbing & Tile',
      role: 'Contractor',
      message: 'Plumbing rough-in is done and passed inspection. All new supply lines and drain connections are in place. Attached the inspection report for your records.',
      time: '9:30 AM',
      date: 'Feb 10',
      hasAttachment: true,
      attachmentCount: 1,
      attachments: [
        { name: 'plumbing_inspection_report.pdf', type: 'document', size: '920 KB' },
      ],
    },
  ],
};

const quickReplies = [
  'Thanks for the update!',
  'When will you be on-site next?',
  'Can you send photos of the progress?',
  'I have a question about the timeline',
  'Looks great, please proceed',
  'Can we schedule a quick call?',
];

export default function MessageContractorModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  contractor,
  contractorAvatar,
}: MessageContractorModalProps) {
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'Homeowner' | 'Contractor' | 'System'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedAttachment, setExpandedAttachment] = useState<number | null>(null);
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setChatMessages(allMessages[jobId] || []);
      setFilterRole('all');
      setSearchQuery('');
      setShowSearch(false);
      setMessageText('');
      setShowQuickReplies(false);
    }
  }, [isOpen, jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const newMsg: Message = {
      id: chatMessages.length + 100,
      sender: 'You',
      role: 'Homeowner',
      message: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      hasAttachment: false,
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

  const filteredMessages = chatMessages.filter((msg) => {
    const roleMatch = filterRole === 'all' || msg.role === filterRole;
    const searchMatch =
      !searchQuery ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch && searchMatch;
  });

  const groupedMessages: Record<string, Message[]> = {};
  filteredMessages.forEach((msg) => {
    if (!groupedMessages[msg.date]) groupedMessages[msg.date] = [];
    groupedMessages[msg.date].push(msg);
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Homeowner':
        return 'bg-[#14B8A6]';
      case 'Contractor':
        return 'bg-[#0B1F33]';
      case 'System':
        return 'bg-[#D4B483]';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Homeowner':
        return 'ri-home-heart-line';
      case 'Contractor':
        return 'ri-tools-line';
      case 'System':
        return 'ri-robot-line';
      default:
        return 'ri-user-line';
    }
  };

  const getAttachIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'ri-image-line';
      case 'document':
        return 'ri-file-text-line';
      default:
        return 'ri-attachment-line';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl max-w-2xl w-full shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={contractorAvatar}
              alt={contractor}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-[#0B1F33] text-sm">{contractor}</h3>
              <p className="text-xs text-[#6B7C8F]">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                showSearch
                  ? 'bg-[#14B8A6] text-white'
                  : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
              }`}
            >
              <i className="ri-search-line text-lg"></i>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200 transition-all cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-6 pt-3 flex-shrink-0">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F]"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9FB] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
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
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-6 pt-3 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
          {[
            { id: 'all' as const, label: 'All', count: chatMessages.length },
            {
              id: 'Homeowner' as const,
              label: 'You',
              count: chatMessages.filter((m) => m.role === 'Homeowner').length,
            },
            {
              id: 'Contractor' as const,
              label: 'Contractor',
              count: chatMessages.filter((m) => m.role === 'Contractor').length,
            },
            {
              id: 'System' as const,
              label: 'System',
              count: chatMessages.filter((m) => m.role === 'System').length,
            },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRole(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterRole === f.id
                  ? 'bg-[#0B1F33] text-white'
                  : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-70">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 flex flex-col-reverse bg-[#F9F9FB]">
          <div ref={messagesEndRef} />
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-[#6B7C8F] font-semibold px-3 py-1 bg-white rounded-full border border-gray-200">
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
                          <span className="text-xs font-bold text-[#D4B483]">
                            Emporva System
                          </span>
                        </div>
                        <p className="text-xs text-[#333645] leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-xs text-[#6B7C8F] mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex gap-3 ${
                        msg.role === 'Homeowner' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(
                          msg.role
                        )}`}
                      >
                        <i
                          className={`${getRoleIcon(msg.role)} text-white text-sm`}
                        ></i>
                      </div>

                      {/* Message Bubble */}
                      <div className="max-w-[75%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#0B1F33]">
                            {msg.sender}
                          </span>
                          <span className="text-xs text-[#6B7C8F]">{msg.time}</span>
                        </div>
                        <div
                          className={`rounded-xl px-4 py-3 ${
                            msg.role === 'Homeowner'
                              ? 'bg-[#14B8A6] text-white rounded-tr-sm'
                              : 'bg-white border border-gray-200 text-[#333645] rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        </div>

                        {/* Attachments */}
                        {msg.hasAttachment && msg.attachments && (
                          <div className="mt-2 space-y-1.5">
                            <button
                              onClick={() =>
                                setExpandedAttachment(
                                  expandedAttachment === msg.id ? null : msg.id
                                )
                              }
                              className="flex items-center gap-1.5 text-xs text-[#14B8A6] font-semibold cursor-pointer hover:underline"
                            >
                              <i className="ri-attachment-line"></i>
                              {msg.attachmentCount} attachment
                              {(msg.attachmentCount || 0) > 1 ? 's' : ''}
                              <i
                                className={`ri-arrow-${
                                  expandedAttachment === msg.id ? 'up' : 'down'
                                }-s-line`}
                              ></i>
                            </button>
                            {expandedAttachment === msg.id && (
                              <div className="space-y-1.5 pl-1">
                                {msg.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-[#14B8A6]/50 transition-all cursor-pointer"
                                  >
                                    <div
                                      className={`w-7 h-7 rounded flex items-center justify-center ${
                                        att.type === 'image'
                                          ? 'bg-[#14B8A6]/10'
                                          : 'bg-[#D4B483]/10'
                                      }`}
                                    >
                                      <i
                                        className={`${getAttachIcon(att.type)} text-sm ${
                                          att.type === 'image'
                                            ? 'text-[#14B8A6]'
                                            : 'text-[#D4B483]'
                                        }`}
                                      ></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-[#0B1F33] truncate">
                                        {att.name}
                                      </p>
                                      <p className="text-xs text-[#6B7C8F]">{att.size}</p>
                                    </div>
                                    <i className="ri-download-line text-[#6B7C8F] text-sm hover:text-[#14B8A6] cursor-pointer"></i>
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
              <p className="text-sm text-[#6B7C8F] font-semibold">
                {searchQuery
                  ? 'No messages match your search'
                  : 'No messages in this filter'}
              </p>
            </div>
          )}
        </div>

        {/* Sent Confirmation */}
        {sentConfirmation && (
          <div className="px-6 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2 flex-shrink-0">
            <i className="ri-check-double-line text-green-600"></i>
            <span className="text-xs text-green-700 font-semibold">
              Message sent — your contractor will be notified
            </span>
          </div>
        )}

        {/* Quick Replies */}
        {showQuickReplies && (
          <div className="px-6 py-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-flashlight-line text-[#D4B483] text-sm"></i>
              <span className="text-xs font-bold text-[#0B1F33]">Quick Replies</span>
              <button
                onClick={() => setShowQuickReplies(false)}
                className="ml-auto text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(qr)}
                  className="px-3 py-1.5 bg-[#F9F9FB] border border-gray-200 rounded-full text-xs text-[#333645] hover:bg-[#14B8A6]/10 hover:border-[#14B8A6]/30 transition-all cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAttachMenu(false)}
                  ></div>
                  <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-20">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left"
                      onClick={() => setShowAttachMenu(false)}
                    >
                      <i className="ri-image-line text-[#14B8A6]"></i>
                      <span className="text-sm text-[#333645] font-medium">Photo</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left"
                      onClick={() => setShowAttachMenu(false)}
                    >
                      <i className="ri-file-text-line text-[#D4B483]"></i>
                      <span className="text-sm text-[#333645] font-medium">Document</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F9FB] transition-all cursor-pointer text-left"
                      onClick={() => setShowAttachMenu(false)}
                    >
                      <i className="ri-camera-line text-[#6B7C8F]"></i>
                      <span className="text-sm text-[#333645] font-medium">Take Photo</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick Reply Toggle */}
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                showQuickReplies
                  ? 'bg-[#D4B483] text-[#0B1F33]'
                  : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
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
                  if (e.target.value.length <= 500) {
                    setMessageText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + 'px';
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${contractor}...`}
                rows={1}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-[#F9F9FB] border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                style={{ minHeight: '42px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                messageText.trim()
                  ? 'bg-[#14B8A6] text-white hover:bg-[#0ea89a] shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B7C8F]">
              Press Enter to send, Shift+Enter for new line
            </p>
            <p className="text-xs text-[#6B7C8F]">{messageText.length}/500</p>
          </div>
        </div>

        {/* Encryption Notice */}
        <div className="flex items-center justify-center gap-2 py-2 border-t border-gray-100 flex-shrink-0">
          <i className="ri-lock-line text-[#6B7C8F] text-xs"></i>
          <span className="text-xs text-[#6B7C8F]">
            Messages are encrypted and synced with the contractor&apos;s dashboard
          </span>
        </div>
      </div>
    </div>
  );
}

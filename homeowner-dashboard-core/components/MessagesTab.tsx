import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type {
  Conversation,
  Message,
  MessageAttachment,
} from '../../../types/messaging';

// ============================================================
// Derived UI types (built from joined queries)
// ============================================================

interface ThreadItem {
  id: string;
  title: string | null;
  type: 'direct' | 'group';
  job_id: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  participant_name: string;
  participant_initials: string;
  participant_avatar: string | null;
}

interface MessageItem {
  id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  created_at: string;
  sender_name: string;
  sender_initials: string;
  sender_avatar: string | null;
  is_own: boolean;
  attachments: MessageAttachment[];
}

// ============================================================
// Component
// ============================================================

export default function MessagesTab() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ----------------------------------------------------------
  // Fetch conversation threads
  // ----------------------------------------------------------
  const fetchThreads = useCallback(async () => {
    if (!user) return;

    // Get all conversations the user is part of
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map(p => p.conversation_id);
    const readMap = Object.fromEntries(participations.map(p => [p.conversation_id, p.last_read_at]));

    // Fetch conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (!conversations || conversations.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    // Build thread items
    const threadItems: ThreadItem[] = [];

    for (const conv of conversations as Conversation[]) {
      // Get the other participant(s) for display name
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id)
        .neq('user_id', user.id);

      let participantName = conv.title || 'Conversation';
      let participantInitials = '?';
      let participantAvatar: string | null = null;

      if (participants && participants.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', participants[0].user_id)
          .single();

        if (profile) {
          participantName = conv.title || `${profile.first_name} ${profile.last_name}`;
          participantInitials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
          participantAvatar = profile.avatar_url;

          if (conv.type === 'group' && participants.length > 1 && !conv.title) {
            participantName = `${profile.first_name} & ${participants.length} others`;
          }
        }
      }

      // Get last message
      const { data: lastMessages } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMsg = lastMessages?.[0] || null;

      // Count unread messages
      const lastReadAt = readMap[conv.id];
      let unreadCount = 0;
      if (lastReadAt) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .gt('created_at', lastReadAt);
        unreadCount = count || 0;
      }

      threadItems.push({
        id: conv.id,
        title: conv.title,
        type: conv.type as 'direct' | 'group',
        job_id: conv.job_id,
        last_message: lastMsg?.content || null,
        last_message_time: lastMsg?.created_at || null,
        unread_count: unreadCount,
        participant_name: participantName,
        participant_initials: participantInitials,
        participant_avatar: participantAvatar,
      });
    }

    setThreads(threadItems);
    setLoading(false);
  }, [user]);

  // ----------------------------------------------------------
  // Fetch messages for selected thread
  // ----------------------------------------------------------
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, content, message_type, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
      setMessages([]);
      return;
    }

    // Get unique sender IDs and fetch profiles
    const senderIds = [...new Set(data.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', senderIds);

    const profileMap = Object.fromEntries(
      (profiles || []).map(p => [p.id, p])
    );

    // Fetch attachments for all messages
    const messageIds = data.map(m => m.id);
    const { data: attachments } = await supabase
      .from('message_attachments')
      .select('*')
      .in('message_id', messageIds);

    const attachmentMap: Record<string, MessageAttachment[]> = {};
    for (const att of (attachments || []) as MessageAttachment[]) {
      if (!attachmentMap[att.message_id]) attachmentMap[att.message_id] = [];
      attachmentMap[att.message_id].push(att);
    }

    const items: MessageItem[] = data.map((msg: Message) => {
      const profile = profileMap[msg.sender_id];
      return {
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        created_at: msg.created_at,
        sender_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
        sender_initials: profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() : '?',
        sender_avatar: profile?.avatar_url || null,
        is_own: msg.sender_id === user.id,
        attachments: attachmentMap[msg.id] || [],
      };
    });

    setMessages(items);

    // Mark as read
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);
  }, [user]);

  // ----------------------------------------------------------
  // Send a message
  // ----------------------------------------------------------
  const handleSend = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedThread,
      sender_id: user.id,
      content: newMessage.trim(),
      message_type: 'text',
    });

    if (!error) {
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedThread);

      await fetchMessages(selectedThread);
      await fetchThreads();
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ----------------------------------------------------------
  // Realtime subscription
  // ----------------------------------------------------------
  useEffect(() => {
    if (!selectedThread) return;

    const channel = supabase
      .channel(`messages:${selectedThread}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedThread}`,
        },
        () => {
          fetchMessages(selectedThread);
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread, fetchMessages, fetchThreads]);

  // ----------------------------------------------------------
  // Initial load
  // ----------------------------------------------------------
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread);
    }
  }, [selectedThread, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const currentThread = threads.find(t => t.id === selectedThread);

  const filteredThreads = searchTerm
    ? threads.filter(t =>
        t.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.last_message || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : threads;

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Empty state — no conversations at all
  // ----------------------------------------------------------
  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-20 px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-message-3-line text-4xl text-[#D4B483]"></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No Messages Yet
            </h3>
            <p className="text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              When you start a project or connect with a contractor, your conversations will appear here. You'll be able to share messages, photos, and files to keep everything organized.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex h-[600px] sm:h-[700px]">
        {/* Conversations List */}
        <div className={`${
          selectedThread ? 'hidden sm:block' : 'block'
        } w-full sm:w-80 border-r border-gray-200 flex flex-col`}>
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`w-full p-3 sm:p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  selectedThread === thread.id ? 'bg-[#D4B483]/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {thread.participant_avatar ? (
                      <img
                        src={thread.participant_avatar}
                        alt={thread.participant_name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {thread.participant_initials}
                      </div>
                    )}
                    {thread.unread_count > 0 && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {thread.participant_name}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTime(thread.last_message_time)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {thread.last_message || 'No messages yet'}
                    </p>
                    {thread.unread_count > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#D4B483] text-[#0B1F33] text-xs font-medium rounded-full">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedThread && currentThread ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="sm:hidden w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
                {currentThread.participant_avatar ? (
                  <img
                    src={currentThread.participant_avatar}
                    alt={currentThread.participant_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {currentThread.participant_initials}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {currentThread.participant_name}
                  </p>
                  {currentThread.type === 'group' && (
                    <p className="text-xs text-gray-500">Group conversation</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[70%]`}>
                      {!msg.is_own && currentThread.type === 'group' && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</p>
                      )}
                      {msg.message_type === 'system' ? (
                        <div className="text-center text-xs text-gray-400 italic py-1">
                          {msg.content}
                        </div>
                      ) : (
                        <>
                          <div
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm ${
                              msg.is_own
                                ? 'bg-[#0B1F33] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {msg.content}
                          </div>
                          {msg.attachments.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {msg.attachments.map((att) => (
                                <div key={att.id} className="flex items-center gap-2 text-xs text-[#D4B483]">
                                  <i className={att.file_type.startsWith('image/') ? 'ri-image-line' : 'ri-file-line'}></i>
                                  <span className="truncate">{att.file_name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className={`text-xs text-gray-500 mt-1 ${msg.is_own ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent resize-none text-sm"
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-send-plane-fill text-base sm:text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-200 rounded-full">
                <i className="ri-message-3-line text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

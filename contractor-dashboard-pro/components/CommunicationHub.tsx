import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type {
  Conversation,
} from '../../../types/messaging';

// ============================================================
// Local UI types
// ============================================================

interface InboxItem {
  id: string;                 // conversation id
  from: string;               // other participant's full name
  fromInitials: string;
  avatarUrl: string | null;
  subject: string;            // conversation title or participant name
  preview: string;            // last message content
  fullBody: string;           // same — messages are short enough
  time: string;               // ISO timestamp of last message
  unread: boolean;
  unreadCount: number;
  type: 'email' | 'sms';     // map conversation type → badge
  conversationId: string;
}

interface SentItem {
  id: string;                 // message id
  to: string;                 // recipient full name
  subject: string;
  preview: string;
  type: 'email' | 'sms';
  time: string;               // ISO timestamp
  conversationId: string;
}

interface Template {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms';
  category: string;
}

// ============================================================
// Utility
// ============================================================

const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-[#0B1F33] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

const formatRelativeTime = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ============================================================
// Component
// ============================================================

const CommunicationHub: React.FC = () => {
  const { user } = useAuth();

  /* -----------------------------------------------------------
   * State
   * -------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [sentItems, setSentItems] = useState<SentItem[]>([]);
  const [sentTodayCount, setSentTodayCount] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState<string | null>(null);

  const [templates, _setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'Project Update',
      subject: 'Update on Your {{job_title}} Project',
      body: 'Hi {{client_name}},\n\nI wanted to give you a quick update on your project. We\'ve completed [milestone] and are on track for the next phase. Everything is progressing smoothly.\n\nLet me know if you have any questions!\n\nBest regards',
      type: 'email',
      category: 'Updates'
    },
    {
      id: 2,
      name: 'Payment Reminder',
      subject: 'Payment Reminder - Invoice #{{invoice_number}}',
      body: 'Hi {{client_name}},\n\nThis is a friendly reminder that payment for invoice #{{invoice_number}} is due on {{due_date}}. Please let me know if you have any questions about the invoice.\n\nThank you!',
      type: 'email',
      category: 'Billing'
    },
    {
      id: 3,
      name: 'Appointment Confirmation',
      subject: 'Appointment Confirmed for {{date}}',
      body: 'Hi {{client_name}},\n\nThis confirms our appointment on {{date}} at {{time}}. I\'ll see you then!\n\nPlease let me know if you need to reschedule.\n\nThanks',
      type: 'email',
      category: 'Scheduling'
    },
    {
      id: 4,
      name: 'Quick Check-in',
      subject: '',
      body: 'Hi {{client_name}}, just checking in on your {{job_title}} project. Let me know if you need anything!',
      type: 'sms',
      category: 'Follow-up'
    }
  ]);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState<{
    to: string;
    subject: string;
    body: string;
    type: 'email' | 'sms';
  }>({
    to: '',
    subject: '',
    body: '',
    type: 'email',
  });

  /* -----------------------------------------------------------
   * Fetch inbox (conversations where user is participant)
   * -------------------------------------------------------- */
  const fetchInbox = useCallback(async () => {
    if (!user) return;

    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) {
      setInboxItems([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map(p => p.conversation_id);
    const readMap = Object.fromEntries(participations.map(p => [p.conversation_id, p.last_read_at]));

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (!conversations || conversations.length === 0) {
      setInboxItems([]);
      setLoading(false);
      return;
    }

    const items: InboxItem[] = [];

    for (const conv of conversations as Conversation[]) {
      // Get the other participant(s)
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
      } else {
        // Never read — all messages from others are unread
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id);
        unreadCount = count || 0;
      }

      const content = lastMsg?.content || '';

      items.push({
        id: conv.id,
        from: participantName,
        fromInitials: participantInitials,
        avatarUrl: participantAvatar,
        subject: conv.title || '',
        preview: content.length > 120 ? content.slice(0, 120) + '...' : content,
        fullBody: content,
        time: lastMsg?.created_at || conv.updated_at,
        unread: unreadCount > 0,
        unreadCount,
        type: conv.type === 'group' ? 'email' : 'email',
        conversationId: conv.id,
      });
    }

    setInboxItems(items);
    setLoading(false);
  }, [user]);

  /* -----------------------------------------------------------
   * Fetch sent messages
   * -------------------------------------------------------- */
  const fetchSent = useCallback(async () => {
    if (!user) return;

    const { data: sentMessages } = await supabase
      .from('messages')
      .select('id, conversation_id, content, created_at')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!sentMessages || sentMessages.length === 0) {
      setSentItems([]);
      setSentTodayCount(0);
      return;
    }

    // Count sent today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = sentMessages.filter(m => new Date(m.created_at) >= todayStart).length;
    setSentTodayCount(todayCount);

    // Get conversation IDs to find recipients
    const convIds = Array.from(new Set(sentMessages.map(m => m.conversation_id)));

    // For each conversation, get the other participant profile
    const recipientMap: Record<string, string> = {};
    const convTitleMap: Record<string, string> = {};

    for (const convId of convIds) {
      // Get conversation title
      const { data: conv } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', convId)
        .single();

      if (conv?.title) {
        convTitleMap[convId] = conv.title;
      }

      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convId)
        .neq('user_id', user.id);

      if (participants && participants.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', participants[0].user_id)
          .single();

        if (profile) {
          recipientMap[convId] = `${profile.first_name} ${profile.last_name}`;
        }
      }
    }

    const items: SentItem[] = sentMessages.map((msg) => {
      const content = msg.content || '';
      return {
        id: msg.id,
        to: recipientMap[msg.conversation_id] || 'Unknown',
        subject: convTitleMap[msg.conversation_id] || '',
        preview: content.length > 120 ? content.slice(0, 120) + '...' : content,
        type: 'email' as const,
        time: msg.created_at,
        conversationId: msg.conversation_id,
      };
    });

    setSentItems(items);
  }, [user]);

  /* -----------------------------------------------------------
   * Compute average response time
   * -------------------------------------------------------- */
  const computeAvgResponseTime = useCallback(async () => {
    if (!user) return;

    // Get conversations the user participates in
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) return;

    const convIds = participations.map(p => p.conversation_id);

    // Get recent messages from these conversations (last 100)
    const { data: messages } = await supabase
      .from('messages')
      .select('conversation_id, sender_id, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true })
      .limit(500);

    if (!messages || messages.length < 2) return;

    // For each conversation, find incoming→reply pairs and measure response time
    const responseTimes: number[] = [];
    const byConv: Record<string, typeof messages> = {};
    for (const msg of messages) {
      if (!byConv[msg.conversation_id]) byConv[msg.conversation_id] = [];
      byConv[msg.conversation_id].push(msg);
    }

    for (const msgs of Object.values(byConv)) {
      for (let i = 0; i < msgs.length - 1; i++) {
        // Incoming message (not from user) followed by user's reply
        if (msgs[i].sender_id !== user.id && msgs[i + 1].sender_id === user.id) {
          const incomingTime = new Date(msgs[i].created_at).getTime();
          const replyTime = new Date(msgs[i + 1].created_at).getTime();
          const diffMs = replyTime - incomingTime;
          if (diffMs > 0 && diffMs < 7 * 24 * 60 * 60 * 1000) { // cap at 7 days
            responseTimes.push(diffMs);
          }
        }
      }
    }

    if (responseTimes.length === 0) {
      setAvgResponseTime('—');
      return;
    }

    const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const avgMins = avgMs / (1000 * 60);

    if (avgMins < 60) {
      setAvgResponseTime(`${Math.round(avgMins)}m`);
    } else {
      const hours = avgMins / 60;
      setAvgResponseTime(`${hours.toFixed(1)}h`);
    }
  }, [user]);

  /* -----------------------------------------------------------
   * Initial load
   * -------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchInbox(), fetchSent(), computeAvgResponseTime()]);
  }, [user, fetchInbox, fetchSent, computeAvgResponseTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* -----------------------------------------------------------
   * Realtime subscription — listen across all user conversations
   * -------------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`comm-hub:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Re-fetch both tabs on any new message
          fetchInbox();
          fetchSent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchInbox, fetchSent]);

  /* -----------------------------------------------------------
   * Handlers
   * -------------------------------------------------------- */
  const handleMessageClick = async (itemId: string) => {
    setSelectedMessage(itemId);

    // Mark as read
    const item = inboxItems.find(m => m.id === itemId);
    if (item && item.unread && user) {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', item.conversationId)
        .eq('user_id', user.id);

      setInboxItems(prev =>
        prev.map(m =>
          m.id === itemId ? { ...m, unread: false, unreadCount: 0 } : m
        )
      );
    }
  };

  const handleReply = (itemId: string) => {
    const message = inboxItems.find(m => m.id === itemId);
    if (message) {
      setReplyingTo(itemId);
      setReplyText('');
    }
  };

  const handleSendReply = async (itemId: string) => {
    if (!replyText.trim() || !user) return;

    const item = inboxItems.find(m => m.id === itemId);
    if (!item) return;

    setSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: item.conversationId,
      sender_id: user.id,
      content: replyText.trim(),
      message_type: 'text',
    });

    if (!error) {
      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', item.conversationId);

      // Update last_read_at
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', item.conversationId)
        .eq('user_id', user.id);

      // Send email notification to other participants (fire-and-forget)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ type: 'new_message', data: { conversationId: item.conversationId, messagePreview: replyText.trim().substring(0, 200) } }),
        }).catch(err => console.error('[Messages] Email notification failed:', err));
      });

      showToast(`Reply sent to ${item.from}`);
      setReplyingTo(null);
      setReplyText('');

      // Refresh data
      await Promise.all([fetchInbox(), fetchSent()]);
    } else {
      showToast('Failed to send reply. Please try again.');
    }

    setSending(false);
  };

  const handleSendCompose = async () => {
    if (!composeData.to.trim() || !composeData.body.trim()) return;
    if (composeData.type === 'email' && !composeData.subject.trim()) return;
    if (!user) return;

    setSending(true);

    // Look up recipient by email or name
    // For now, try to find an existing conversation or create a new message
    // We'll search for the recipient profile first
    const searchTerm = composeData.to.trim();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .or(`email.eq.${searchTerm},first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      showToast('Recipient not found. Please enter a valid email or name.');
      setSending(false);
      return;
    }

    const recipientId = profiles[0].id;
    const recipientName = `${profiles[0].first_name} ${profiles[0].last_name}`;

    // Check if conversation already exists between these two users
    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    let existingConvId: string | null = null;

    if (myParticipations && myParticipations.length > 0) {
      const myConvIds = myParticipations.map(p => p.conversation_id);
      const { data: theirParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', myConvIds);

      if (theirParticipations && theirParticipations.length > 0) {
        existingConvId = theirParticipations[0].conversation_id;
      }
    }

    let conversationId = existingConvId;

    // Create new conversation if none exists
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: composeData.subject || null,
          type: 'direct',
          created_by: user.id,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        showToast('Failed to create conversation. Please try again.');
        setSending(false);
        return;
      }

      conversationId = newConv.id;

      // Add participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: user.id, role: 'member' },
        { conversation_id: conversationId, user_id: recipientId, role: 'member' },
      ]);
    }

    // Send message
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: composeData.body.trim(),
      message_type: 'text',
    });

    if (!error) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Send email notification to recipient (fire-and-forget)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ type: 'new_message', data: { conversationId, messagePreview: composeData.body.trim().substring(0, 200) } }),
        }).catch(err => console.error('[Messages] Email notification failed:', err));
      });

      setShowComposeModal(false);
      setComposeData({ to: '', subject: '', body: '', type: 'email' });
      showToast(`${composeData.type === 'email' ? 'Email' : 'SMS'} sent to ${recipientName}`);

      await Promise.all([fetchInbox(), fetchSent()]);
    } else {
      showToast('Failed to send message. Please try again.');
    }

    setSending(false);
  };

  const loadTemplateForCompose = (template: Template) => {
    setComposeData({
      to: '',
      subject: template.subject,
      body: template.body,
      type: template.type,
    });
    setShowComposeModal(true);
  };

  const handleArchive = (itemId: string) => {
    // Remove from local state (no DB archive column currently)
    setInboxItems(prev => prev.filter(m => m.id !== itemId));
    setShowArchiveConfirm(null);
    setSelectedMessage(null);
    showToast('Message archived');
  };

  const handleDelete = async (itemId: string) => {
    // Remove from local state
    setInboxItems(prev => prev.filter(m => m.id !== itemId));
    setShowDeleteConfirm(null);
    setSelectedMessage(null);
    showToast('Message deleted');
  };

  /* -----------------------------------------------------------
   * Derived data
   * -------------------------------------------------------- */
  const filteredInbox = inboxItems.filter(msg =>
    msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = inboxItems.filter(m => m.unread).length;

  /* -----------------------------------------------------------
   * Loading state
   * -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">Communication Hub</h2>
            <p className="text-gray-600 mt-1">Manage all client communications in one place</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------
   * Render
   * -------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Communication Hub</h2>
          <p className="text-gray-600 mt-1">Manage all client communications in one place</p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="bg-[#14B8A6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d9488] transition-all flex items-center gap-2"
        >
          <i className="ri-mail-add-line"></i>
          New Message
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unread Messages</p>
              <p className="text-3xl font-bold text-[#0B1F33] mt-1">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-mail-unread-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sent Today</p>
              <p className="text-3xl font-bold text-[#0B1F33] mt-1">{sentTodayCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-send-plane-line text-2xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold text-[#0B1F33] mt-1">{avgResponseTime || '—'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-4 font-semibold transition-all relative ${
              activeTab === 'inbox'
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-inbox-line mr-2"></i>
            Inbox
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-4 font-semibold transition-all relative ${
              activeTab === 'sent'
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-send-plane-line mr-2"></i>
            Sent
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-4 font-semibold transition-all relative ${
              activeTab === 'templates'
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-file-list-line mr-2"></i>
            Templates
          </button>
        </div>

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                />
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-3">
              {filteredInbox.map((message) => (
                <div key={message.id}>
                  <div
                    onClick={() => handleMessageClick(message.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      message.unread
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } ${selectedMessage === message.id ? 'ring-2 ring-[#14B8A6]' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {message.avatarUrl ? (
                            <img
                              src={message.avatarUrl}
                              alt={message.from}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0d9488] rounded-full flex items-center justify-center text-white font-semibold">
                              {message.fromInitials || message.from.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold ${message.unread ? 'text-[#0B1F33]' : 'text-gray-700'}`}>
                                {message.from}
                              </p>
                              {message.unread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                message.type === 'email'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {message.type === 'email' ? 'Email' : 'SMS'}
                              </span>
                            </div>
                            {message.subject && (
                              <p className={`text-sm mt-1 ${message.unread ? 'font-semibold text-[#0B1F33]' : 'text-gray-600'}`}>
                                {message.subject}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm ml-13">{message.preview}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">{formatRelativeTime(message.time)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Message View */}
                  {selectedMessage === message.id && (
                    <div className="mt-3 ml-13 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line mb-4">{message.fullBody}</p>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleReply(message.id)}
                          className="bg-[#0B1F33] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all flex items-center gap-2"
                        >
                          <i className="ri-reply-line"></i>
                          Reply
                        </button>
                        <button
                          onClick={() => setShowArchiveConfirm(message.id)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <i className="ri-archive-line"></i>
                          Archive
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(message.id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-all flex items-center gap-2"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Delete
                        </button>
                      </div>

                      {/* Reply Composer */}
                      {replyingTo === message.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Reply to {message.from}
                            </label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              maxLength={500}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
                              rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1">{replyText.length}/500 characters</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSendReply(message.id)}
                              disabled={!replyText.trim() || sending}
                              className="bg-[#14B8A6] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0d9488] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <i className="ri-send-plane-fill"></i>
                              {sending ? 'Sending...' : 'Send Reply'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="text-gray-600 hover:text-gray-900 font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === message.id && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-900 font-semibold mb-3">Are you sure you want to delete this message?</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Archive Confirmation */}
                      {showArchiveConfirm === message.id && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-900 font-semibold mb-3">Archive this message?</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleArchive(message.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                            >
                              Yes, Archive
                            </button>
                            <button
                              onClick={() => setShowArchiveConfirm(null)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredInbox.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-semibold">
                  {searchQuery ? 'No messages match your search' : 'No messages yet'}
                </p>
                {!searchQuery && (
                  <p className="text-gray-400 text-sm mt-2">
                    When clients message you, conversations will appear here.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sent Tab */}
        {activeTab === 'sent' && (
          <div className="p-6">
            <div className="space-y-3">
              {sentItems.map((message) => (
                <div key={message.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                          <i className="ri-send-plane-fill"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-700">To: {message.to}</p>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              message.type === 'email'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {message.type === 'email' ? 'Email' : 'SMS'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                              <i className="ri-check-double-line mr-1"></i>Delivered
                            </span>
                          </div>
                          {message.subject && (
                            <p className="text-sm text-gray-600 mt-1">{message.subject}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm ml-13">{message.preview}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500">{formatRelativeTime(message.time)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sentItems.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-send-plane-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-semibold">No sent messages yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Messages you send will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#14B8A6] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#0B1F33]">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          template.type === 'email'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {template.type === 'email' ? 'Email' : 'SMS'}
                        </span>
                        <span className="text-xs text-gray-500">{template.category}</span>
                      </div>
                    </div>
                  </div>
                  {template.subject && (
                    <p className="text-sm font-semibold text-gray-700 mb-2">{template.subject}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.body}</p>
                  <button
                    onClick={() => loadTemplateForCompose(template)}
                    className="w-full bg-[#14B8A6] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0d9488] transition-all"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#0B1F33]">New Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setComposeData({ ...composeData, type: 'email' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      composeData.type === 'email'
                        ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#14B8A6]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-mail-line mr-2"></i>
                    Email
                  </button>
                  <button
                    onClick={() => setComposeData({ ...composeData, type: 'sms' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      composeData.type === 'sms'
                        ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#14B8A6]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-message-3-line mr-2"></i>
                    SMS
                  </button>
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To {composeData.type === 'sms' && '(Phone Number)'}
                </label>
                <input
                  type="text"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder={composeData.type === 'email' ? 'client@example.com' : '(555) 123-4567'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                />
              </div>

              {/* Subject (Email only) */}
              {composeData.type === 'email' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Enter subject..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Type your message..."
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
                  rows={8}
                />
                <p className="text-xs text-gray-500 mt-1">{composeData.body.length}/500 characters</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSendCompose}
                  disabled={!composeData.to.trim() || !composeData.body.trim() || (composeData.type === 'email' && !composeData.subject.trim()) || sending}
                  className="flex-1 bg-[#14B8A6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d9488] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <i className="ri-send-plane-fill"></i>
                  {sending ? 'Sending...' : `Send ${composeData.type === 'email' ? 'Email' : 'SMS'}`}
                </button>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;

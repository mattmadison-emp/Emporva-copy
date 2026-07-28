// ============================================================
// Conversation types
// ============================================================

export type ConversationType = 'direct' | 'group';
export type ConversationParticipantRole = 'member' | 'admin';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Conversation {
  id: string;
  title: string | null;
  type: ConversationType;
  job_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ConversationParticipantRole;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// ============================================================
// Joined / enriched types for UI consumption
// ============================================================

export interface ConversationWithDetails extends Conversation {
  participants: ConversationParticipantWithProfile[];
  last_message: Message | null;
  unread_count: number;
}

export interface ConversationParticipantWithProfile extends ConversationParticipant {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: string | null;
  };
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  attachments: MessageAttachment[];
}

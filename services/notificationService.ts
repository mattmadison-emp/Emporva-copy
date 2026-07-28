import { supabase } from '../lib/supabase';
import type { UserSettings } from '../types/userSettings';

// ============================================================
// Notification channels
// ============================================================

export type NotificationChannel = 'email' | 'push' | 'sms';

export type NotificationCategory =
  | 'project_updates'
  | 'messages'
  | 'maintenance_reminders'
  | 'seasonal_tips'
  | 'marketing'
  | 'emergency_alerts';

export interface NotificationPayload {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ============================================================
// Channel-specific send functions
// Providers are not wired up yet — these are stubs that log
// the payload and will be replaced with real integrations
// (e.g. SendGrid, Firebase Cloud Messaging, Twilio)
// ============================================================

async function sendEmail(payload: NotificationPayload, _email: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[NotificationService] No session, cannot send email');
      return false;
    }

    const emailType = mapCategoryToEmailType(payload.category);
    if (!emailType) {
      console.log('[NotificationService] No email type mapping for category:', payload.category);
      return false;
    }

    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        type: emailType,
        data: {
          userId: payload.userId,
          title: payload.title,
          body: payload.body,
          ...payload.data,
        },
      }),
    });

    if (!response.ok) {
      console.error('[NotificationService] Email send failed:', response.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[NotificationService] Email error:', err);
    return false;
  }
}

function mapCategoryToEmailType(category: NotificationCategory): string | null {
  switch (category) {
    case 'messages': return 'new_message';
    case 'project_updates': return 'job_assigned';
    default: return null;
  }
}

async function sendPush(payload: NotificationPayload): Promise<boolean> {
  // TODO: Integrate push provider (Firebase Cloud Messaging, OneSignal, etc.)
  console.log('[NotificationService] Push queued:', payload);
  return true;
}

async function sendSMS(payload: NotificationPayload, phone: string): Promise<boolean> {
  // TODO: Integrate SMS provider (Twilio, etc.)
  console.log('[NotificationService] SMS queued:', { to: phone, ...payload });
  return true;
}

// ============================================================
// Settings check — which channels are enabled for this category?
// ============================================================

const settingsMap: Record<NotificationCategory, { email?: keyof UserSettings; push?: keyof UserSettings; sms?: keyof UserSettings }> = {
  project_updates: {
    email: 'email_project_updates',
    push: 'push_project_updates',
    sms: 'sms_project_updates',
  },
  messages: {
    email: 'email_messages',
    push: 'push_messages',
    sms: 'sms_messages',
  },
  maintenance_reminders: {
    email: 'email_maintenance_reminders',
    push: 'push_maintenance_reminders',
    sms: 'sms_maintenance_reminders',
  },
  seasonal_tips: {
    email: 'email_seasonal_tips',
  },
  marketing: {
    email: 'email_marketing',
  },
  emergency_alerts: {
    push: 'push_emergency_alerts',
    sms: 'sms_emergency_alerts',
  },
};

function getEnabledChannels(settings: UserSettings, category: NotificationCategory): NotificationChannel[] {
  const map = settingsMap[category];
  const channels: NotificationChannel[] = [];

  if (map.email && settings[map.email] === true) channels.push('email');
  if (map.push && settings[map.push] === true) channels.push('push');
  if (map.sms && settings[map.sms] === true) channels.push('sms');

  return channels;
}

// ============================================================
// Public API
// ============================================================

/**
 * Send a notification to a user across all their enabled channels.
 * Respects the user's notification preferences from user_settings.
 */
export async function sendNotification(payload: NotificationPayload): Promise<{ sent: NotificationChannel[]; errors: string[] }> {
  const sent: NotificationChannel[] = [];
  const errors: string[] = [];

  // Fetch user settings and profile in parallel
  const [settingsResult, profileResult] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', payload.userId).single(),
    supabase.from('profiles').select('email, phone').eq('id', payload.userId).single(),
  ]);

  if (settingsResult.error || !settingsResult.data) {
    return { sent, errors: ['Failed to fetch user settings'] };
  }

  const settings = settingsResult.data as UserSettings;
  const profile = profileResult.data;
  const enabledChannels = getEnabledChannels(settings, payload.category);

  for (const channel of enabledChannels) {
    try {
      switch (channel) {
        case 'email': {
          if (!profile?.email) {
            errors.push('No email address on profile');
            break;
          }
          const ok = await sendEmail(payload, profile.email);
          if (ok) sent.push('email');
          break;
        }
        case 'push': {
          const ok = await sendPush(payload);
          if (ok) sent.push('push');
          break;
        }
        case 'sms': {
          if (!profile?.phone) {
            errors.push('No phone number on profile');
            break;
          }
          const ok = await sendSMS(payload, profile.phone);
          if (ok) sent.push('sms');
          break;
        }
      }
    } catch (err) {
      errors.push(`${channel}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { sent, errors };
}

/**
 * Send a notification to multiple users (e.g. all participants in a conversation).
 */
export async function sendBulkNotification(
  userIds: string[],
  category: NotificationCategory,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ results: Record<string, { sent: NotificationChannel[]; errors: string[] }> }> {
  const results: Record<string, { sent: NotificationChannel[]; errors: string[] }> = {};

  await Promise.all(
    userIds.map(async (userId) => {
      results[userId] = await sendNotification({ userId, category, title, body, data });
    }),
  );

  return { results };
}

/**
 * Send a notification on a specific channel only, bypassing user settings.
 * Use for system-critical messages (e.g. password reset, security alerts).
 */
export async function sendDirectNotification(
  payload: NotificationPayload,
  channel: NotificationChannel,
): Promise<{ success: boolean; error?: string }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, phone')
    .eq('id', payload.userId)
    .single();

  try {
    switch (channel) {
      case 'email': {
        if (!profile?.email) return { success: false, error: 'No email address on profile' };
        const ok = await sendEmail(payload, profile.email);
        return { success: ok };
      }
      case 'push': {
        const ok = await sendPush(payload);
        return { success: ok };
      }
      case 'sms': {
        if (!profile?.phone) return { success: false, error: 'No phone number on profile' };
        const ok = await sendSMS(payload, profile.phone);
        return { success: ok };
      }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

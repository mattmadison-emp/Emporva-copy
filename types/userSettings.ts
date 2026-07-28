export type ProfileVisibility = 'private' | 'limited' | 'public';

export interface UserSettings {
  user_id: string;

  // Email notifications
  email_project_updates: boolean;
  email_messages: boolean;
  email_maintenance_reminders: boolean;
  email_seasonal_tips: boolean;
  email_marketing: boolean;

  // Push notifications
  push_project_updates: boolean;
  push_messages: boolean;
  push_maintenance_reminders: boolean;
  push_emergency_alerts: boolean;

  // SMS notifications
  sms_project_updates: boolean;
  sms_messages: boolean;
  sms_maintenance_reminders: boolean;
  sms_emergency_alerts: boolean;

  // Privacy
  profile_visibility: ProfileVisibility;
  show_email: boolean;
  show_phone: boolean;
  allow_contractor_contact: boolean;

  // Security
  two_factor_enabled: boolean;

  // Contractor-specific notifications
  email_new_leads: boolean;
  email_job_updates: boolean;
  push_new_leads: boolean;
  push_job_updates: boolean;
  sms_new_leads: boolean;
  sms_job_updates: boolean;

  // Contractor business preferences
  available_for_work: boolean;
  auto_quote_enabled: boolean;

  created_at: string;
  updated_at: string;
}

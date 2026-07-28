import { supabase } from './supabase';

export type ActivityAction =
  | 'job_posted'
  | 'job_deleted'
  | 'job_status_changed'
  | 'property_updated'
  | 'systems_updated'
  | 'profile_updated'
  | 'photo_uploaded'
  | 'password_changed';

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  description: string;
  homeownerProfileId?: string | null;
  multiUnitProfileId?: string | null;
  contractorProfileId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  userId,
  action,
  description,
  homeownerProfileId,
  multiUnitProfileId,
  contractorProfileId,
  metadata,
}: LogActivityParams) {
  await supabase.from('activity_log').insert({
    user_id: userId,
    action,
    description,
    homeowner_profile_id: homeownerProfileId || null,
    multi_unit_profile_id: multiUnitProfileId || null,
    contractor_profile_id: contractorProfileId || null,
    metadata: metadata || {},
  });
}

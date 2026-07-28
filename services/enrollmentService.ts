import { supabase } from '../lib/supabase';
import type { Profile, UserRole, ContactMethod } from '../types/profile';
import type { MultiUnitProfile } from '../types/multiUnit';
import type { ContractorProfile } from '../types/contractor';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: UserRole;
    tier?: 'core' | 'premium';
    preferred_contact?: ContactMethod;
    onboarding_completed?: boolean;
  }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function saveHomeownerProfile(
  userId: string
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('homeowner_profiles')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id, error: null };
}

export async function saveMultiUnitProfile(
  data: Omit<MultiUnitProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('multi_unit_profiles')
    .upsert(data, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  return { error: null };
}

export async function saveContractorProfile(
  data: Omit<ContractorProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('contractor_profiles')
    .upsert(data, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  return { error: null };
}

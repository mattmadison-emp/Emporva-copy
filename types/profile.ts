export type ContactMethod = 'phone' | 'text' | 'email' | 'any';
export type UserRole = 'homeowner' | 'multi-unit' | 'contractor';
export type Tier = 'core' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'paused';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  tier: Tier;
  preferred_contact: ContactMethod | null;
  onboarding_completed: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_current_period_end: string | null;
  monthly_ai_credits_remaining: number;
  ai_credits_period_start: string;
  created_at: string;
  updated_at: string;
}

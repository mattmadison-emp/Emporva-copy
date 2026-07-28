import type { ContractorTrade } from '../constants/trades';

export type JobCategory = ContractorTrade;

export type BudgetRange =
  | 'under-1000'
  | '1000-5000'
  | '5000-10000'
  | '10000-25000'
  | '25000-plus';

export type JobTimeline =
  | 'asap'
  | 'within-1-week'
  | 'within-1-month'
  | 'within-3-months'
  | 'flexible';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  user_id: string;
  homeowner_profile_id: string | null;
  multi_unit_profile_id: string | null;
  title: string;
  category: JobCategory;
  description: string;
  location: string;
  budget_range: BudgetRange | null;
  timeline: JobTimeline | null;
  photos: string[];
  status: JobStatus;
  quotes_received: number;
  // Project-specific fields
  is_project: boolean;
  estimated_budget: number | null;
  actual_spend: number | null;
  progress: number;
  start_date: string | null;
  estimated_completion: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkItemStatus = 'open' | 'quoted' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';

export interface WorkItem {
  id: string;
  job_id: string;
  contractor_id: string | null;
  title: string;
  description: string | null;
  trade: string;
  status: WorkItemStatus;
  estimated_budget: string | null;
  agreed_price: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

import type { WorkItem } from './workItem';

export interface ActiveJobView {
  id: string;
  title: string;
  status: string;
  description: string;
  category: string;
  created_at: string;

  homeowner_name: string;
  homeowner_email: string;
  property_address: string;

  my_work_item: WorkItem;
  is_multi_trade: boolean;
  my_trade_role: string;
  all_work_items: WorkItem[];
  progress: number;
}

export type PaymentType = 'deposit' | 'milestone' | 'final' | 'full';
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Payment {
  id: string;
  job_id: string;
  work_item_id: string | null;
  payer_id: string;
  payee_id: string;
  amount: number;
  description: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  confirmation_id: string | null;
  created_at: string;
  updated_at: string;
}

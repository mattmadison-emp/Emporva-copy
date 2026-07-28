export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

export interface ProjectMilestone {
  id: string;
  job_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type QACategory = 'scope' | 'timeline' | 'budget' | 'materials' | 'quality' | 'access' | 'other';
export type QAStatus = 'pending' | 'answered';

export interface ProjectQAThread {
  id: string;
  job_id: string;
  approval_id: string | null;
  question: string;
  category: QACategory;
  asked_by: string;
  response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  status: QAStatus;
  created_at: string;
  // Joined fields
  asker_first_name?: string | null;
  asker_last_name?: string | null;
  responder_first_name?: string | null;
  responder_last_name?: string | null;
}

export type ApprovalType = 'estimate' | 'change_order' | 'milestone' | 'completion';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ProjectApproval {
  id: string;
  job_id: string;
  submitted_by: string;
  type: ApprovalType;
  title: string;
  description: string | null;
  amount: number | null;
  status: ApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  documents: string[] | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export type PhotoCategory = 'before' | 'progress' | 'after' | 'issue' | 'other';

export interface ProjectPhoto {
  id: string;
  job_id: string;
  uploaded_by: string;
  url: string;
  caption: string | null;
  category: PhotoCategory;
  created_at: string;
  // Joined fields
  uploader_first_name?: string | null;
  uploader_last_name?: string | null;
}

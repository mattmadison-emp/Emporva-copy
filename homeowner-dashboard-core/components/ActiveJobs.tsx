import { useState, useEffect, useCallback } from 'react';
import MessageContractorModal from './MessageContractorModal';
import ProjectJobsList from './ProjectJobsList';
import type { ProjectJob } from './ProjectJobsList';
import ApprovalsTab from './ApprovalsTab';
import QATab from './QATab';
import PhotosTab from './PhotosTab';
import ApprovalActionModal from './ApprovalActionModal';
import AskQuestionModal from './AskQuestionModal';
import CreateProjectModal from '../../../components/feature/CreateProjectModal';
import JobPaymentsTab from './JobPaymentsTab';
import ProjectCalendarView from './ProjectCalendarView';
import WorkItemsTab from './WorkItemsTab';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { aiAgentService } from '../../../services/aiAgentService';

interface Approval {
  id: string;
  type: 'estimate' | 'change_order' | 'milestone' | 'completion';
  title: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  documents?: string[];
  photos?: string[];
}

interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: 'contractor' | 'homeowner';
  uploadedDate: string;
  category: 'before' | 'progress' | 'after' | 'issue' | 'other';
}

interface QAThread {
  id: string;
  jobId: string;
  approvalId?: string;
  question: string;
  category: string;
  askedBy: 'homeowner' | 'contractor';
  askerName: string;
  askedAt: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  status: 'pending' | 'answered';
}

interface DIYProject {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Not started' | 'In progress' | 'Paused' | 'Completed';
  complexity?: 'Easy' | 'Moderate' | 'Advanced';
  estimatedTime?: string;
  startDate?: string;
  targetDate?: string;
  totalCost: number;
  userBudget?: number;
  materials: DIYMaterial[];
  tasks: DIYTask[];
  photos: string[];
  aiSuggested: boolean;
  handedOffToContractor: boolean;
  contractorJobId?: string;
  importantForResale: boolean;
  resources: DIYResource[];
}

interface DIYMaterial {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
}

interface DIYTask {
  id: string;
  description: string;
  completed: boolean;
}

interface DIYResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'guide';
}

// Helper to map a DB row to the DIYProject interface
function mapDbToDIY(row: Record<string, unknown>): DIYProject {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    description: (row.description as string) || '',
    status: row.status as DIYProject['status'],
    complexity: (row.complexity as DIYProject['complexity']) || undefined,
    estimatedTime: (row.estimated_time as string) || undefined,
    startDate: (row.start_date as string) || undefined,
    targetDate: (row.target_date as string) || undefined,
    totalCost: Number(row.total_cost) || 0,
    userBudget: Number(row.user_budget) || Number(row.total_cost) || 0,
    materials: (row.materials as DIYMaterial[]) || [],
    tasks: (row.tasks as DIYTask[]) || [],
    photos: (row.photos as string[]) || [],
    aiSuggested: (row.ai_suggested as boolean) || false,
    handedOffToContractor: (row.handed_off_to_contractor as boolean) || false,
    contractorJobId: (row.contractor_job_id as string) || undefined,
    importantForResale: (row.important_for_resale as boolean) || false,
    resources: (row.resources as DIYResource[]) || [],
  };
}

interface ActiveJobsProps {
  showDIY?: boolean;
  // PHASE_1_GTM: when true, only the DIY view is shown and the contractor
  // projects view + toggle are hidden. Drop this prop to restore the full
  // contractor/DIY experience in Phase 2.
  diyOnly?: boolean;
}

export default function ActiveJobs({ showDIY = false, diyOnly = false }: ActiveJobsProps) {
  const { user } = useAuth();
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  // DIY Projects state
  const [diyProjects, setDiyProjects] = useState<DIYProject[]>([]);
  const [selectedDIY, setSelectedDIY] = useState<DIYProject | null>(null);
  const [diyFilterStatus, setDiyFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'contractor' | 'diy'>(diyOnly ? 'diy' : 'contractor');
  const [showCreateDIYModal, setShowCreateDIYModal] = useState(false);
  const [createDIYForm, setCreateDIYForm] = useState({ name: '', category: '', description: '', startDate: '', targetDate: '', estimatedBudget: '' });
  const [createDIYSaving, setCreateDIYSaving] = useState(false);
  const [showEditDIYModal, setShowEditDIYModal] = useState(false);
  const [editDIYForm, setEditDIYForm] = useState({ name: '', category: '', description: '', startDate: '', targetDate: '', estimatedBudget: '' });
  const [editDIYSaving, setEditDIYSaving] = useState(false);
  const [showDeleteDIYConfirm, setShowDeleteDIYConfirm] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffProject, setHandoffProject] = useState<DIYProject | null>(null);
  const [handoffReason, setHandoffReason] = useState('');
  const [handoffNotes, setHandoffNotes] = useState('');
  const [handoffSaving, setHandoffSaving] = useState(false);
  const [showAIPlanModal, setShowAIPlanModal] = useState(false);
  const [aiPlanProject, setAiPlanProject] = useState<DIYProject | null>(null);
  const [aiPlanGenerating, setAiPlanGenerating] = useState(false);
  const [aiPlanReady, setAiPlanReady] = useState(false);
  const [showHandoffSuccess, setShowHandoffSuccess] = useState(false);
  const [handoffSuccessProject, setHandoffSuccessProject] = useState<DIYProject | null>(null);

  // Ask Question state
  const [askQuestionApproval, setAskQuestionApproval] = useState<Approval | null>(null);
  const [askQuestionJobId, setAskQuestionJobId] = useState<string | null>(null);
  const [questionSending, setQuestionSending] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);
  const [questionToast, setQuestionToast] = useState('');

  // Reply to contractor question state
  const [replySending, setReplySending] = useState(false);

  // Approval action states
  const [approvalActionModal, setApprovalActionModal] = useState<{
    jobId: string;
    approval: Approval;
    action: 'approve' | 'reject';
  } | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  // Create project modal state
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Messaging modal state
  const [messagingJob, setMessagingJob] = useState<{ id: string; title: string; contractor: string; avatar: string } | null>(null);

  // Q&A threads — loaded from Supabase
  const [qaThreads, setQaThreads] = useState<QAThread[]>([]);

  // Projects loaded from Supabase
  const [jobs, setJobs] = useState<ProjectJob[]>([]);

  // Approvals loaded from Supabase
  const [approvalsState, setApprovalsState] = useState<Record<string, Approval[]>>({});

  // Photos loaded from Supabase
  const [jobPhotos, setJobPhotos] = useState<Record<string, JobPhoto[]>>({});

  // Milestones loaded from Supabase
  const [jobMilestones, setJobMilestones] = useState<Record<string, Array<{
    id: string; title: string; description: string; status: string;
    due_date: string | null; completed_at: string | null; sort_order: number;
  }>>>({});

  // Documents loaded from Supabase
  const [jobDocuments, setJobDocuments] = useState<Record<string, Array<{
    id: string; name: string; file_url: string; file_name: string;
    file_size: string; doc_type: string; created_at: string;
  }>>>({});

  // ── Fetch real project data from Supabase ──────────────────────
  const fetchProjects = useCallback(async () => {
    // PHASE_1_GTM: contractor projects hidden — skip the fetch entirely when DIY-only.
    if (!user || diyOnly) { setLoadingProjects(false); return; }
    setLoadingProjects(true);

    try {
      // 1. Get all projects (jobs where is_project = true) for this user
      const { data: projectRows } = await supabase
        .from('jobs')
        .select('id, title, status, progress, estimated_budget, actual_spend, start_date, estimated_completion, updated_at')
        .eq('user_id', user.id)
        .eq('is_project', true)
        .order('updated_at', { ascending: false });

      if (!projectRows || projectRows.length === 0) {
        setJobs([]);
        setLoadingProjects(false);
        return;
      }

      const jobIds = projectRows.map(j => j.id);

      // 2. Parallel: work_items (to find primary contractor), milestones, approvals, photos, qa_threads, documents
      const [workItemsRes, milestonesRes, approvalsRes, photosRes, qaRes, docsRes] = await Promise.all([
        supabase
          .from('work_items')
          .select('job_id, contractor_id, status')
          .in('job_id', jobIds),
        supabase
          .from('project_milestones')
          .select('id, job_id, title, description, status, due_date, completed_at, sort_order')
          .in('job_id', jobIds)
          .order('sort_order', { ascending: true }),
        supabase
          .from('project_approvals')
          .select('id, job_id, type, title, description, amount, status, documents, photos, created_at')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_photos')
          .select('id, job_id, uploaded_by, url, caption, category, created_at')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_qa_threads')
          .select('id, job_id, approval_id, question, category, asked_by, response, responded_by, responded_at, status, created_at')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_documents')
          .select('id, job_id, name, file_url, file_name, file_size, doc_type, created_at')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false }),
      ]);

      // 3. Collect all contractor_ids and user_ids to look up names
      const contractorIds = new Set<string>();
      const allUserIds = new Set<string>();
      (workItemsRes.data || []).forEach(wi => { if (wi.contractor_id) contractorIds.add(wi.contractor_id); });
      (qaRes.data || []).forEach(q => { allUserIds.add(q.asked_by); if (q.responded_by) allUserIds.add(q.responded_by); });
      (photosRes.data || []).forEach(p => allUserIds.add(p.uploaded_by));
      contractorIds.forEach(id => allUserIds.add(id));

      // 4. Fetch profiles + contractor business names
      let profileMap: Record<string, { first_name: string | null; last_name: string | null; avatar_url: string | null }> = {};
      let businessNameMap: Record<string, string | null> = {};
      if (allUserIds.size > 0) {
        const ids = Array.from(allUserIds);
        const [profilesRes, cpRes] = await Promise.all([
          supabase.from('profiles').select('id, first_name, last_name, avatar_url').in('id', ids),
          supabase.from('contractor_profiles').select('user_id, business_name').in('user_id', Array.from(contractorIds)),
        ]);
        (profilesRes.data || []).forEach(p => { profileMap[p.id] = p; });
        (cpRes.data || []).forEach(cp => { businessNameMap[cp.user_id] = cp.business_name; });
      }

      const getName = (uid: string) => {
        if (uid === user.id) return 'You';
        const p = profileMap[uid];
        return businessNameMap[uid] || [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Unknown';
      };

      // 5. Build the jobs array in the shape the UI expects
      const builtJobs = projectRows.map(proj => {
        const projWorkItems = (workItemsRes.data || []).filter(wi => wi.job_id === proj.id);
        // Primary contractor = first assigned contractor found
        const primaryContractorId = projWorkItems.find(wi => wi.contractor_id)?.contractor_id || null;
        const contractorName = primaryContractorId ? getName(primaryContractorId) : 'No contractor assigned';
        const contractorAvatar = primaryContractorId ? (profileMap[primaryContractorId]?.avatar_url || '') : '';

        // Next milestone: first pending/in-progress milestone
        const projMilestones = (milestonesRes.data || []).filter(m => m.job_id === proj.id);
        const nextMilestone = projMilestones.find(m => m.status === 'pending' || m.status === 'in-progress');

        // Counts
        const projApprovals = (approvalsRes.data || []).filter(a => a.job_id === proj.id);
        const pendingApprovals = projApprovals.filter(a => a.status === 'pending').length;
        const projPhotos = (photosRes.data || []).filter(p => p.job_id === proj.id);

        // Time since last update
        const updatedAt = new Date(proj.updated_at);
        const diffMs = Date.now() - updatedAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const lastUpdate = diffHours < 1 ? 'just now'
          : diffHours < 24 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
          : `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;

        // Status display
        const statusLabel = proj.status === 'in-progress' ? 'In Progress'
          : proj.status === 'completed' ? 'Completed'
          : proj.status === 'cancelled' ? 'Cancelled'
          : 'Open';

        return {
          id: proj.id,
          title: proj.title,
          contractor: contractorName,
          contractorAvatar,
          contractorId: primaryContractorId || '',
          status: statusLabel,
          progress: proj.progress || 0,
          startDate: proj.start_date || proj.updated_at,
          estimatedCompletion: proj.estimated_completion || '',
          budget: Number(proj.estimated_budget) || 0,
          spent: Number(proj.actual_spend) || 0,
          nextMilestone: nextMilestone?.title || '—',
          lastUpdate,
          pendingApprovals,
          newPhotos: projPhotos.length,
        };
      });
      setJobs(builtJobs);

      // 6. Build approvals state keyed by job id
      const approvalsByJob: Record<string, Approval[]> = {};
      (approvalsRes.data || []).forEach(a => {
        if (!approvalsByJob[a.job_id]) approvalsByJob[a.job_id] = [];
        approvalsByJob[a.job_id].push({
          id: a.id,
          type: a.type as Approval['type'],
          title: a.title,
          description: a.description || '',
          amount: a.amount ? Number(a.amount) : undefined,
          status: a.status as Approval['status'],
          submittedDate: new Date(a.created_at).toISOString().split('T')[0],
          documents: a.documents || undefined,
          photos: a.photos || undefined,
        });
      });
      setApprovalsState(approvalsByJob);

      // 7. Build photos state keyed by job id
      const photosByJob: Record<string, JobPhoto[]> = {};
      (photosRes.data || []).forEach(p => {
        if (!photosByJob[p.job_id]) photosByJob[p.job_id] = [];
        photosByJob[p.job_id].push({
          id: p.id,
          url: p.url,
          caption: p.caption || '',
          uploadedBy: p.uploaded_by === user.id ? 'homeowner' : 'contractor',
          uploadedDate: new Date(p.created_at).toISOString().split('T')[0],
          category: p.category as JobPhoto['category'],
        });
      });
      setJobPhotos(photosByJob);

      // 8. Build Q&A threads
      const builtThreads: QAThread[] = (qaRes.data || []).map(q => ({
        id: q.id,
        jobId: q.job_id,
        approvalId: q.approval_id || undefined,
        question: q.question,
        category: q.category,
        askedBy: (q.asked_by === user.id ? 'homeowner' : 'contractor') as 'homeowner' | 'contractor',
        askerName: getName(q.asked_by),
        askedAt: new Date(q.created_at).toISOString().split('T')[0],
        response: q.response || undefined,
        respondedAt: q.responded_at ? new Date(q.responded_at).toISOString().split('T')[0] : undefined,
        respondedBy: q.responded_by ? getName(q.responded_by) : undefined,
        status: q.status as 'pending' | 'answered',
      }));
      setQaThreads(builtThreads);

      // 9. Build milestones state keyed by job id
      const milestonesByJob: Record<string, Array<{
        id: string; title: string; description: string; status: string;
        due_date: string | null; completed_at: string | null; sort_order: number;
      }>> = {};
      (milestonesRes.data || []).forEach(m => {
        if (!milestonesByJob[m.job_id]) milestonesByJob[m.job_id] = [];
        milestonesByJob[m.job_id].push({
          id: m.id,
          title: m.title,
          description: m.description || '',
          status: m.status,
          due_date: m.due_date || null,
          completed_at: m.completed_at || null,
          sort_order: m.sort_order,
        });
      });
      setJobMilestones(milestonesByJob);

      // 10. Build documents state keyed by job id
      const docsByJob: Record<string, Array<{
        id: string; name: string; file_url: string; file_name: string;
        file_size: string; doc_type: string; created_at: string;
      }>> = {};
      (docsRes.data || []).forEach(d => {
        if (!docsByJob[d.job_id]) docsByJob[d.job_id] = [];
        docsByJob[d.job_id].push({
          id: d.id,
          name: d.name,
          file_url: d.file_url,
          file_name: d.file_name,
          file_size: d.file_size || '',
          doc_type: d.doc_type,
          created_at: d.created_at,
        });
      });
      setJobDocuments(docsByJob);

    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [user, diyOnly]);

  // ── Fetch DIY projects from Supabase ──────────────────────
  const fetchDIYProjects = useCallback(async () => {
    if (!user || !showDIY) return;
    const { data } = await supabase
      .from('diy_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      // Sort by urgency (active work first), keeping the DB's updated_at-desc
      // order as the tiebreaker (Array.sort is stable).
      const statusRank: Record<DIYProject['status'], number> = {
        'In progress': 0,
        'Not started': 1,
        'Paused': 2,
        'Completed': 3,
      };
      const projects = data.map(mapDbToDIY);
      projects.sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9));
      setDiyProjects(projects);
    }
  }, [user, showDIY]);

  useEffect(() => {
    fetchProjects();
    fetchDIYProjects();
  }, [fetchProjects, fetchDIYProjects]);

  const handleApproval = (jobId: string, approvalId: string, action: 'approve' | 'reject') => {
    const approval = approvalsState[jobId]?.find(a => a.id === approvalId);
    if (!approval) return;
    
    setApprovalActionModal({ jobId, approval, action });
    setApprovalNote('');
    setApprovalProcessing(false);
    setApprovalSuccess(false);
  };

  const handleConfirmApproval = async (noteFromModal?: string) => {
    if (!approvalActionModal || !user) return;

    setApprovalProcessing(true);

    const { jobId, approval, action } = approvalActionModal;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const note = noteFromModal ?? approvalNote;

    const { error } = await supabase
      .from('project_approvals')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: note || null,
      })
      .eq('id', approval.id);

    if (error) {
      console.error('Error updating approval:', error);
      setApprovalProcessing(false);
      return;
    }

    // Update local state
    setApprovalsState(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map(a =>
        a.id === approval.id ? { ...a, status: newStatus as Approval['status'] } : a
      )
    }));

    setApprovalProcessing(false);
    setApprovalSuccess(true);

    setTimeout(() => {
      setApprovalActionModal(null);
      setApprovalSuccess(false);
      setApprovalNote('');

      setQuestionToast(
        action === 'approve'
          ? `${approval.title} approved! Contractor has been notified.`
          : `${approval.title} rejected. Contractor has been notified.`
      );
      setTimeout(() => setQuestionToast(''), 4000);
    }, 1500);
  };

  const handleCancelApproval = () => {
    setApprovalActionModal(null);
    setApprovalNote('');
    setApprovalProcessing(false);
    setApprovalSuccess(false);
  };

  const handlePhotoUpload = (caption: string, category: string) => {
    console.log('Upload photo with caption:', caption, 'category:', category);
  };

  const handleOpenAskQuestion = (jobId: string, approval?: Approval) => {
    setAskQuestionJobId(jobId);
    setAskQuestionApproval(approval || null);
    setQuestionSent(false);
  };

  const handleSendQuestion = async (question: string, category: string) => {
    if (!question.trim() || !askQuestionJobId || !user) return;
    setQuestionSending(true);

    const { data, error } = await supabase
      .from('project_qa_threads')
      .insert({
        job_id: askQuestionJobId,
        approval_id: askQuestionApproval?.id || null,
        question,
        category,
        asked_by: user.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error sending question:', error);
      setQuestionSending(false);
      return;
    }

    const newThread: QAThread = {
      id: data.id,
      jobId: askQuestionJobId,
      approvalId: askQuestionApproval?.id,
      question,
      category,
      askedBy: 'homeowner',
      askerName: 'You',
      askedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setQaThreads(prev => [...prev, newThread]);
    setQuestionSending(false);
    setQuestionSent(true);

    setTimeout(() => {
      setAskQuestionApproval(null);
      setAskQuestionJobId(null);
      setQuestionSent(false);
      setQuestionToast('Question sent! Your contractor will be notified.');
      setTimeout(() => setQuestionToast(''), 4000);
    }, 1500);
  };

  const handleSendReply = async (threadId: string, text: string) => {
    if (!text.trim() || !user) return;
    setReplySending(true);

    const { error } = await supabase
      .from('project_qa_threads')
      .update({
        response: text,
        responded_by: user.id,
        responded_at: new Date().toISOString(),
        status: 'answered',
      })
      .eq('id', threadId);

    if (error) {
      console.error('Error sending reply:', error);
      setReplySending(false);
      return;
    }

    setQaThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, response: text, respondedAt: new Date().toISOString().split('T')[0], respondedBy: 'You', status: 'answered' as const }
        : t
    ));
    setReplySending(false);
    setQuestionToast('Reply sent! The contractor will be notified.');
    setTimeout(() => setQuestionToast(''), 4000);
  };

  const getJobQAThreads = (jobId: string) => qaThreads.filter(t => t.jobId === jobId);
  const getPendingContractorQuestions = (jobId: string) => qaThreads.filter(t => t.jobId === jobId && t.askedBy === 'contractor' && t.status === 'pending');

  const selectedJobData = jobs.find(job => job.id === selectedJob);
  const selectedJobApprovals = selectedJob ? approvalsState[selectedJob] || [] : [];
  const selectedJobPhotos = selectedJob ? jobPhotos[selectedJob] || [] : [];
  const selectedJobMilestones = selectedJob ? jobMilestones[selectedJob] || [] : [];
  const selectedJobDocuments = selectedJob ? jobDocuments[selectedJob] || [] : [];

  const getDIYStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDIYComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'Easy': return 'text-emerald-600';
      case 'Moderate': return 'text-amber-600';
      case 'Advanced': return 'text-rose-600';
      default: return 'text-gray-600';
    }
  };

  const handleToggleDIYTask = async (projectId: string, taskId: string) => {
    const project = diyProjects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    // Persist to DB
    await supabase
      .from('diy_projects')
      .update({ tasks: updatedTasks })
      .eq('id', projectId);

    setDiyProjects(diyProjects.map(p =>
      p.id === projectId ? { ...p, tasks: updatedTasks } : p
    ));
    if (selectedDIY && selectedDIY.id === projectId) {
      setSelectedDIY({ ...selectedDIY, tasks: updatedTasks });
    }
  };

  const handleConnectContractor = (project: DIYProject, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHandoffProject(project);
    setHandoffReason('');
    setHandoffNotes('');
    setShowHandoffModal(true);
  };

  const handleConfirmHandoff = async () => {
    if (!handoffProject || !user) return;
    setHandoffSaving(true);
    const projectRef = { ...handoffProject };

    // Build job description from DIY project details
    const reasonLabels: Record<string, string> = {
      stuck: 'Homeowner needs help with a particular step',
      safety: 'Safety concerns — professional assistance requested',
      prefer: 'Homeowner prefers professional handling',
      time: 'Homeowner doesn\'t have enough time',
    };
    const materialsText = handoffProject.materials.length > 0
      ? `\n\nMaterials needed:\n${handoffProject.materials.map(m => `- ${m.name} (x${m.quantity})`).join('\n')}`
      : '';
    const description = [
      handoffProject.description,
      reasonLabels[handoffReason] ? `\nReason for contractor: ${reasonLabels[handoffReason]}` : '',
      handoffNotes ? `\nAdditional notes: ${handoffNotes}` : '',
      materialsText,
      handoffProject.totalCost > 0 ? `\nEstimated budget: $${handoffProject.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
    ].filter(Boolean).join('');

    // Get homeowner profile ID
    const { data: homeownerProfile } = await supabase
      .from('homeowner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Determine budget range from totalCost
    let budgetRange = 'under-1000';
    if (handoffProject.totalCost >= 25000) budgetRange = '25000-plus';
    else if (handoffProject.totalCost >= 10000) budgetRange = '10000-25000';
    else if (handoffProject.totalCost >= 5000) budgetRange = '5000-10000';
    else if (handoffProject.totalCost >= 1000) budgetRange = '1000-5000';

    // Get user's property location
    const { data: property } = await supabase
      .from('properties')
      .select('address_line1, city, state, zip')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    const location = property
      ? [property.address_line1, property.city, property.state, property.zip].filter(Boolean).join(', ')
      : '';

    // Create the job posting
    const { data: newJob } = await supabase.from('jobs').insert({
      user_id: user.id,
      homeowner_profile_id: homeownerProfile?.id || null,
      title: handoffProject.name,
      category: handoffProject.category === 'Minor Electrical' ? 'Electrical'
        : handoffProject.category === 'Minor Plumbing' ? 'Plumbing'
        : handoffProject.category,
      description,
      location,
      budget_range: budgetRange,
      photos: [],
      status: 'open',
    }).select('id').single();

    // Link the DIY project to the new job
    const updatePayload: Record<string, unknown> = { handed_off_to_contractor: true };
    if (newJob) updatePayload.contractor_job_id = newJob.id;

    await supabase
      .from('diy_projects')
      .update(updatePayload)
      .eq('id', handoffProject.id);

    setDiyProjects(diyProjects.map(p =>
      p.id === handoffProject.id
        ? { ...p, handedOffToContractor: true, contractorJobId: newJob?.id }
        : p
    ));
    if (selectedDIY && selectedDIY.id === handoffProject.id) {
      setSelectedDIY({ ...selectedDIY, handedOffToContractor: true, contractorJobId: newJob?.id });
    }
    setHandoffSaving(false);
    setShowHandoffModal(false);
    setHandoffProject(null);
    setHandoffSuccessProject(projectRef);
    setShowHandoffSuccess(true);
  };

  const [aiPlanError, setAiPlanError] = useState('');

  const handleOpenAIPlan = async (project: DIYProject) => {
    setAiPlanProject(project);
    setShowAIPlanModal(true);
    setAiPlanReady(false);
    setAiPlanGenerating(true);
    setAiPlanError('');

    try {
      const plan = await aiAgentService.generateDIYPlan(
        project.name,
        project.category,
        project.description || undefined,
      );

      // Map AI response to project shape with IDs
      setAiPlanProject({
        ...project,
        complexity: plan.complexity as DIYProject['complexity'],
        estimatedTime: plan.estimatedTime,
        totalCost: plan.totalCost,
        materials: plan.materials.map((m, i) => ({ id: `mat-${i + 1}`, name: m.name, quantity: m.quantity, estimatedCost: m.estimatedCost })),
        tasks: plan.tasks.map((t, i) => ({ id: `task-${i + 1}`, description: t.description, completed: false })),
        resources: plan.resources.map((r, i) => ({ id: `res-${i + 1}`, title: r.title, description: r.description, url: r.url, type: r.type })),
      });
      setAiPlanReady(true);
    } catch (err) {
      setAiPlanError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAiPlanGenerating(false);
    }
  };

  const filteredDIYProjects = diyFilterStatus === 'all'
    ? diyProjects
    : diyProjects.filter(p => p.status === diyFilterStatus);

  if (selectedJob && selectedJobData) {
    void getJobQAThreads(selectedJob);
    const pendingQuestions = getPendingContractorQuestions(selectedJob);

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => { setSelectedJob(null); setActiveDetailTab('overview'); }}
          className="flex items-center gap-2 text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl"></i>
          <span className="font-semibold">Back to All Projects</span>
        </button>

        {/* Pending Contractor Questions Alert */}
        {pendingQuestions.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-question-answer-line text-orange-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="font-bold text-orange-900 mb-1">
                {pendingQuestions.length} question{pendingQuestions.length > 1 ? 's' : ''} from your contractor
              </p>
              <p className="text-sm text-orange-700 mb-3">
                {selectedJobData.contractor} has asked questions that need your response. Answering promptly helps keep the project on track.
              </p>
              <button
                onClick={() => setActiveDetailTab('qa')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-reply-line mr-2"></i>
                View &amp; Respond
              </button>
            </div>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {selectedJobData.contractorAvatar ? (
                <img
                  src={selectedJobData.contractorAvatar}
                  alt={selectedJobData.contractor}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{selectedJobData.contractor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-1">
                  {selectedJobData.title}
                </h2>
                <p className="text-[#6B7C8F] mb-2">{selectedJobData.contractor}</p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    {selectedJobData.status}
                  </span>
                  <span className="text-sm text-[#6B7C8F]">
                    Updated {selectedJobData.lastUpdate}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMessagingJob({ id: selectedJobData.id, title: selectedJobData.title, contractor: selectedJobData.contractor, avatar: selectedJobData.contractorAvatar })}
              className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-message-3-line mr-2"></i>
              Message Contractor
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#0B1F33]">Overall Progress</span>
              <span className="text-sm font-bold text-[#0B1F33]">{selectedJobData.progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#14B8A6] to-[#0ea89a] rounded-full transition-all duration-500"
                style={{ width: `${selectedJobData.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <p className="text-xs text-[#6B7C8F] mb-1">Budget</p>
              <p className="text-lg font-bold text-[#0B1F33]">
                ${selectedJobData.budget.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <p className="text-xs text-[#6B7C8F] mb-1">Spent</p>
              <p className="text-lg font-bold text-[#0B1F33]">
                ${selectedJobData.spent.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <p className="text-xs text-[#6B7C8F] mb-1">Start Date</p>
              <p className="text-lg font-bold text-[#0B1F33]">
                {new Date(selectedJobData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-[#F9F9FB] rounded-lg p-4">
              <p className="text-xs text-[#6B7C8F] mb-1">Est. Completion</p>
              <p className="text-lg font-bold text-[#0B1F33]">
                {new Date(selectedJobData.estimatedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 p-2 min-w-max">
              {[
                { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                { id: 'work-items', label: 'Work Items', icon: 'ri-tools-line' },
                { id: 'approvals', label: 'Approvals', icon: 'ri-checkbox-circle-line', badge: selectedJobApprovals.filter(a => a.status === 'pending').length },
                { id: 'qa', label: 'Q&A', icon: 'ri-question-answer-line', badge: pendingQuestions.length },
                { id: 'photos', label: 'Photos', icon: 'ri-image-line', badge: selectedJobPhotos.length },
                { id: 'payments', label: 'Payments', icon: 'ri-secure-payment-line' },
                { id: 'calendar', label: 'Calendar', icon: 'ri-calendar-line' },
                { id: 'timeline', label: 'Timeline', icon: 'ri-time-line' },
                { id: 'documents', label: 'Documents', icon: 'ri-file-text-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                    activeDetailTab === tab.id
                      ? 'bg-[#0B1F33] text-white'
                      : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                  }`}
                >
                  <i className={`${tab.icon} text-base sm:text-lg`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                      activeDetailTab === tab.id
                        ? 'bg-white text-[#0B1F33]'
                        : tab.id === 'qa'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-4">Next Milestone</h3>
                  <div className="bg-[#F9F9FB] rounded-lg p-4 border-l-4 border-[#14B8A6]">
                    <p className="font-semibold text-[#0B1F33] mb-1">{selectedJobData.nextMilestone}</p>
                    <p className="text-sm text-[#6B7C8F]">Expected completion in 3-5 days</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {(() => {
                      // Build recent activity from approvals, photos, Q&A, milestones
                      const activities: Array<{ icon: string; text: string; time: string; color: string; bg: string }> = [];

                      selectedJobApprovals.forEach(a => {
                        activities.push({
                          icon: a.status === 'pending' ? 'ri-checkbox-circle-line' : a.status === 'approved' ? 'ri-check-double-line' : 'ri-close-circle-line',
                          text: `${a.title} — ${a.status}`,
                          time: a.submittedDate,
                          color: a.status === 'pending' ? 'text-orange-600' : a.status === 'approved' ? 'text-green-600' : 'text-red-600',
                          bg: a.status === 'pending' ? 'bg-orange-50' : a.status === 'approved' ? 'bg-green-50' : 'bg-red-50',
                        });
                      });

                      if (selectedJobPhotos.length > 0) {
                        activities.push({
                          icon: 'ri-image-line',
                          text: `${selectedJobPhotos.length} photo${selectedJobPhotos.length !== 1 ? 's' : ''} uploaded`,
                          time: selectedJobPhotos[0]?.uploadedDate || '',
                          color: 'text-blue-600',
                          bg: 'bg-blue-50',
                        });
                      }

                      const jobQAs = qaThreads.filter(t => t.jobId === selectedJob);
                      jobQAs.slice(0, 2).forEach(q => {
                        activities.push({
                          icon: 'ri-question-answer-line',
                          text: `Q&A: ${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}`,
                          time: q.askedAt,
                          color: 'text-purple-600',
                          bg: 'bg-purple-50',
                        });
                      });

                      // Sort by date descending, take top 5
                      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
                      const recentActivities = activities.slice(0, 5);

                      if (recentActivities.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <p className="text-sm text-[#6B7C8F]">No recent activity for this project</p>
                          </div>
                        );
                      }

                      const timeAgo = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const now = new Date();
                        const diffMs = now.getTime() - d.getTime();
                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                        if (diffHrs < 1) return 'Just now';
                        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
                        const diffDays = Math.floor(diffHrs / 24);
                        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      };

                      return recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${activity.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <i className={`${activity.icon} ${activity.color}`}></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-[#0B1F33]">{activity.text}</p>
                            <p className="text-xs text-[#6B7C8F]">{timeAgo(activity.time)}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Work Items Tab */}
            {activeDetailTab === 'work-items' && (
              <WorkItemsTab jobId={selectedJob!} />
            )}

            {/* Approvals Tab */}
            {activeDetailTab === 'approvals' && (
              <ApprovalsTab
                approvals={selectedJobApprovals}
                qaThreads={qaThreads}
                jobId={selectedJob}
                onApprove={handleApproval}
                onAskQuestion={handleOpenAskQuestion}
              />
            )}

            {/* Q&A Tab */}
            {activeDetailTab === 'qa' && (
              <QATab
                threads={getJobQAThreads(selectedJob)}
                pendingQuestions={pendingQuestions}
                contractorName={selectedJobData.contractor}
                jobId={selectedJob}
                approvals={approvalsState}
                onAskQuestion={(jobId) => handleOpenAskQuestion(jobId)}
                onSendReply={(threadId, text) => handleSendReply(threadId, text)}
                replySending={replySending}
              />
            )}

            {/* Photos Tab */}
            {activeDetailTab === 'photos' && (
              <PhotosTab
                photos={selectedJobPhotos}
                onUpload={handlePhotoUpload}
              />
            )}

            {/* Payments Tab */}
            {activeDetailTab === 'payments' && (
              <JobPaymentsTab
                jobId={selectedJob}
                jobTitle={selectedJobData.title}
                contractorId={selectedJobData.contractorId}
                contractorName={selectedJobData.contractor}
              />
            )}

            {/* Calendar Tab */}
            {activeDetailTab === 'calendar' && (
              <ProjectCalendarView
                milestones={selectedJobMilestones}
                approvals={selectedJobApprovals}
                projectStart={selectedJobData.startDate}
                projectEnd={selectedJobData.estimatedCompletion}
                projectTitle={selectedJobData.title}
                projectProgress={selectedJobData.progress}
              />
            )}

            {/* Timeline Tab */}
            {activeDetailTab === 'timeline' && (
              <div className="space-y-6">
                {/* Predictive Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-[#6B7C8F] mb-1">Project Progress</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0B1F33]">{selectedJobData.progress}%</p>
                  </div>
                  <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-[#6B7C8F] mb-1">Days Elapsed</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0B1F33]">
                      {Math.round((Date.now() - new Date(selectedJobData.startDate).getTime()) / (1000 * 60 * 60 * 24))} / {Math.round((new Date(selectedJobData.estimatedCompletion).getTime() - new Date(selectedJobData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                  <div className="bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-[#6B7C8F] mb-1">Est. Completion</p>
                    <p className="text-base sm:text-2xl font-bold text-[#0B1F33]">
                      {new Date(selectedJobData.estimatedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <p className="text-xs sm:text-sm text-[#6B7C8F] mb-1">Status</p>
                    <p className="text-base sm:text-lg font-bold text-green-600">On Track</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0B1F33]">Project Timeline</h3>
                <div className="space-y-4">
                  {selectedJobMilestones.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-time-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-sm text-[#6B7C8F]">No milestones added for this project yet</p>
                    </div>
                  ) : selectedJobMilestones.map((milestone, index, arr) => {
                    const msStatus = milestone.status === 'completed' ? 'completed'
                      : milestone.status === 'in-progress' ? 'in-progress'
                      : 'pending';
                    return (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msStatus === 'completed'
                              ? 'bg-green-600'
                              : msStatus === 'in-progress'
                              ? 'bg-[#0B1F33]'
                              : 'bg-gray-300'
                          }`}
                        >
                          <i
                            className={`${
                              msStatus === 'completed'
                                ? 'ri-check-line text-white'
                                : msStatus === 'in-progress'
                                ? 'ri-loader-4-line text-white'
                                : 'ri-time-line text-white'
                            } text-xl`}
                          ></i>
                        </div>
                        {index < arr.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              msStatus === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-[#0B1F33]">{milestone.title}</h4>
                            <p className="text-sm text-[#6B7C8F]">
                              {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              msStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : msStatus === 'in-progress'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {msStatus === 'completed'
                              ? 'Completed'
                              : msStatus === 'in-progress'
                              ? 'In Progress'
                              : 'Pending'}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-[#6B7C8F]">{milestone.description}</p>
                        )}
                        {msStatus === 'in-progress' && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-2">
                            <p className="text-sm text-[#0B1F33]">
                              <i className="ri-information-line text-teal-600 mr-1"></i>
                              This milestone is currently in progress.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>

                {/* AI Timeline Insight */}
                <div className="bg-gradient-to-r from-[#F9F9FB] to-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-sparkling-line text-white text-xl"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#0B1F33]">AI Timeline Insight</h4>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4B483] to-[#c4a473] text-[#0B1F33] text-xs font-bold rounded-full flex items-center gap-1">
                          <i className="ri-vip-crown-line text-[10px]"></i>
                          Premium
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7C8F]">
                        {(() => {
                          const completed = selectedJobMilestones.filter(m => m.status === 'completed').length;
                          const total = selectedJobMilestones.length;
                          const inProgress = selectedJobMilestones.find(m => m.status === 'in-progress');
                          if (total === 0) return 'Add milestones to this project to get AI-powered timeline insights.';
                          if (completed === total) return `All ${total} milestones are complete. This project is ready for final review.`;
                          return `${completed} of ${total} milestones completed (${Math.round((completed / total) * 100)}%). ${inProgress ? `Currently working on: ${inProgress.title}.` : 'No milestone is currently in progress.'} Project is at ${selectedJobData.progress}% overall progress.`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeDetailTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Project Documents</h3>
                  <button className="px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm">
                    <i className="ri-upload-line mr-1 sm:mr-2"></i>
                    Upload Document
                  </button>
                </div>

                {selectedJobDocuments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-file-text-line text-2xl sm:text-3xl text-[#6B7C8F]"></i>
                    </div>
                    <p className="font-semibold text-[#0B1F33] text-sm mb-1">No documents yet</p>
                    <p className="text-xs sm:text-sm text-[#6B7C8F]">Upload contracts, permits, specs, and other project documents</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedJobDocuments.map((doc) => {
                      const docTypeIcon: Record<string, string> = {
                        contract: 'ri-file-shield-line',
                        'change-order': 'ri-file-edit-line',
                        permit: 'ri-file-check-line',
                        inspection: 'ri-search-eye-line',
                        specs: 'ri-file-list-3-line',
                        invoice: 'ri-file-text-line',
                        other: 'ri-file-line',
                      };
                      const docTypeColor: Record<string, string> = {
                        contract: 'bg-blue-50 text-blue-500',
                        'change-order': 'bg-orange-50 text-orange-500',
                        permit: 'bg-green-50 text-green-500',
                        inspection: 'bg-purple-50 text-purple-500',
                        specs: 'bg-cyan-50 text-cyan-500',
                        invoice: 'bg-yellow-50 text-yellow-500',
                        other: 'bg-gray-50 text-gray-500',
                      };
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${docTypeColor[doc.doc_type] || 'bg-gray-50 text-gray-500'}`}>
                              <i className={`${docTypeIcon[doc.doc_type] || 'ri-file-line'} text-base sm:text-xl`}></i>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-[#0B1F33] text-xs sm:text-sm truncate">{doc.name}</p>
                              <p className="text-[10px] sm:text-xs text-[#6B7C8F]">
                                {doc.file_size ? `${doc.file_size} • ` : ''}{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 sm:px-3 py-2 text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer flex-shrink-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <i className="ri-download-line text-lg sm:text-xl"></i>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Approval Action Modal */}
        {approvalActionModal && (
          <ApprovalActionModal
            approval={approvalActionModal.approval}
            action={approvalActionModal.action}
            processing={approvalProcessing}
            success={approvalSuccess}
            onConfirm={(note) => handleConfirmApproval(note)}
            onCancel={handleCancelApproval}
          />
        )}

        {/* Ask Question Modal */}
        {askQuestionJobId && (
          <AskQuestionModal
            jobTitle={jobs.find(j => j.id === askQuestionJobId)?.title || ''}
            contractorName={jobs.find(j => j.id === askQuestionJobId)?.contractor || ''}
            approvalTitle={askQuestionApproval?.title}
            sending={questionSending}
            sent={questionSent}
            onSend={handleSendQuestion}
            onClose={() => { setAskQuestionJobId(null); setAskQuestionApproval(null); }}
          />
        )}

        {/* Handoff Modal from Detail View */}
        {showHandoffModal && handoffProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                      <i className="ri-user-star-line text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1F33]">Post Job for Contractors</h3>
                      <p className="text-sm text-[#6B7C8F]">Post &quot;{handoffProject.name}&quot; to the marketplace for quotes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-2xl text-gray-600"></i>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Why do you need professional help?</label>
                    <div className="space-y-2">
                      {[
                        { value: 'stuck', label: 'I\'m stuck on a particular step', icon: 'ri-question-line' },
                        { value: 'safety', label: 'I\'m worried about safety concerns', icon: 'ri-shield-line' },
                        { value: 'prefer', label: 'I prefer to have a professional handle it', icon: 'ri-user-star-line' },
                        { value: 'time', label: 'I don\'t have enough time', icon: 'ri-time-line' }
                      ].map((reason) => (
                        <label
                          key={reason.value}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${handoffReason === reason.value ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                        >
                          <input type="radio" name="handoff-reason" value={reason.value} checked={handoffReason === reason.value} onChange={() => setHandoffReason(reason.value)} className="w-5 h-5 text-teal-600 cursor-pointer" />
                          <div className="w-8 h-8 flex items-center justify-center">
                            <i className={`${reason.icon} text-xl ${handoffReason === reason.value ? 'text-teal-600' : 'text-gray-600'}`}></i>
                          </div>
                          <span className="flex-1 font-medium text-[#0B1F33]">{reason.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Additional Notes (Optional)</label>
                    <textarea
                      rows={4}
                      value={handoffNotes}
                      onChange={e => setHandoffNotes(e.target.value)}
                      placeholder="Any specific concerns or requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                      maxLength={500}
                    ></textarea>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-[#0B1F33] mb-3">Job Posting Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Project:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Category:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Estimated Budget:</span>
                        <span className="font-semibold text-[#0B1F33]">${handoffProject.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Tasks Completed:</span>
                        <span className="font-semibold text-[#0B1F33]">
                          {handoffProject.tasks.filter(t => t.completed).length} of {handoffProject.tasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-[#6B7C8F]">
                        <i className="ri-information-line mr-1"></i>
                        This will post your project to the Emporva marketplace. Contractors matching your category will be able to view the details and submit quotes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmHandoff}
                      disabled={handoffSaving}
                      className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {handoffSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>Posting...</>
                      ) : (
                        <><i className="ri-megaphone-line mr-2"></i>Post to Marketplace</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Handoff to Contractor Modal (from grid view) */}
        {showHandoffModal && handoffProject && !selectedDIY && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                      <i className="ri-user-star-line text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1F33]">Post Job for Contractors</h3>
                      <p className="text-sm text-[#6B7C8F]">Post &quot;{handoffProject.name}&quot; to the marketplace for quotes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-2xl text-gray-600"></i>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Why do you need professional help?</label>
                    <div className="space-y-2">
                      {[
                        { value: 'stuck', label: 'I\'m stuck on a particular step', icon: 'ri-question-line' },
                        { value: 'safety', label: 'I\'m worried about safety concerns', icon: 'ri-shield-line' },
                        { value: 'prefer', label: 'I prefer to have a professional handle it', icon: 'ri-user-star-line' },
                        { value: 'time', label: 'I don\'t have enough time', icon: 'ri-time-line' }
                      ].map((reason) => (
                        <label
                          key={reason.value}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-all"
                        >
                          <input type="radio" name="handoff-reason-grid" value={reason.value} className="w-5 h-5 text-teal-600 cursor-pointer" />
                          <div className="w-8 h-8 flex items-center justify-center">
                            <i className={`${reason.icon} text-xl ${handoffReason === reason.value ? 'text-teal-600' : 'text-gray-600'}`}></i>
                          </div>
                          <span className="flex-1 font-medium text-[#0B1F33]">{reason.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Additional Notes (Optional)</label>
                    <textarea
                      rows={4}
                      value={handoffNotes}
                      onChange={e => setHandoffNotes(e.target.value)}
                      placeholder="Any specific concerns or requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                      maxLength={500}
                    ></textarea>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-[#0B1F33] mb-3">Job Posting Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Project:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Category:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Estimated Budget:</span>
                        <span className="font-semibold text-[#0B1F33]">${handoffProject.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Tasks Completed:</span>
                        <span className="font-semibold text-[#0B1F33]">
                          {handoffProject.tasks.filter(t => t.completed).length} of {handoffProject.tasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-[#6B7C8F]">
                        <i className="ri-information-line mr-1"></i>
                        This will post your project to the Emporva marketplace. Contractors matching your category will be able to view the details and submit quotes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmHandoff}
                      disabled={handoffSaving}
                      className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {handoffSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>Posting...</>
                      ) : (
                        <><i className="ri-megaphone-line mr-2"></i>Post to Marketplace</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Handoff Success Confirmation */}
        {showHandoffSuccess && handoffSuccessProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] p-8 text-center">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <i className="ri-check-line text-white text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                <p className="text-white/70 text-sm">We&apos;re finding the best contractors for your project</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Project Summary */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <i className="ri-tools-line text-teal-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="font-bold text-[#0B1F33]">{handoffSuccessProject.name}</p>
                      <p className="text-xs text-[#6B7C8F]">{handoffSuccessProject.category} &middot; ${handoffSuccessProject.totalCost} estimated</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Steps */}
                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-4">What happens next</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-check-line text-emerald-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1F33] text-sm">Request received</p>
                        <p className="text-xs text-[#6B7C8F]">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-search-line text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1F33] text-sm">Matching with contractors</p>
                        <p className="text-xs text-[#6B7C8F]">We&apos;re reviewing local pros who specialize in {handoffSuccessProject.category.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-mail-send-line text-gray-400 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400 text-sm">Receive quotes</p>
                        <p className="text-xs text-[#6B7C8F]">Estimated within 24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-handshake-line text-gray-400 text-sm"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400 text-sm">Choose your contractor</p>
                        <p className="text-xs text-[#6B7C8F]">Compare quotes and pick the best fit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Match Time */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-line text-teal-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-teal-900 text-sm">Estimated match time: 24-48 hours</p>
                    <p className="text-xs text-teal-700">You&apos;ll receive a notification when contractors respond</p>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => {
                    setShowHandoffSuccess(false);
                    setHandoffSuccessProject(null);
                  }}
                  className="w-full px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a5c] transition-all cursor-pointer whitespace-nowrap"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {questionToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
            <div className="w-8 h-8 bg-[#14B8A6] rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <span className="text-sm font-medium">{questionToast}</span>
            <button
              onClick={() => setQuestionToast('')}
              className="ml-2 text-white/60 hover:text-white cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* Message Contractor Modal */}
        <MessageContractorModal
          isOpen={!!messagingJob}
          onClose={() => setMessagingJob(null)}
          jobId={messagingJob?.id || ''}
          jobTitle={messagingJob?.title || ''}
          contractor={messagingJob?.contractor || ''}
          contractorAvatar={messagingJob?.avatar || ''}
        />
      </div>
    );
  }

  // DIY Detail View
  if (selectedDIY) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedDIY(null)}
          className="flex items-center gap-2 text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl"></i>
          <span className="font-semibold">Back to Projects</span>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#0B1F33] mb-2">{selectedDIY.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {selectedDIY.category}
                  </span>
                  <select
                    value={selectedDIY.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as DIYProject['status'];
                      const updates: Record<string, unknown> = { status: newStatus };
                      if (newStatus === 'Completed') updates.completed_at = new Date().toISOString();
                      const { error } = await supabase.from('diy_projects').update(updates).eq('id', selectedDIY.id);
                      if (error) {
                        console.error('[diy] status update failed:', error);
                        return;
                      }
                      const updated = { ...selectedDIY, status: newStatus };
                      setSelectedDIY(updated);
                      setDiyProjects(prev => prev.map(p => p.id === selectedDIY.id ? { ...p, status: newStatus } : p));
                    }}
                    className={`px-3 py-1 rounded-full font-medium border cursor-pointer text-sm ${getDIYStatusColor(selectedDIY.status)}`}
                  >
                    {(['Not started', 'In progress', 'Paused', 'Completed'] as const).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {selectedDIY.complexity && (
                    <span className={`font-semibold ${getDIYComplexityColor(selectedDIY.complexity)}`}>
                      {selectedDIY.complexity}
                    </span>
                  )}
                  {selectedDIY.estimatedTime && (
                    <span className="text-gray-600">
                      <i className="ri-time-line mr-1"></i>
                      {selectedDIY.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {selectedDIY.userBudget && selectedDIY.userBudget > 0 && selectedDIY.totalCost !== selectedDIY.userBudget ? (
                  <>
                    <div className="text-sm text-gray-600 mb-1">Your Budget</div>
                    <div className="text-xl font-bold text-[#0B1F33]">${selectedDIY.userBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs text-[#6B7C8F] mt-2 mb-1">AI Estimate</div>
                    <div className="text-2xl font-bold text-[#14B8A6]">${selectedDIY.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                    <div className="text-3xl font-bold text-[#0B1F33]">${selectedDIY.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{selectedDIY.description}</p>

            {selectedDIY.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0B1F33] mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedDIY.photos.map((photo, idx) => (
                    <div key={idx} className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img src={photo} alt={`Project photo ${idx + 1}`} className="w-full h-full object-cover object-top" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedDIY.startDate || selectedDIY.targetDate) && (
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                {selectedDIY.startDate && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Start Date</div>
                    <div className="font-semibold text-[#0B1F33]">{new Date(selectedDIY.startDate).toLocaleDateString()}</div>
                  </div>
                )}
                {selectedDIY.targetDate && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Target Completion</div>
                    <div className="font-semibold text-[#0B1F33]">{new Date(selectedDIY.targetDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              {selectedDIY.status !== 'Completed' && (
                <button
                  onClick={() => handleOpenAIPlan(selectedDIY)}
                  className="px-6 py-3 bg-gradient-to-r from-[#0B1F33] to-[#1a3a5c] text-white rounded-lg font-semibold hover:from-[#1a3a5c] hover:to-[#0B1F33] transition-all shadow-sm cursor-pointer whitespace-nowrap border-2 border-transparent inline-flex items-center"
                >
                  <i className="ri-sparkling-line mr-2"></i>
                  Plan with AI
                </button>
              )}
              {selectedDIY.handedOffToContractor ? (
                <span className="px-6 py-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold border border-teal-200">
                  <i className="ri-user-star-line mr-2"></i>
                  Posted to marketplace
                </span>
              ) : selectedDIY.status !== 'Completed' ? (
                <button
                  onClick={() => handleConnectContractor(selectedDIY)}
                  className="px-6 py-3 bg-white text-teal-700 border-2 border-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all cursor-pointer whitespace-nowrap inline-flex items-center"
                >
                  <i className="ri-megaphone-line mr-2"></i>
                  Post for Contractor Quotes
                </button>
              ) : null}
              <button
                onClick={() => {
                  setEditDIYForm({
                    name: selectedDIY.name,
                    category: selectedDIY.category,
                    description: selectedDIY.description,
                    startDate: selectedDIY.startDate || '',
                    targetDate: selectedDIY.targetDate || '',
                    estimatedBudget: selectedDIY.totalCost ? selectedDIY.totalCost.toString() : '',
                  });
                  setShowEditDIYModal(true);
                }}
                className="px-6 py-3 bg-white text-[#0B1F33] border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap inline-flex items-center"
              >
                <i className="ri-edit-line mr-2"></i>
                Edit Project
              </button>
              <button
                onClick={() => setShowDeleteDIYConfirm(true)}
                className="px-6 py-3 bg-white text-red-600 border-2 border-red-200 rounded-lg font-semibold hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap inline-flex items-center"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Delete
              </button>
            </div>

            {/* Tasks Checklist */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Tasks Checklist</h3>
              <div className="space-y-2">
                {selectedDIY.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleDIYTask(selectedDIY.id, task.id)}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-[#0B1F33]'}`}>
                      {task.description}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {selectedDIY.tasks.filter(t => t.completed).length} of {selectedDIY.tasks.length} tasks completed
              </div>
            </div>

            {/* Materials List */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Materials List</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedDIY.materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-100 transition-colors">
                        <td className="px-4 py-3 text-[#0B1F33]">{material.name}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{material.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0B1F33]">${(material.estimatedCost * material.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-3 text-[#0B1F33]" colSpan={2}>Total Estimated Cost</td>
                      <td className="px-4 py-3 text-right text-[#0B1F33]">${selectedDIY.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {selectedDIY.materials.length > 0 && (
                <p className="text-[11px] text-[#6B7C8F] mt-3 italic">
                  <i className="ri-information-line mr-1"></i>
                  Pricing may vary based on materials selected, your location, and retailer. Our AI estimates are always improving, but we recommend confirming prices before purchasing.
                </p>
              )}
            </div>

            {/* Helpful Resources */}
            {selectedDIY.resources.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Helpful Resources</h3>
                <div className="space-y-3">
                  {selectedDIY.resources.map((resource) => {
                    const searchQuery = encodeURIComponent(`${resource.title} ${selectedDIY.name} DIY`);
                    const safeUrl = resource.type === 'guide'
                      ? `https://www.youtube.com/results?search_query=${searchQuery}`
                      : `https://www.google.com/search?q=${searchQuery}`;
                    return (
                      <a
                        key={resource.id}
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-start gap-4 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
                      >
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${resource.type === 'guide' ? 'ri-youtube-line' : 'ri-search-line'} text-white text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0B1F33] mb-1">{resource.title}</h4>
                          <p className="text-sm text-gray-700">{resource.description}</p>
                          <p className="text-xs text-teal-600 mt-1">{resource.type === 'guide' ? 'Search on YouTube' : 'Search on Google'}</p>
                        </div>
                        <i className="ri-external-link-line text-teal-600 text-xl flex-shrink-0"></i>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Plan Modal */}
        {showAIPlanModal && aiPlanProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-lg flex items-center justify-center">
                      <i className="ri-sparkling-line text-[#D4B483] text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1F33]">AI Step-by-Step Plan</h3>
                      <p className="text-sm text-[#6B7C8F]">{aiPlanProject.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAIPlanModal(false); setAiPlanProject(null); setAiPlanReady(false); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-2xl text-gray-600"></i>
                  </button>
                </div>

                {aiPlanGenerating && (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-[#14B8A6] animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-sparkling-line text-[#14B8A6] text-2xl"></i>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-[#0B1F33] mb-2">Generating your plan...</h4>
                    <p className="text-sm text-[#6B7C8F]">AI is analyzing your project and creating a detailed step-by-step guide</p>
                  </div>
                )}

                {aiPlanError && !aiPlanGenerating && (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-error-warning-line text-2xl text-red-600"></i>
                    </div>
                    <h4 className="text-lg font-bold text-[#0B1F33] mb-2">Failed to generate plan</h4>
                    <p className="text-sm text-[#6B7C8F] mb-4">{aiPlanError}</p>
                    <button
                      onClick={() => handleOpenAIPlan(aiPlanProject)}
                      className="px-6 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm"
                    >
                      <i className="ri-refresh-line mr-2"></i>Try Again
                    </button>
                  </div>
                )}

                {aiPlanReady && (
                  <div className="space-y-6">
                    {/* AI Summary Card */}
                    <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-lightbulb-line text-[#D4B483]"></i>
                        <span className="font-bold text-sm text-[#D4B483]">AI Project Assessment</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-white/50 mb-1">Difficulty</div>
                          <div className="font-bold">{aiPlanProject.complexity || 'Moderate'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 mb-1">Time Estimate</div>
                          <div className="font-bold">{aiPlanProject.estimatedTime || '2-4 hours'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 mb-1">Budget</div>
                          <div className="font-bold">${aiPlanProject.totalCost}</div>
                        </div>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {aiPlanProject.complexity === 'Easy'
                          ? 'This is a straightforward project suitable for beginners. Follow each step carefully for a professional result.'
                          : aiPlanProject.complexity === 'Advanced'
                          ? 'This project requires some experience. Take your time, and don\'t hesitate to consult a professional if you encounter unexpected issues.'
                          : 'A moderate project that most homeowners can handle. Proper preparation is key to success.'}
                      </p>
                    </div>

                    {/* Safety Warnings */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-alert-line text-amber-600 text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-900 mb-1">Safety Reminders</h4>
                          <ul className="text-sm text-amber-800 space-y-1">
                            {((aiPlanProject as unknown as { safetyWarnings?: string[] }).safetyWarnings || []).length > 0
                              ? ((aiPlanProject as unknown as { safetyWarnings?: string[] }).safetyWarnings || []).map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))
                              : (
                              <>
                                <li>• Wear safety glasses and gloves when cutting or sanding</li>
                                <li>• Ensure proper ventilation when using adhesives or sealants</li>
                                <li>• Keep your workspace clean and organized to prevent accidents</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Plan */}
                    <div>
                      <h4 className="text-lg font-bold text-[#0B1F33] mb-4">Detailed Step-by-Step Plan</h4>
                      <div className="space-y-3">
                        {aiPlanProject.tasks.map((task, idx) => (
                          <div key={task.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                                task.completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0B1F33] text-white'
                              }`}>
                                {task.completed ? <i className="ri-check-line text-lg"></i> : idx + 1}
                              </div>
                              {idx < aiPlanProject.tasks.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[24px] ${task.completed ? 'bg-emerald-300' : 'bg-gray-200'}`}></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className={`font-semibold mb-1 ${task.completed ? 'text-emerald-700 line-through' : 'text-[#0B1F33]'}`}>
                                {task.description}
                              </p>
                              <p className="text-xs text-[#6B7C8F]">
                                Estimated: {(task as unknown as { estimatedMinutes?: number }).estimatedMinutes || 15} minutes
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Tools & Materials */}
                    <div>
                      <h4 className="text-lg font-bold text-[#0B1F33] mb-3">Materials Checklist</h4>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Est. Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {aiPlanProject.materials.map((material) => (
                              <tr key={material.id}>
                                <td className="px-4 py-3 text-[#0B1F33]">{material.name}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{material.quantity}</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#0B1F33]">${material.estimatedCost}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-[#6B7C8F] mt-3 italic">
                        <i className="ri-information-line mr-1"></i>
                        Pricing may vary based on materials selected, your location, and retailer. Our AI estimates are always improving, but we recommend confirming prices before purchasing.
                      </p>
                    </div>

                    {/* Pro Tips */}
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-lightbulb-flash-line text-teal-600 text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-teal-900 mb-2">Pro Tips</h4>
                          <ul className="text-sm text-teal-800 space-y-1.5">
                            {((aiPlanProject as unknown as { proTips?: string[] }).proTips || []).length > 0
                              ? ((aiPlanProject as unknown as { proTips?: string[] }).proTips || []).map((tip, i) => (
                                <li key={i}>• {tip}</li>
                              ))
                              : (
                              <>
                                <li>• Take before photos to document the original condition</li>
                                <li>• Watch a video tutorial specific to your project before starting</li>
                                <li>• Work methodically and don&apos;t rush — quality takes time</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => { setShowAIPlanModal(false); setAiPlanProject(null); setAiPlanReady(false); }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Close
                      </button>
                      <button
                        onClick={async () => {
                          if (!user || !aiPlanProject) return;
                          const totalCost = Math.round(aiPlanProject.materials.reduce((sum, m) => sum + m.estimatedCost * m.quantity, 0) * 100) / 100;
                          const userBudget = selectedDIY?.userBudget || selectedDIY?.totalCost || 0;
                          const { error } = await supabase
                            .from('diy_projects')
                            .update({
                              total_cost: totalCost,
                              user_budget: userBudget,
                              materials: aiPlanProject.materials,
                              tasks: aiPlanProject.tasks,
                              resources: aiPlanProject.resources || [],
                              complexity: aiPlanProject.complexity || null,
                              estimated_time: aiPlanProject.estimatedTime || null,
                            })
                            .eq('id', aiPlanProject.id)
                            .eq('user_id', user.id);

                          if (!error) {
                            setDiyProjects(prev => prev.map(p =>
                              p.id === aiPlanProject.id
                                ? { ...p, totalCost, userBudget, materials: aiPlanProject.materials, tasks: aiPlanProject.tasks, resources: aiPlanProject.resources || [], complexity: aiPlanProject.complexity, estimatedTime: aiPlanProject.estimatedTime }
                                : p
                            ));
                            if (selectedDIY?.id === aiPlanProject.id) {
                              setSelectedDIY(prev => prev ? { ...prev, totalCost, userBudget, materials: aiPlanProject.materials, tasks: aiPlanProject.tasks, resources: aiPlanProject.resources || [], complexity: aiPlanProject.complexity, estimatedTime: aiPlanProject.estimatedTime } : prev);
                            }
                            setQuestionToast('AI plan saved to your project!');
                          } else {
                            console.error('Failed to save AI plan:', error);
                            setQuestionToast('Failed to save plan. Please try again.');
                          }
                          setTimeout(() => setQuestionToast(''), 4000);
                          setShowAIPlanModal(false);
                          setAiPlanProject(null);
                          setAiPlanReady(false);
                        }}
                        className="flex-1 px-6 py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-check-line mr-2"></i>
                        Save Plan to Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit DIY Project Modal */}
        {showEditDIYModal && selectedDIY && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0B1F33]">Edit Project</h3>
                  <button onClick={() => setShowEditDIYModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <i className="ri-close-line text-2xl text-gray-600"></i>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Project Name *</label>
                    <input type="text" value={editDIYForm.name} onChange={e => setEditDIYForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Category *</label>
                    <select value={editDIYForm.category} onChange={e => setEditDIYForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer">
                      <option value="">Select a category</option>
                      {['Cosmetic', 'Minor Plumbing', 'Minor Electrical', 'Painting', 'Outdoor', 'Flooring', 'Storage', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Description</label>
                    <textarea rows={4} value={editDIYForm.description} onChange={e => setEditDIYForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none" maxLength={500} />
                    <div className="text-xs text-gray-500 mt-1">{editDIYForm.description.length}/500 characters</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Start Date</label>
                      <input type="date" value={editDIYForm.startDate} onChange={e => setEditDIYForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Target Completion</label>
                      <input type="date" value={editDIYForm.targetDate} onChange={e => setEditDIYForm(prev => ({ ...prev, targetDate: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Estimated Budget ($)</label>
                    <input type="number" value={editDIYForm.estimatedBudget} onChange={e => setEditDIYForm(prev => ({ ...prev, estimatedBudget: e.target.value }))} placeholder="e.g., 250" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button onClick={() => setShowEditDIYModal(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap">Cancel</button>
                  <button
                    disabled={!editDIYForm.name.trim() || !editDIYForm.category || editDIYSaving}
                    onClick={async () => {
                      if (!user || !selectedDIY) return;
                      setEditDIYSaving(true);
                      const { error } = await supabase
                        .from('diy_projects')
                        .update({
                          name: editDIYForm.name.trim(),
                          category: editDIYForm.category,
                          description: editDIYForm.description.trim(),
                          start_date: editDIYForm.startDate || null,
                          target_date: editDIYForm.targetDate || null,
                          total_cost: Number(editDIYForm.estimatedBudget) || 0,
                        })
                        .eq('id', selectedDIY.id)
                        .eq('user_id', user.id);
                      setEditDIYSaving(false);
                      if (!error) {
                        const updated = {
                          ...selectedDIY,
                          name: editDIYForm.name.trim(),
                          category: editDIYForm.category,
                          description: editDIYForm.description.trim(),
                          startDate: editDIYForm.startDate || undefined,
                          targetDate: editDIYForm.targetDate || undefined,
                          totalCost: Number(editDIYForm.estimatedBudget) || 0,
                        };
                        setSelectedDIY(updated);
                        setDiyProjects(prev => prev.map(p => p.id === selectedDIY.id ? updated : p));
                        setShowEditDIYModal(false);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editDIYSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete DIY Project Confirmation */}
        {showDeleteDIYConfirm && selectedDIY && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-delete-bin-line text-2xl text-red-600"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Delete Project?</h3>
                <p className="text-sm text-[#6B7C8F]">
                  Are you sure you want to delete <strong>{selectedDIY.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDeleteDIYConfirm(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  onClick={async () => {
                    if (!user || !selectedDIY) return;
                    await supabase.from('diy_projects').delete().eq('id', selectedDIY.id).eq('user_id', user.id);
                    setDiyProjects(prev => prev.filter(p => p.id !== selectedDIY.id));
                    setShowDeleteDIYConfirm(false);
                    setSelectedDIY(null);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handoff Modal from Detail View */}
        {showHandoffModal && handoffProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                      <i className="ri-user-star-line text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0B1F33]">Post Job for Contractors</h3>
                      <p className="text-sm text-[#6B7C8F]">Post &quot;{handoffProject.name}&quot; to the marketplace for quotes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-2xl text-gray-600"></i>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Why do you need professional help?</label>
                    <div className="space-y-2">
                      {[
                        { value: 'stuck', label: 'I\'m stuck on a particular step', icon: 'ri-question-line' },
                        { value: 'safety', label: 'I\'m worried about safety concerns', icon: 'ri-shield-line' },
                        { value: 'prefer', label: 'I prefer to have a professional handle it', icon: 'ri-user-star-line' },
                        { value: 'time', label: 'I don\'t have enough time', icon: 'ri-time-line' }
                      ].map((reason) => (
                        <label
                          key={reason.value}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${handoffReason === reason.value ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}
                        >
                          <input type="radio" name="handoff-reason" value={reason.value} checked={handoffReason === reason.value} onChange={() => setHandoffReason(reason.value)} className="w-5 h-5 text-teal-600 cursor-pointer" />
                          <div className="w-8 h-8 flex items-center justify-center">
                            <i className={`${reason.icon} text-xl ${handoffReason === reason.value ? 'text-teal-600' : 'text-gray-600'}`}></i>
                          </div>
                          <span className="flex-1 font-medium text-[#0B1F33]">{reason.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Additional Notes (Optional)</label>
                    <textarea
                      rows={4}
                      value={handoffNotes}
                      onChange={e => setHandoffNotes(e.target.value)}
                      placeholder="Any specific concerns or requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                      maxLength={500}
                    ></textarea>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-[#0B1F33] mb-3">Job Posting Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Project:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Category:</span>
                        <span className="font-semibold text-[#0B1F33]">{handoffProject.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Estimated Budget:</span>
                        <span className="font-semibold text-[#0B1F33]">${handoffProject.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7C8F]">Tasks Completed:</span>
                        <span className="font-semibold text-[#0B1F33]">
                          {handoffProject.tasks.filter(t => t.completed).length} of {handoffProject.tasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-[#6B7C8F]">
                        <i className="ri-information-line mr-1"></i>
                        This will post your project to the Emporva marketplace. Contractors matching your category will be able to view the details and submit quotes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmHandoff}
                      disabled={handoffSaving}
                      className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {handoffSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>Posting...</>
                      ) : (
                        <><i className="ri-megaphone-line mr-2"></i>Post to Marketplace</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Job List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33]">Active Projects</h2>
        {showDIY && viewMode === 'diy' ? (
          <button
            onClick={() => setShowCreateDIYModal(true)}
            className="px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a5c] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
          >
            <i className="ri-add-line mr-1 sm:mr-2"></i>
            New DIY Project
          </button>
        ) : (
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
          >
            <i className="ri-add-line mr-1 sm:mr-2"></i>
            Start New Project
          </button>
        )}
      </div>

      {/* View Mode Toggle (hidden when DIY-only — contractor projects paused) */}
      {showDIY && !diyOnly && (
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setViewMode('contractor')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'contractor'
                ? 'bg-[#0B1F33] text-white shadow-sm'
                : 'text-[#6B7C8F] hover:text-[#0B1F33]'
            }`}
          >
            <i className="ri-briefcase-line text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Contractor Projects</span>
            <span className="sm:hidden">Contractor</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
              viewMode === 'contractor' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {jobs.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('diy')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'diy'
                ? 'bg-[#0B1F33] text-white shadow-sm'
                : 'text-[#6B7C8F] hover:text-[#0B1F33]'
            }`}
          >
            <i className="ri-tools-line text-sm sm:text-base"></i>
            <span className="hidden sm:inline">DIY Projects</span>
            <span className="sm:hidden">DIY</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
              viewMode === 'diy' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {diyProjects.length}
            </span>
          </button>
        </div>
      )}

      {/* DIY Projects View */}
      {showDIY && viewMode === 'diy' ? (
        <div className="space-y-6">
          {/* DIY Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[10px] sm:text-xs font-medium">Total Projects</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-teal-400 text-sm sm:text-base"></i>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{diyProjects.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[10px] sm:text-xs font-medium">In Progress</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-hammer-line text-[#D4B483] text-sm sm:text-base"></i>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{diyProjects.filter(p => p.status === 'In progress').length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[10px] sm:text-xs font-medium">Completed</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-emerald-400 text-sm sm:text-base"></i>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{diyProjects.filter(p => p.status === 'Completed').length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[10px] sm:text-xs font-medium">Total Investment</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-[#D4B483] text-sm sm:text-base"></i>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">${diyProjects.reduce((sum, p) => sum + p.totalCost, 0)}</p>
            </div>
          </div>

          {/* DIY Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {['all', 'Not started', 'In progress', 'Paused', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setDiyFilterStatus(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  diyFilterStatus === status
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* DIY Projects Grid */}
          {filteredDIYProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-tools-line text-gray-400 text-3xl sm:text-4xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33] mb-2">No projects found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">Start your first DIY project and track your progress</p>
              <button
                onClick={() => setShowCreateDIYModal(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-all cursor-pointer whitespace-nowrap text-xs sm:text-sm"
              >
                <i className="ri-add-line mr-2"></i>
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredDIYProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedDIY(project)}
                >
                  {project.photos.length > 0 && (
                    <div className="w-full h-36 sm:h-44">
                      <img src={project.photos[0]} alt={project.name} className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-[#0B1F33] mb-2 line-clamp-2">{project.name}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] sm:text-xs font-medium">
                            {project.category}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${getDIYStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          {project.complexity && (
                            <span className={`text-[10px] sm:text-xs font-semibold ${getDIYComplexityColor(project.complexity)}`}>
                              {project.complexity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-lg sm:text-xl font-bold text-[#0B1F33]">${project.totalCost}</div>
                        {project.importantForResale && (
                          <span className="inline-flex items-center text-[10px] sm:text-xs text-[#D4B483] font-medium mt-1">
                            <i className="ri-star-fill mr-1"></i>
                            For resale
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                      {project.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          <span className="truncate">{project.estimatedTime}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <i className="ri-checkbox-line"></i>
                        {project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks
                      </span>
                    </div>
                    {/* Connect to Contractor / Handed Off indicator */}
                    {project.handedOffToContractor ? (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-600 font-medium pt-3 border-t border-gray-100">
                        <i className="ri-user-star-line"></i>
                        <span>Handed off to contractor</span>
                      </div>
                    ) : project.status !== 'Completed' ? (
                      <button
                        onClick={(e) => handleConnectContractor(project, e)}
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-teal-600 text-teal-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-50 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-user-star-line mr-1 sm:mr-2"></i>
                        Connect to a Contractor
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create DIY Modal */}
          {showCreateDIYModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[#0B1F33]">Create New DIY Project</h3>
                    <button
                      onClick={() => { setShowCreateDIYModal(false); setCreateDIYForm({ name: '', category: '', description: '', startDate: '', targetDate: '', estimatedBudget: '' }); }}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-2xl text-gray-600"></i>
                    </button>
                  </div>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Project Name *</label>
                      <input
                        type="text"
                        value={createDIYForm.name}
                        onChange={e => setCreateDIYForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Install Smart Thermostat"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Category *</label>
                      <select
                        value={createDIYForm.category}
                        onChange={e => setCreateDIYForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                      >
                        <option value="">Select a category</option>
                        {['Cosmetic', 'Minor Plumbing', 'Minor Electrical', 'Painting', 'Outdoor', 'Flooring', 'Storage', 'Other'].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Description</label>
                      <textarea
                        rows={4}
                        value={createDIYForm.description}
                        onChange={e => setCreateDIYForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what you want to accomplish..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                        maxLength={500}
                      ></textarea>
                      <div className="text-xs text-gray-500 mt-1">{createDIYForm.description.length}/500 characters</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Start Date</label>
                        <input
                          type="date"
                          value={createDIYForm.startDate}
                          onChange={e => setCreateDIYForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Target Completion</label>
                        <input
                          type="date"
                          value={createDIYForm.targetDate}
                          onChange={e => setCreateDIYForm(prev => ({ ...prev, targetDate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Estimated Budget ($)</label>
                      <input
                        type="number"
                        value={createDIYForm.estimatedBudget}
                        onChange={e => setCreateDIYForm(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                        placeholder="e.g., 250"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowCreateDIYModal(false); setCreateDIYForm({ name: '', category: '', description: '', startDate: '', targetDate: '', estimatedBudget: '' }); }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!createDIYForm.name.trim() || !createDIYForm.category || createDIYSaving}
                        onClick={async () => {
                          if (!user || !createDIYForm.name.trim() || !createDIYForm.category) return;
                          setCreateDIYSaving(true);
                          const { data, error } = await supabase
                            .from('diy_projects')
                            .insert({
                              user_id: user.id,
                              name: createDIYForm.name.trim(),
                              category: createDIYForm.category,
                              description: createDIYForm.description.trim(),
                              status: 'Not started',
                              start_date: createDIYForm.startDate || null,
                              target_date: createDIYForm.targetDate || null,
                              total_cost: Number(createDIYForm.estimatedBudget) || 0,
                            })
                            .select()
                            .single();
                          setCreateDIYSaving(false);
                          if (error) {
                            console.error('Error creating DIY project:', error);
                            return;
                          }
                          if (data) {
                            const newProject = mapDbToDIY(data);
                            setDiyProjects(prev => [newProject, ...prev]);
                            setSelectedDIY(newProject);
                          }
                          setShowCreateDIYModal(false);
                          setCreateDIYForm({ name: '', category: '', description: '', startDate: '', targetDate: '', estimatedBudget: '' });
                        }}
                        className="flex-1 px-6 py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createDIYSaving ? 'Creating...' : 'Create Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Handoff to Contractor Modal (from grid view) */}
          {showHandoffModal && handoffProject && !selectedDIY && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                        <i className="ri-user-star-line text-white text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#0B1F33]">Connect to a Contractor</h3>
                        <p className="text-sm text-[#6B7C8F]">Get professional help with: {handoffProject.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-2xl text-gray-600"></i>
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Why do you need professional help?</label>
                      <div className="space-y-2">
                        {[
                          { value: 'stuck', label: 'I\'m stuck on a particular step', icon: 'ri-question-line' },
                          { value: 'safety', label: 'I\'m worried about safety concerns', icon: 'ri-shield-line' },
                          { value: 'prefer', label: 'I prefer to have a professional handle it', icon: 'ri-user-star-line' },
                          { value: 'time', label: 'I don\'t have enough time', icon: 'ri-time-line' }
                        ].map((reason) => (
                          <label
                            key={reason.value}
                            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-all"
                          >
                            <input type="radio" name="handoff-reason-grid" value={reason.value} className="w-5 h-5 text-teal-600 cursor-pointer" />
                            <div className="w-8 h-8 flex items-center justify-center">
                              <i className={`${reason.icon} text-xl ${handoffReason === reason.value ? 'text-teal-600' : 'text-gray-600'}`}></i>
                            </div>
                            <span className="flex-1 font-medium text-[#0B1F33]">{reason.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Additional Notes (Optional)</label>
                      <textarea
                        rows={4}
                        placeholder="Any specific concerns or requirements..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                        maxLength={500}
                      ></textarea>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-bold text-[#0B1F33] mb-3">Job Posting Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B7C8F]">Project:</span>
                          <span className="font-semibold text-[#0B1F33]">{handoffProject.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B7C8F]">Category:</span>
                          <span className="font-semibold text-[#0B1F33]">{handoffProject.category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B7C8F]">Estimated Cost:</span>
                          <span className="font-semibold text-[#0B1F33]">${handoffProject.totalCost}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B7C8F]">Tasks Completed:</span>
                          <span className="font-semibold text-[#0B1F33]">
                            {handoffProject.tasks.filter(t => t.completed).length} of {handoffProject.tasks.length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-[#6B7C8F]">
                          <i className="ri-information-line mr-1"></i>
                          This will post your project to the Emporva marketplace. Contractors matching your category will be able to view the details and submit quotes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={() => { setShowHandoffModal(false); setHandoffProject(null); }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmHandoff}
                        className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-send-plane-line mr-2"></i>
                        Connect to Contractors
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ProjectJobsList
          jobs={jobs}
          loading={loadingProjects}
          qaThreads={qaThreads}
          onSelectJob={(jobId) => setSelectedJob(jobId)}
          onMessageJob={(job) => setMessagingJob(job)}
          onCreateProject={() => setShowCreateProjectModal(true)}
        />
      )}

      {/* Toast (for list view) */}
      {questionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
          <div className="w-8 h-8 bg-[#14B8A6] rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-check-line text-white text-lg"></i>
          </div>
          <span className="text-sm font-medium">{questionToast}</span>
          <button
            onClick={() => setQuestionToast('')}
            className="ml-2 text-white/60 hover:text-white cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Message Contractor Modal */}
      <MessageContractorModal
        isOpen={!!messagingJob}
        onClose={() => setMessagingJob(null)}
        jobId={messagingJob?.id || ''}
        jobTitle={messagingJob?.title || ''}
        contractor={messagingJob?.contractor || ''}
        contractorAvatar={messagingJob?.avatar || ''}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSuccess={() => { setShowCreateProjectModal(false); fetchProjects(); }}
      />
    </div>
  );
}

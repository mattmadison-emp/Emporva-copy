import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Job {
  id: number;
  title: string;
  client: string;
  value: string;
  property: string;
  daysInStage: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  phone?: string;
  email?: string;
  createdDate?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  jobs: Job[];
}

interface NewJobForm {
  title: string;
  client: string;
  property: string;
  value: string;
  priority: 'high' | 'medium' | 'low';
  stageId: string;
  notes: string;
}

const emptyForm: NewJobForm = {
  title: '',
  client: '',
  property: '',
  value: '',
  priority: 'medium',
  stageId: 'new-lead',
  notes: '',
};

// Map pipeline stages to work_item statuses for DB sync
const stageToStatus: Record<string, string> = {
  'new-lead': 'open',
  'clarifying': 'open',
  'ready-quote': 'quoted',
  'scheduled': 'assigned',
  'in-progress': 'in-progress',
  'completed': 'completed',
  'follow-up': 'completed',
};

const statusToStage = (status: string): string => {
  switch (status) {
    case 'open': return 'new-lead';
    case 'quoted': return 'ready-quote';
    case 'assigned': return 'scheduled';
    case 'in-progress': return 'in-progress';
    case 'completed': return 'completed';
    case 'cancelled': return 'completed';
    default: return 'new-lead';
  }
};

const emptyStages: Stage[] = [
  { id: 'new-lead', name: 'New Lead', color: 'bg-blue-100 text-blue-700', jobs: [] },
  { id: 'clarifying', name: 'Clarifying Scope', color: 'bg-purple-100 text-purple-700', jobs: [] },
  { id: 'ready-quote', name: 'Ready to Quote', color: 'bg-yellow-100 text-yellow-700', jobs: [] },
  { id: 'scheduled', name: 'Scheduled', color: 'bg-indigo-100 text-indigo-700', jobs: [] },
  { id: 'in-progress', name: 'In Progress', color: 'bg-orange-100 text-orange-700', jobs: [] },
  { id: 'completed', name: 'Completed', color: 'bg-green-100 text-green-700', jobs: [] },
  { id: 'follow-up', name: 'Follow-Up', color: 'bg-teal-100 text-teal-700', jobs: [] },
];

export default function PipelineView() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState<NewJobForm>({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobStageId, setSelectedJobStageId] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  // Map work_item IDs to DB IDs for persistence
  const [wiIdMap, setWiIdMap] = useState<Record<number, string>>({});

  // Drag state
  const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
  const [dragSourceStage, setDragSourceStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const [stages, setStages] = useState<Stage[]>(emptyStages.map(s => ({ ...s, jobs: [] })));
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch pipeline data from DB
  const fetchPipeline = useCallback(async () => {
    if (!user) return;

    // Get all work items for this contractor
    const { data: workItems } = await supabase
      .from('work_items')
      .select('id, job_id, title, trade, status, agreed_price, updated_at, created_at')
      .eq('contractor_id', user.id)
      .order('updated_at', { ascending: false });

    if (!workItems || workItems.length === 0) {
      setStages(emptyStages.map(s => ({ ...s, jobs: [] })));
      return;
    }

    // Get associated jobs for titles and homeowner info
    const jobIds = [...new Set(workItems.map(w => w.job_id))];
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, user_id, location')
      .in('id', jobIds);

    const homeownerIds = [...new Set((jobs || []).map(j => j.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .in('id', homeownerIds);

    const profileMap = Object.fromEntries(
      (profiles || []).map(p => [p.id, p])
    );
    const jobMap = Object.fromEntries(
      (jobs || []).map(j => [j.id, j])
    );

    // Build pipeline jobs and map IDs
    const idMap: Record<number, string> = {};
    const built = emptyStages.map(s => ({ ...s, jobs: [] as Job[] }));

    workItems.forEach((wi, idx) => {
      const job = jobMap[wi.job_id];
      const homeowner = job ? profileMap[job.user_id] : null;
      const stageId = statusToStage(wi.status);
      const stage = built.find(s => s.id === stageId);
      const numId = idx + 1;
      idMap[numId] = wi.id;

      const updatedAt = new Date(wi.updated_at);
      const daysInStage = Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)));

      const pipelineJob: Job = {
        id: numId,
        title: job?.title || wi.title,
        client: homeowner ? `${homeowner.first_name} ${homeowner.last_name}` : 'Unknown',
        value: wi.agreed_price ? `$${Number(wi.agreed_price).toLocaleString()}` : 'TBD',
        property: job?.location || '',
        daysInStage,
        priority: daysInStage > 7 ? 'high' : daysInStage > 3 ? 'medium' : 'low',
        phone: homeowner?.phone || '',
        email: homeowner?.email || '',
        createdDate: wi.created_at?.split('T')[0] || '',
      };

      if (stage) stage.jobs.push(pipelineJob);
    });

    setWiIdMap(idMap);
    setStages(built);
  }, [user]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Close modals on Escape
  useEffect(() => {
    if (!showAddModal && !selectedJob) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setSelectedJob(null);
        setEditingNotes(false);
        setConfirmDelete(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAddModal, selectedJob]);

  // Click outside for add modal
  useEffect(() => {
    if (!showAddModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showAddModal]);

  // Click outside for detail modal
  useEffect(() => {
    if (!selectedJob) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (detailRef.current && !detailRef.current.contains(e.target as Node)) {
        setSelectedJob(null);
        setEditingNotes(false);
        setConfirmDelete(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [selectedJob]);

  // Click outside for filter dropdown
  useEffect(() => {
    if (!showFilter) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showFilter]);

  const filteredStages = filterPriority === 'all'
    ? stages
    : stages.map(s => ({ ...s, jobs: s.jobs.filter(j => j.priority === filterPriority) }));

  // --- Drag and Drop Handlers ---
  const handleDragStart = (jobId: number, stageId: string) => {
    setDraggedJobId(jobId);
    setDragSourceStage(stageId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragOverStage === stageId) {
        setDragOverStage(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedJobId || !dragSourceStage || dragSourceStage === targetStageId) {
      setDraggedJobId(null);
      setDragSourceStage(null);
      return;
    }

    let movedJob: Job | null = null;
    const targetStageName = stages.find(s => s.id === targetStageId)?.name || '';

    setStages(prev => {
      const updated = prev.map(stage => {
        if (stage.id === dragSourceStage) {
          const job = stage.jobs.find(j => j.id === draggedJobId);
          if (job) movedJob = { ...job, daysInStage: 0 };
          return { ...stage, jobs: stage.jobs.filter(j => j.id !== draggedJobId) };
        }
        return stage;
      });

      if (!movedJob) return prev;

      return updated.map(stage => {
        if (stage.id === targetStageId) {
          return { ...stage, jobs: [...stage.jobs, movedJob!] };
        }
        return stage;
      });
    });

    // Persist status change to DB
    if (draggedJobId && wiIdMap[draggedJobId] && stageToStatus[targetStageId]) {
      supabase
        .from('work_items')
        .update({ status: stageToStatus[targetStageId] })
        .eq('id', wiIdMap[draggedJobId])
        .then(() => {});

      // Send email notification when job is assigned
      if (stageToStatus[targetStageId] === 'assigned') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) return;
          fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ type: 'job_assigned', data: { workItemId: wiIdMap[draggedJobId!] } }),
          }).catch(err => console.error('[Pipeline] Email notification failed:', err));
        });
      }
    }

    setDraggedJobId(null);
    setDragSourceStage(null);

    setSuccessToast(`Moved to ${targetStageName}`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
    setDragSourceStage(null);
    setDragOverStage(null);
  };

  // --- Job Detail ---
  const openJobDetail = (job: Job, stageId: string) => {
    setSelectedJob({ ...job });
    setSelectedJobStageId(stageId);
    setEditingNotes(false);
    setTempNotes(job.notes || '');
    setConfirmDelete(false);
  };

  const saveNotes = () => {
    if (!selectedJob) return;
    setStages(prev => prev.map(stage => ({
      ...stage,
      jobs: stage.jobs.map(j => j.id === selectedJob.id ? { ...j, notes: tempNotes } : j)
    })));
    setSelectedJob({ ...selectedJob, notes: tempNotes });
    setEditingNotes(false);
  };

  const moveJobToStage = (targetStageId: string) => {
    if (!selectedJob || targetStageId === selectedJobStageId) return;
    const targetStageName = stages.find(s => s.id === targetStageId)?.name || '';

    setStages(prev => {
      let job: Job | null = null;
      const updated = prev.map(stage => {
        if (stage.id === selectedJobStageId) {
          job = stage.jobs.find(j => j.id === selectedJob.id) || null;
          return { ...stage, jobs: stage.jobs.filter(j => j.id !== selectedJob.id) };
        }
        return stage;
      });
      if (!job) return prev;
      return updated.map(stage => {
        if (stage.id === targetStageId) {
          return { ...stage, jobs: [...stage.jobs, { ...job!, daysInStage: 0 }] };
        }
        return stage;
      });
    });

    setSelectedJobStageId(targetStageId);
    setSuccessToast(`Moved to ${targetStageName}`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const updateJobPriority = (priority: 'high' | 'medium' | 'low') => {
    if (!selectedJob) return;
    setStages(prev => prev.map(stage => ({
      ...stage,
      jobs: stage.jobs.map(j => j.id === selectedJob.id ? { ...j, priority } : j)
    })));
    setSelectedJob({ ...selectedJob, priority });
  };

  // --- Add Job ---
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newJob.title.trim()) errors.title = 'Job title is required';
    if (!newJob.client.trim()) errors.client = 'Client name is required';
    if (!newJob.property.trim()) errors.property = 'Property address is required';
    if (!newJob.value.trim()) {
      errors.value = 'Estimated value is required';
    } else if (isNaN(parseFloat(newJob.value.replace(/[$,]/g, '')))) {
      errors.value = 'Enter a valid dollar amount';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddJob = () => {
    if (!validateForm()) return;
    const rawValue = parseFloat(newJob.value.replace(/[$,]/g, ''));
    const formattedValue = `$${rawValue.toLocaleString()}`;
    const maxId = stages.reduce((max, s) => Math.max(max, ...s.jobs.map(j => j.id)), 0);
    const job: Job = {
      id: maxId + 1,
      title: newJob.title.trim(),
      client: newJob.client.trim(),
      value: formattedValue,
      property: newJob.property.trim(),
      daysInStage: 0,
      priority: newJob.priority,
      notes: newJob.notes.trim(),
      createdDate: new Date().toISOString().split('T')[0],
    };
    setStages(prev =>
      prev.map(stage =>
        stage.id === newJob.stageId ? { ...stage, jobs: [...stage.jobs, job] } : stage
      )
    );
    setShowAddModal(false);
    setNewJob({ ...emptyForm });
    setFormErrors({});
    setSuccessToast('Job added to pipeline');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // --- Delete Job ---
  const deleteJob = () => {
    if (!selectedJob) return;
    const jobTitle = selectedJob.title;
    setStages(prev => prev.map(stage => ({
      ...stage,
      jobs: stage.jobs.filter(j => j.id !== selectedJob.id)
    })));
    setSelectedJob(null);
    setEditingNotes(false);
    setConfirmDelete(false);
    setSuccessToast(`"${jobTitle}" removed from pipeline`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // --- Funnel Calculations ---
  const getFunnelData = () => {
    const stageOrder = ['new-lead', 'clarifying', 'ready-quote', 'scheduled', 'in-progress', 'completed', 'follow-up'];
    const totalJobs = stages.reduce((sum, s) => sum + s.jobs.length, 0);
    if (totalJobs === 0) return [];

    let cumulative = totalJobs;
    return stageOrder.map((stageId) => {
      const stage = stages.find(s => s.id === stageId);
      if (!stage) return null;
      const pct = Math.round((cumulative / totalJobs) * 100);
      const result = { id: stage.id, name: stage.name, count: stage.jobs.length, percentage: pct, color: stage.color };
      cumulative -= stage.jobs.length;
      return result;
    }).filter(Boolean) as { id: string; name: string; count: number; percentage: number; color: string }[];
  };

  const funnelData = getFunnelData();

  const getTotalValue = (jobs: Job[]) => {
    return jobs.reduce((sum, job) => {
      const value = parseFloat(job.value.replace(/[$,]/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const currentStageName = stages.find(s => s.id === selectedJobStageId)?.name || '';

  // Color map for funnel bars
  const funnelBarColors: Record<string, string> = {
    'new-lead': 'bg-blue-500',
    'clarifying': 'bg-purple-500',
    'ready-quote': 'bg-yellow-500',
    'scheduled': 'bg-indigo-500',
    'in-progress': 'bg-orange-500',
    'completed': 'bg-green-500',
    'follow-up': 'bg-teal-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">Pipeline View</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Drag cards between stages to move jobs &bull; Click a card for details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  filterPriority !== 'all'
                    ? 'border-[#0B1F33] text-[#0B1F33] bg-[#0B1F33]/5'
                    : 'border-gray-200 text-[#6B7C8F] hover:bg-[#F9F9FB]'
                }`}
              >
                <i className="ri-filter-line mr-2"></i>
                Filter{filterPriority !== 'all' ? ` (${filterPriority})` : ''}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 p-2">
                  <p className="text-xs font-semibold text-[#6B7C8F] uppercase px-2 py-1.5">Priority</p>
                  {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setFilterPriority(p); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                        filterPriority === p ? 'bg-[#0B1F33] text-white font-semibold' : 'text-[#0B1F33] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1) + ' Priority'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setNewJob({ ...emptyForm });
                setFormErrors({});
                setShowAddModal(true);
              }}
              className="bg-[#0B1F33] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Add Job
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="p-6 border-b border-gray-100 bg-[#F9F9FB]">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              ${stages.reduce((sum, stage) => sum + getTotalValue(stage.jobs), 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Active Opportunities</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {stages.reduce((sum, stage) => sum + stage.jobs.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Avg Days in Pipeline</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {(() => {
                const allJobs = stages.flatMap(s => s.jobs);
                if (allJobs.length === 0) return '—';
                const avg = allJobs.reduce((sum, j) => sum + j.daysInStage, 0) / allJobs.length;
                return avg.toFixed(1);
              })()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {(() => {
                const totalJobs = stages.reduce((sum, s) => sum + s.jobs.length, 0);
                const completedJobs = (stages.find(s => s.id === 'completed')?.jobs.length || 0) + (stages.find(s => s.id === 'follow-up')?.jobs.length || 0);
                if (totalJobs === 0) return '—';
                return `${Math.round((completedJobs / totalJobs) * 100)}%`;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Progress Bar */}
      {funnelData.length > 0 && (
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="ri-filter-line text-[#0B1F33] text-lg w-5 h-5 flex items-center justify-center"></i>
              <h3 className="text-sm font-bold text-[#0B1F33]">Conversion Funnel</h3>
            </div>
            <p className="text-xs text-[#6B7C8F]">
              {stages.find(s => s.id === 'completed')?.jobs.length || 0} of {stages.reduce((s, st) => s + st.jobs.length, 0)} completed
            </p>
          </div>
          <div className="space-y-2.5">
            {funnelData.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0B1F33] truncate">{item.name}</span>
                </div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${funnelBarColors[item.id] || 'bg-gray-400'}`}
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className={`text-[11px] font-bold ${item.percentage > 20 ? 'text-white' : 'text-[#0B1F33] ml-auto'}`}>
                      {item.count} {item.count === 1 ? 'job' : 'jobs'} &middot; {item.percentage}%
                    </span>
                  </div>
                </div>
                {idx < funnelData.length - 1 && (
                  <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-[#6B7C8F] text-sm"></i>
                  </div>
                )}
                {idx === funnelData.length - 1 && (
                  <div className="w-8 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {filteredStages.map((stage) => (
            <div
              key={stage.id}
              className={`w-80 flex-shrink-0 rounded-xl p-3 transition-all duration-200 ${
                dragOverStage === stage.id && dragSourceStage !== stage.id
                  ? 'bg-teal-50 ring-2 ring-teal-400 ring-dashed'
                  : 'bg-[#F9F9FB]'
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="mb-3 px-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[#0B1F33] text-sm">{stage.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stage.color}`}>
                    {stage.jobs.length}
                  </span>
                </div>
                <p className="text-xs text-[#6B7C8F]">
                  ${getTotalValue(stage.jobs).toLocaleString()} total
                </p>
              </div>

              <div className="space-y-2.5 min-h-[80px]">
                {stage.jobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={() => handleDragStart(job.id, stage.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openJobDetail(job, stage.id)}
                    className={`bg-white border-2 rounded-lg p-4 transition-all cursor-grab active:cursor-grabbing select-none group ${
                      draggedJobId === job.id
                        ? 'opacity-40 border-gray-200 scale-95'
                        : 'border-gray-100 hover:border-[#0B1F33] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-draggable text-gray-300 group-hover:text-gray-500 transition-colors"></i>
                      <h4 className="font-bold text-[#0B1F33] text-sm flex-1 truncate">{job.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.priority === 'high' ? 'bg-red-100 text-red-700' :
                        job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7C8F] mb-0.5 truncate">{job.client}</p>
                    <p className="text-xs text-[#6B7C8F]/70 mb-3 truncate">
                      <i className="ri-map-pin-line mr-1"></i>{job.property}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#0B1F33]">{job.value}</span>
                      <span className="text-[10px] text-[#6B7C8F] bg-gray-100 px-2 py-0.5 rounded-full">{job.daysInStage}d in stage</span>
                    </div>
                  </div>
                ))}

                {stage.jobs.length === 0 && (
                  <div className={`rounded-lg p-6 text-center border-2 border-dashed transition-colors ${
                    dragOverStage === stage.id ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 bg-white/50'
                  }`}>
                    <i className={`ri-inbox-line text-2xl mb-1 block ${dragOverStage === stage.id ? 'text-teal-500' : 'text-gray-300'}`}></i>
                    <p className="text-xs text-[#6B7C8F]">
                      {dragOverStage === stage.id ? 'Drop here' : 'No jobs in this stage'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            ref={detailRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[fadeScaleIn_0.2s_ease-out]"
          >
            {/* Detail Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-[#0B1F33] truncate">{selectedJob.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase flex-shrink-0 ${
                      selectedJob.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedJob.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedJob.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stages.find(s => s.id === selectedJobStageId)?.color || ''}`}>
                      {currentStageName}
                    </span>
                    <span>&bull;</span>
                    <span>{selectedJob.daysInStage}d in stage</span>
                    {selectedJob.createdDate && (
                      <>
                        <span>&bull;</span>
                        <span>Created {selectedJob.createdDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedJob(null); setEditingNotes(false); setConfirmDelete(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0 ml-3"
                >
                  <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-6">
              {/* Value */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-green-600 text-2xl"></i>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]">Estimated Value</p>
                  <p className="text-3xl font-bold text-[#0B1F33]">{selectedJob.value}</p>
                </div>
              </div>

              {/* Client & Property Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F9FB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7C8F] mb-2 font-semibold uppercase tracking-wide">Client</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#0B1F33] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {selectedJob.client.split(' ').map(n => n[0]).join('')}
                    </div>
                    <p className="font-semibold text-[#0B1F33]">{selectedJob.client}</p>
                  </div>
                  {selectedJob.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#6B7C8F] mb-1.5">
                      <i className="ri-phone-line text-base w-4 h-4 flex items-center justify-center"></i>
                      <span>{selectedJob.phone}</span>
                    </div>
                  )}
                  {selectedJob.email && (
                    <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                      <i className="ri-mail-line text-base w-4 h-4 flex items-center justify-center"></i>
                      <span>{selectedJob.email}</span>
                    </div>
                  )}
                </div>
                <div className="bg-[#F9F9FB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7C8F] mb-2 font-semibold uppercase tracking-wide">Property</p>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-map-pin-2-fill text-[#0B1F33] text-lg w-5 h-5 flex items-center justify-center"></i>
                    <p className="font-semibold text-[#0B1F33]">{selectedJob.property}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.property)}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                  >
                    <i className="ri-external-link-line mr-1"></i>View on Map
                  </a>
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-[#6B7C8F] mb-2 font-semibold uppercase tracking-wide">Priority</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateJobPriority(p)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        selectedJob.priority === p
                          ? p === 'high'
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                            : p === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                            : 'bg-gray-200 text-gray-700 ring-2 ring-gray-300'
                          : 'bg-gray-50 text-[#6B7C8F] hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#6B7C8F] font-semibold uppercase tracking-wide">Notes</p>
                  {!editingNotes && (
                    <button
                      onClick={() => { setEditingNotes(true); setTempNotes(selectedJob.notes || ''); }}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-1"></i>Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div>
                    <textarea
                      value={tempNotes}
                      onChange={(e) => { if (e.target.value.length <= 500) setTempNotes(e.target.value); }}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                      placeholder="Add notes about this job..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-[#6B7C8F]">{tempNotes.length}/500</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingNotes(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6B7C8F] hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNotes}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F9F9FB] rounded-lg p-4 min-h-[60px]">
                    <p className="text-sm text-[#0B1F33] leading-relaxed">
                      {selectedJob.notes || <span className="text-[#6B7C8F] italic">No notes yet. Click Edit to add some.</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Move to Stage */}
              <div>
                <p className="text-xs text-[#6B7C8F] mb-2 font-semibold uppercase tracking-wide">Move to Stage</p>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => moveJobToStage(stage.id)}
                      disabled={stage.id === selectedJobStageId}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        stage.id === selectedJobStageId
                          ? 'bg-[#0B1F33] text-white cursor-default'
                          : `${stage.color} hover:ring-2 hover:ring-gray-300 cursor-pointer`
                      }`}
                    >
                      {stage.id === selectedJobStageId && <i className="ri-check-line mr-1"></i>}
                      {stage.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
              <div>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line text-base"></i>
                    Delete Job
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-semibold">Are you sure?</span>
                    <button
                      onClick={deleteJob}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line text-base"></i>
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7C8F] hover:bg-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setSelectedJob(null); setEditingNotes(false); setConfirmDelete(false); }}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7C8F] hover:bg-white transition-all cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[fadeScaleIn_0.2s_ease-out]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-add-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F33]">Add Job to Pipeline</h3>
                  <p className="text-xs text-[#6B7C8F]">Manually create a new pipeline entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen Remodel, Roof Repair"
                  value={newJob.title}
                  onChange={(e) => {
                    setNewJob({ ...newJob, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${
                    formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name of the client"
                  value={newJob.client}
                  onChange={(e) => {
                    setNewJob({ ...newJob, client: e.target.value });
                    if (formErrors.client) setFormErrors({ ...formErrors, client: '' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${
                    formErrors.client ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {formErrors.client && <p className="text-xs text-red-500 mt-1">{formErrors.client}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                  Property Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Street address of the job site"
                  value={newJob.property}
                  onChange={(e) => {
                    setNewJob({ ...newJob, property: e.target.value });
                    if (formErrors.property) setFormErrors({ ...formErrors, property: '' });
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${
                    formErrors.property ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {formErrors.property && <p className="text-xs text-red-500 mt-1">{formErrors.property}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Estimated Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7C8F]">$</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={newJob.value}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, '');
                        setNewJob({ ...newJob, value: val });
                        if (formErrors.value) setFormErrors({ ...formErrors, value: '' });
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${
                        formErrors.value ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                  </div>
                  {formErrors.value && <p className="text-xs text-red-500 mt-1">{formErrors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewJob({ ...newJob, priority: p })}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                          newJob.priority === p
                            ? p === 'high'
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                              : p === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                              : 'bg-gray-200 text-gray-700 ring-2 ring-gray-300'
                            : 'bg-gray-50 text-[#6B7C8F] hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Pipeline Stage</label>
                <select
                  value={newJob.stageId}
                  onChange={(e) => setNewJob({ ...newJob, stageId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all cursor-pointer"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Notes</label>
                <textarea
                  placeholder="Any additional details about this job..."
                  value={newJob.notes}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setNewJob({ ...newJob, notes: e.target.value });
                    }
                  }}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                />
                <p className="text-xs text-[#6B7C8F] text-right mt-1">{newJob.notes.length}/500</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7C8F] hover:bg-white transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                className="px-5 py-2.5 rounded-lg bg-[#0B1F33] text-white text-sm font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1.5"></i>
                Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-lg animate-[fadeSlideUp_0.3s_ease-out]">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-white text-lg"></i>
          </div>
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

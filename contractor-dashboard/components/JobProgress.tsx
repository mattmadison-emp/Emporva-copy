import { useState, useRef } from 'react';

interface JobProgressProps {
  jobId: number;
  jobTitle: string;
  isMultiTrade?: boolean;
  myTradeRole?: string;
}

interface Photo {
  id: number;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  tag: 'before' | 'during' | 'after' | 'issue' | 'material';
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  assignee?: string;
}

interface Approval {
  id: number;
  title: string;
  type: 'homeowner' | 'inspector' | 'contractor' | 'system';
  status: 'approved' | 'pending' | 'rejected' | 'not-required';
  date?: string;
  approver?: string;
  note?: string;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked' | 'awaiting-approval';
  completionPercent: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  payment: string;
  paymentStatus: 'released' | 'pending-approval' | 'pending' | 'held';
  tasks: Task[];
  approvals: Approval[];
  photos: Photo[];
  notes?: string;
}

const initialJobProgressData: Record<number, { milestones: Milestone[]; overallPercent: number }> = {
  1: {
    overallPercent: 65,
    milestones: [
      {
        id: 1,
        title: 'Initial Assessment & Planning',
        description: 'Site inspection, moisture readings, scope documentation, and remediation plan approval.',
        status: 'completed',
        completionPercent: 100,
        startDate: 'Jan 15, 2025',
        dueDate: 'Jan 16, 2025',
        completedDate: 'Jan 15, 2025',
        payment: '$990.00',
        paymentStatus: 'released',
        tasks: [
          { id: 1, title: 'Conduct moisture readings across crawlspace', completed: true },
          { id: 2, title: 'Document existing damage with photos', completed: true },
          { id: 3, title: 'Create remediation plan', completed: true },
          { id: 4, title: 'Submit plan to homeowner for approval', completed: true }
        ],
        approvals: [
          { id: 1, title: 'Remediation Plan Approval', type: 'homeowner', status: 'approved', date: 'Jan 15, 2025', approver: 'Jennifer Martinez' },
          { id: 2, title: 'Scope of Work Sign-Off', type: 'homeowner', status: 'approved', date: 'Jan 15, 2025', approver: 'Jennifer Martinez' }
        ],
        photos: [
          {
            id: 1,
            url: 'https://readdy.ai/api/search-image?query=crawlspace with visible moisture damage on wooden beams and floor joists dark damp environment with condensation droplets professional inspection photo with flashlight illumination showing water stains and mold growth&width=640&height=480&seq=prog1&orientation=landscape',
            caption: 'Initial moisture damage — east wall joists',
            uploadedBy: 'You',
            uploadedAt: 'Jan 15, 2025 9:14 AM',
            tag: 'before'
          },
          {
            id: 2,
            url: 'https://readdy.ai/api/search-image?query=digital moisture meter reading on wooden beam in crawlspace showing high humidity levels professional contractor hand holding device against damp wood surface close up inspection photo&width=640&height=480&seq=prog2&orientation=landscape',
            caption: 'Moisture reading 78% — beam section B3',
            uploadedBy: 'You',
            uploadedAt: 'Jan 15, 2025 9:32 AM',
            tag: 'before'
          }
        ]
      },
      {
        id: 2,
        title: 'Vapor Barrier Installation',
        description: 'Remove old barrier, prep surfaces, install 6-mil vapor barrier with sealed seams.',
        status: 'completed',
        completionPercent: 100,
        startDate: 'Jan 16, 2025',
        dueDate: 'Jan 18, 2025',
        completedDate: 'Jan 17, 2025',
        payment: '$1,485.00',
        paymentStatus: 'released',
        tasks: [
          { id: 1, title: 'Remove old vapor barrier material', completed: true },
          { id: 2, title: 'Clean and prep crawlspace floor', completed: true },
          { id: 3, title: 'Install drainage matting', completed: true },
          { id: 4, title: 'Lay 6-mil vapor barrier', completed: true },
          { id: 5, title: 'Seal all seams with butyl tape', completed: true },
          { id: 6, title: 'Secure barrier to foundation walls', completed: true }
        ],
        approvals: [
          { id: 1, title: 'Barrier Installation Inspection', type: 'homeowner', status: 'approved', date: 'Jan 17, 2025', approver: 'Jennifer Martinez' }
        ],
        photos: [
          {
            id: 1,
            url: 'https://readdy.ai/api/search-image?query=new white vapor barrier plastic sheeting installed in crawlspace with sealed seams using butyl tape clean professional installation secured to foundation walls bright work lights showing quality finish&width=640&height=480&seq=prog6&orientation=landscape',
            caption: 'New 6-mil vapor barrier — installation complete',
            uploadedBy: 'You',
            uploadedAt: 'Jan 17, 2025 11:30 AM',
            tag: 'after'
          }
        ]
      },
      {
        id: 3,
        title: 'Dehumidifier Setup & Calibration',
        description: 'Install 70-pint dehumidifier, connect drainage, calibrate humidity targets.',
        status: 'in-progress',
        completionPercent: 60,
        startDate: 'Jan 19, 2025',
        dueDate: 'Jan 22, 2025',
        payment: '$990.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Position dehumidifier unit', completed: true },
          { id: 2, title: 'Connect condensate drain line', completed: true },
          { id: 3, title: 'Wire electrical connection', completed: true },
          { id: 4, title: 'Calibrate humidity target (45-50%)', completed: false },
          { id: 5, title: 'Run 24-hour test cycle', completed: false }
        ],
        approvals: [
          { id: 1, title: 'Equipment Placement Approval', type: 'homeowner', status: 'approved', date: 'Jan 19, 2025', approver: 'Jennifer Martinez' },
          { id: 2, title: 'Electrical Work Sign-Off', type: 'inspector', status: 'pending', approver: 'City Inspector' }
        ],
        photos: [
          {
            id: 1,
            url: 'https://readdy.ai/api/search-image?query=commercial dehumidifier unit positioned in crawlspace on vapor barrier with condensate drain line connected professional HVAC equipment installation well lit clean workspace&width=640&height=480&seq=prog8&orientation=landscape',
            caption: 'Dehumidifier positioned and drain connected',
            uploadedBy: 'You',
            uploadedAt: 'Jan 19, 2025 10:00 AM',
            tag: 'during'
          }
        ],
        notes: 'Waiting on 24-hour test cycle to complete before requesting final calibration sign-off.'
      },
      {
        id: 4,
        title: 'Insulation & Sealing',
        description: 'Apply spray foam insulation to rim joists and seal all penetrations.',
        status: 'pending',
        completionPercent: 0,
        startDate: 'Jan 23, 2025',
        dueDate: 'Jan 26, 2025',
        payment: '$990.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Prep rim joist areas', completed: false },
          { id: 2, title: 'Apply spray foam insulation', completed: false },
          { id: 3, title: 'Seal pipe and wire penetrations', completed: false },
          { id: 4, title: 'Insulate crawlspace access door', completed: false }
        ],
        approvals: [{ id: 1, title: 'Insulation Coverage Approval', type: 'homeowner', status: 'not-required' }],
        photos: []
      },
      {
        id: 5,
        title: 'Final Inspection & Testing',
        description: 'Complete moisture readings, verify all systems, final walkthrough with homeowner.',
        status: 'pending',
        completionPercent: 0,
        startDate: 'Jan 27, 2025',
        dueDate: 'Jan 28, 2025',
        payment: '$495.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Take final moisture readings', completed: false },
          { id: 2, title: 'Verify dehumidifier performance', completed: false },
          { id: 3, title: 'Document before/after comparison', completed: false },
          { id: 4, title: 'Walkthrough with homeowner', completed: false },
          { id: 5, title: 'Deliver maintenance guide', completed: false }
        ],
        approvals: [
          { id: 1, title: 'Final Walkthrough Sign-Off', type: 'homeowner', status: 'not-required' },
          { id: 2, title: 'Project Completion Approval', type: 'homeowner', status: 'not-required' }
        ],
        photos: []
      }
    ]
  },
  2: {
    overallPercent: 15,
    milestones: [
      {
        id: 1,
        title: 'Pre-Visit Diagnostic',
        description: 'Review system history, prepare diagnostic tools, confirm appointment.',
        status: 'completed',
        completionPercent: 100,
        startDate: 'Jan 20, 2025',
        dueDate: 'Jan 21, 2025',
        completedDate: 'Jan 20, 2025',
        payment: '$0.00',
        paymentStatus: 'released',
        tasks: [
          { id: 1, title: 'Review HVAC system model and history', completed: true },
          { id: 2, title: 'Prepare diagnostic equipment', completed: true },
          { id: 3, title: 'Confirm appointment with homeowner', completed: true }
        ],
        approvals: [{ id: 1, title: 'Appointment Confirmation', type: 'homeowner', status: 'approved', date: 'Jan 20, 2025', approver: 'Robert Chen' }],
        photos: []
      },
      {
        id: 2,
        title: 'On-Stage Diagnostic & Assessment',
        description: 'Full system diagnostic, identify issues, provide repair estimate.',
        status: 'pending',
        completionPercent: 0,
        startDate: 'Jan 22, 2025',
        dueDate: 'Jan 22, 2025',
        payment: '$345.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Inspect outdoor condenser unit', completed: false },
          { id: 2, title: 'Check refrigerant levels', completed: false },
          { id: 3, title: 'Test capacitor and electrical components', completed: false },
          { id: 4, title: 'Inspect ductwork for leaks', completed: false },
          { id: 5, title: 'Provide diagnostic report to homeowner', completed: false }
        ],
        approvals: [{ id: 1, title: 'Repair Estimate Approval', type: 'homeowner', status: 'not-required' }],
        photos: []
      },
      {
        id: 3,
        title: 'Repair & Verification',
        description: 'Execute repairs, test system performance, verify proper operation.',
        status: 'pending',
        completionPercent: 0,
        startDate: 'Jan 22, 2025',
        dueDate: 'Jan 23, 2025',
        payment: '$805.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Replace faulty components', completed: false },
          { id: 2, title: 'Recharge refrigerant if needed', completed: false },
          { id: 3, title: 'Run full system test cycle', completed: false },
          { id: 4, title: 'Verify temperature output', completed: false },
          { id: 5, title: 'Final walkthrough with homeowner', completed: false }
        ],
        approvals: [{ id: 1, title: 'Repair Completion Sign-Off', type: 'homeowner', status: 'not-required' }],
        photos: []
      }
    ]
  },
  3: {
    overallPercent: 35,
    milestones: [
      {
        id: 1,
        title: 'Plumbing Rough-In (Your Scope)',
        description: 'Install new water supply lines, drain lines, and gas connections for kitchen.',
        status: 'completed',
        completionPercent: 100,
        startDate: 'Jan 20, 2025',
        dueDate: 'Jan 24, 2025',
        completedDate: 'Jan 24, 2025',
        payment: '$3,200.00',
        paymentStatus: 'released',
        tasks: [
          { id: 1, title: 'Demo existing plumbing', completed: true },
          { id: 2, title: 'Install PEX supply lines', completed: true },
          { id: 3, title: 'Install drain lines for sink and dishwasher', completed: true },
          { id: 4, title: 'Install gas line for range', completed: true },
          { id: 5, title: 'Pressure test all lines', completed: true },
          { id: 6, title: 'Install shut-off valves', completed: true }
        ],
        approvals: [
          { id: 1, title: 'Plumbing Rough-In Inspection', type: 'inspector', status: 'approved', date: 'Jan 24, 2025', approver: 'City Inspector - J. Davis' },
          { id: 2, title: 'Homeowner Progress Review', type: 'homeowner', status: 'approved', date: 'Jan 24, 2025', approver: 'Sarah Thompson' }
        ],
        photos: [
          {
            id: 1,
            url: 'https://readdy.ai/api/search-image?query=new PEX water supply lines installed in kitchen wall framing red and blue PEX tubing with crimp fittings professional plumbing rough in work clean installation&width=640&height=480&seq=prog12&orientation=landscape',
            caption: 'PEX supply lines installed',
            uploadedBy: 'You',
            uploadedAt: 'Jan 22, 2025 3:00 PM',
            tag: 'during'
          }
        ]
      },
      {
        id: 2,
        title: 'Electrical Rough-In',
        description: 'Install new circuits, outlets, and lighting wiring for kitchen layout.',
        status: 'in-progress',
        completionPercent: 70,
        startDate: 'Jan 22, 2025',
        dueDate: 'Jan 27, 2025',
        payment: '$2,800.00',
        paymentStatus: 'pending',
        tasks: [
          { id: 1, title: 'Install dedicated appliance circuits', completed: true, assignee: 'BrightSpark Electric' },
          { id: 2, title: 'Wire recessed lighting positions', completed: true, assignee: 'BrightSpark Electric' },
          { id: 3, title: 'Install GFCI outlets', completed: true, assignee: 'BrightSpark Electric' },
          { id: 4, title: 'Wire under-cabinet lighting', completed: false, assignee: 'BrightSpark Electric' },
          { id: 5, title: 'Final electrical inspection', completed: false, assignee: 'BrightSpark Electric' }
        ],
        approvals: [
          { id: 1, title: 'Electrical Rough-In Inspection', type: 'inspector', status: 'pending', approver: 'City Inspector' },
          { id: 2, title: 'Homeowner Progress Review', type: 'homeowner', status: 'pending', approver: 'Sarah Thompson' }
        ],
        photos: [],
        notes: 'Under-cabinet lighting materials arriving Jan 26. On track for completion.'
      }
    ]
  }
};

const photoTagStyles: Record<string, { bg: string; text: string; label: string }> = {
  before: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Before' },
  during: { bg: 'bg-[#00B8A9]/10', text: 'text-[#00B8A9]', label: 'In Progress' },
  after: { bg: 'bg-green-100', text: 'text-green-700', label: 'After' },
  issue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Issue' },
  material: { bg: 'bg-[#D4B483]/20', text: 'text-[#D4B483]', label: 'Material' }
};

export default function JobProgress({ jobId, jobTitle: _jobTitle, isMultiTrade: _isMultiTrade, myTradeRole: _myTradeRole }: JobProgressProps) {
  const initial = initialJobProgressData[jobId] || initialJobProgressData[1];
  const [milestones, setMilestones] = useState<Milestone[]>(initial.milestones);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'milestones' | 'approvals'>('milestones');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Photo states
  const [lightboxPhoto, setLightboxPhoto] = useState<{ photo: Photo; milestonePhotos: Photo[] } | null>(null);
  const [uploadModal, setUploadModal] = useState<{ milestoneId: number; milestoneTitle: string } | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadTag, setUploadTag] = useState<Photo['tag']>('during');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<'all' | Photo['tag']>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark complete states
  const [markCompleteModal, setMarkCompleteModal] = useState<{ milestone: Milestone } | null>(null);
  const [markCompleteNote, setMarkCompleteNote] = useState('');
  const [markCompleteRequestPayment, setMarkCompleteRequestPayment] = useState(true);
  const [markCompleteNotifyHomeowner, setMarkCompleteNotifyHomeowner] = useState(true);
  const [markCompleteStep, setMarkCompleteStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  // Add note states
  const [addNoteModal, setAddNoteModal] = useState<{ milestoneId: number; milestoneTitle: string } | null>(null);
  const [addNoteText, setAddNoteText] = useState('');
  const [addNoteSuccess, setAddNoteSuccess] = useState(false);

  // Add milestone modal
  const [addMilestoneModal, setAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneStart, setNewMilestoneStart] = useState('');
  const [newMilestoneDue, setNewMilestoneDue] = useState('');
  const [newMilestonePayment, setNewMilestonePayment] = useState('');

  // Add task states
  const [addTaskMilestoneId, setAddTaskMilestoneId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Remove milestone confirm
  const [removeMilestoneConfirm, setRemoveMilestoneConfirm] = useState<number | null>(null);

  // Edit milestone
  const [editMilestoneModal, setEditMilestoneModal] = useState<Milestone | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editPayment, setEditPayment] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Computed values
  const totalTasks = milestones.reduce((s, m) => s + m.tasks.length, 0);
  const completedTasks = milestones.reduce((s, m) => s + m.tasks.filter(t => t.completed).length, 0);
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in-progress' || m.status === 'awaiting-approval').length;
  const totalPhotos = milestones.reduce((s, m) => s + m.photos.length, 0);
  const overallPercent = milestones.length > 0 ? Math.round(milestones.reduce((s, m) => s + m.completionPercent, 0) / milestones.length) : 0;

  const allApprovals = milestones.flatMap(m => m.approvals.map(a => ({ ...a, milestoneName: m.title, milestoneId: m.id })));
  const filteredApprovals = approvalFilter === 'all' ? allApprovals.filter(a => a.status !== 'not-required') : allApprovals.filter(a => a.status === approvalFilter);
  const pendingApprovalCount = allApprovals.filter(a => a.status === 'pending').length;
  const approvedCount = allApprovals.filter(a => a.status === 'approved').length;

  const totalPayment = milestones.reduce((s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'), 0);
  const releasedPayment = milestones.filter(m => m.paymentStatus === 'released').reduce((s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'), 0);

  // --- Handlers ---

  const handleToggleTask = (milestoneId: number, taskId: number) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId || m.status === 'completed' || m.status === 'awaiting-approval') return m;
      const updatedTasks = m.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const pct = Math.round((completedCount / updatedTasks.length) * 100);
      return { ...m, tasks: updatedTasks, completionPercent: pct, status: pct > 0 && m.status === 'pending' ? 'in-progress' : m.status };
    }));
  };

  const handleAddTask = (milestoneId: number) => {
    if (!newTaskTitle.trim()) return;
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const newId = m.tasks.length > 0 ? Math.max(...m.tasks.map(t => t.id)) + 1 : 1;
      return { ...m, tasks: [...m.tasks, { id: newId, title: newTaskTitle.trim(), completed: false }] };
    }));
    setNewTaskTitle('');
    setAddTaskMilestoneId(null);
    showToast('Task added');
  };

  const handleRemoveTask = (milestoneId: number, taskId: number) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const updatedTasks = m.tasks.filter(t => t.id !== taskId);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const pct = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      return { ...m, tasks: updatedTasks, completionPercent: pct };
    }));
    showToast('Task removed');
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newId = milestones.length > 0 ? Math.max(...milestones.map(m => m.id)) + 1 : 1;
    const newMilestone: Milestone = {
      id: newId,
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || 'No description provided.',
      status: 'pending',
      completionPercent: 0,
      startDate: newMilestoneStart || 'TBD',
      dueDate: newMilestoneDue || 'TBD',
      payment: newMilestonePayment ? `$${parseFloat(newMilestonePayment).toFixed(2)}` : '$0.00',
      paymentStatus: 'pending',
      tasks: [],
      approvals: [{ id: 1, title: 'Milestone Completion Approval', type: 'homeowner', status: 'not-required' }],
      photos: [],
    };
    setMilestones(prev => [...prev, newMilestone]);
    setAddMilestoneModal(false);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneStart('');
    setNewMilestoneDue('');
    setNewMilestonePayment('');
    showToast('Milestone added');
  };

  const handleRemoveMilestone = (id: number) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    setRemoveMilestoneConfirm(null);
    if (expandedMilestone === id) setExpandedMilestone(null);
    showToast('Milestone removed');
  };

  const handleEditMilestone = () => {
    if (!editMilestoneModal || !editTitle.trim()) return;
    setMilestones(prev => prev.map(m => {
      if (m.id !== editMilestoneModal.id) return m;
      return {
        ...m,
        title: editTitle.trim(),
        description: editDesc.trim() || m.description,
        startDate: editStart || m.startDate,
        dueDate: editDue || m.dueDate,
        payment: editPayment ? `$${parseFloat(editPayment).toFixed(2)}` : m.payment,
      };
    }));
    setEditMilestoneModal(null);
    showToast('Milestone updated');
  };

  const handleMarkComplete = (milestone: Milestone) => {
    setMarkCompleteModal({ milestone });
    setMarkCompleteNote('');
    setMarkCompleteRequestPayment(true);
    setMarkCompleteNotifyHomeowner(true);
    setMarkCompleteStep('confirm');
  };

  const handleConfirmMarkComplete = () => {
    if (!markCompleteModal) return;
    setMarkCompleteStep('processing');
    setTimeout(() => {
      setMilestones(prev => prev.map(m => {
        if (m.id !== markCompleteModal.milestone.id) return m;
        return {
          ...m,
          status: 'awaiting-approval' as const,
          completionPercent: 100,
          tasks: m.tasks.map(t => ({ ...t, completed: true })),
          paymentStatus: 'pending-approval' as const,
          notes: markCompleteNote.trim() || m.notes,
          approvals: m.approvals.map(a => a.type === 'homeowner' && a.status === 'not-required' ? { ...a, status: 'pending' as const, title: a.title || 'Milestone Completion Approval' } : a),
        };
      }));
      setMarkCompleteStep('success');
    }, 1800);
  };

  const handleCloseMarkComplete = () => { setMarkCompleteModal(null); setMarkCompleteStep('confirm'); };

  const handleAddNote = (milestone: Milestone) => {
    setAddNoteModal({ milestoneId: milestone.id, milestoneTitle: milestone.title });
    setAddNoteText(milestone.notes || '');
    setAddNoteSuccess(false);
  };

  const handleSaveNote = () => {
    if (!addNoteModal) return;
    setMilestones(prev => prev.map(m => m.id === addNoteModal.milestoneId ? { ...m, notes: addNoteText.trim() } : m));
    setAddNoteSuccess(true);
    setTimeout(() => { setAddNoteModal(null); setAddNoteText(''); setAddNoteSuccess(false); }, 1200);
  };

  // Photo handlers
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); };
  const handleUploadSubmit = () => { setUploadSuccess(true); setTimeout(() => { setUploadModal(null); setUploadCaption(''); setUploadTag('during'); setUploadPreview(null); setUploadSuccess(false); }, 1500); };
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxPhoto) return;
    const { photo, milestonePhotos } = lightboxPhoto;
    const idx = milestonePhotos.findIndex(p => p.id === photo.id);
    const newIdx = direction === 'prev' ? (idx - 1 + milestonePhotos.length) % milestonePhotos.length : (idx + 1) % milestonePhotos.length;
    setLightboxPhoto({ photo: milestonePhotos[newIdx], milestonePhotos });
  };
  const getFilteredPhotos = (photos: Photo[]) => photoFilter === 'all' ? photos : photos.filter(p => p.tag === photoFilter);

  // Style helpers
  const getMilestoneStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-500', ring: 'ring-green-200', icon: 'ri-check-line', badge: 'bg-green-100 text-green-700', line: 'bg-green-400' };
      case 'in-progress': return { bg: 'bg-[#00B8A9]', ring: 'ring-[#00B8A9]/30', icon: 'ri-loader-4-line', badge: 'bg-[#00B8A9]/10 text-[#00B8A9]', line: 'bg-gray-200' };
      case 'awaiting-approval': return { bg: 'bg-orange-400', ring: 'ring-orange-200', icon: 'ri-time-line', badge: 'bg-orange-100 text-orange-700', line: 'bg-gray-200' };
      case 'pending': return { bg: 'bg-gray-300', ring: 'ring-gray-100', icon: 'ri-time-line', badge: 'bg-gray-100 text-gray-600', line: 'bg-gray-200' };
      case 'blocked': return { bg: 'bg-red-400', ring: 'ring-red-100', icon: 'ri-lock-line', badge: 'bg-red-100 text-red-600', line: 'bg-gray-200' };
      default: return { bg: 'bg-gray-300', ring: 'ring-gray-100', icon: 'ri-time-line', badge: 'bg-gray-100 text-gray-600', line: 'bg-gray-200' };
    }
  };
  const getStatusLabel = (s: string) => s === 'awaiting-approval' ? 'Awaiting Approval' : s.replace('-', ' ');
  const getApprovalIcon = (type: string) => { switch (type) { case 'homeowner': return 'ri-user-heart-line'; case 'inspector': return 'ri-shield-check-line'; case 'contractor': return 'ri-tools-line'; default: return 'ri-settings-3-line'; } };
  const getApprovalStatusStyle = (s: string) => { switch (s) { case 'approved': return 'bg-green-100 text-green-700'; case 'pending': return 'bg-orange-100 text-orange-700'; case 'rejected': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-500'; } };
  const getPaymentStatusStyle = (s: string) => { switch (s) { case 'released': return 'bg-green-100 text-green-700'; case 'pending-approval': return 'bg-orange-100 text-orange-700'; case 'pending': return 'bg-gray-100 text-gray-600'; case 'held': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-600'; } };
  const getPaymentStatusLabel = (s: string) => { switch (s) { case 'released': return 'Released'; case 'pending-approval': return 'Awaiting Approval'; case 'pending': return 'Pending'; case 'held': return 'Held'; default: return s; } };

  return (
    <div className="space-y-6">
      {/* View Toggle + Add Milestone */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'milestones', label: 'Milestones', icon: 'ri-flag-line' },
            { id: 'approvals', label: 'Approvals', icon: 'ri-shield-check-line', badge: pendingApprovalCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${activeView === tab.id ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className={`${tab.icon} text-base`}></i>{tab.label}
              {tab.badge && tab.badge > 0 && <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B7C8F] flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}><i className="ri-camera-line"></i>{totalPhotos} photos</span>
          <button
            onClick={() => setAddMilestoneModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-add-line"></i>Add Milestone
          </button>
        </div>
      </div>

      {/* Awaiting Approval Banner */}
      {milestones.some(m => m.status === 'awaiting-approval') && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-time-line text-orange-600 text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {milestones.filter(m => m.status === 'awaiting-approval').length} milestone{milestones.filter(m => m.status === 'awaiting-approval').length > 1 ? 's' : ''} awaiting homeowner approval
            </p>
            <p className="text-xs text-orange-700 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              The homeowner will review and approve from their dashboard. Payment will be released upon approval.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B1F33] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><i className="ri-bar-chart-box-line text-[#D4B483]"></i></div>
            <span className="text-xs text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>Overall</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{overallPercent}%</p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2"><div className="bg-[#00B8A9] h-1.5 rounded-full" style={{ width: `${overallPercent}%` }}></div></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i className="ri-flag-line text-green-600"></i></div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Milestones</span>
          </div>
          <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{completedMilestones}/{milestones.length}<span className="text-xs font-normal text-[#6B7C8F] ml-1">done</span></p>
          {inProgressMilestones > 0 && <p className="text-xs text-[#00B8A9] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{inProgressMilestones} active</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center"><i className="ri-checkbox-circle-line text-[#00B8A9]"></i></div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Tasks</span>
          </div>
          <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{completedTasks}/{totalTasks}<span className="text-xs font-normal text-[#6B7C8F] ml-1">complete</span></p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2"><div className="bg-[#00B8A9] h-1.5 rounded-full" style={{ width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }}></div></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#D4B483]/20 rounded-lg flex items-center justify-center"><i className="ri-money-dollar-circle-line text-[#D4B483]"></i></div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Payments</span>
          </div>
          <p className="text-lg font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${releasedPayment.toLocaleString()}</p>
          <p className="text-xs text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>of ${totalPayment.toLocaleString()} total</p>
        </div>
      </div>

      {/* MILESTONES VIEW */}
      {activeView === 'milestones' && (
        <div className="space-y-0">
          {milestones.map((milestone, index) => {
            const style = getMilestoneStatusStyle(milestone.status);
            const isExpanded = expandedMilestone === milestone.id;
            const isLast = index === milestones.length - 1;
            const completedTaskCount = milestone.tasks.filter(t => t.completed).length;
            const pendingApprovals = milestone.approvals.filter(a => a.status === 'pending').length;
            const filteredPhotos = getFilteredPhotos(milestone.photos);
            const isEditable = milestone.status !== 'completed' && milestone.status !== 'awaiting-approval';

            return (
              <div key={milestone.id} className="relative flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
                  <div className={`w-8 h-8 rounded-full ${style.bg} ring-4 ${style.ring} flex items-center justify-center z-10 flex-shrink-0`}>
                    <i className={`${style.icon} text-white text-sm ${milestone.status === 'in-progress' ? 'animate-spin' : ''}`}></i>
                  </div>
                  {!isLast && <div className={`w-0.5 flex-1 ${style.line} min-h-[24px]`}></div>}
                </div>

                {/* Card */}
                <div className={`flex-1 mb-4 bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${milestone.status === 'in-progress' ? 'border-[#00B8A9]/40' : milestone.status === 'awaiting-approval' ? 'border-orange-300' : 'border-gray-100'}`}>
                  <div className="p-4 cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors" onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{milestone.title}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.badge}`}>{getStatusLabel(milestone.status)}</span>
                          {pendingApprovals > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1"><i className="ri-shield-check-line text-xs"></i>{pendingApprovals} pending</span>}
                          {milestone.photos.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0B1F33]/5 text-[#0B1F33] flex items-center gap-1"><i className="ri-camera-line text-xs"></i>{milestone.photos.length}</span>}
                        </div>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{milestone.payment}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(milestone.paymentStatus)}`}>{getPaymentStatusLabel(milestone.paymentStatus)}</span>
                        </div>
                        <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-[#6B7C8F] text-lg`}></i>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${milestone.status === 'completed' ? 'bg-green-500' : milestone.status === 'awaiting-approval' ? 'bg-orange-400' : milestone.status === 'blocked' ? 'bg-red-400' : 'bg-[#00B8A9]'}`} style={{ width: `${milestone.completionPercent}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-[#0B1F33] w-10 text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>{milestone.completionPercent}%</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>{milestone.startDate} — {milestone.dueDate}</span>
                      <span className="flex items-center gap-1"><i className="ri-checkbox-circle-line"></i>{completedTaskCount}/{milestone.tasks.length} tasks</span>
                      {milestone.completedDate && <span className="flex items-center gap-1 text-green-600"><i className="ri-check-double-line"></i>Completed {milestone.completedDate}</span>}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-5">
                      {/* Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-list-check-2 text-[#00B8A9]"></i>Tasks ({completedTaskCount}/{milestone.tasks.length})
                          </h6>
                          {isEditable && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setAddTaskMilestoneId(milestone.id); setNewTaskTitle(''); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap transition-colors"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <i className="ri-add-line"></i>Add Task
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {milestone.tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F9F9FB] transition-colors group">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleTask(milestone.id, task.id); }}
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${task.completed ? 'bg-green-500' : 'border-2 border-gray-300 hover:border-[#00B8A9]'}`}
                              >
                                {task.completed && <i className="ri-check-line text-white text-xs"></i>}
                              </button>
                              <span className={`text-sm flex-1 ${task.completed ? 'text-[#6B7C8F] line-through' : 'text-[#0B1F33]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{task.title}</span>
                              {task.assignee && <span className="text-xs text-[#6B7C8F] bg-[#F9F9FB] px-2 py-1 rounded-full flex-shrink-0">{task.assignee}</span>}
                              {isEditable && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemoveTask(milestone.id, task.id); }}
                                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                >
                                  <i className="ri-close-line text-sm"></i>
                                </button>
                              )}
                            </div>
                          ))}
                          {/* Inline add task */}
                          {addTaskMilestoneId === milestone.id && (
                            <div className="flex items-center gap-2 p-2.5 bg-[#F9F9FB] rounded-lg" onClick={e => e.stopPropagation()}>
                              <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300 flex-shrink-0"></div>
                              <input
                                type="text"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(milestone.id); if (e.key === 'Escape') setAddTaskMilestoneId(null); }}
                                placeholder="Enter task name and press Enter..."
                                className="flex-1 bg-transparent text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddTask(milestone.id)}
                                className="px-2.5 py-1 bg-[#00B8A9] text-white rounded-md text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >Add</button>
                              <button
                                onClick={() => setAddTaskMilestoneId(null)}
                                className="px-2 py-1 text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer text-xs"
                              >Cancel</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photos */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-camera-line text-[#00B8A9]"></i>Progress Photos ({milestone.photos.length})
                          </h6>
                          <button
                            onClick={(e) => { e.stopPropagation(); setUploadModal({ milestoneId: milestone.id, milestoneTitle: milestone.title }); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-upload-2-line"></i>Upload Photos
                          </button>
                        </div>
                        {milestone.photos.length > 0 ? (
                          <>
                            <div className="flex gap-1.5 mb-3 flex-wrap">
                              {[{ id: 'all', label: 'All' }, { id: 'before', label: 'Before' }, { id: 'during', label: 'In Progress' }, { id: 'after', label: 'After' }, { id: 'issue', label: 'Issues' }, { id: 'material', label: 'Materials' }].map(f => {
                                const count = f.id === 'all' ? milestone.photos.length : milestone.photos.filter(p => p.tag === f.id).length;
                                if (f.id !== 'all' && count === 0) return null;
                                return (
                                  <button
                                    key={f.id}
                                    onClick={(e) => { e.stopPropagation(); setPhotoFilter(f.id as any); }}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${photoFilter === f.id ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                  >
                                    {f.label} ({count})
                                  </button>
                                );
                              })}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {filteredPhotos.map(photo => {
                                const tagStyle = photoTagStyles[photo.tag];
                                return (
                                  <div
                                    key={photo.id}
                                    className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-[#00B8A9]/30"
                                    onClick={(e) => { e.stopPropagation(); setLightboxPhoto({ photo, milestonePhotos: filteredPhotos }); }}
                                  >
                                    <div className="w-full h-32 bg-gray-100"><img src={photo.url} alt={photo.caption} className="w-full h-full object-cover object-top" /></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                      <p className="text-white text-xs font-semibold leading-tight truncate w-full">{photo.caption}</p>
                                    </div>
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${tagStyle.bg} ${tagStyle.text}`}>{tagStyle.label}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="bg-[#F9F9FB] rounded-xl p-6 text-center border border-dashed border-gray-200">
                            <i className="ri-camera-off-line text-[#6B7C8F] text-2xl mb-2"></i>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>No photos yet</p>
                          </div>
                        )}
                      </div>

                      {/* Approvals */}
                      {milestone.approvals.filter(a => a.status !== 'not-required').length > 0 && (
                        <div>
                          <h6 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-shield-check-line text-[#D4B483]"></i>Approvals
                          </h6>
                          <div className="space-y-2">
                            {milestone.approvals.filter(a => a.status !== 'not-required').map(approval => (
                              <div key={approval.id} className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${approval.status === 'approved' ? 'bg-green-100' : approval.status === 'pending' ? 'bg-orange-100' : 'bg-red-100'}`}>
                                  <i className={`${getApprovalIcon(approval.type)} ${approval.status === 'approved' ? 'text-green-600' : approval.status === 'pending' ? 'text-orange-600' : 'text-red-600'}`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{approval.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <span className="capitalize">{approval.type}</span>
                                    {approval.approver && <><span>&middot;</span><span>{approval.approver}</span></>}
                                    {approval.date && <><span>&middot;</span><span>{approval.date}</span></>}
                                  </div>
                                  {approval.note && <p className="text-xs text-[#6B7C8F] mt-1 italic">&ldquo;{approval.note}&rdquo;</p>}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${getApprovalStatusStyle(approval.status)}`}>{approval.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {milestone.notes && (
                        <div className="bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-lg p-3 flex items-start gap-2">
                          <i className="ri-sticky-note-line text-[#D4B483] mt-0.5"></i>
                          <p className="text-xs text-[#0B1F33] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>{milestone.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {milestone.status === 'in-progress' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkComplete(milestone); }}
                            className="px-4 py-2 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-check-line"></i>Submit for Approval
                          </button>
                        )}
                        {milestone.status === 'awaiting-approval' && (
                          <div className="px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-time-line"></i>Waiting for Homeowner Approval
                          </div>
                        )}
                        {(milestone.status === 'in-progress' || milestone.status === 'pending') && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setUploadModal({ milestoneId: milestone.id, milestoneTitle: milestone.title }); }}
                              className="px-4 py-2 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <i className="ri-upload-2-line"></i>Upload Photos
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddNote(milestone); }}
                              className="px-4 py-2 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <i className="ri-edit-line"></i>{milestone.notes ? 'Edit Note' : 'Add Note'}
                            </button>
                          </>
                        )}
                        {isEditable && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditMilestoneModal(milestone); setEditTitle(milestone.title); setEditDesc(milestone.description); setEditStart(milestone.startDate); setEditDue(milestone.dueDate); setEditPayment(milestone.payment.replace(/[$,]/g, '')); }}
                              className="px-3 py-2 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <i className="ri-pencil-line"></i>Edit
                            </button>
                            {milestone.status === 'pending' && milestone.tasks.length === 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setRemoveMilestoneConfirm(milestone.id); }}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                <i className="ri-delete-bin-line"></i>Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {milestones.length === 0 && (
            <div className="bg-[#F9F9FB] rounded-xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-flag-line text-[#6B7C8F] text-3xl"></i></div>
              <h5 className="font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Milestones Yet</h5>
              <p className="text-sm text-[#6B7C8F] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Add milestones to track project progress and payments.</p>
              <button
                onClick={() => setAddMilestoneModal(true)}
                className="px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg text-sm font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-add-line"></i>Add First Milestone
              </button>
            </div>
          )}
        </div>
      )}

      {/* APPROVALS VIEW */}
      {activeView === 'approvals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setApprovalFilter('pending')}>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-1"><i className="ri-time-line text-orange-600"></i></div>
              <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{pendingApprovalCount}</p>
              <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>Pending</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setApprovalFilter('approved')}>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-1"><i className="ri-check-double-line text-green-600"></i></div>
              <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{approvedCount}</p>
              <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>Approved</p>
            </div>
            <div className="bg-[#F9F9FB] border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setApprovalFilter('all')}>
              <div className="w-8 h-8 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mb-1"><i className="ri-list-check text-[#0B1F33]"></i></div>
              <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{allApprovals.filter(a => a.status !== 'not-required').length}</p>
              <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Total</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[{ id: 'all', label: 'All Active' }, { id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' }, { id: 'rejected', label: 'Rejected' }].map(f => (
              <button
                key={f.id}
                onClick={() => setApprovalFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${approvalFilter === f.id ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >{f.label}</button>
            ))}
          </div>
          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-shield-check-line text-[#6B7C8F] text-3xl"></i></div>
              <h5 className="font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Approvals Found</h5>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((approval, idx) => (
                <div key={`${approval.milestoneId}-${approval.id}-${idx}`} className={`bg-white rounded-xl border shadow-sm p-4 ${approval.status === 'pending' ? 'border-orange-200' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${approval.status === 'approved' ? 'bg-green-100' : approval.status === 'pending' ? 'bg-orange-100' : 'bg-red-100'}`}>
                      <i className={`${getApprovalIcon(approval.type)} text-lg ${approval.status === 'approved' ? 'text-green-600' : approval.status === 'pending' ? 'text-orange-600' : 'text-red-600'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{approval.title}</h5>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getApprovalStatusStyle(approval.status)}`}>{approval.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <span className="flex items-center gap-1"><i className="ri-flag-line"></i>{approval.milestoneName}</span>
                        {approval.approver && <span className="flex items-center gap-1"><i className="ri-user-line"></i>{approval.approver}</span>}
                        {approval.date && <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>{approval.date}</span>}
                      </div>
                    </div>
                    {approval.status === 'pending' && (
                      <button className="px-3 py-2 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <i className="ri-send-plane-line"></i>Send Reminder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="font-bold text-[#0B1F33] text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <i className="ri-money-dollar-circle-line text-[#D4B483]"></i>Payment Schedule
        </h4>
        <div className="space-y-3">
          {milestones.map(m => (
            <div key={m.id} className="flex items-center gap-4 p-3 bg-[#F9F9FB] rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.paymentStatus === 'released' ? 'bg-green-500' : m.paymentStatus === 'pending-approval' ? 'bg-orange-400' : 'bg-gray-300'}`}>
                {m.paymentStatus === 'released' ? <i className="ri-check-line text-white text-sm"></i> : m.paymentStatus === 'pending-approval' ? <i className="ri-time-line text-white text-sm"></i> : <i className="ri-lock-line text-white text-sm"></i>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0B1F33] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.title}</p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Due: {m.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.payment}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(m.paymentStatus)}`}>{getPaymentStatusLabel(m.paymentStatus)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Total</span>
          <div className="text-right">
            <span className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>${totalPayment.toLocaleString()}</span>
            <span className="text-xs text-green-600 ml-2" style={{ fontFamily: 'Inter, sans-serif' }}>(${releasedPayment.toLocaleString()} released)</span>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* ADD MILESTONE MODAL */}
      {addMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAddMilestoneModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-xl flex items-center justify-center"><i className="ri-flag-line text-[#00B8A9] text-xl"></i></div>
                  <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Add Milestone</h3>
                </div>
                <button onClick={() => setAddMilestoneModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-[#6B7C8F] text-lg"></i></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={e => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g., Foundation Repair"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</label>
                <textarea
                  value={newMilestoneDesc}
                  onChange={e => { if (e.target.value.length <= 500) setNewMilestoneDesc(e.target.value); }}
                  placeholder="Describe the work involved..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start Date</label>
                  <input
                    type="text"
                    value={newMilestoneStart}
                    onChange={e => setNewMilestoneStart(e.target.value)}
                    placeholder="e.g., Feb 1, 2025"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Due Date</label>
                  <input
                    type="text"
                    value={newMilestoneDue}
                    onChange={e => setNewMilestoneDue(e.target.value)}
                    placeholder="e.g., Feb 5, 2025"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment Amount ($)</label>
                <input
                  type="number"
                  value={newMilestonePayment}
                  onChange={e => setNewMilestonePayment(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setAddMilestoneModal(false)} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestoneTitle.trim()}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${newMilestoneTitle.trim() ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-add-line"></i>Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MILESTONE MODAL */}
      {editMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditMilestoneModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Edit Milestone</h3>
                <button onClick={() => setEditMilestoneModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-[#6B7C8F] text-lg"></i></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => { if (e.target.value.length <= 500) setEditDesc(e.target.value); }}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start Date</label>
                  <input
                    type="text"
                    value={editStart}
                    onChange={e => setEditStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Due Date</label>
                  <input
                    type="text"
                    value={editDue}
                    onChange={e => setEditDue(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment ($)</label>
                <input
                  type="number"
                  value={editPayment}
                  onChange={e => setEditPayment(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditMilestoneModal(null)} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
              <button onClick={handleEditMilestone} className="px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg text-sm font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <i className="ri-save-line"></i>Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MILESTONE CONFIRM */}
      {removeMilestoneConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRemoveMilestoneConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-600 text-2xl"></i></div>
            <h4 className="font-bold text-[#0B1F33] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Remove Milestone?</h4>
            <p className="text-sm text-[#6B7C8F] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>This action cannot be undone. The milestone and all associated data will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setRemoveMilestoneConfirm(null)} className="px-5 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
              <button onClick={() => handleRemoveMilestone(removeMilestoneConfirm)} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <i className="ri-delete-bin-line"></i>Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK COMPLETE / SUBMIT FOR APPROVAL MODAL */}
      {markCompleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleCloseMarkComplete}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {markCompleteStep === 'processing' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 border-4 border-[#00B8A9]/20 border-t-[#00B8A9] rounded-full animate-spin mx-auto mb-5"></div>
                <h4 className="font-bold text-[#0B1F33] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Submitting for Approval...</h4>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Notifying homeowner for review</p>
              </div>
            ) : markCompleteStep === 'success' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5"><i className="ri-send-plane-line text-orange-600 text-3xl"></i></div>
                <h4 className="font-bold text-[#0B1F33] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Submitted for Approval!</h4>
                <p className="text-sm text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}><strong>{markCompleteModal.milestone.title}</strong> has been sent to the homeowner for review.</p>
                <p className="text-xs text-orange-600 mt-2 flex items-center justify-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}><i className="ri-time-line"></i>Payment of {markCompleteModal.milestone.payment} will be released upon approval</p>
                <button onClick={handleCloseMarkComplete} className="mt-6 px-6 py-2.5 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#0B1F33]/90 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Done</button>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><i className="ri-send-plane-line text-orange-600 text-xl"></i></div>
                      <div>
                        <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Submit for Homeowner Approval</h3>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{markCompleteModal.milestone.title}</p>
                      </div>
                    </div>
                    <button onClick={handleCloseMarkComplete} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-[#6B7C8F] text-lg"></i></button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {markCompleteModal.milestone.tasks.filter(t => !t.completed).length > 0 && (
                    <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <i className="ri-alert-line text-amber-600 mt-0.5"></i>
                      <div>
                        <p className="text-xs font-semibold text-amber-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{markCompleteModal.milestone.tasks.filter(t => !t.completed).length} of {markCompleteModal.milestone.tasks.length} tasks incomplete</p>
                        <p className="text-xs text-amber-700 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Submitting will auto-check all remaining tasks.</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/10 rounded-lg p-3 flex items-start gap-2.5">
                    <i className="ri-information-line text-[#0B1F33] mt-0.5"></i>
                    <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>The homeowner will review this milestone from their dashboard. Once approved, payment of <strong>{markCompleteModal.milestone.payment}</strong> will be released.</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg">
                    <div className="w-9 h-9 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0"><i className="ri-money-dollar-circle-line text-[#D4B483]"></i></div>
                    <div className="flex-1">
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Milestone Payment</p>
                      <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{markCompleteModal.milestone.payment}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00B8A9]/40 transition-colors">
                      <input type="checkbox" checked={markCompleteRequestPayment} onChange={e => setMarkCompleteRequestPayment(e.target.checked)} className="w-4 h-4 accent-[#00B8A9] cursor-pointer" />
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Request payment release</p>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Submit {markCompleteModal.milestone.payment} for homeowner approval</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#00B8A9]/40 transition-colors">
                      <input type="checkbox" checked={markCompleteNotifyHomeowner} onChange={e => setMarkCompleteNotifyHomeowner(e.target.checked)} className="w-4 h-4 accent-[#00B8A9] cursor-pointer" />
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Notify homeowner</p>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Send notification via email &amp; app</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Completion Note <span className="font-normal text-[#6B7C8F]">(optional)</span></label>
                    <textarea
                      value={markCompleteNote}
                      onChange={e => { if (e.target.value.length <= 500) setMarkCompleteNote(e.target.value); }}
                      placeholder="Add any notes for the homeowner..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-[#6B7C8F] text-right mt-1">{markCompleteNote.length}/500</p>
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={handleCloseMarkComplete} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                  <button onClick={handleConfirmMarkComplete} className="px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg text-sm font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <i className="ri-send-plane-line"></i>Submit for Approval
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {addNoteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setAddNoteModal(null); setAddNoteText(''); setAddNoteSuccess(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {addNoteSuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-check-line text-green-600 text-3xl"></i></div>
                <h4 className="font-bold text-[#0B1F33] text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Note Saved!</h4>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{milestones.find(m => m.id === addNoteModal.milestoneId)?.notes ? 'Edit Note' : 'Add Note'}</h3>
                      <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{addNoteModal.milestoneTitle}</p>
                    </div>
                    <button onClick={() => { setAddNoteModal(null); setAddNoteText(''); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-[#6B7C8F] text-lg"></i></button>
                  </div>
                </div>
                <div className="p-5">
                  <textarea
                    value={addNoteText}
                    onChange={e => { if (e.target.value.length <= 500) setAddNoteText(e.target.value); }}
                    placeholder="Add a note about this milestone..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <p className="text-xs text-[#6B7C8F] text-right mt-1">{addNoteText.length}/500</p>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => { setAddNoteModal(null); setAddNoteText(''); }} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                  <button
                    onClick={handleSaveNote}
                    disabled={!addNoteText.trim()}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${addNoteText.trim() ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-save-line"></i>Save Note
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PHOTO UPLOAD MODAL */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setUploadModal(null); setUploadPreview(null); setUploadCaption(''); setUploadSuccess(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Progress Photo</h3>
                  <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{uploadModal.milestoneTitle}</p>
                </div>
                <button onClick={() => { setUploadModal(null); setUploadPreview(null); setUploadCaption(''); setUploadSuccess(false); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-[#6B7C8F] text-lg"></i></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {uploadSuccess ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-check-line text-green-600 text-3xl"></i></div>
                  <h4 className="font-bold text-[#0B1F33] text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Photo Uploaded!</h4>
                </div>
              ) : (
                <>
                  {uploadPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <div className="w-full h-56 bg-gray-100"><img src={uploadPreview} alt="Upload preview" className="w-full h-full object-contain" /></div>
                      <button onClick={() => setUploadPreview(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70"><i className="ri-close-line text-white text-sm"></i></button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-[#00B8A9] bg-[#00B8A9]/5' : 'border-gray-200 hover:border-[#00B8A9]/50'}`}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-14 h-14 bg-[#00B8A9]/10 rounded-full flex items-center justify-center mx-auto mb-3"><i className="ri-image-add-line text-[#00B8A9] text-2xl"></i></div>
                      <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{isDragging ? 'Drop your photo here' : 'Drag &amp; drop or click to upload'}</p>
                      <p className="text-xs text-[#6B7C8F]">JPG, PNG, HEIC up to 25MB</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Caption</label>

                    <input type="text" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Describe what this photo shows..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9]" style={{ fontFamily: 'Inter, sans-serif' }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B1F33] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>Photo Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.entries(photoTagStyles) as [Photo['tag'], typeof photoTagStyles[string]][]).map(([key, s]) => (
                        <button key={key} onClick={() => setUploadTag(key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${uploadTag === key ? `${s.bg} ${s.text} border-current` : 'bg-[#F9F9FB] text-[#6B7C8F] border-transparent hover:bg-gray-200'}`}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!uploadSuccess && (
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => { setUploadModal(null); setUploadPreview(null); setUploadCaption(''); }} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                <button onClick={handleUploadSubmit} disabled={!uploadPreview}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${uploadPreview ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}><i className="ri-upload-2-line"></i>Upload Photo</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={() => setLightboxPhoto(null)}>
          <div className="flex items-center justify-between p-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${photoTagStyles[lightboxPhoto.photo.tag].bg} ${photoTagStyles[lightboxPhoto.photo.tag].text}`}>{photoTagStyles[lightboxPhoto.photo.tag].label}</span>
              <span className="text-white/70 text-sm">{lightboxPhoto.milestonePhotos.findIndex(p => p.id === lightboxPhoto.photo.id) + 1} of {lightboxPhoto.milestonePhotos.length}</span>
            </div>
            <button onClick={() => setLightboxPhoto(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"><i className="ri-close-line text-white text-xl"></i></button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-16 min-h-0" onClick={e => e.stopPropagation()}>
            {lightboxPhoto.milestonePhotos.length > 1 && (
              <button onClick={() => navigateLightbox('prev')} className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer z-10"><i className="ri-arrow-left-s-line text-white text-2xl"></i></button>
            )}
            <img src={lightboxPhoto.photo.url} alt={lightboxPhoto.photo.caption} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            {lightboxPhoto.milestonePhotos.length > 1 && (
              <button onClick={() => navigateLightbox('next')} className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer z-10"><i className="ri-arrow-right-s-line text-white text-2xl"></i></button>
            )}
          </div>
          <div className="p-4 flex-shrink-0 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{lightboxPhoto.photo.caption}</p>
            <div className="flex items-center justify-center gap-3 text-white/50 text-xs">
              <span><i className="ri-user-line mr-1"></i>{lightboxPhoto.photo.uploadedBy}</span>
              <span>&middot;</span>
              <span><i className="ri-time-line mr-1"></i>{lightboxPhoto.photo.uploadedAt}</span>
            </div>
            {lightboxPhoto.milestonePhotos.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {lightboxPhoto.milestonePhotos.map(p => (
                  <button key={p.id} onClick={() => setLightboxPhoto({ ...lightboxPhoto, photo: p })}
                    className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all border-2 ${p.id === lightboxPhoto.photo.id ? 'border-[#00B8A9] opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    <img src={p.url} alt={p.caption} className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="ri-check-line text-[#00B8A9]"></i>
          <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
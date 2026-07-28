import { useState } from 'react';

interface HomeownerProgressViewProps {
  jobId: number;
  jobTitle: string;
  contractor: string;
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
  contractorNote?: string;
}

const initialData: Record<
  number,
  { milestones: Milestone[]; overallPercent: number }
> = {
  1: {
    overallPercent: 65,
    milestones: [
      {
        id: 1,
        title: 'Initial Assessment & Planning',
        description:
          'Site inspection, moisture readings, scope documentation, and remediation plan approval.',
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
          {
            id: 1,
            title: 'Remediation Plan Approval',
            type: 'homeowner',
            status: 'approved',
            date: 'Jan 15, 2025',
            approver: 'You'
          }
        ],
        photos: [
          {
            id: 1,
            url:
              'https://readdy.ai/api/search-image?query=crawlspace%20with%20visible%20moisture%20damage%20on%20wooden%20beams%20and%20floor%20joists%20dark%20damp%20environment%20with%20condensation%20droplets%20professional%20inspection%20photo%20with%20flashlight%20illumination%20showing%20water%20stains%20and%20mold%20growth&width=640&height=480&seq=prog1&orientation=landscape',
            caption: 'Initial moisture damage — east wall joists',
            uploadedBy: 'Mike Thompson',
            uploadedAt: 'Jan 15, 2025 9:14 AM',
            tag: 'before'
          },
          {
            id: 2,
            url:
              'https://readdy.ai/api/search-image?query=digital%20moisture%20meter%20reading%20on%20wooden%20beam%20in%20crawlspace%20showing%20high%20humidity%20levels%20professional%20contractor%20hand%20holding%20device%20against%20damp%20wood%20surface%20close%20up%20inspection%20photo&width=640&height=480&seq=prog2&orientation=landscape',
            caption: 'Moisture reading 78% — beam section B3',
            uploadedBy: 'Mike Thompson',
            uploadedAt: 'Jan 15, 2025 9:32 AM',
            tag: 'before'
          }
        ]
      },
      {
        id: 2,
        title: 'Vapor Barrier Installation',
        description:
          'Remove old barrier, prep surfaces, install 6-mil vapor barrier with sealed seams.',
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
          {
            id: 1,
            title: 'Barrier Installation Inspection',
            type: 'homeowner',
            status: 'approved',
            date: 'Jan 17, 2025',
            approver: 'You'
          }
        ],
        photos: [
          {
            id: 1,
            url:
              'https://readdy.ai/api/search-image?query=new%20white%20vapor%20barrier%20plastic%20sheeting%20installed%20in%20crawlspace%20with%20sealed%20seams%20using%20butyl%20tape%20clean%20professional%20installation%20secured%20to%20foundation%20walls%20bright%20work%20lights%20showing%20quality%20finish&width=640&height=480&seq=prog6&orientation=landscape',
            caption: 'New 6-mil vapor barrier — installation complete',
            uploadedBy: 'Mike Thompson',
            uploadedAt: 'Jan 17, 2025 11:30 AM',
            tag: 'after'
          }
        ]
      },
      {
        id: 3,
        title: 'Dehumidifier Setup & Calibration',
        description:
          'Install 70-pint dehumidifier, connect drainage, calibrate humidity targets.',
        status: 'awaiting-approval',
        completionPercent: 100,
        startDate: 'Jan 19, 2025',
        dueDate: 'Jan 22, 2025',
        payment: '$990.00',
        paymentStatus: 'pending-approval',
        tasks: [
          { id: 1, title: 'Position dehumidifier unit', completed: true },
          { id: 2, title: 'Connect condensate drain line', completed: true },
          { id: 3, title: 'Wire electrical connection', completed: true },
          { id: 4, title: 'Calibrate humidity target (45-50%)', completed: true },
          { id: 5, title: 'Run 24-hour test cycle', completed: true }
        ],
        approvals: [{ id: 1, title: 'Milestone Completion Approval', type: 'homeowner', status: 'pending' }],
        photos: [
          {
            id: 1,
            url:
              'https://readdy.ai/api/search-image?query=commercial%20dehumidifier%20unit%20positioned%20in%20crawlspace%20on%20vapor%20barrier%20with%20condensate%20drain%20line%20connected%20professional%20HVAC%20equipment%20installation%20well%20lit%20clean%20workspace&width=640&height=480&seq=prog8&orientation=landscape',
            caption: 'Dehumidifier positioned and drain connected',
            uploadedBy: 'Mike Thompson',
            uploadedAt: 'Jan 19, 2025 10:00 AM',
            tag: 'during'
          }
        ],
        contractorNote:
          'All tasks completed. 24-hour test cycle passed — humidity levels stable at 47%. Ready for your review.',
        notes: 'Waiting on homeowner approval to release payment.'
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
        approvals: [],
        photos: []
      },
      {
        id: 5,
        title: 'Final Inspection & Testing',
        description: 'Complete moisture readings, verify all systems, final walkthrough.',
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
        approvals: [],
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
        approvals: [
          {
            id: 1,
            title: 'Appointment Confirmation',
            type: 'homeowner',
            status: 'approved',
            date: 'Jan 20, 2025',
            approver: 'You'
          }
        ],
        photos: []
      },
      {
        id: 2,
        title: 'On-Site Diagnostic & Assessment',
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
          { id: 5, title: 'Provide diagnostic report', completed: false }
        ],
        approvals: [],
        photos: []
      }
    ]
  },
  3: {
    overallPercent: 5,
    milestones: [
      {
        id: 1,
        title: 'Roof Inspection & Prep',
        description: 'Inspect damaged area, order materials, prep work site.',
        status: 'awaiting-approval',
        completionPercent: 100,
        startDate: 'Feb 5, 2025',
        dueDate: 'Feb 5, 2025',
        payment: '$800.00',
        paymentStatus: 'pending-approval',
        tasks: [
          { id: 1, title: 'Inspect damaged shingle area', completed: true },
          { id: 2, title: 'Order matching shingles', completed: true },
          { id: 3, title: 'Set up safety equipment', completed: true }
        ],
        approvals: [{ id: 1, title: 'Inspection Approval', type: 'homeowner', status: 'pending' }],
        photos: [],
        contractorNote:
          'Inspection complete. Damage is isolated to the south-facing section. Materials ordered and arriving tomorrow.'
      }
    ]
  },
  4: {
    overallPercent: 100,
    milestones: [
      {
        id: 1,
        title: 'Water Heater Replacement',
        description: 'Remove old unit, install new 50-gallon water heater.',
        status: 'completed',
        completionPercent: 100,
        startDate: 'Jan 10, 2025',
        dueDate: 'Jan 11, 2025',
        completedDate: 'Jan 11, 2025',
        payment: '$2,100.00',
        paymentStatus: 'released',
        tasks: [
          { id: 1, title: 'Disconnect and remove old unit', completed: true },
          { id: 2, title: 'Install new 50-gallon water heater', completed: true },
          { id: 3, title: 'Connect plumbing and gas lines', completed: true },
          { id: 4, title: 'Test and verify operation', completed: true }
        ],
        approvals: [
          {
            id: 1,
            title: 'Final Approval',
            type: 'homeowner',
            status: 'approved',
            date: 'Jan 11, 2025',
            approver: 'You'
          }
        ],
        photos: []
      }
    ]
  }
};

const photoTagStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  before: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Before' },
  during: {
    bg: 'bg-[#00B8A9]/10',
    text: 'text-[#00B8A9]',
    label: 'In Progress'
  },
  after: { bg: 'bg-green-100', text: 'text-green-700', label: 'After' },
  issue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Issue' },
  material: {
    bg: 'bg-[#D4B483]/20',
    text: 'text-[#D4B483]',
    label: 'Material'
  }
};

export default function HomeownerProgressView({
  jobId,
  jobTitle: _jobTitle,
  contractor
}: HomeownerProgressViewProps) {
  const initial = initialData[jobId] || initialData[1];
  const [milestones, setMilestones] = useState<Milestone[]>(
    initial.milestones
  );
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    photo: Photo;
    milestonePhotos: Photo[];
  } | null>(null);

  // Approval modal
  const [approvalModal, setApprovalModal] = useState<{
    milestone: Milestone;
    action: 'approve' | 'reject';
  } | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalStep, setApprovalStep] = useState<
    'confirm' | 'processing' | 'success'
  >('confirm');
  const [rejectReason, setRejectReason] = useState('');
  const [releasePayment, setReleasePayment] = useState(true);

  // Release held payment modal
  const [releaseModal, setReleaseModal] = useState<{
    milestone: Milestone;
  } | null>(null);
  const [releaseStep, setReleaseStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  void showToast;

  // Computed values
  const totalTasks = milestones.reduce((s, m) => s + m.tasks.length, 0);
  const completedTasks = milestones.reduce(
    (s, m) => s + m.tasks.filter((t) => t.completed).length,
    0
  );
  const completedMilestones = milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const awaitingApproval = milestones.filter(
    (m) => m.status === 'awaiting-approval'
  );
  const overallPercent =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((s, m) => s + m.completionPercent, 0) /
            milestones.length
        )
      : 0;
  const totalPayment = milestones.reduce(
    (s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'),
    0
  );
  const releasedPayment = milestones
    .filter((m) => m.paymentStatus === 'released')
    .reduce(
      (s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'),
      0
    );
  const pendingPayment = milestones
    .filter((m) => m.paymentStatus === 'pending-approval')
    .reduce(
      (s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'),
      0
    );
  const heldPayment = milestones
    .filter((m) => m.paymentStatus === 'held')
    .reduce(
      (s, m) => s + parseFloat(m.payment.replace(/[$,]/g, '') || '0'),
      0
    );

  const handleApprove = (milestone: Milestone) => {
    setApprovalModal({ milestone, action: 'approve' });
    setApprovalNote('');
    setApprovalStep('confirm');
    setReleasePayment(true);
  };

  const handleReject = (milestone: Milestone) => {
    setApprovalModal({ milestone, action: 'reject' });
    setRejectReason('');
    setApprovalStep('confirm');
  };

  const handleConfirmApproval = () => {
    if (!approvalModal) return;
    setApprovalStep('processing');
    setTimeout(() => {
      const isApprove = approvalModal.action === 'approve';
      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id !== approvalModal.milestone.id) return m;
          if (isApprove) {
            return {
              ...m,
              status: 'completed',
              completedDate: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              paymentStatus: releasePayment ? 'released' : 'held',
              approvals: m.approvals.map((a) =>
                a.type === 'homeowner' && a.status === 'pending'
                  ? {
                      ...a,
                      status: 'approved',
                      date: new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }),
                      approver: 'You',
                      note: approvalNote || undefined
                    }
                  : a
              )
            };
          } else {
            return {
              ...m,
              status: 'in-progress',
              completionPercent: Math.round(
                (m.tasks.filter((t) => t.completed).length /
                  Math.max(m.tasks.length, 1)) *
                  100
              ),
              paymentStatus: 'pending',
              approvals: m.approvals.map((a) =>
                a.type === 'homeowner' && a.status === 'pending'
                  ? {
                      ...a,
                      status: 'rejected',
                      date: new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }),
                      approver: 'You',
                      note: rejectReason || undefined
                    }
                  : a
              )
            };
          }
        })
      );
      setApprovalStep('success');
    }, 1500);
  };

  const handleCloseApproval = () => {
    setApprovalModal(null);
    setApprovalStep('confirm');
    setApprovalNote('');
    setRejectReason('');
    setReleasePayment(true);
  };

  const handleOpenReleaseModal = (milestone: Milestone) => {
    setReleaseModal({ milestone });
    setReleaseStep('confirm');
  };

  const handleConfirmRelease = () => {
    if (!releaseModal) return;
    setReleaseStep('processing');
    setTimeout(() => {
      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id !== releaseModal.milestone.id) return m;
          return { ...m, paymentStatus: 'released' };
        })
      );
      setReleaseStep('success');
    }, 1500);
  };

  const handleCloseReleaseModal = () => {
    setReleaseModal(null);
    setReleaseStep('confirm');
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxPhoto) return;
    const { photo, milestonePhotos } = lightboxPhoto;
    const idx = milestonePhotos.findIndex((p) => p.id === photo.id);
    const newIdx =
      direction === 'prev'
        ? (idx - 1 + milestonePhotos.length) % milestonePhotos.length
        : (idx + 1) % milestonePhotos.length;
    setLightboxPhoto({ photo: milestonePhotos[newIdx], milestonePhotos });
  };

  const getMilestoneStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500',
          ring: 'ring-green-200',
          icon: 'ri-check-line',
          badge: 'bg-green-100 text-green-700'
        };
      case 'in-progress':
        return {
          bg: 'bg-[#00B8A9]',
          ring: 'ring-[#00B8A9]/30',
          icon: 'ri-loader-4-line',
          badge: 'bg-[#00B8A9]/10 text-[#00B8A9]'
        };
      case 'awaiting-approval':
        return {
          bg: 'bg-orange-400',
          ring: 'ring-orange-200',
          icon: 'ri-notification-line',
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'pending':
        return {
          bg: 'bg-gray-300',
          ring: 'ring-gray-100',
          icon: 'ri-time-line',
          badge: 'bg-gray-100 text-gray-600'
        };
      case 'blocked':
        return {
          bg: 'bg-red-400',
          ring: 'ring-red-100',
          icon: 'ri-lock-line',
          badge: 'bg-red-100 text-red-600'
        };
      default:
        return {
          bg: 'bg-gray-300',
          ring: 'ring-gray-100',
          icon: 'ri-time-line',
          badge: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const getStatusLabel = (s: string) =>
    s === 'awaiting-approval' ? 'Needs Your Approval' : s.replace('-', ' ');
  const getPaymentStatusStyle = (s: string) => {
    switch (s) {
      case 'released':
        return 'bg-green-100 text-green-700';
      case 'pending-approval':
        return 'bg-orange-100 text-orange-700';
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'held':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  const getPaymentStatusLabel = (s: string) => {
    switch (s) {
      case 'released':
        return 'Released';
      case 'pending-approval':
        return 'Awaiting Your Approval';
      case 'pending':
        return 'Pending';
      case 'held':
        return 'Held';
      default:
        return s;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Required Banner */}
      {awaitingApproval.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-notification-3-line text-2xl"></i>
            </div>
            <div className="flex-1">
              <h4
                className="font-bold text-lg mb-1"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {awaitingApproval.length} Milestone
                {awaitingApproval.length > 1 ? 's' : ''} Need
                {awaitingApproval.length === 1 ? 's' : ''} Your Approval
              </h4>
              <p
                className="text-white/90 text-sm mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {contractor} has submitted work for your review. Approve to
                release payment or request revisions.
              </p>
              <div className="flex gap-2 flex-wrap">
                {awaitingApproval.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setExpandedMilestone(m.id)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-eye-line"></i>
                    {m.title} — {m.payment}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="text-3xl font-bold"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                ${pendingPayment.toLocaleString()}
              </p>
              <p
                className="text-xs text-white/80"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                pending release
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2D2A74] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-bar-chart-box-line text-[#00B8A9]"></i>
            </div>
            <span
              className="text-xs text-white/70"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Overall
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {overallPercent}%
          </p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#00B8A9] h-1.5 rounded-full"
              style={{ width: `${overallPercent}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-flag-line text-green-600"></i>
            </div>
            <span
              className="text-xs text-[#6B7C8F]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Milestones
            </span>
          </div>
          <p
            className="text-lg font-bold text-[#2D2A74]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {completedMilestones}/{milestones.length}
          </p>
          {awaitingApproval.length > 0 && (
            <p
              className="text-xs text-orange-600 mt-1 font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {awaitingApproval.length} needs approval
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-[#00B8A9]"></i>
            </div>
            <span
              className="text-xs text-[#6B7C8F]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Tasks
            </span>
          </div>
          <p
            className="text-lg font-bold text-[#2D2A74]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {completedTasks}/{totalTasks}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#00B8A9] h-1.5 rounded-full"
              style={{
                width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`
              }}
            ></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-green-600"></i>
            </div>
            <span
              className="text-xs text-[#6B7C8F]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Released
            </span>
          </div>
          <p
            className="text-lg font-bold text-green-600"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ${releasedPayment.toLocaleString()}
          </p>
          <p
            className="text-xs text-[#6B7C8F] mt-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            of ${totalPayment.toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-0">
        {milestones.map((milestone, index) => {
          const style = getMilestoneStatusStyle(milestone.status);
          const isExpanded = expandedMilestone === milestone.id;
          const isLast = index === milestones.length - 1;
          const completedTaskCount = milestone.tasks.filter((t) => t.completed)
            .length;
          const needsApproval = milestone.status === 'awaiting-approval';

          return (
            <div key={milestone.id} className="relative flex gap-4">
              <div
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: '32px' }}
              >
                <div
                  className={`w-8 h-8 rounded-full ${style.bg} ring-4 ${style.ring} flex items-center justify-center z-10 flex-shrink-0 ${
                    needsApproval ? 'animate-pulse' : ''
                  }`}
                >
                  <i
                    className={`${style.icon} text-white text-sm ${
                      milestone.status === 'in-progress' ? 'animate-spin' : ''
                    }`}
                  ></i>
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 ${
                      milestone.status === 'completed'
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                    } min-h-[24px]`}
                  ></div>
                )}
              </div>

              <div
                className={`flex-1 mb-4 bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  needsApproval
                    ? 'border-orange-300 ring-2 ring-orange-100'
                    : milestone.status === 'in-progress'
                    ? 'border-[#00B8A9]/40'
                    : 'border-gray-100'
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-[#F9F9FB]/50 transition-colors"
                  onClick={() =>
                    setExpandedMilestone(isExpanded ? null : milestone.id)
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5
                          className="font-bold text-[#2D2A74] text-sm"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {milestone.title}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.badge}`}
                        >
                          {getStatusLabel(milestone.status)}
                        </span>
                      </div>
                      <p
                        className="text-xs text-[#6B7C8F]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {milestone.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <div className="text-right">
                        <p
                          className="text-sm font-bold text-[#2D2A74]"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {milestone.payment}
                        </p>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(
                            milestone.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusLabel(milestone.paymentStatus)}
                        </span>
                      </div>
                      <i
                        className={`ri-arrow-${
                          isExpanded ? 'up' : 'down'
                        }-s-line text-[#6B7C8F] text-lg`}
                      ></i>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          milestone.status === 'completed'
                            ? 'bg-green-500'
                            : needsApproval
                            ? 'bg-orange-400'
                            : 'bg-[#00B8A9]'
                        }`}
                        style={{ width: `${milestone.completionPercent}%` }}
                      ></div>
                    </div>
                    <span
                      className="text-xs font-bold text-[#2D2A74] w-10 text-right"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {milestone.completionPercent}%
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4 mt-2 text-xs text-[#6B7C8F]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line"></i>
                      {milestone.startDate} — {milestone.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-checkbox-circle-line"></i>
                      {completedTaskCount}/{milestone.tasks.length} tasks
                    </span>
                    {milestone.completedDate && (
                      <span className="flex items-center gap-1 text-green-600">
                        <i className="ri-check-double-line"></i>
                        Completed {milestone.completedDate}
                      </span>
                    )}
                  </div>

                  {/* Quick approval buttons when collapsed */}
                  {!isExpanded && needsApproval && (
                    <div
                      className="flex gap-2 mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleApprove(milestone)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-check-double-line"></i>Approve Milestone
                      </button>
                      <button
                        onClick={() => handleReject(milestone)}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-close-line"></i>Request Revisions
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-5">
                    {/* Contractor Note */}
                    {milestone.contractorNote && (
                      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-line text-[#00B8A9]"></i>
                        </div>
                        <div>
                          <p
                            className="text-xs font-bold text-[#00B8A9] mb-1"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            Note from {contractor}
                          </p>
                          <p
                            className="text-sm text-[#333645]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {milestone.contractorNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    <div>
                      <h6
                        className="text-xs font-bold text-[#2D2A74] uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <i className="ri-list-check-2 text-[#00B8A9]"></i>
                        Tasks ({completedTaskCount}/{milestone.tasks.length})
                      </h6>
                      <div className="space-y-2">
                        {milestone.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F9F9FB] transition-colors"
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                task.completed
                                  ? 'bg-green-500'
                                  : 'border-2 border-gray-300'
                              }`}
                            >
                              {task.completed && (
                                <i className="ri-check-line text-white text-xs"></i>
                              )}
                            </div>
                            <span
                              className={`text-sm flex-1 ${
                                task.completed
                                  ? 'text-[#6B7C8F] line-through'
                                  : 'text-[#2D2A74]'
                              }`}
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {task.title}
                            </span>
                            {task.assignee && (
                              <span className="text-xs text-[#6B7C8F] bg-[#F9F9FB] px-2 py-1 rounded-full flex-shrink-0">
                                {task.assignee}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photos */}
                    {milestone.photos.length > 0 && (
                      <div>
                        <h6
                          className="text-xs font-bold text-[#2D2A74] uppercase tracking-wider mb-3 flex items-center gap-2"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-camera-line text-[#00B8A9]"></i>
                          Progress Photos ({milestone.photos.length})
                        </h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {milestone.photos.map((photo) => {
                            const tagStyle = photoTagStyles[photo.tag];
                            return (
                              <div
                                key={photo.id}
                                className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxPhoto({
                                    photo,
                                    milestonePhotos: milestone.photos
                                  });
                                }}
                              >
                                <div className="w-full h-32 bg-gray-100">
                                  <img
                                    src={photo.url}
                                    alt={photo.caption}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                  <p className="text-white text-xs font-semibold leading-tight truncate w-full">
                                    {photo.caption}
                                  </p>
                                </div>
                                <div
                                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${tagStyle.bg} ${tagStyle.text}`}
                                >
                                  {tagStyle.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Approvals History */}
                    {milestone.approvals.filter((a) => a.status !== 'not-required')
                      .length > 0 && (
                      <div>
                        <h6
                          className="text-xs font-bold text-[#2D2A74] uppercase tracking-wider mb-3 flex items-center gap-2"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-shield-check-line text-[#D4B483]"></i>
                          Approval History
                        </h6>
                        <div className="space-y-2">
                          {milestone.approvals
                            .filter((a) => a.status !== 'not-required')
                            .map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg"
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    a.status === 'approved'
                                      ? 'bg-green-100'
                                      : a.status === 'pending'
                                      ? 'bg-orange-100'
                                      : 'bg-red-100'
                                  }`}
                                >
                                  <i
                                    className={`ri-user-heart-line ${
                                      a.status === 'approved'
                                        ? 'text-green-600'
                                        : a.status === 'pending'
                                        ? 'text-orange-600'
                                        : 'text-red-600'
                                    }`}
                                  ></i>
                                </div>
                                <div className="flex-1">
                                  <p
                                    className="text-sm font-semibold text-[#2D2A74]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                  >
                                    {a.title}
                                  </p>
                                  {a.date && (
                                    <p
                                      className="text-xs text-[#6B7C8F]"
                                      style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                      {a.date}
                                    </p>
                                  )}
                                  {a.note && (
                                    <p
                                      className="text-xs text-[#6B7C8F] mt-1 italic"
                                    >
                                      &ldquo;{a.note}&rdquo;
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
                                    a.status === 'approved'
                                      ? 'bg-green-100 text-green-700'
                                      : a.status === 'pending'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {a.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Approval Actions */}
                    {needsApproval && (
                      <div
                        className="bg-orange-50 border border-orange-200 rounded-xl p-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-shield-check-line text-orange-600 text-xl"></i>
                          </div>
                          <div>
                            <h5
                              className="font-bold text-orange-900 text-sm mb-1"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              Your Approval Required
                            </h5>
                            <p
                              className="text-xs text-orange-700"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {contractor} has marked this milestone as
                              complete. Review the work, photos, and tasks above,
                              then approve to proceed. You can choose whether to
                              release the payment of{' '}
                              <strong>{milestone.payment}</strong> now or hold it.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(milestone)}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-check-double-line"></i>
                            Approve Milestone
                          </button>
                          <button
                            onClick={() => handleReject(milestone)}
                            className="px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <i className="ri-close-line"></i>Request Revisions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4
          className="font-bold text-[#2D2A74] text-sm mb-4 flex items-center gap-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <i className="ri-money-dollar-circle-line text-[#00B8A9]"></i>
          Payment Schedule
        </h4>
        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                m.paymentStatus === 'pending-approval'
                  ? 'bg-orange-50 border border-orange-200'
                  : m.paymentStatus === 'held'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-[#F9F9FB]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.paymentStatus === 'released'
                    ? 'bg-green-500'
                    : m.paymentStatus === 'pending-approval'
                    ? 'bg-orange-400'
                    : m.paymentStatus === 'held'
                    ? 'bg-red-400'
                    : 'bg-gray-300'
                }`}
              >
                {m.paymentStatus === 'released' ? (
                  <i className="ri-check-line text-white text-sm"></i>
                ) : m.paymentStatus === 'pending-approval' ? (
                  <i className="ri-notification-line text-white text-sm"></i>
                ) : m.paymentStatus === 'held' ? (
                  <i className="ri-hand-coin-line text-white text-sm"></i>
                ) : (
                  <i className="ri-lock-line text-white text-sm"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-[#2D2A74] truncate"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {m.title}
                </p>
                <p
                  className="text-xs text-[#6B7C8F]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Due: {m.dueDate}
                </p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p
                    className="text-sm font-bold text-[#2D2A74]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {m.payment}
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(
                      m.paymentStatus
                    )}`}
                  >
                    {getPaymentStatusLabel(m.paymentStatus)}
                  </span>
                </div>
                {m.paymentStatus === 'pending-approval' && (
                  <button
                    onClick={() => handleApprove(m)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Approve
                  </button>
                )}
                {m.paymentStatus === 'held' && (
                  <button
                    onClick={() => handleOpenReleaseModal(m)}
                    className="px-3 py-2 bg-[#00B8A9] text-white rounded-lg text-xs font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-send-plane-line text-sm"></i>
                    Release Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span
            className="text-sm font-bold text-[#2D2A74]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Total
          </span>
          <div className="text-right">
            <span
              className="text-lg font-bold text-[#2D2A74]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              ${totalPayment.toLocaleString()}
            </span>
            <span className="text-xs text-green-600 ml-2">
              (${releasedPayment.toLocaleString()} released)
            </span>
            {pendingPayment > 0 && (
              <span className="text-xs text-orange-600 ml-2">
                (${pendingPayment.toLocaleString()} pending)
              </span>
            )}
            {heldPayment > 0 && (
              <span className="text-xs text-red-600 ml-2">
                (${heldPayment.toLocaleString()} held)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {approvalModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleCloseApproval}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {approvalStep === 'processing' ? (
              <div className="p-10 text-center">
                <div
                  className={`w-16 h-16 border-4 ${
                    approvalModal.action === 'approve'
                      ? 'border-green-200 border-t-green-600'
                      : 'border-red-200 border-t-red-600'
                  } rounded-full animate-spin mx-auto mb-5`}
                ></div>
                <h4
                  className="font-bold text-[#2D2A74] text-lg mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {approvalModal.action === 'approve'
                    ? releasePayment
                      ? 'Approving & Releasing Payment...'
                      : 'Approving Milestone...'
                    : 'Sending Revision Request...'}
                </h4>
              </div>
            ) : approvalStep === 'success' ? (
              <div className="p-10 text-center">
                <div
                  className={`w-16 h-16 ${
                    approvalModal.action === 'approve'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  } rounded-full flex items-center justify-center mx-auto mb-5`}
                >
                  <i
                    className={`${
                      approvalModal.action === 'approve'
                        ? 'ri-check-double-line text-green-600'
                        : 'ri-arrow-go-back-line text-red-600'
                    } text-3xl`}
                  ></i>
                </div>
                <h4
                  className="font-bold text-[#2D2A74] text-lg mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {approvalModal.action === 'approve'
                    ? releasePayment
                      ? 'Approved & Payment Released!'
                      : 'Milestone Approved!'
                    : 'Revision Requested'}
                </h4>
                <p
                  className="text-sm text-[#6B7C8F] mb-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {approvalModal.action === 'approve'
                    ? releasePayment
                      ? `${approvalModal.milestone.payment} has been released to ${contractor}.`
                      : `Work approved. Payment of ${approvalModal.milestone.payment} is being held — you can release it later from the Payment Schedule section.`
                    : `${contractor} has been notified to make revisions.`}
                </p>
                <button
                  onClick={handleCloseApproval}
                  className="mt-6 px-6 py-2.5 bg-[#2D2A74] text-white rounded-lg text-sm font-semibold hover:bg-[#2D2A74]/90 cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Done
                </button>
              </div>
            ) : approvalModal.action === 'approve' ? (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <i className="ri-check-double-line text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <h3
                          className="font-bold text-[#2D2A74] text-base"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Approve Milestone
                        </h3>
                        <p
                          className="text-xs text-[#6B7C8F]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {approvalModal.milestone.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseApproval}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <i className="ri-close-line text-[#6B7C8F] text-lg"></i>
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-[#F9F9FB] rounded-lg p-3">
                    <p
                      className="text-xs text-[#6B7C8F] mb-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Tasks completed
                    </p>
                    <p
                      className="text-sm font-bold text-[#2D2A74]"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {approvalModal.milestone.tasks.filter((t) => t.completed)
                        .length}
                      /
                      {approvalModal.milestone.tasks.length}
                    </p>
                  </div>

                  {/* Payment Release Toggle */}
                  <div className={`rounded-xl border-2 transition-all ${releasePayment ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-[#F9F9FB]'}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${releasePayment ? 'bg-green-100' : 'bg-gray-200'}`}>
                            <i className={`ri-money-dollar-circle-line text-lg ${releasePayment ? 'text-green-600' : 'text-gray-500'}`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Release Payment Now
                            </p>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {approvalModal.milestone.payment} to {contractor}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setReleasePayment(!releasePayment)}
                          className={`relative w-12 h-7 rounded-full transition-all cursor-pointer flex-shrink-0 ${releasePayment ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${releasePayment ? 'left-[22px]' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      <div className={`mt-3 pt-3 border-t ${releasePayment ? 'border-green-200' : 'border-gray-200'}`}>
                        {releasePayment ? (
                          <div className="flex items-start gap-2">
                            <i className="ri-shield-check-line text-green-600 text-sm mt-0.5 flex-shrink-0"></i>
                            <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Funds will be transferred to {contractor} immediately upon approval. Protected by Emporva escrow.
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <i className="ri-lock-line text-[#6B7C8F] text-sm mt-0.5 flex-shrink-0"></i>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Work will be marked as approved, but payment will be held. You can release it later from the Payment Schedule section.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-xs font-bold text-[#2D2A74] mb-1.5 block"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Feedback{' '}
                      <span className="font-normal text-[#6B7C8F]">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={approvalNote}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) setApprovalNote(e.target.value);
                      }}
                      placeholder="Great work! Everything looks good..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#2D2A74] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={handleCloseApproval}
                    className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApproval}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {releasePayment ? (
                      <>
                        <i className="ri-check-double-line"></i>
                        Approve &amp; Release Payment
                      </>
                    ) : (
                      <>
                        <i className="ri-check-line"></i>
                        Approve Without Payment
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <i className="ri-arrow-go-back-line text-red-600 text-xl"></i>
                      </div>
                      <div>
                        <h3
                          className="font-bold text-[#2D2A74] text-base"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Request Revisions
                        </h3>
                        <p
                          className="text-xs text-[#6B7C8F]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {approvalModal.milestone.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseApproval}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <i className="ri-close-line text-[#6B7C8F] text-lg"></i>
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <i className="ri-information-line text-red-600 text-xl mt-0.5"></i>
                    <div>
                      <p
                        className="text-sm font-semibold text-red-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Payment will not be released
                      </p>
                      <p
                        className="text-xs text-red-700 mt-0.5"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        The milestone will be sent back to {contractor} for
                        revisions. They can resubmit once changes are made.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label
                      className="text-xs font-bold text-[#2D2A74] mb-1.5 block"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Reason for Revisions{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) setRejectReason(e.target.value);
                      }}
                      placeholder="Please describe what needs to be revised..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-[#2D2A74] placeholder-[#6B7C8F]/50 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-[#6B7C8F] text-right mt-1">
                      {rejectReason.length}/500
                    </p>
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={handleCloseApproval}
                    className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApproval}
                    disabled={!rejectReason.trim()}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                      rejectReason.trim()
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-arrow-go-back-line"></i>
                    Request Revisions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RELEASE HELD PAYMENT MODAL */}
      {releaseModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={handleCloseReleaseModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {releaseStep === 'processing' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 border-4 border-[#00B8A9]/20 border-t-[#00B8A9] rounded-full animate-spin mx-auto mb-5"></div>
                <h4
                  className="font-bold text-[#2D2A74] text-lg mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Releasing Payment...
                </h4>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Transferring funds securely
                </p>
              </div>
            ) : releaseStep === 'success' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <i className="ri-check-double-line text-green-600 text-3xl"></i>
                </div>
                <h4
                  className="font-bold text-[#2D2A74] text-lg mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Payment Released!
                </h4>
                <p className="text-sm text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {releaseModal.milestone.payment} has been released to {contractor}.
                </p>
                <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  The contractor will be notified and funds will arrive within 1–2 business days.
                </p>
                <button
                  onClick={handleCloseReleaseModal}
                  className="mt-6 px-6 py-2.5 bg-[#2D2A74] text-white rounded-lg text-sm font-semibold hover:bg-[#2D2A74]/90 cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-xl flex items-center justify-center">
                        <i className="ri-send-plane-line text-[#00B8A9] text-xl"></i>
                      </div>
                      <div>
                        <h3
                          className="font-bold text-[#2D2A74] text-base"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Release Held Payment
                        </h3>
                        <p
                          className="text-xs text-[#6B7C8F]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {releaseModal.milestone.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseReleaseModal}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <i className="ri-close-line text-[#6B7C8F] text-lg"></i>
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {/* Payment summary card */}
                  <div className="bg-[#F9F9FB] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Milestone</span>
                      <span className="text-sm font-semibold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>{releaseModal.milestone.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Contractor</span>
                      <span className="text-sm font-semibold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>{contractor}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D2A74]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount to Release</span>
                      <span className="text-xl font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>{releaseModal.milestone.payment}</span>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4 flex items-start gap-3">
                    <i className="ri-shield-check-line text-[#00B8A9] text-lg mt-0.5 flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-semibold text-[#2D2A74] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        What happens next
                      </p>
                      <ul className="space-y-1.5">
                        <li className="text-xs text-[#6B7C8F] flex items-start gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <i className="ri-check-line text-[#00B8A9] mt-0.5 flex-shrink-0"></i>
                          Funds transfer to {contractor} within 1–2 business days
                        </li>
                        <li className="text-xs text-[#6B7C8F] flex items-start gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <i className="ri-check-line text-[#00B8A9] mt-0.5 flex-shrink-0"></i>
                          Contractor receives a payment notification
                        </li>
                        <li className="text-xs text-[#6B7C8F] flex items-start gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <i className="ri-check-line text-[#00B8A9] mt-0.5 flex-shrink-0"></i>
                          Transaction recorded in your payment history
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={handleCloseReleaseModal}
                    className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRelease}
                    className="px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg text-sm font-semibold hover:bg-[#00a89a] cursor-pointer whitespace-nowrap flex items-center gap-2 transition-colors"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-send-plane-line"></i>
                    Confirm &amp; Release {releaseModal.milestone.payment}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="flex items-center justify-between p-4 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${photoTagStyles[lightboxPhoto.photo.tag].bg} ${photoTagStyles[lightboxPhoto.photo.tag].text}`}
              >
                {photoTagStyles[lightboxPhoto.photo.tag].label}
              </span>
              <span className="text-white/70 text-sm">
                {lightboxPhoto.milestonePhotos.findIndex(
                  (p) => p.id === lightboxPhoto.photo.id
                ) + 1}{' '}
                of {lightboxPhoto.milestonePhotos.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              <i className="ri-close-line text-white text-xl"></i>
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center relative px-16 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxPhoto.milestonePhotos.length > 1 && (
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer z-10"
              >
                <i className="ri-arrow-left-s-line text-white text-2xl"></i>
              </button>
            )}
            <img
              src={lightboxPhoto.photo.url}
              alt={lightboxPhoto.photo.caption}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {lightboxPhoto.milestonePhotos.length > 1 && (
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer z-10"
              >
                <i className="ri-arrow-right-s-line text-white text-2xl"></i>
              </button>
            )}
          </div>
          <div
            className="p-4 flex-shrink-0 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-white font-semibold text-sm mb-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {lightboxPhoto.photo.caption}
            </p>
            <div className="flex items-center justify-center gap-3 text-white/50 text-xs">
              <span>
                <i className="ri-user-line mr-1"></i>
                {lightboxPhoto.photo.uploadedBy}
              </span>
              <span>&middot;</span>
              <span>
                <i className="ri-time-line mr-1"></i>
                {lightboxPhoto.photo.uploadedAt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2A74] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <i className="ri-check-line text-[#00B8A9]"></i>
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}

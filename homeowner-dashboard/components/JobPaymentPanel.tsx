
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JobPaymentPanelProps {
  jobId: number;
  jobTitle: string;
  contractor: string;
  onClose: () => void;
}

interface PayableMilestone {
  id: number;
  title: string;
  amount: number;
  status: 'ready' | 'upcoming' | 'paid';
  dueDate: string;
}

const milestonesByJob: Record<number, PayableMilestone[]> = {
  1: [
    { id: 1, title: 'Initial Assessment & Planning', amount: 990, status: 'paid', dueDate: 'Jan 16, 2025' },
    { id: 2, title: 'Vapor Barrier Installation', amount: 1485, status: 'paid', dueDate: 'Jan 18, 2025' },
    { id: 3, title: 'Dehumidifier Setup & Calibration', amount: 990, status: 'ready', dueDate: 'Jan 22, 2025' },
    { id: 4, title: 'Insulation & Sealing', amount: 990, status: 'upcoming', dueDate: 'Jan 26, 2025' },
    { id: 5, title: 'Final Inspection & Testing', amount: 495, status: 'upcoming', dueDate: 'Jan 28, 2025' }
  ],
  2: [
    { id: 1, title: 'Pre-Visit Diagnostic', amount: 0, status: 'paid', dueDate: 'Jan 21, 2025' },
    { id: 2, title: 'On-Site Diagnostic & Assessment', amount: 345, status: 'ready', dueDate: 'Jan 22, 2025' },
    { id: 3, title: 'Repair & Parts Installation', amount: 805, status: 'upcoming', dueDate: 'Jan 23, 2025' }
  ],
  3: [
    { id: 1, title: 'Roof Inspection & Prep', amount: 800, status: 'ready', dueDate: 'Feb 5, 2025' },
    { id: 2, title: 'Shingle Replacement', amount: 1600, status: 'upcoming', dueDate: 'Feb 7, 2025' },
    { id: 3, title: 'Final Inspection & Cleanup', amount: 800, status: 'upcoming', dueDate: 'Feb 8, 2025' }
  ],
  4: [
    { id: 1, title: 'Water Heater Replacement', amount: 2100, status: 'paid', dueDate: 'Jan 11, 2025' }
  ]
};

export default function JobPaymentPanel({ jobId, jobTitle, contractor, onClose }: JobPaymentPanelProps) {
  const navigate = useNavigate();
  const milestones = milestonesByJob[jobId] || [];
  const [selectedMilestones, setSelectedMilestones] = useState<number[]>([]);

  const readyMilestones = milestones.filter(m => m.status === 'ready');
  const paidMilestones = milestones.filter(m => m.status === 'paid');
  const upcomingMilestones = milestones.filter(m => m.status === 'upcoming');

  const totalPaid = paidMilestones.reduce((s, m) => s + m.amount, 0);
  const totalReady = readyMilestones.reduce((s, m) => s + m.amount, 0);
  const totalUpcoming = upcomingMilestones.reduce((s, m) => s + m.amount, 0);
  const totalProject = milestones.reduce((s, m) => s + m.amount, 0);
  const selectedTotal = milestones
    .filter(m => selectedMilestones.includes(m.id))
    .reduce((s, m) => s + m.amount, 0);

  const toggleMilestone = (id: number) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone || milestone.status !== 'ready') return;
    setSelectedMilestones(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleProceedToCheckout = () => {
    navigate(`/checkout?type=milestone-payment&jobId=${jobId}&amount=${selectedTotal}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: 'bg-green-100 text-green-700', icon: 'ri-check-line', label: 'Paid' };
      case 'ready':
        return { bg: 'bg-orange-100 text-orange-700', icon: 'ri-notification-line', label: 'Ready to Pay' };
      case 'upcoming':
        return { bg: 'bg-gray-100 text-gray-500', icon: 'ri-lock-line', label: 'Upcoming' };
      default:
        return { bg: 'bg-gray-100 text-gray-500', icon: 'ri-question-line', label: status };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0B1F33] p-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Job Payments
              </h3>
              <p className="text-sm text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                {jobTitle}
              </p>
              <p className="text-xs text-white/50 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Contractor: {contractor}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
            >
              <i className="ri-close-line text-white text-lg"></i>
            </button>
          </div>

          {/* Summary Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Paid</p>
              <p className="text-lg font-bold text-green-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Due Now</p>
              <p className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ${totalReady.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Remaining</p>
              <p className="text-lg font-bold text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ${totalUpcoming.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span>Payment Progress</span>
              <span>{totalProject > 0 ? Math.round((totalPaid / totalProject) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-[#00B8A9] h-2 rounded-full transition-all"
                style={{ width: `${totalProject > 0 ? (totalPaid / totalProject) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {readyMilestones.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Ready for Payment
                </h4>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Select milestones below to pay. Payments are held in escrow until work is verified.
                </p>
              </div>
            </div>
          )}

          {milestones.map(milestone => {
            const style = getStatusStyle(milestone.status);
            const isSelected = selectedMilestones.includes(milestone.id);
            const isSelectable = milestone.status === 'ready';

            return (
              <div
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                    : isSelectable
                    ? 'border-orange-200 bg-orange-50/50 cursor-pointer hover:border-[#00B8A9]/50'
                    : 'border-gray-100 bg-white'
                } ${!isSelectable ? '' : 'cursor-pointer'}`}
              >
                {/* Checkbox / Status Icon */}
                {isSelectable ? (
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'bg-[#00B8A9] border-[#00B8A9]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                  </div>
                ) : (
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                      milestone.status === 'paid' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <i className={`${style.icon} text-white text-sm`}></i>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      milestone.status === 'upcoming' ? 'text-gray-400' : 'text-[#0B1F33]'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-xs text-[#6B7C8F] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Due: {milestone.dueDate}
                  </p>
                </div>

                {/* Amount & Status */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      milestone.status === 'paid'
                        ? 'text-green-600'
                        : milestone.status === 'upcoming'
                        ? 'text-gray-400'
                        : 'text-[#0B1F33]'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {milestone.amount > 0 ? `$${milestone.amount.toLocaleString()}` : 'Free'}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg}`}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Pay Button */}
        <div className="border-t border-gray-100 p-6 flex-shrink-0 bg-white">
          {selectedMilestones.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedMilestones.length} milestone{selectedMilestones.length > 1 ? 's' : ''} selected
                </span>
                <span className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ${selectedTotal.toLocaleString()}
                </span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-[#00B8A9] text-white rounded-xl font-bold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-secure-payment-line"></i>
                Proceed to Secure Payment
              </button>
            </div>
          ) : readyMilestones.length > 0 ? (
            <p className="text-sm text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Select milestones above to make a payment
            </p>
          ) : (
            <p className="text-sm text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              No payments due at this time
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

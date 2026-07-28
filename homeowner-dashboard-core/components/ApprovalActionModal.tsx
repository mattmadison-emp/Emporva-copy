import { useState } from 'react';

interface Approval {
  id: string;
  type: 'estimate' | 'change_order' | 'milestone' | 'completion';
  title: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

interface ApprovalActionModalProps {
  approval: Approval;
  action: 'approve' | 'reject';
  processing: boolean;
  success: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export default function ApprovalActionModal({ approval, action, processing, success, onConfirm, onCancel }: ApprovalActionModalProps) {
  const [note, setNote] = useState('');

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
          <div className="p-10 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              action === 'approve' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <i className={`text-3xl ${
                action === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
              }`}></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-2">
              {action === 'approve' ? 'Approved!' : 'Rejected'}
            </h3>
            <p className="text-sm text-[#6B7C8F]">
              {action === 'approve'
                ? 'Your contractor has been notified and can proceed with this work.'
                : 'Your contractor has been notified of your decision.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#0B1F33] mb-1">
                {action === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h2>
              <p className="text-sm text-[#6B7C8F]">{approval.title}</p>
            </div>
            <button
              onClick={onCancel}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[#F9F9FB] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0B1F33] mb-1">{approval.description}</p>
                <p className="text-xs text-[#6B7C8F]">
                  Submitted {new Date(approval.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {approval.amount && (
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-[#0B1F33]">${approval.amount.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-4 flex items-start gap-3 ${
            action === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <i className={`text-xl ${
              action === 'approve' ? 'ri-information-line text-green-600' : 'ri-alert-line text-red-600'
            }`}></i>
            <div className="flex-1">
              <p className={`text-sm font-semibold mb-1 ${action === 'approve' ? 'text-green-900' : 'text-red-900'}`}>
                {action === 'approve' ? 'What happens next?' : 'Are you sure?'}
              </p>
              <p className={`text-xs ${action === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                {action === 'approve'
                  ? 'Your contractor will be notified immediately and can proceed with this work. Any associated payment will be processed according to your agreement.'
                  : 'Your contractor will be notified of the rejection. You may want to add a note explaining your decision or ask questions before rejecting.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
              {action === 'approve' ? 'Add a note (optional)' : 'Reason for rejection (optional)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => { if (e.target.value.length <= 500) setNote(e.target.value); }}
              placeholder={action === 'approve' ? 'Add any comments or instructions...' : "Explain why you're rejecting this request..."}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-gray-400 focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-[#6B7C8F]">This note will be sent to your contractor</p>
              <span className={`text-xs ${note.length > 450 ? 'text-orange-500' : 'text-[#6B7C8F]'}`}>{note.length}/500</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={processing}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
              action === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <i className={action === 'approve' ? 'ri-check-line' : 'ri-close-line'}></i>
                {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

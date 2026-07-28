import type { ActiveJobView } from '../../../types/activeJob';

type ModalName = 'sendInvoice' | 'addMaterials' | 'changeOrder' | 'milestoneComplete' | 'uploadPhotos' | 'messageTrades' | 'reportIssue' | 'tradeScopes' | 'projectTimeline';

interface JobOverviewTabProps {
  job: ActiveJobView;
  onOpenModal: (modal: ModalName) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function JobOverviewTab({ job, onOpenModal }: JobOverviewTabProps) {
  const myItem = job.my_work_item;
  const myPrice = myItem.agreed_price ? `$${myItem.agreed_price.toLocaleString()}` : (myItem.estimated_budget || '—');

  if (!job.is_multi_trade) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/20 rounded-lg p-4 flex items-start gap-3">
          <i className="ri-information-line text-[#0B1F33] text-xl"></i>
          <div className="flex-1">
            <p className="text-sm text-[#0B1F33] font-semibold mb-1">Two-Way Sync Active</p>
            <p className="text-xs text-[#6B7C8F]">
              All updates, messages, and changes sync instantly with the homeowner's dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-xs text-green-700 mb-1">Project Status</div>
            <div className="text-2xl font-bold text-green-600">
              {myItem.status === 'completed' ? 'Complete' : myItem.status === 'in-progress' ? 'On Track' : 'Scheduled'}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-700 mb-1">Days Remaining</div>
            <div className="text-2xl font-bold text-blue-600">{daysRemaining(myItem.end_date)}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-xs text-purple-700 mb-1">Agreed Price</div>
            <div className="text-2xl font-bold text-purple-600">{myPrice}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-xs text-orange-700 mb-1">Timeline</div>
            <div className="text-lg font-bold text-orange-600">
              {formatDate(myItem.start_date)} — {formatDate(myItem.end_date)}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-[#0B1F33] mb-3">Quick Actions</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onOpenModal('sendInvoice')}
              className="p-4 bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] rounded-lg hover:from-[#1a3a52] hover:to-[#2a4a62] transition-all cursor-pointer text-left"
            >
              <i className="ri-file-text-line text-teal-400 text-2xl mb-2"></i>
              <p className="font-semibold text-white text-sm">Send Invoice</p>
              <p className="text-xs text-white/60 mt-0.5">Bill homeowner</p>
            </button>
            <button
              onClick={() => onOpenModal('addMaterials')}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
            >
              <i className="ri-add-line text-teal-500 text-2xl mb-2"></i>
              <p className="font-semibold text-[#0B1F33] text-sm">Add Materials</p>
            </button>
            <button
              onClick={() => onOpenModal('changeOrder')}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
            >
              <i className="ri-edit-line text-teal-500 text-2xl mb-2"></i>
              <p className="font-semibold text-[#0B1F33] text-sm">Request Change Order</p>
            </button>
            <button
              onClick={() => onOpenModal('milestoneComplete')}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
            >
              <i className="ri-check-double-line text-teal-500 text-2xl mb-2"></i>
              <p className="font-semibold text-[#0B1F33] text-sm">Mark Milestone Complete</p>
            </button>
            <button
              onClick={() => onOpenModal('uploadPhotos')}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
            >
              <i className="ri-upload-2-line text-teal-500 text-2xl mb-2"></i>
              <p className="font-semibold text-[#0B1F33] text-sm">Upload Progress Photos</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multi-trade overview
  const completedItems = job.all_work_items.filter(wi => wi.status === 'completed');
  const inProgressItems = job.all_work_items.filter(wi => wi.status === 'in-progress');
  const totalProjectCost = job.all_work_items.reduce((sum, wi) => sum + (wi.agreed_price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/20 rounded-lg p-4 flex items-start gap-3">
        <i className="ri-information-line text-[#0B1F33] text-xl"></i>
        <div className="flex-1">
          <p className="text-sm text-[#0B1F33] font-semibold mb-1">Two-Way Sync Active</p>
          <p className="text-xs text-[#6B7C8F]">
            All updates, messages, and changes sync instantly with the homeowner's dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs text-green-700 mb-1">Your Status</div>
          <div className="text-xl font-bold text-green-600">
            {myItem.status === 'completed' ? 'Complete' : myItem.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs text-blue-700 mb-1">Your Price</div>
          <div className="text-xl font-bold text-blue-600">{myPrice}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xs text-purple-700 mb-1">Trades Progress</div>
          <div className="text-sm font-bold text-purple-600">
            {completedItems.length}/{job.all_work_items.length} complete
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-xs text-orange-700 mb-1">Total Project</div>
          <div className="text-xl font-bold text-orange-600">
            {totalProjectCost > 0 ? `$${totalProjectCost.toLocaleString()}` : '—'}
          </div>
        </div>
      </div>

      {myItem.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <i className="ri-check-double-line text-green-600 text-2xl"></i>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 mb-1">Your Work is Complete</p>
              <p className="text-xs text-green-700">
                {job.my_trade_role} phase finished. {inProgressItems.length > 0 ? `${inProgressItems.length} trade(s) still in progress.` : 'All trades complete.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-bold text-[#0B1F33] mb-3">Your Quick Actions</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onOpenModal('sendInvoice')}
            className="p-4 bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] rounded-lg hover:from-[#1a3a52] hover:to-[#2a4a62] transition-all cursor-pointer text-left"
          >
            <i className="ri-file-text-line text-teal-400 text-2xl mb-2"></i>
            <p className="font-semibold text-white text-sm">Send Invoice</p>
            <p className="text-xs text-white/60 mt-0.5">Bill homeowner</p>
          </button>
          <button
            onClick={() => onOpenModal('messageTrades')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
          >
            <i className="ri-team-line text-teal-500 text-2xl mb-2"></i>
            <p className="font-semibold text-[#0B1F33] text-sm">Message Other Trades</p>
          </button>
          <button
            onClick={() => onOpenModal('reportIssue')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
          >
            <i className="ri-alert-line text-teal-500 text-2xl mb-2"></i>
            <p className="font-semibold text-[#0B1F33] text-sm">Report Issue/Concern</p>
          </button>
          <button
            onClick={() => onOpenModal('tradeScopes')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
          >
            <i className="ri-file-list-line text-teal-500 text-2xl mb-2"></i>
            <p className="font-semibold text-[#0B1F33] text-sm">View All Trade Scopes</p>
          </button>
          <button
            onClick={() => onOpenModal('projectTimeline')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors cursor-pointer text-left"
          >
            <i className="ri-calendar-check-line text-teal-500 text-2xl mb-2"></i>
            <p className="font-semibold text-[#0B1F33] text-sm">View Project Timeline</p>
          </button>
        </div>
      </div>
    </div>
  );
}

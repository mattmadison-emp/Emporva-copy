import { useState } from 'react';
import type { ActiveJobView } from '../../../types/activeJob';
import { getStatusColor, getStatusLabel } from './utils/statusColors';
import JobOverviewTab from './JobOverviewTab';
import JobDocuments from '../../../components/feature/JobDocuments';
import JobMessaging from '../../../components/feature/JobMessaging';
import JobCostsMaterials from '../../../components/feature/JobCostsMaterials';
import JobProgress from '../../../components/feature/JobProgress';
import TradeCoordination from '../../../components/feature/TradeCoordination';

type ActiveTab = 'overview' | 'messages' | 'documents' | 'costs' | 'progress' | 'coordination';
type ModalName = 'sendInvoice' | 'addMaterials' | 'changeOrder' | 'milestoneComplete' | 'uploadPhotos'
  | 'messageTrades' | 'reportIssue' | 'tradeScopes' | 'projectTimeline' | 'requestApproval' | 'markJobComplete';

interface JobDetailPanelProps {
  job: ActiveJobView;
  onOpenModal: (modal: ModalName) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function JobDetailPanel({ job, onOpenModal }: JobDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const myItem = job.my_work_item;

  // Build trade data for coordination tab (map work_items to the Trade interface expected by TradeCoordination)
  const tradeData = job.all_work_items.map(wi => ({
    id: wi.id as any,
    tradeName: wi.trade,
    contractor: wi.contractor_id === myItem.contractor_id ? 'You' : wi.trade,
    contractorEmail: '',
    status: wi.status === 'completed' ? 'Complete' as const
      : wi.status === 'in-progress' ? 'In Progress' as const
      : wi.status === 'assigned' ? 'Ready to Start' as const
      : 'Blocked' as const,
    startDate: formatDate(wi.start_date),
    endDate: formatDate(wi.end_date),
    progress: wi.status === 'completed' ? 100 : wi.status === 'in-progress' ? 50 : 0,
    cost: wi.agreed_price ? `$${wi.agreed_price.toLocaleString()}` : (wi.estimated_budget || '—'),
    dependencies: [] as string[],
    materials: [] as any[],
    unreadMessages: 0,
    isMyTrade: wi.id === myItem.id,
  }));

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'ri-dashboard-line' },
    ...(job.is_multi_trade ? [{ id: 'coordination' as const, label: 'Trade Coordination', icon: 'ri-team-line' }] : []),
    { id: 'messages' as const, label: 'Messages', icon: 'ri-message-3-line' },
    { id: 'documents' as const, label: 'Documents', icon: 'ri-folder-line' },
    { id: 'costs' as const, label: 'Costs & Materials', icon: 'ri-money-dollar-circle-line' },
    { id: 'progress' as const, label: 'Progress', icon: 'ri-bar-chart-box-line' },
  ];

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Job Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">{job.title}</h3>
              {job.is_multi_trade && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    <i className="ri-team-line"></i>
                    Multi-Trade Project
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
                    <i className="ri-user-star-line"></i>
                    Your Role: {job.my_trade_role}
                  </span>
                </div>
              )}
              <div className="space-y-1 text-sm text-[#6B7C8F]">
                <div className="flex items-center gap-2">
                  <i className="ri-user-line"></i>
                  <span>{job.homeowner_name}</span>
                  {job.homeowner_email && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-teal-600">{job.homeowner_email}</span>
                    </>
                  )}
                </div>
                {job.property_address && (
                  <div className="flex items-center gap-2">
                    <i className="ri-map-pin-line"></i>
                    <span>{job.property_address}</span>
                  </div>
                )}
              </div>
            </div>
            <span className={`px-3 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(myItem.status)}`}>
              {getStatusLabel(myItem.status)}
            </span>
          </div>

          {/* Info cards + action buttons */}
          {!job.is_multi_trade && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Start Date</div>
                  <div className="font-bold text-[#0B1F33]">{formatDate(myItem.start_date)}</div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">End Date</div>
                  <div className="font-bold text-[#0B1F33]">{formatDate(myItem.end_date)}</div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Progress</div>
                  <div className="font-bold text-teal-600">{job.progress}%</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-message-3-line"></i>
                  Message Homeowner
                </button>
                <button
                  onClick={() => onOpenModal('requestApproval')}
                  className="px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c5a574] transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-edit-line"></i>
                  Request Approval
                </button>
                <button
                  onClick={() => onOpenModal('markJobComplete')}
                  className="px-4 py-3 bg-white border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg hover:bg-[#0B1F33] hover:text-white transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-check-line"></i>
                  Mark Complete
                </button>
              </div>
            </>
          )}

          {job.is_multi_trade && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Total Project</div>
                  <div className="font-bold text-[#0B1F33]">
                    {job.all_work_items.reduce((s, wi) => s + (wi.agreed_price || 0), 0) > 0
                      ? `$${job.all_work_items.reduce((s, wi) => s + (wi.agreed_price || 0), 0).toLocaleString()}`
                      : '—'}
                  </div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Your Scope</div>
                  <div className="font-bold text-teal-600">
                    {myItem.agreed_price ? `$${myItem.agreed_price.toLocaleString()}` : '—'}
                  </div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Trades</div>
                  <div className="font-bold text-[#0B1F33]">{job.all_work_items.length}</div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-[#6B7C8F] mb-1">Overall Progress</div>
                  <div className="font-bold text-teal-600">{job.progress}%</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-message-3-line"></i>
                  Message Homeowner
                </button>
                <button
                  onClick={() => setActiveTab('coordination')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-team-line"></i>
                  Coordinate with Trades
                </button>
                <button
                  onClick={() => onOpenModal('markJobComplete')}
                  className="px-4 py-3 bg-white border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg hover:bg-[#0B1F33] hover:text-white transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-check-line"></i>
                  Mark My Work Complete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <JobOverviewTab job={job} onOpenModal={onOpenModal} />
          )}

          {activeTab === 'coordination' && job.is_multi_trade && (
            <TradeCoordination
              trades={tradeData}
              jobTitle={job.title}
              myTradeRole={job.my_trade_role}
            />
          )}

          {activeTab === 'messages' && (
            <JobMessaging
              jobId={job.id as any}
              jobTitle={job.title}
              homeowner={job.homeowner_name}
              homeownerEmail={job.homeowner_email}
              isMultiTrade={job.is_multi_trade}
            />
          )}

          {activeTab === 'documents' && (
            <JobDocuments
              jobId={job.id as any}
              jobTitle={job.title}
              homeowner={job.homeowner_name}
            />
          )}

          {activeTab === 'costs' && (
            <JobCostsMaterials
              jobId={job.id as any}
              jobTitle={job.title}
              isMultiTrade={job.is_multi_trade}
              myTradeRole={job.my_trade_role}
            />
          )}

          {activeTab === 'progress' && (
            <JobProgress
              jobId={job.id as any}
              jobTitle={job.title}
              isMultiTrade={job.is_multi_trade}
              myTradeRole={job.my_trade_role}
            />
          )}
        </div>
      </div>
    </div>
  );
}

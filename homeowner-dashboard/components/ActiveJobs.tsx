import { useState } from 'react';
import ContractorQA from './ContractorQA';
import HomeownerProgressView from './HomeownerProgressView';
import HomeownerCostsMaterials from './HomeownerCostsMaterials';
import HomeownerDocuments from './HomeownerDocuments';
import ProjectTimeline from './ProjectTimeline';
import JobPaymentPanel from './JobPaymentPanel';

interface Job {
  id: number;
  title: string;
  contractor: string;
  contractorCompany?: string;
  contractorEmail?: string;
  propertyAddress?: string;
  status: 'Pending Approval' | 'Scheduled' | 'In Progress' | 'Completed' | 'Needs Review';
  startDate: string;
  endDate: string;
  progress: number;
  estimatedCost: string;
  confirmedQuote: string;
  squareFootage?: string;
  unreadMessages: number;
  lastUpdate: string;
  priority: 'high' | 'medium' | 'low';
  isMultiTrade?: boolean;
  trades?: Trade[];
}

interface Trade {
  id: number;
  name: string;
  contractor: string;
  contractorEmail: string;
  status: 'Blocked' | 'Ready to Start' | 'Requires Approval' | 'In Progress' | 'Complete';
  progress: number;
  cost: string;
  startDate: string;
  endDate: string;
  dependencies: number[];
  materials: Material[];
  unreadMessages: number;
}

interface Material {
  name: string;
  needed: string;
  ordered: string;
  status: 'delivered' | 'in-transit' | 'pending';
  cost: string;
  sharedWith?: string[];
}

export default function ActiveJobs() {
  const [selectedJob, setSelectedJob] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'documents' | 'costs' | 'progress' | 'trades' | 'timeline'>('overview');
  const [selectedTrade, setSelectedTrade] = useState<number | null>(null);
  const [showQA, setShowQA] = useState(false);
  const [qaToast, _setQaToast] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);

  const jobs: Job[] = [
    {
      id: 1,
      title: 'Crawlspace Moisture Remediation',
      contractor: 'Mike Thompson',
      contractorEmail: 'mike@charlottehomerepair.com',
      propertyAddress: '2847 Oak Ridge Drive, Charlotte, NC 28203',
      status: 'In Progress',
      startDate: 'Jan 15, 2025',
      endDate: 'Jan 28, 2025',
      progress: 65,
      estimatedCost: '$4,200 - $5,800',
      confirmedQuote: '$4,950',
      squareFootage: '850 sq ft',
      unreadMessages: 1,
      lastUpdate: '45 min ago',
      priority: 'high'
    },
    {
      id: 2,
      title: 'HVAC System Diagnostic & Repair',
      contractor: 'Sarah Martinez',
      contractorCompany: 'Climate Control Experts',
      status: 'Scheduled',
      startDate: 'Jan 22, 2025',
      endDate: 'Jan 23, 2025',
      progress: 15,
      estimatedCost: '$800 - $1,500',
      confirmedQuote: '$1,150',
      unreadMessages: 0,
      lastUpdate: '1 day ago',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Roof Shingle Replacement - South Side',
      contractor: 'David Chen',
      contractorCompany: 'Summit Roofing & Repair',
      status: 'Pending Approval',
      startDate: 'Feb 5, 2025',
      endDate: 'Feb 8, 2025',
      progress: 5,
      estimatedCost: '$2,800 - $3,600',
      confirmedQuote: '$3,200',
      squareFootage: '420 sq ft',
      unreadMessages: 1,
      lastUpdate: '3 hours ago',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Water Heater Replacement',
      contractor: 'James Wilson',
      contractorCompany: 'Precision Plumbing Services',
      status: 'Needs Review',
      startDate: 'Jan 10, 2025',
      endDate: 'Jan 11, 2025',
      progress: 100,
      estimatedCost: '$1,800 - $2,400',
      confirmedQuote: '$2,100',
      unreadMessages: 0,
      lastUpdate: '5 days ago',
      priority: 'low'
    }
  ];

  const selectedJobData = jobs.find(j => j.id === selectedJob) || jobs[0];

  const pendingQAByJob: Record<number, number> = {
    1: 2,
    2: 1,
    3: 1,
    4: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20';
      case 'Scheduled':
        return 'bg-[#FDC500]/10 text-[#FDC500] border-[#FDC500]/20';
      case 'Pending Approval':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Completed':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'Needs Review':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const messages = [
    {
      id: 1,
      sender: 'Mike Thompson',
      role: 'Contractor',
      message: 'Vapor barrier installation complete. Added photos to the job room. Dehumidifier arrives tomorrow morning.',
      time: '2 hours ago',
      hasAttachment: true,
      attachmentCount: 4
    },
    {
      id: 2,
      sender: 'You',
      role: 'Homeowner',
      message: 'Great progress! Quick question - will the dehumidifier need a dedicated outlet?',
      time: '3 hours ago',
      hasAttachment: false
    },
    {
      id: 3,
      sender: 'Mike Thompson',
      role: 'Contractor',
      message: 'Yes, we will use the existing outlet near the sump pump. It is on a dedicated 20A circuit, which is perfect for this unit.',
      time: '3 hours ago',
      hasAttachment: false
    },
    {
      id: 4,
      sender: 'Emporva System',
      role: 'System',
      message: 'Milestone completed: Vapor Barrier Installation. Payment hold released: $1,485',
      time: '4 hours ago',
      hasAttachment: false
    }
  ];

  const getTradeStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20';
      case 'Ready to Start':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Requires Approval':
        return 'bg-[#FDC500]/10 text-[#FDC500] border-[#FDC500]/20';
      case 'Blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTradeStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'ri-check-line';
      case 'In Progress':
        return 'ri-loader-4-line';
      case 'Ready to Start':
        return 'ri-play-circle-line';
      case 'Requires Approval':
        return 'ri-time-line';
      case 'Blocked':
        return 'ri-lock-line';
      default:
        return 'ri-question-line';
    }
  };

  const renderDependencyChain = () => {
    if (!selectedJobData.isMultiTrade || !selectedJobData.trades) return null;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <i className="ri-information-line text-blue-600 text-xl"></i>
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Multi-Trade Project with Sequenced Workflow
            </p>
            <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              This project involves {selectedJobData.trades.length} specialized trades working in coordinated sequence. Each trade has dependencies that must complete before the next can begin.
            </p>
          </div>
        </div>

        {/* Visual Dependency Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-[#2D2A74] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <i className="ri-git-branch-line text-[#00B8A9]"></i>
            Project Timeline & Dependencies
          </h4>
          
          <div className="space-y-4">
            {selectedJobData.trades.map((trade, index) => {
              const hasDependencies = trade.dependencies.length > 0;
              const dependencyTrades = hasDependencies 
                ? selectedJobData.trades!.filter(t => trade.dependencies.includes(t.id))
                : [];

              return (
                <div key={trade.id} className="relative">
                  {/* Dependency Lines */}
                  {index > 0 && (
                    <div className="absolute left-5 -top-4 w-0.5 h-4 bg-gray-300"></div>
                  )}

                  <div className="flex gap-4 items-start">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      trade.status === 'Complete' ? 'bg-green-500 text-white' :
                      trade.status === 'In Progress' ? 'bg-[#00B8A9] text-white' :
                      trade.status === 'Ready to Start' ? 'bg-blue-500 text-white' :
                      trade.status === 'Blocked' ? 'bg-red-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      <i className={`${getTradeStatusIcon(trade.status)} text-xl`}></i>
                    </div>

                    {/* Trade Card */}
                    <div 
                      className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTrade === trade.id 
                          ? 'border-[#00B8A9] bg-[#00B8A9]/5' 
                          : 'border-gray-200 hover:border-[#00B8A9]/50'
                      }`}
                      onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {trade.name}
                            </h5>
                            {trade.unreadMessages > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {trade.unreadMessages}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#333645] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {trade.contractor} • {trade.startDate} - {trade.endDate}
                          </p>
                          <p className="text-xs font-bold text-[#00B8A9]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {trade.cost}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTradeStatusColor(trade.status)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {trade.status}
                        </span>
                      </div>

                      {/* Dependencies Info */}
                      {hasDependencies && (
                        <div className="mb-2 p-2 bg-gray-50 rounded text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <span className="text-gray-600">Depends on: </span>
                          <span className="text-[#2D2A74] font-semibold">
                            {dependencyTrades.map(dt => dt.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            trade.status === 'Complete' ? 'bg-green-500' :
                            trade.status === 'In Progress' ? 'bg-[#00B8A9]' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${trade.progress}%` }}
                        ></div>
                      </div>

                      {/* Expanded Details */}
                      {selectedTrade === trade.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-[#2D2A74] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              Materials ({trade.materials.length})
                            </p>
                            <div className="space-y-2">
                              {trade.materials.map((material, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-200">
                                  <div className="flex-1">
                                    <p className="font-semibold text-[#2D2A74] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {material.name}
                                      {material.sharedWith && (
                                        <span className="ml-2 text-[#00B8A9] text-xs">
                                          <i className="ri-share-line"></i> Shared
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {material.needed} • {material.cost}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    material.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    material.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {material.status === 'delivered' ? 'Delivered' :
                                     material.status === 'in-transit' ? 'In Transit' :
                                     'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <i className="ri-message-3-line mr-1"></i>
                              Message {trade.contractor.split(' ')[0]}
                            </button>
                            {trade.status === 'Requires Approval' && (
                              <button className="flex-1 px-3 py-2 bg-[#FDC500] text-[#2D2A74] rounded-lg hover:bg-[#fdd633] transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                <i className="ri-check-line mr-1"></i>
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-xs text-green-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Completed Trades</div>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedJobData.trades.filter(t => t.status === 'Complete').length}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>In Progress</div>
            <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedJobData.trades.filter(t => t.status === 'In Progress').length}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-xs text-orange-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Ready to Start</div>
            <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedJobData.trades.filter(t => t.status === 'Ready to Start').length}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-xs text-red-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Blocked</div>
            <div className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedJobData.trades.filter(t => t.status === 'Blocked').length}
            </div>
          </div>
        </div>

        {/* Coordination Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-[#2D2A74] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <i className="ri-notification-3-line text-[#00B8A9]"></i>
            Coordination Alerts
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <i className="ri-check-line text-green-600 text-lg"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Plumbing Complete — Drywall Ready
                </p>
                <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sarah Chen completed plumbing rough-in. James Wilson has been notified that drywall stage is ready to begin.
                </p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <i className="ri-loader-4-line text-blue-600 text-lg"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Electrical In Progress
                </p>
                <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tom Rodriguez is 70% complete with electrical upgrade. Estimated completion: Jan 30.
                </p>
              </div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <i className="ri-alert-line text-orange-600 text-lg"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Material Conflict Detected
                </p>
                <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Primer & Paint is marked as shared between Drywall and Painting trades. Coordination required to avoid duplicate orders.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-gradient-to-r from-[#2D2A74] to-[#00B8A9] rounded-lg p-6 text-white">
          <h4 className="font-bold text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <i className="ri-compass-3-line"></i>
            What Happens Next
          </h4>
          <div className="space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              <strong>Current Phase:</strong> Electrical upgrade is 70% complete (Tom Rodriguez)
            </p>
            <p>
              <strong>Next Phase:</strong> Once electrical is finished, drywall installation will begin (James Wilson)
            </p>
            <p>
              <strong>Timeline:</strong> Drywall expected to start Jan 31 and complete by Feb 5
            </p>
            <p>
              <strong>Your Action:</strong> No action needed. You'll receive a notification when drywall is ready for inspection.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D2A74] to-[#00B8A9] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Current Emporva Jobs
            </h2>
            <p className="text-white/90 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track active projects, communicate with contractors, and manage approvals
            </p>
          </div>
          <div className="flex items-center gap-4">
            {Object.values(pendingQAByJob).reduce((a, b) => a + b, 0) > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/30 transition-colors" onClick={() => setShowQA(true)}>
                <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                  <i className="ri-question-answer-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {Object.values(pendingQAByJob).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-xs text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Questions Pending
                  </div>
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {jobs.length}
              </div>
              <div className="text-sm text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                Active Jobs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#2D2A74] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your Jobs
            </h3>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedJob === job.id
                      ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                      : 'border-gray-100 hover:border-[#00B8A9]/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[#2D2A74] text-sm leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(pendingQAByJob[job.id] || 0) > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" title="Pending contractor questions">
                          <i className="ri-question-line text-xs"></i>
                        </span>
                      )}
                      {job.unreadMessages > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {job.unreadMessages}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.contractorCompany}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {job.lastUpdate}
                    </span>
                  </div>

                  {(pendingQAByJob[job.id] || 0) > 0 && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md">
                      <i className="ri-question-answer-line text-orange-500 text-xs"></i>
                      <span className="text-xs font-semibold text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {pendingQAByJob[job.id]} contractor question{pendingQAByJob[job.id] > 1 ? 's' : ''} awaiting reply
                      </span>
                    </div>
                  )}

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00B8A9] h-2 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Details Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Job Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#2D2A74] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {selectedJobData.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line"></i>
                      {selectedJobData.contractor}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-building-line"></i>
                      {selectedJobData.contractorCompany}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(selectedJobData.status)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {selectedJobData.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Start Date</div>
                  <div className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedJobData.startDate}</div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>End Date</div>
                  <div className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedJobData.endDate}</div>
                </div>
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Progress</div>
                  <div className="font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedJobData.progress}%</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <i className="ri-message-3-line"></i>
                  Message Contractor
                </button>
                {(pendingQAByJob[selectedJob] || 0) > 0 && (
                  <button
                    onClick={() => setShowQA(true)}
                    className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 relative"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-question-answer-line"></i>
                    Answer Questions
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {pendingQAByJob[selectedJob]}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowPaymentPanel(true)}
                  className="px-4 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c5a574] transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className="ri-secure-payment-line"></i>
                  Pay
                </button>
                <button className="px-4 py-3 bg-white border-2 border-[#2D2A74] text-[#2D2A74] rounded-lg hover:bg-[#2D2A74] hover:text-white transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <i className="ri-phone-line"></i>
                  Call
                </button>
                <button className="px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <i className="ri-alert-line"></i>
                  Report Issue
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-100">
              <div className="flex gap-1 p-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                  ...(selectedJobData.isMultiTrade ? [{ id: 'trades', label: 'Multi-Trade Timeline', icon: 'ri-git-branch-line', badge: selectedJobData.trades?.length }] : []),
                  { id: 'messages', label: 'Messages', icon: 'ri-message-3-line', badge: selectedJobData.unreadMessages },
                  { id: 'documents', label: 'Documents', icon: 'ri-folder-line' },
                  { id: 'costs', label: 'Costs & Materials', icon: 'ri-money-dollar-circle-line' },
                  { id: 'progress', label: 'Progress', icon: 'ri-bar-chart-box-line' },
                  { id: 'timeline', label: 'Timeline', icon: 'ri-time-line' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all relative ${
                      activeTab === tab.id
                        ? 'bg-[#00B8A9] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className={tab.icon}></i>
                    {tab.label}
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'trades' && selectedJobData.isMultiTrade && renderDependencyChain()}
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Pending Q&A Alert */}
                  {(pendingQAByJob[selectedJob] || 0) > 0 && (
                    <div
                      onClick={() => setShowQA(true)}
                      className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-orange-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-question-answer-line text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {pendingQAByJob[selectedJob]} Contractor Question{pendingQAByJob[selectedJob] > 1 ? 's' : ''} Awaiting Your Response
                        </p>
                        <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Contractors interested in this job have asked questions. Responding helps them provide more accurate quotes and speeds up the process.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 flex-shrink-0">
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Reply Now</span>
                        <i className="ri-arrow-right-s-line text-lg"></i>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Job Summary
                    </h4>
                    <div className="bg-[#F9F9FB] rounded-lg p-4 space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <p className="text-[#333645]">
                        Complete moisture remediation of crawlspace including vapor barrier installation, dehumidifier setup, insulation repair, and drainage improvements. This project addresses high humidity levels detected during the home inspection and prevents future mold growth and structural damage.
                      </p>
                      {selectedJobData.squareFootage && (
                        <p className="text-gray-600">
                          <strong>Area:</strong> {selectedJobData.squareFootage}
                        </p>
                      )}
                      <p className="text-gray-600">
                        <strong>Permit Status:</strong> No permit required for this scope of work
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-xs text-green-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>On Schedule</div>
                        <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <i className="ri-check-line"></i>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-xs text-blue-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Days Remaining</div>
                        <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>8</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-xs text-purple-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Milestones Complete</div>
                        <div className="text-2xl font-bold text-purple-600" style={{ fontFamily: 'Poppins, sans-serif' }}>2/5</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-xs text-orange-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Budget Status</div>
                        <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <i className="ri-funds-line"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Recent Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-2 h-2 bg-[#00B8A9] rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <strong>Mike Thompson</strong> uploaded 4 progress photos
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Milestone completed: <strong>Vapor Barrier Installation</strong>
                          </p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Payment released: <strong>$1,485</strong> (Milestone 2)
                          </p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/20 rounded-lg p-4 flex items-start gap-3">
                    <i className="ri-information-line text-[#0B1F33] text-xl"></i>
                    <div className="flex-1">
                      <p className="text-sm text-[#0B1F33] font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Real-Time Sync Active
                      </p>
                      <p className="text-xs text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Messages, photos, and updates appear instantly for both you and your contractor. All communication is logged and secure.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.role === 'Homeowner'
                            ? 'bg-[#00B8A9]/10 ml-8'
                            : msg.role === 'System'
                            ? 'bg-gray-50 border border-gray-200'
                            : 'bg-white border border-gray-200 mr-8'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {msg.sender}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              msg.role === 'Contractor' ? 'bg-[#00B8A9]/20 text-[#00B8A9]' :
                              msg.role === 'System' ? 'bg-gray-200 text-gray-600' :
                              'bg-[#2D2A74]/20 text-[#2D2A74]'
                            }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {msg.role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {msg.message}
                        </p>
                        {msg.hasAttachment && (
                          <div className="flex items-center gap-2 text-xs text-[#00B8A9] cursor-pointer hover:underline">
                            <i className="ri-attachment-2"></i>
                            {msg.attachmentCount} attachments
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                      <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <i className="ri-attachment-2 text-lg"></i>
                      </button>
                      <button className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a2f47] transition-colors font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <HomeownerDocuments
                  jobId={selectedJob}
                  jobTitle={selectedJobData.title}
                  contractor={selectedJobData.contractor}
                />
              )}

              {activeTab === 'costs' && (
                <HomeownerCostsMaterials jobId={selectedJob} jobTitle={selectedJobData.title} contractor={selectedJobData.contractor} />
              )}

              {activeTab === 'progress' && (
                <HomeownerProgressView jobId={selectedJob} jobTitle={selectedJobData.title} contractor={selectedJobData.contractor} />
              )}

              {activeTab === 'timeline' && (
                <ProjectTimeline
                  jobId={selectedJob}
                  jobTitle={selectedJobData.title}
                  contractor={selectedJobData.contractor}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#2D2A74] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <i className="ri-notification-3-line text-[#00B8A9]"></i>
          Smart Alerts & Notifications
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="ri-eye-line text-green-600 text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Quote Viewed
                </p>
                <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Mike Thompson viewed your approval on the change order 2 hours ago
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="ri-alert-line text-orange-600 text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-orange-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Approval Needed
                </p>
                <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Roof Shingle Replacement quote is waiting for your approval to continue
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="ri-money-dollar-circle-line text-blue-600 text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Payment Ready
                </p>
                <p className="text-xs text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Milestone 3 is ready for payment release ($990) - Insulation work completed
                </p>
              </div>
              <button
                onClick={() => setShowPaymentPanel(true)}
                className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer whitespace-nowrap flex-shrink-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Pay Now
              </button>
            </div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="ri-edit-line text-purple-600 text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Change Request
                </p>
                <p className="text-xs text-purple-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sarah Martinez added a change request for additional ductwork cleaning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A Modal */}
      {showQA && (
        <ContractorQA
          jobId={selectedJob}
          jobTitle={selectedJobData.title}
          onClose={() => setShowQA(false)}
        />
      )}

      {/* Payment Panel */}
      {showPaymentPanel && (
        <JobPaymentPanel
          jobId={selectedJob}
          jobTitle={selectedJobData.title}
          contractor={selectedJobData.contractor}
          onClose={() => setShowPaymentPanel(false)}
        />
      )}

      {/* Toast Notification */}
      {qaToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <i className="ri-check-double-line text-xl"></i>
          <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Response sent to contractor!
          </span>
        </div>
      )}
    </div>
  );
}

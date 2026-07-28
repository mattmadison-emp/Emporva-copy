import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useContractorJobs } from '../../../hooks/useContractorJobs';
import InvoiceBuilder from '../../../components/feature/InvoiceBuilder';
import ActiveJobsHeader from './ActiveJobsHeader';
import JobListSidebar from './JobListSidebar';
import JobDetailPanel from './JobDetailPanel';
import SmartAlerts from './SmartAlerts';
import {
  AddMaterialsModal,
  ChangeOrderModal,
  MilestoneCompleteModal,
  UploadPhotosModal,
  MessageTradesModal,
  ReportIssueModal,
  TradeScopesModal,
  ProjectTimelineModal,
  RequestApprovalModal,
  MarkJobCompleteModal,
} from './modals';

type ActiveModal =
  | null
  | 'addMaterials'
  | 'changeOrder'
  | 'milestoneComplete'
  | 'uploadPhotos'
  | 'messageTrades'
  | 'reportIssue'
  | 'tradeScopes'
  | 'projectTimeline'
  | 'requestApproval'
  | 'markJobComplete'
  | 'sendInvoice';

export default function ActiveEmporvaJobs() {
  const { jobs, loading } = useContractorJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setActiveModal(null);

  // Auto-select first job
  const effectiveSelectedId = selectedJobId || (jobs.length > 0 ? jobs[0].id : null);
  const selectedJob = jobs.find(j => j.id === effectiveSelectedId);

  // Milestones from project_milestones table
  const [milestones, setMilestones] = useState<Array<{ id: string; title: string; status: string; date: string; payment: string }>>([]);

  const fetchMilestones = useCallback(async () => {
    if (!effectiveSelectedId) { setMilestones([]); return; }
    const { data } = await supabase
      .from('project_milestones')
      .select('id, title, status, due_date')
      .eq('job_id', effectiveSelectedId)
      .order('sort_order', { ascending: true });

    if (data) {
      setMilestones(data.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        date: m.due_date ? new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        payment: '—',
      })));
    }
  }, [effectiveSelectedId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // Trade data for multi-trade modals
  const tradeData = selectedJob
    ? selectedJob.all_work_items.map(wi => ({
        id: wi.id as any,
        tradeName: wi.trade,
        contractor: wi.contractor_id === selectedJob.my_work_item.contractor_id ? 'You' : wi.trade,
        contractorEmail: '',
        status: wi.status === 'completed' ? 'Complete' as const
          : wi.status === 'in-progress' ? 'In Progress' as const
          : wi.status === 'assigned' ? 'Ready to Start' as const
          : 'Blocked' as const,
        startDate: wi.start_date || '—',
        endDate: wi.end_date || '—',
        progress: wi.status === 'completed' ? 100 : wi.status === 'in-progress' ? 50 : 0,
        cost: wi.agreed_price ? `$${wi.agreed_price.toLocaleString()}` : (wi.estimated_budget || '—'),
        dependencies: [] as string[],
        materials: [] as any[],
        unreadMessages: 0,
        isMyTrade: wi.id === selectedJob.my_work_item.id,
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line text-3xl text-teal-600 animate-spin"></i>
          <p className="text-sm text-[#6B7C8F] mt-3">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <i className={`${
              toast.type === 'success' ? 'ri-check-line text-green-600' :
              toast.type === 'error' ? 'ri-close-line text-red-600' :
              'ri-information-line text-blue-600'
            } text-lg`}></i>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedJob && (
        <>
          <AddMaterialsModal
            show={activeModal === 'addMaterials'}
            onClose={closeModal}
            onSubmit={(data) => { closeModal(); showToast(`${data.name} added to materials list`); }}
            jobTitle={selectedJob.title}
          />
          <ChangeOrderModal
            show={activeModal === 'changeOrder'}
            onClose={closeModal}
            onSubmit={() => { closeModal(); showToast('Change order request sent to homeowner'); }}
            jobTitle={selectedJob.title}
            homeowner={selectedJob.homeowner_name}
          />
          <MilestoneCompleteModal
            show={activeModal === 'milestoneComplete'}
            onClose={closeModal}
            onSubmit={(name) => { closeModal(); showToast(`"${name}" marked as complete`); }}
            milestones={milestones}
            jobTitle={selectedJob.title}
          />
          <UploadPhotosModal
            show={activeModal === 'uploadPhotos'}
            onClose={closeModal}
            onSubmit={(count) => { closeModal(); showToast(`${count} photo${count > 1 ? 's' : ''} uploaded successfully`); }}
            jobTitle={selectedJob.title}
            milestones={milestones}
          />
          <MessageTradesModal
            show={activeModal === 'messageTrades'}
            onClose={closeModal}
            onSubmit={(tradeName) => { closeModal(); showToast(`Message sent to ${tradeName}`); }}
            trades={tradeData}
            jobTitle={selectedJob?.job_title}
          />
          <ReportIssueModal
            show={activeModal === 'reportIssue'}
            onClose={closeModal}
            onSubmit={() => { closeModal(); showToast('Issue report submitted successfully'); }}
            jobTitle={selectedJob.title}
            trades={tradeData}
          />
          <TradeScopesModal
            show={activeModal === 'tradeScopes'}
            onClose={closeModal}
            trades={tradeData}
            jobTitle={selectedJob.title}
          />
          <ProjectTimelineModal
            show={activeModal === 'projectTimeline'}
            onClose={closeModal}
            trades={tradeData}
            jobTitle={selectedJob.title}
          />
          <RequestApprovalModal
            show={activeModal === 'requestApproval'}
            onClose={closeModal}
            onSubmit={(type) => { closeModal(); showToast(`${type} approval request sent to ${selectedJob.homeowner_name}`); }}
            jobTitle={selectedJob.title}
            homeowner={selectedJob.homeowner_name}
            milestones={milestones}
          />
          <MarkJobCompleteModal
            show={activeModal === 'markJobComplete'}
            onClose={closeModal}
            onSubmit={() => {
              closeModal();
              showToast(selectedJob.is_multi_trade
                ? `Your ${selectedJob.my_trade_role} work marked complete`
                : `"${selectedJob.title}" submitted for final completion`
              );
            }}
            jobTitle={selectedJob.title}
            homeowner={selectedJob.homeowner_name}
            isMultiTrade={selectedJob.is_multi_trade}
            myTradeRole={selectedJob.my_trade_role}
            confirmedQuote={selectedJob.my_work_item.agreed_price ? `$${selectedJob.my_work_item.agreed_price.toLocaleString()}` : '—'}
            milestones={milestones}
          />

          {/* Send Invoice Modal */}
          {activeModal === 'sendInvoice' && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">Send Invoice — {selectedJob.title}</h3>
                    <p className="text-sm text-[#6B7C8F] mt-1">Create and send a branded invoice to {selectedJob.homeowner_name}</p>
                  </div>
                  <button onClick={closeModal} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                    <i className="ri-close-line text-xl text-gray-500"></i>
                  </button>
                </div>
                <div className="p-6">
                  <InvoiceBuilder
                    jobId={selectedJob.id as any}
                    jobTitle={selectedJob.title}
                    homeowner={selectedJob.homeowner_name}
                    homeownerEmail={selectedJob.homeowner_email}
                    propertyAddress={selectedJob.property_address}
                    confirmedQuote={selectedJob.my_work_item.agreed_price ? `$${selectedJob.my_work_item.agreed_price.toLocaleString()}` : '—'}
                    onClose={closeModal}
                    onSend={() => { closeModal(); showToast(`Invoice sent to ${selectedJob.homeowner_name}`); }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ActiveJobsHeader jobCount={jobs.length} />

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="ri-briefcase-line text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-bold text-[#0B1F33] mb-2">No Active Jobs</h3>
          <p className="text-sm text-[#6B7C8F]">
            When you're assigned work items on jobs, they'll appear here for you to manage.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <JobListSidebar
            jobs={jobs}
            selectedJobId={effectiveSelectedId}
            onSelectJob={setSelectedJobId}
          />
          {selectedJob && (
            <JobDetailPanel
              job={selectedJob}
              onOpenModal={setActiveModal}
            />
          )}
        </div>
      )}

      <SmartAlerts jobs={jobs} />

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

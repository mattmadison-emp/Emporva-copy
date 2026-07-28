import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import JobPostingModal, { JobPostingData } from '../../../components/feature/JobPostingModal';
import OwnerQuotesView from '../../../components/feature/OwnerQuotesView';
import type { Job } from '../../../types/job';

const budgetLabels: Record<string, string> = {
  'under-1000': 'Under $1,000',
  '1000-5000': '$1,000 - $5,000',
  '5000-10000': '$5,000 - $10,000',
  '10000-25000': '$10,000 - $25,000',
  '25000-plus': '$25,000+',
};

const timelineLabels: Record<string, string> = {
  'asap': 'ASAP',
  'within-1-week': 'Within 1 week',
  'within-1-month': 'Within 1 month',
  'within-3-months': 'Within 3 months',
  'flexible': 'Flexible',
};

export default function PostedJobsTab() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'quotes' | 'messages'>('details');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleJobPost = (jobData: JobPostingData) => {
    console.log('Job posted:', jobData);
    setShowJobPostingModal(false);
    fetchJobs();
  };

  const handleAcceptQuote = (quoteId: string) => {
    console.log('Accepting quote:', quoteId);
  };

  const handleDeclineQuote = (quoteId: string) => {
    console.log('Declining quote:', quoteId);
  };

  const handleAskQuestion = (quoteId: string) => {
    console.log('Opening message for quote:', quoteId);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete || !user) return;
    setDeleting(true);
    await supabase.from('jobs').delete().eq('id', jobToDelete.id);

    // Log activity
    const { logActivity } = await import('../../../lib/activityLog');
    await logActivity({
      userId: user.id,
      action: 'job_deleted',
      description: `Deleted job: ${jobToDelete.title}`,
      homeownerProfileId: jobToDelete.homeowner_profile_id,
      metadata: { title: jobToDelete.title, category: jobToDelete.category },
    });

    setDeleting(false);
    setJobToDelete(null);
    if (selectedJob?.id === jobToDelete.id) {
      setSelectedJob(null);
    }
    fetchJobs();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
              <i className="ri-briefcase-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
            <button
              onClick={() => setShowJobPostingModal(true)}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              Post Your First Job
            </button>
          </div>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Job Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <i className="ri-calendar-line"></i>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="ri-map-pin-line"></i>
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    title="Delete job"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Quotes Summary */}
            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Category</p>
                  <p className="text-sm font-semibold text-gray-900">{job.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Quotes Received</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{job.quotes_received}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.budget_range ? budgetLabels[job.budget_range] || job.budget_range : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedJob?.id === job.id && (
              <div className="p-4 sm:p-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  {['quotes', 'details', 'messages'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab as any)}
                      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeDetailTab === tab
                          ? 'border-teal-600 text-teal-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab === 'quotes' && `Quotes (${job.quotes_received})`}
                      {tab === 'details' && 'Job Details'}
                      {tab === 'messages' && 'Messages'}
                    </button>
                  ))}
                </div>

                {/* Quotes Tab */}
                {activeDetailTab === 'quotes' && (
                  <div className="space-y-3 sm:space-y-4">
                    {job.quotes_received > 0 ? (
                      <OwnerQuotesView
                        jobId={job.id}
                        jobTitle={job.title}
                        onAcceptQuote={handleAcceptQuote}
                        onDeclineQuote={handleDeclineQuote}
                        onAskQuestion={handleAskQuestion}
                      />
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                          <i className="ri-file-text-line text-2xl sm:text-3xl text-gray-400"></i>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">No quotes received yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeDetailTab === 'details' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{job.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Budget Range</h4>
                        <p className="text-sm text-gray-700">
                          {job.budget_range ? budgetLabels[job.budget_range] || job.budget_range : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                        <p className="text-sm text-gray-700">
                          {job.timeline ? timelineLabels[job.timeline] || job.timeline : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                      <span className="px-2 py-1 bg-[#14B8A6] text-white text-xs font-semibold rounded-full">
                        {job.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages Tab */}
                {activeDetailTab === 'messages' && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                      <i className="ri-message-3-line text-2xl sm:text-3xl text-gray-400"></i>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">No messages yet</p>
                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Start Conversation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        userType="homeowner"
        onSubmit={handleJobPost}
      />

      {/* Delete Confirmation Dialog */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <i className="ri-delete-bin-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Job</h3>
            <p className="text-sm text-gray-600 text-center mb-1">
              Are you sure you want to delete this job?
            </p>
            <p className="text-sm font-semibold text-gray-900 text-center mb-6">
              "{jobToDelete.title}"
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone. Any quotes or messages associated with this job will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

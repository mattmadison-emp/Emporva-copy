import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import JobPostingModal from './JobPostingModal';
import OwnerQuotesView from './OwnerQuotesView';
import type { Job } from '../../types/job';

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

interface PostedJobsViewProps {
  userType: 'homeowner' | 'multi-unit';
}

export default function PostedJobsView({ userType }: PostedJobsViewProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'quotes' | 'interested'>('details');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);
    fetchJobs();
    if (selectedJob?.id === jobId) {
      setSelectedJob({ ...selectedJob, status: newStatus as Job['status'] });
    }
  };

  const handleAcceptQuote = (quoteId: string) => {
    console.log(`Accepting quote: ${quoteId}`);
    if (selectedJob) {
      handleStatusChange(selectedJob.id, 'in-progress');
    }
  };

  const handleDeclineQuote = (quoteId: string) => {
    console.log(`Declining quote: ${quoteId}`);
  };

  const handleAskQuestion = (quoteId: string) => {
    console.log(`Opening message thread for quote: ${quoteId}`);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete || !user) return;
    setDeleting(true);
    await supabase.from('jobs').delete().eq('id', jobToDelete.id);

    const { logActivity } = await import('../../lib/activityLog');
    await logActivity({
      userId: user.id,
      action: 'job_deleted',
      description: `Deleted job: ${jobToDelete.title}`,
      homeownerProfileId: jobToDelete.homeowner_profile_id,
      multiUnitProfileId: jobToDelete.multi_unit_profile_id,
      metadata: { title: jobToDelete.title, category: jobToDelete.category },
    });

    setDeleting(false);
    setJobToDelete(null);
    if (selectedJob?.id === jobToDelete.id) {
      setSelectedJob(null);
    }
    fetchJobs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Posted Jobs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your job postings and review contractor quotes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Active Jobs</p>
            <p className="text-2xl font-bold text-teal-600">
              {jobs.filter(j => j.status === 'open' || j.status === 'in-progress').length}
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{job.title}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-tools-line text-gray-600"></i>
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                      {job.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-map-pin-line"></i>
                    <span>{job.location}</span>
                  </div>
                  {job.timeline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="ri-alarm-line"></i>
                      <span className="font-medium">{timelineLabels[job.timeline] || job.timeline}</span>
                    </div>
                  )}
                  {job.budget_range && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="ri-money-dollar-circle-line"></i>
                      <span className="font-medium">{budgetLabels[job.budget_range] || job.budget_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-calendar-line"></i>
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 sm:gap-6 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="ri-file-text-line text-green-600"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Quotes</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{job.quotes_received}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setActiveDetailTab('details');
                    }}
                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-eye-line mr-1 sm:mr-2"></i>
                    View Details
                  </button>
                  {job.quotes_received > 0 && (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setActiveDetailTab('quotes');
                      }}
                      className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap relative"
                    >
                      <i className="ri-file-text-line mr-1 sm:mr-2"></i>
                      Review Quotes
                      <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {job.quotes_received}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="px-3 sm:px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-1 sm:mr-2"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posted Jobs</h3>
          <p className="text-gray-600">
            Click "Post a Job" to get started and receive quotes from contractors.
          </p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-4xl sm:my-8 max-h-[90vh] sm:max-h-none overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-xl z-10 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Posted {new Date(selectedJob.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer ml-4"
                >
                  <i className="ri-close-line text-xl sm:text-2xl"></i>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setActiveDetailTab('details')}
                  className={`px-3 sm:px-4 py-2 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    activeDetailTab === 'details'
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="ri-file-list-line mr-1 sm:mr-2"></i>
                  Job Details
                </button>
                <button
                  onClick={() => setActiveDetailTab('quotes')}
                  className={`px-3 sm:px-4 py-2 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap relative ${
                    activeDetailTab === 'quotes'
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="ri-file-text-line mr-1 sm:mr-2"></i>
                  Quotes
                  {selectedJob.quotes_received > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">
                      {selectedJob.quotes_received}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {activeDetailTab === 'details' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Job Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Category</p>
                      <span className="px-2 py-1 bg-teal-600 text-white text-xs font-semibold rounded-full">
                        {selectedJob.category}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Location</p>
                      <p className="text-sm text-gray-900">{selectedJob.location}</p>
                    </div>
                    {selectedJob.timeline && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Timeline</p>
                        <p className="text-sm text-gray-900">{timelineLabels[selectedJob.timeline] || selectedJob.timeline}</p>
                      </div>
                    )}
                    {selectedJob.budget_range && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Budget Range</p>
                        <p className="text-sm text-gray-900">{budgetLabels[selectedJob.budget_range] || selectedJob.budget_range}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Controls */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Job Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['open', 'in-progress', 'completed', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedJob.id, status)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            selectedJob.status === status
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'quotes' && (
                <OwnerQuotesView
                  jobId={selectedJob.id}
                  jobTitle={selectedJob.title}
                  onAcceptQuote={handleAcceptQuote}
                  onDeclineQuote={handleDeclineQuote}
                  onAskQuestion={handleAskQuestion}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <JobPostingModal
          isOpen={true}
          onClose={() => setEditingJob(null)}
          userType={userType}
          onSubmit={() => {
            setEditingJob(null);
            fetchJobs();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
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
    </div>
  );
}

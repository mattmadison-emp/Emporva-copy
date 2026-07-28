import { useState } from 'react';

export interface ProjectJob {
  id: string;
  title: string;
  contractor: string;
  contractorAvatar: string;
  contractorId: string;
  status: string;
  progress: number;
  startDate: string;
  estimatedCompletion: string;
  budget: number;
  spent: number;
  nextMilestone: string;
  lastUpdate: string;
  pendingApprovals: number;
  newPhotos: number;
}

interface QAThread {
  id: string;
  jobId: string;
  approvalId?: string;
  question: string;
  category: string;
  askedBy: 'homeowner' | 'contractor';
  askerName: string;
  askedAt: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  status: 'pending' | 'answered';
}

interface ProjectJobsListProps {
  jobs: ProjectJob[];
  loading: boolean;
  qaThreads: QAThread[];
  onSelectJob: (jobId: string) => void;
  onMessageJob: (job: { id: string; title: string; contractor: string; avatar: string }) => void;
  onCreateProject: () => void;
}

export default function ProjectJobsList({ jobs, loading, qaThreads, onSelectJob, onMessageJob, onCreateProject }: ProjectJobsListProps) {
  const getPendingContractorQuestions = (jobId: string) =>
    qaThreads.filter(t => t.jobId === jobId && t.askedBy === 'contractor' && t.status === 'pending');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#14B8A6] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-[#6B7C8F]">Loading projects...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-briefcase-line text-3xl sm:text-4xl text-[#6B7C8F]"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33] mb-2">No Active Projects</h3>
        <p className="text-sm sm:text-base text-[#6B7C8F] mb-6">Start a new project to get matched with qualified contractors</p>
        <button
          onClick={onCreateProject}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
        >
          Start Your First Project
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      {jobs.map((job) => {
        const jobPendingQs = getPendingContractorQuestions(job.id);
        return (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                {job.contractorAvatar ? (
                  <img
                    src={job.contractorAvatar}
                    alt={job.contractor}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{job.contractor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-[#0B1F33] mb-1 line-clamp-2">{job.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6B7C8F] mb-2 truncate">{job.contractor}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-sm font-semibold">
                      {job.status}
                    </span>
                    <span className="text-[10px] sm:text-sm text-[#6B7C8F]">Updated {job.lastUpdate}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                {jobPendingQs.length > 0 && (
                  <div className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] sm:text-sm font-bold flex items-center gap-1">
                    <i className="ri-question-answer-line"></i>
                    {jobPendingQs.length} Q&amp;A
                  </div>
                )}
                {job.pendingApprovals > 0 && (
                  <div className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] sm:text-sm font-bold flex items-center gap-1">
                    <i className="ri-alert-line"></i>
                    {job.pendingApprovals} Approval{job.pendingApprovals > 1 ? 's' : ''}
                  </div>
                )}
                {job.newPhotos > 0 && (
                  <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-bold flex items-center gap-1">
                    <i className="ri-image-line"></i>
                    {job.newPhotos} New
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-semibold text-[#0B1F33]">Progress</span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1F33]">{job.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#14B8A6] to-[#0ea89a] rounded-full transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="bg-[#F9F9FB] rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Budget</p>
                <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">${job.budget.toLocaleString()}</p>
              </div>
              <div className="bg-[#F9F9FB] rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Spent</p>
                <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">${job.spent.toLocaleString()}</p>
              </div>
              <div className="bg-[#F9F9FB] rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1 truncate">Next Milestone</p>
                <p className="text-xs sm:text-sm font-bold text-[#0B1F33] truncate">{job.nextMilestone}</p>
              </div>
              <div className="bg-[#F9F9FB] rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1 truncate">Est. Completion</p>
                <p className="text-xs sm:text-sm font-bold text-[#0B1F33]">
                  {job.estimatedCompletion ? new Date(job.estimatedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => onSelectJob(job.id)}
                className="flex-1 px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => onMessageJob({ id: job.id, title: job.title, contractor: job.contractor, avatar: job.contractorAvatar })}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-white border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#F9F9FB] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
              >
                <i className="ri-message-3-line mr-1 sm:mr-2"></i>
                Message
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

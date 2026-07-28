import type { ActiveJobView } from '../../../types/activeJob';
import { getStatusColor, getStatusLabel } from './utils/statusColors';

interface JobListSidebarProps {
  jobs: ActiveJobView[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function JobListSidebar({ jobs, selectedJobId, onSelectJob }: JobListSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#0B1F33] mb-4">
          Your Jobs
        </h3>
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedJobId === job.id
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-gray-100 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-[#0B1F33] text-sm leading-tight mb-1">
                    {job.title}
                  </h4>
                  {job.is_multi_trade && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-1">
                      <i className="ri-team-line"></i>
                      Multi-Trade
                    </span>
                  )}
                  {job.is_multi_trade && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full ml-1">
                      <i className="ri-user-star-line"></i>
                      Your Role: {job.my_trade_role}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#6B7C8F] mb-2">
                {job.homeowner_name}
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.my_work_item.status)}`}>
                  {getStatusLabel(job.my_work_item.status)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(job.my_work_item.updated_at)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${job.progress}%` }}
                ></div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-briefcase-line text-3xl text-gray-300 mb-2"></i>
              <p className="text-sm text-[#6B7C8F]">No active jobs</p>
              <p className="text-xs text-gray-400 mt-1">Jobs will appear here when you're assigned work items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

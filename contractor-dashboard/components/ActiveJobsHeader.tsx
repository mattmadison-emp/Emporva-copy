interface ActiveJobsHeaderProps {
  jobCount: number;
}

export default function ActiveJobsHeader({ jobCount }: ActiveJobsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">
            Active Emporva Jobs
          </h2>
          <p className="text-white/90 text-lg">
            Manage projects, communicate with homeowners, and track progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">
              {jobCount}
            </div>
            <div className="text-sm text-white/80">
              Active Jobs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

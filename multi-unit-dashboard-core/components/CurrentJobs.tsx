import { useState } from 'react';

export default function CurrentJobs() {
  const [filterProperty, setFilterProperty] = useState('all');
  const [jobs] = useState([
    {
      id: 1,
      property: 'Building A',
      unit: '304',
      title: 'Water Leak Repair',
      trade: 'Plumbing',
      status: 'In Progress',
      contractor: 'Richmond Plumbing Co.',
      startDate: 'Today',
      estimatedCost: '$850',
      priority: 'Urgent'
    },
    {
      id: 2,
      property: 'Building C',
      unit: '102',
      title: 'HVAC Repair',
      trade: 'HVAC',
      status: 'Scheduled',
      contractor: 'Cool Air Systems',
      startDate: 'Tomorrow',
      estimatedCost: '$1,200',
      priority: 'High'
    },
    {
      id: 3,
      property: 'Building B',
      unit: '205',
      title: 'Water Heater Replacement',
      trade: 'Plumbing',
      status: 'Pending Approval',
      contractor: 'Metro Plumbing',
      startDate: 'Next Week',
      estimatedCost: '$2,400',
      priority: 'Medium'
    },
    {
      id: 4,
      property: 'Building A',
      unit: 'Common Area',
      title: 'Exterior Painting',
      trade: 'Painting',
      status: 'In Progress',
      contractor: 'Elite Painters',
      startDate: '3 days ago',
      estimatedCost: '$5,600',
      priority: 'Low'
    },
    {
      id: 5,
      property: 'Building C',
      unit: '301',
      title: 'Electrical Panel Upgrade',
      trade: 'Electrical',
      status: 'Scheduled',
      contractor: 'Bright Electric',
      startDate: 'Next Monday',
      estimatedCost: '$1,800',
      priority: 'Medium'
    }
  ]);

  const filteredJobs = filterProperty === 'all' 
    ? jobs 
    : jobs.filter(job => job.property === filterProperty);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Scheduled':
        return 'bg-green-100 text-green-700';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Current Emporva Jobs</h2>
          <p className="text-[#6B7C8F]">Track all active jobs across your portfolio</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483]"
          >
            <option value="all">All Properties</option>
            <option value="Building A">Building A</option>
            <option value="Building B">Building B</option>
            <option value="Building C">Building C</option>
          </select>
          <button className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap flex items-center gap-2">
            <i className="ri-add-line text-xl"></i>
            Create Job
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#0B1F33]">{job.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-[#6B7C8F]">
                  {job.property} - Unit {job.unit} • {job.trade}
                </p>
              </div>
              <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium whitespace-nowrap cursor-pointer">
                View Job Room →
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-4">
              <div>
                <p className="text-xs text-[#6B7C8F] mb-1">Contractor</p>
                <p className="text-sm font-semibold text-[#0B1F33]">{job.contractor}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F] mb-1">Start Date</p>
                <p className="text-sm font-semibold text-[#0B1F33]">{job.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F] mb-1">Estimated Cost</p>
                <p className="text-sm font-semibold text-[#0B1F33]">{job.estimatedCost}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F] mb-1">Trade</p>
                <p className="text-sm font-semibold text-[#0B1F33]">{job.trade}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-medium hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                Open Job Room
              </button>
              <button className="px-4 py-2 border border-[#E5E7EB] text-[#333645] rounded-lg text-sm font-medium hover:bg-[#F9F9FB] transition-colors whitespace-nowrap">
                View Timeline
              </button>
              <button className="px-4 py-2 border border-[#E5E7EB] text-[#333645] rounded-lg text-sm font-medium hover:bg-[#F9F9FB] transition-colors whitespace-nowrap">
                Message Contractor
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#D4B483]/10 rounded-xl p-6 border border-[#D4B483]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-2xl text-[#D4B483]"></i>
          </div>
          <div>
            <h4 className="font-semibold text-[#0B1F33] mb-2">Shared Job Rooms</h4>
            <p className="text-sm text-[#6B7C8F] mb-3">
              Each job has a dedicated workspace where you can communicate with contractors, approve changes, track progress, view photos, and manage payments—all in one place.
            </p>
            <p className="text-sm text-[#6B7C8F]">
              Scheduling windows show estimated timeframes, not exact times, to accommodate multi-trade coordination and dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

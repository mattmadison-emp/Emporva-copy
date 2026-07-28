export default function PropertyOverview() {
  const propertyData = {
    conditionScore: 87,
    address: '1847 Maple Ridge Drive',
    yearBuilt: 2008,
    squareFeet: 2450,
    lastInspection: 'March 2024',
    valueProtection: '3.2 years',
    annualSpend: '$4,850',
    preventiveSavings: '$12,300'
  };

  const upcomingRisks = [
    {
      system: 'Water Heater',
      age: 11,
      expectedLife: '12-15 years',
      urgency: 'high',
      action: 'Schedule diagnostic',
      estimatedCost: '$1,200-$1,800'
    },
    {
      system: 'Roof Shingles',
      age: 16,
      expectedLife: '20-25 years',
      urgency: 'medium',
      action: 'Plan for replacement',
      estimatedCost: '$8,500-$12,000'
    },
    {
      system: 'HVAC System',
      age: 9,
      expectedLife: '15-20 years',
      urgency: 'low',
      action: 'Continue maintenance',
      estimatedCost: '$6,000-$9,000'
    }
  ];

  const recentActivity = [
    {
      date: 'May 15, 2024',
      type: 'Service Completed',
      description: 'Kitchen faucet leak repair',
      contractor: 'Elite Plumbing Solutions',
      cost: '$385'
    },
    {
      date: 'May 10, 2024',
      type: 'Quote Received',
      description: 'Bathroom tile installation',
      contractor: 'Modern Home Renovations',
      cost: '$2,850'
    },
    {
      date: 'May 3, 2024',
      type: 'Maintenance',
      description: 'HVAC spring tune-up',
      contractor: 'Climate Control Experts',
      cost: '$195'
    }
  ];

  const maintenancePriorities = [
    { task: 'Clean gutters and downspouts', urgency: 'high', dueDate: 'This week' },
    { task: 'Replace HVAC air filters', urgency: 'medium', dueDate: 'Next 2 weeks' },
    { task: 'Test sump pump operation', urgency: 'medium', dueDate: 'Next 2 weeks' },
    { task: 'Inspect exterior caulking', urgency: 'low', dueDate: 'This month' }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium':
        return 'bg-[#FDC500]/10 text-[#FDC500] border-[#FDC500]/20';
      case 'low':
        return 'bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Health Score */}
      <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a2f47] rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Property Health Score
            </h2>
            <p className="text-white/90 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              {propertyData.address}
            </p>
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-6xl font-bold">{propertyData.conditionScore}</div>
              <div className="text-2xl font-semibold">/100</div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <i className="ri-arrow-up-line text-xl"></i>
              <span className="font-semibold">+5 points this quarter</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-3">
              <div className="text-sm text-white/80 mb-1">Built</div>
              <div className="text-2xl font-bold">{propertyData.yearBuilt}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-white/80 mb-1">Size</div>
              <div className="text-2xl font-bold">{propertyData.squareFeet.toLocaleString()}</div>
              <div className="text-xs text-white/70">sq ft</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div>
            <div className="text-sm text-white/80 mb-1">Asset Life Extended</div>
            <div className="text-2xl font-bold">{propertyData.valueProtection}</div>
          </div>
          <div>
            <div className="text-sm text-white/80 mb-1">Annual Spend</div>
            <div className="text-2xl font-bold">{propertyData.annualSpend}</div>
          </div>
          <div>
            <div className="text-sm text-white/80 mb-1">Preventive Savings</div>
            <div className="text-2xl font-bold">{propertyData.preventiveSavings}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Risks Alert */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-lg">
            <i className="ri-alert-line text-xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Upcoming Risks
          </h2>
        </div>

        <div className="space-y-4">
          {upcomingRisks.map((risk, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#D4B483] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#0B1F33] text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {risk.system}
                  </h3>
                  <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Age: {risk.age} years • Expected life: {risk.expectedLife}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(risk.urgency)}`}>
                  {risk.urgency.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Estimated cost:</strong> {risk.estimatedCost}
                </div>
                <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a2f47] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                  {risk.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Maintenance Priorities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Top Maintenance Priorities
          </h2>
          <div className="space-y-3">
            {maintenancePriorities.map((priority, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F9F9FB] transition-colors">
                <input type="checkbox" className="mt-1 w-5 h-5 cursor-pointer" />
                <div className="flex-1">
                  <div className="font-semibold text-[#2D2A74] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {priority.task}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getUrgencyColor(priority.urgency)}`}>
                      {priority.urgency}
                    </span>
                    <span className="text-xs text-gray-500">Due: {priority.dueDate}</span>
                  </div>
                </div>
                <button className="text-[#D4B483] hover:text-[#0B1F33] cursor-pointer">
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-3 border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg hover:bg-[#0B1F33] hover:text-white transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer">
            View All Tasks
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="border-l-4 border-[#D4B483] pl-4 py-2">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-bold text-[#D4B483]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {activity.type}
                  </span>
                  <span className="text-xs text-gray-500">{activity.date}</span>
                </div>
                <h3 className="font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {activity.description}
                </h3>
                <div className="flex items-center justify-between text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span>{activity.contractor}</span>
                  <span className="font-bold">{activity.cost}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-3 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#D4B483] hover:text-[#D4B483] transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
}

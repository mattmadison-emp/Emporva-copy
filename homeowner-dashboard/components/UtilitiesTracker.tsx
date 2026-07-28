export default function UtilitiesTracker() {
  const utilityData = {
    electric: {
      currentMonth: 1245,
      lastMonth: 1180,
      yearAvg: 1150,
      neighborhoodAvg: 1320,
      trend: 'up',
      efficiency: 92
    },
    gas: {
      currentMonth: 85,
      lastMonth: 120,
      yearAvg: 95,
      neighborhoodAvg: 110,
      trend: 'down',
      efficiency: 88
    },
    water: {
      currentMonth: 6800,
      lastMonth: 6500,
      yearAvg: 6200,
      neighborhoodAvg: 7500,
      trend: 'up',
      efficiency: 85
    }
  };

  const alerts = [
    {
      type: 'warning',
      title: 'Water usage spike detected',
      description: 'Your water usage increased 15% this month. Check for potential leaks.',
      action: 'Schedule inspection',
      icon: 'ri-drop-line'
    },
    {
      type: 'success',
      title: 'Energy efficiency improved',
      description: 'Your electric usage is 6% below neighborhood average.',
      action: 'View tips',
      icon: 'ri-flashlight-line'
    }
  ];

  const systems = [
    {
      name: 'HVAC System',
      efficiency: 92,
      lastService: 'March 2024',
      nextService: 'September 2024',
      energyImpact: 'High',
      status: 'Excellent'
    },
    {
      name: 'Water Heater',
      efficiency: 78,
      lastService: 'January 2024',
      nextService: 'January 2025',
      energyImpact: 'Medium',
      status: 'Fair'
    },
    {
      name: 'Insulation',
      efficiency: 85,
      lastService: 'N/A',
      nextService: 'Inspect in 2026',
      energyImpact: 'High',
      status: 'Good'
    },
    {
      name: 'Windows',
      efficiency: 70,
      lastService: 'N/A',
      nextService: 'Consider upgrade',
      energyImpact: 'Medium',
      status: 'Needs attention'
    }
  ];

  const maintenanceReminders = [
    { task: 'Replace HVAC air filter', due: 'This week', category: 'HVAC' },
    { task: 'Clean refrigerator coils', due: 'Next 2 weeks', category: 'Appliances' },
    { task: 'Check water heater pressure valve', due: 'This month', category: 'Plumbing' },
    { task: 'Inspect weatherstripping', due: 'This month', category: 'Weatherization' }
  ];

  const getEfficiencyColor = (score: number) => {
    if (score >= 85) return 'text-[#00B8A9]';
    if (score >= 70) return 'text-[#FDC500]';
    return 'text-red-600';
  };

  const getEfficiencyBg = (score: number) => {
    if (score >= 85) return 'bg-[#00B8A9]';
    if (score >= 70) return 'bg-[#FDC500]';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border-2 ${
                alert.type === 'warning'
                  ? 'bg-[#FDC500]/5 border-[#FDC500]/20'
                  : 'bg-[#00B8A9]/5 border-[#00B8A9]/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                    alert.type === 'warning' ? 'bg-[#FDC500]/10' : 'bg-[#00B8A9]/10'
                  }`}
                >
                  <i
                    className={`${alert.icon} text-xl ${
                      alert.type === 'warning' ? 'text-[#FDC500]' : 'text-[#00B8A9]'
                    }`}
                  ></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#2D2A74] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {alert.title}
                  </h3>
                  <p className="text-sm text-[#333645] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {alert.description}
                  </p>
                  <button className="px-4 py-2 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                    {alert.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Utility Usage Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Electric */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-[#FDC500]/10 rounded-lg">
              <i className="ri-flashlight-line text-2xl text-[#FDC500]"></i>
            </div>
            <div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Electric
              </h3>
              <div className="text-xs text-gray-500">kWh this month</div>
            </div>
          </div>

          <div className="text-4xl font-bold text-[#2D2A74] mb-2">
            {utilityData.electric.currentMonth.toLocaleString()}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <i className={`ri-arrow-${utilityData.electric.trend === 'up' ? 'up' : 'down'}-line text-lg ${
              utilityData.electric.trend === 'up' ? 'text-red-600' : 'text-[#00B8A9]'
            }`}></i>
            <span className="text-sm text-[#333645]">
              {Math.abs(((utilityData.electric.currentMonth - utilityData.electric.lastMonth) / utilityData.electric.lastMonth * 100)).toFixed(1)}% vs last month
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Year average:</span>
              <span className="font-semibold text-[#333645]">{utilityData.electric.yearAvg} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Neighborhood avg:</span>
              <span className="font-semibold text-[#333645]">{utilityData.electric.neighborhoodAvg} kWh</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Efficiency Score</span>
              <span className={`text-2xl font-bold ${getEfficiencyColor(utilityData.electric.efficiency)}`}>
                {utilityData.electric.efficiency}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getEfficiencyBg(utilityData.electric.efficiency)}`}
                style={{ width: `${utilityData.electric.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Gas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 rounded-lg">
              <i className="ri-fire-line text-2xl text-orange-500"></i>
            </div>
            <div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Natural Gas
              </h3>
              <div className="text-xs text-gray-500">Therms this month</div>
            </div>
          </div>

          <div className="text-4xl font-bold text-[#2D2A74] mb-2">
            {utilityData.gas.currentMonth}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <i className={`ri-arrow-${utilityData.gas.trend === 'up' ? 'up' : 'down'}-line text-lg ${
              utilityData.gas.trend === 'up' ? 'text-red-600' : 'text-[#00B8A9]'
            }`}></i>
            <span className="text-sm text-[#333645]">
              {Math.abs(((utilityData.gas.currentMonth - utilityData.gas.lastMonth) / utilityData.gas.lastMonth * 100)).toFixed(1)}% vs last month
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Year average:</span>
              <span className="font-semibold text-[#333645]">{utilityData.gas.yearAvg} therms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Neighborhood avg:</span>
              <span className="font-semibold text-[#333645]">{utilityData.gas.neighborhoodAvg} therms</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Efficiency Score</span>
              <span className={`text-2xl font-bold ${getEfficiencyColor(utilityData.gas.efficiency)}`}>
                {utilityData.gas.efficiency}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getEfficiencyBg(utilityData.gas.efficiency)}`}
                style={{ width: `${utilityData.gas.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-lg">
              <i className="ri-drop-line text-2xl text-blue-500"></i>
            </div>
            <div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Water
              </h3>
              <div className="text-xs text-gray-500">Gallons this month</div>
            </div>
          </div>

          <div className="text-4xl font-bold text-[#2D2A74] mb-2">
            {utilityData.water.currentMonth.toLocaleString()}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <i className={`ri-arrow-${utilityData.water.trend === 'up' ? 'up' : 'down'}-line text-lg ${
              utilityData.water.trend === 'up' ? 'text-red-600' : 'text-[#00B8A9]'
            }`}></i>
            <span className="text-sm text-[#333645]">
              {Math.abs(((utilityData.water.currentMonth - utilityData.water.lastMonth) / utilityData.water.lastMonth * 100)).toFixed(1)}% vs last month
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Year average:</span>
              <span className="font-semibold text-[#333645]">{utilityData.water.yearAvg.toLocaleString()} gal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Neighborhood avg:</span>
              <span className="font-semibold text-[#333645]">{utilityData.water.neighborhoodAvg.toLocaleString()} gal</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Efficiency Score</span>
              <span className={`text-2xl font-bold ${getEfficiencyColor(utilityData.water.efficiency)}`}>
                {utilityData.water.efficiency}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getEfficiencyBg(utilityData.water.efficiency)}`}
                style={{ width: `${utilityData.water.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Efficiency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2D2A74] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            System Efficiency
          </h2>
          <div className="space-y-4">
            {systems.map((system, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#2D2A74] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {system.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-[#333645]">
                      <span>Impact: {system.energyImpact}</span>
                      <span className={`font-semibold ${getEfficiencyColor(system.efficiency)}`}>
                        {system.status}
                      </span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getEfficiencyColor(system.efficiency)}`}>
                    {system.efficiency}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${getEfficiencyBg(system.efficiency)}`}
                    style={{ width: `${system.efficiency}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last service: {system.lastService}</span>
                  <span>Next: {system.nextService}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2D2A74] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Filter & Maintenance Reminders
          </h2>
          <div className="space-y-3">
            {maintenanceReminders.map((reminder, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F9F9FB] transition-colors">
                <input type="checkbox" className="mt-1 w-5 h-5 cursor-pointer" />
                <div className="flex-1">
                  <div className="font-semibold text-[#2D2A74] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {reminder.task}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-[#00B8A9]/10 text-[#00B8A9] rounded font-semibold">
                      {reminder.category}
                    </span>
                    <span className="text-gray-500">Due: {reminder.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-3 border-2 border-[#00B8A9] text-[#00B8A9] rounded-lg hover:bg-[#00B8A9] hover:text-white transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer">
            View All Reminders
          </button>
        </div>
      </div>
    </div>
  );
}

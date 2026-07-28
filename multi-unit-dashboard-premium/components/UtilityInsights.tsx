import { useState } from 'react';

export default function UtilityInsights() {
  const [selectedProperty, setSelectedProperty] = useState('all');

  const properties = [
    { id: 'all', name: 'All Properties' },
    { id: 'sunset', name: 'Sunset Apartments' },
    { id: 'riverside', name: 'Riverside Complex' },
    { id: 'downtown', name: 'Downtown Lofts' }
  ];

  const utilityData = {
    electric: {
      current: 4850,
      previous: 4620,
      trend: 5,
      usage: '12,450 kWh',
      avgPerUnit: '415 kWh'
    },
    gas: {
      current: 1280,
      previous: 1450,
      trend: -12,
      usage: '3,200 therms',
      avgPerUnit: '107 therms'
    },
    water: {
      current: 890,
      previous: 920,
      trend: -3,
      usage: '285,000 gallons',
      avgPerUnit: '9,500 gallons'
    }
  };

  const monthlyTrends = [
    { month: 'Oct', electric: 4200, gas: 980, water: 850 },
    { month: 'Nov', electric: 4400, gas: 1150, water: 870 },
    { month: 'Dec', electric: 4620, gas: 1450, water: 920 },
    { month: 'Jan', electric: 4850, gas: 1280, water: 890 }
  ];

  const insights = [
    {
      type: 'success',
      icon: 'ri-arrow-down-line',
      title: 'Gas Usage Decreased 12%',
      description: 'Heating efficiency improvements across Sunset Apartments are showing results'
    },
    {
      type: 'warning',
      icon: 'ri-arrow-up-line',
      title: 'Electric Usage Up 5%',
      description: 'Consider LED upgrades in common areas at Riverside Complex'
    },
    {
      type: 'info',
      icon: 'ri-lightbulb-line',
      title: 'Water Conservation Opportunity',
      description: 'Low-flow fixtures could save $180/month across all properties'
    }
  ];

  const recommendations = [
    {
      title: 'Smart Thermostat Installation',
      property: 'Riverside Complex',
      savings: '$320/month',
      roi: '18 months',
      priority: 'High'
    },
    {
      title: 'LED Common Area Lighting',
      property: 'All Properties',
      savings: '$145/month',
      roi: '12 months',
      priority: 'High'
    },
    {
      title: 'Low-Flow Fixture Upgrades',
      property: 'Downtown Lofts',
      savings: '$85/month',
      roi: '24 months',
      priority: 'Medium'
    },
    {
      title: 'HVAC System Optimization',
      property: 'Sunset Apartments',
      savings: '$210/month',
      roi: '15 months',
      priority: 'High'
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Utility Insights</h2>
            <p className="text-[#6B7C8F]">Track energy consumption and identify cost-saving opportunities across your portfolio</p>
          </div>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm font-semibold cursor-pointer"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Efficiency Score */}
        <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#D4B483]/5 rounded-lg p-6 border border-[#D4B483]/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#6B7C8F] mb-1">Portfolio Efficiency Score</div>
              <div className="text-4xl font-bold text-[#0B1F33] mb-2">82/100</div>
              <div className="text-sm text-[#6B7C8F]">12% better than similar portfolios</div>
            </div>
            <div className="w-24 h-24 bg-[#D4B483] rounded-full flex items-center justify-center">
              <i className="ri-leaf-line text-4xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Current Month Overview */}
      <div className="grid grid-cols-3 gap-6">
        {/* Electric */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-flashlight-line text-2xl text-yellow-600"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B7C8F]">Electric</div>
              <div className="text-2xl font-bold text-[#0B1F33]">${utilityData.electric.current}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Usage</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.electric.usage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Avg per Unit</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.electric.avgPerUnit}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-[#6B7C8F]">vs Last Month</span>
              <span className="flex items-center gap-1 font-semibold text-red-600">
                <i className="ri-arrow-up-line"></i>
                {utilityData.electric.trend}%
              </span>
            </div>
          </div>
        </div>

        {/* Gas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="ri-fire-line text-2xl text-orange-600"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B7C8F]">Gas</div>
              <div className="text-2xl font-bold text-[#0B1F33]">${utilityData.gas.current}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Usage</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.gas.usage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Avg per Unit</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.gas.avgPerUnit}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-[#6B7C8F]">vs Last Month</span>
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <i className="ri-arrow-down-line"></i>
                {Math.abs(utilityData.gas.trend)}%
              </span>
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-drop-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B7C8F]">Water</div>
              <div className="text-2xl font-bold text-[#0B1F33]">${utilityData.water.current}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Usage</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.water.usage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7C8F]">Avg per Unit</span>
              <span className="font-semibold text-[#0B1F33]">{utilityData.water.avgPerUnit}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-[#6B7C8F]">vs Last Month</span>
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <i className="ri-arrow-down-line"></i>
                {Math.abs(utilityData.water.trend)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#0B1F33] mb-6">4-Month Usage Trends</h3>
        <div className="space-y-6">
          {monthlyTrends.map((month) => (
            <div key={month.month}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#0B1F33] w-12">{month.month}</span>
                <div className="flex-1 flex gap-2">
                  <div
                    className="bg-yellow-200 h-8 rounded flex items-center justify-end pr-2"
                    style={{ width: `${(month.electric / 5000) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-yellow-900">${month.electric}</span>
                  </div>
                  <div
                    className="bg-orange-200 h-8 rounded flex items-center justify-end pr-2"
                    style={{ width: `${(month.gas / 5000) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-orange-900">${month.gas}</span>
                  </div>
                  <div
                    className="bg-blue-200 h-8 rounded flex items-center justify-end pr-2"
                    style={{ width: `${(month.water / 5000) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-blue-900">${month.water}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Electric</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-200 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Gas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Water</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#D4B483] rounded-lg flex items-center justify-center">
            <i className="ri-robot-line text-2xl text-white"></i>
          </div>
          <h3 className="text-lg font-bold text-[#0B1F33]">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
              <i className={`${insight.icon} text-xl mt-0.5`}></i>
              <div>
                <div className="font-bold mb-1">{insight.title}</div>
                <div className="text-sm">{insight.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#0B1F33] mb-6">Cost Savings Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-[#0B1F33]">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7C8F]">{rec.property}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#6B7C8F] mb-1">Estimated Savings</div>
                  <div className="font-bold text-green-600 text-lg">{rec.savings}</div>
                </div>
                <div>
                  <div className="text-[#6B7C8F] mb-1">ROI Timeline</div>
                  <div className="font-bold text-[#0B1F33] text-lg">{rec.roi}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

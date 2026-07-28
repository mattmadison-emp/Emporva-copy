import { useState } from 'react';

export default function PropertyMemory() {
  const [view, setView] = useState<'timeline' | 'systems' | 'ai'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');

  const timelineEvents = [
    {
      id: 1,
      date: '2024-01-15',
      property: 'Sunset Apartments - Unit 204',
      type: 'Repair',
      category: 'HVAC',
      title: 'HVAC System Repair',
      contractor: 'CoolAir HVAC Services',
      cost: 450,
      description: 'Replaced faulty thermostat and cleaned air filters',
      status: 'Completed',
      photos: 2
    },
    {
      id: 2,
      date: '2024-01-10',
      property: 'Riverside Complex - Unit 105',
      type: 'Maintenance',
      category: 'Plumbing',
      title: 'Annual Plumbing Inspection',
      contractor: 'ProFlow Plumbing',
      cost: 200,
      description: 'Routine inspection of all plumbing systems',
      status: 'Completed',
      photos: 3
    },
    {
      id: 3,
      date: '2024-01-05',
      property: 'Downtown Lofts - Unit 301',
      type: 'Installation',
      category: 'Electrical',
      title: 'Smart Thermostat Installation',
      contractor: 'ElectricPro Solutions',
      cost: 350,
      description: 'Installed Nest Learning Thermostat',
      status: 'Completed',
      photos: 1
    },
    {
      id: 4,
      date: '2023-12-20',
      property: 'Sunset Apartments - Building A',
      type: 'Maintenance',
      category: 'Roofing',
      title: 'Roof Inspection & Minor Repairs',
      contractor: 'TopShield Roofing',
      cost: 1200,
      description: 'Annual roof inspection with minor shingle replacement',
      status: 'Completed',
      photos: 5
    }
  ];

  const systemsData = [
    {
      category: 'HVAC',
      icon: 'ri-temp-cold-line',
      items: [
        {
          property: 'Sunset Apartments - Unit 204',
          system: 'Central Air Conditioning',
          lastService: '2024-01-15',
          status: 'Good',
          nextService: '2024-07-15',
          contractor: 'CoolAir HVAC Services',
          cost: 450,
          photos: 2
        },
        {
          property: 'Riverside Complex - Unit 105',
          system: 'Heat Pump System',
          lastService: '2023-11-20',
          status: 'Excellent',
          nextService: '2024-05-20',
          contractor: 'CoolAir HVAC Services',
          cost: 300,
          photos: 1
        }
      ]
    },
    {
      category: 'Plumbing',
      icon: 'ri-drop-line',
      items: [
        {
          property: 'Riverside Complex - Unit 105',
          system: 'Main Water Line',
          lastService: '2024-01-10',
          status: 'Good',
          nextService: '2025-01-10',
          contractor: 'ProFlow Plumbing',
          cost: 200,
          photos: 3
        },
        {
          property: 'Downtown Lofts - Unit 301',
          system: 'Hot Water Heater',
          lastService: '2023-10-15',
          status: 'Monitor',
          nextService: '2024-04-15',
          contractor: 'ProFlow Plumbing',
          cost: 150,
          photos: 2
        }
      ]
    },
    {
      category: 'Electrical',
      icon: 'ri-flashlight-line',
      items: [
        {
          property: 'Downtown Lofts - Unit 301',
          system: 'Smart Thermostat',
          lastService: '2024-01-05',
          status: 'Excellent',
          nextService: '2025-01-05',
          contractor: 'ElectricPro Solutions',
          cost: 350,
          photos: 1
        }
      ]
    },
    {
      category: 'Roofing',
      icon: 'ri-home-8-line',
      items: [
        {
          property: 'Sunset Apartments - Building A',
          system: 'Asphalt Shingle Roof',
          lastService: '2023-12-20',
          status: 'Good',
          nextService: '2024-12-20',
          contractor: 'TopShield Roofing',
          cost: 1200,
          photos: 5
        }
      ]
    }
  ];

  const aiInsights = {
    summary: 'Portfolio maintenance spending has increased 15% over the last 12 months, primarily due to HVAC system repairs across multiple units. Your preventive maintenance schedule is helping reduce emergency repairs by 23%.',
    recurringIssues: [
      'HVAC systems in Sunset Apartments require more frequent service than other properties',
      'Plumbing inspections consistently reveal minor issues before they become major problems',
      'Electrical systems in Downtown Lofts are performing exceptionally well'
    ],
    recommendations: [
      'Consider HVAC system upgrades for Sunset Apartments units to reduce repair frequency',
      'Schedule roof inspections for Riverside Complex before winter season',
      'Implement smart water leak detectors across all properties to prevent water damage'
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-100 text-green-700';
      case 'Good':
        return 'bg-blue-100 text-blue-700';
      case 'Monitor':
        return 'bg-yellow-100 text-yellow-700';
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
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Property Memory</h2>
            <p className="text-[#6B7C8F]">Complete history of all maintenance, repairs, and improvements across your portfolio</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#C4A473] transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-download-line"></i>
            Download Portfolio Report
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7C8F] text-lg"></i>
          <input
            type="text"
            placeholder="Search by property, contractor, or work type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
          />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${
            view === 'timeline' ? 'bg-[#0B1F33] text-white' : 'bg-white text-[#6B7C8F] border border-gray-200'
          }`}
        >
          <i className="ri-time-line"></i>
          Timeline View
        </button>
        <button
          onClick={() => setView('systems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${
            view === 'systems' ? 'bg-[#0B1F33] text-white' : 'bg-white text-[#6B7C8F] border border-gray-200'
          }`}
        >
          <i className="ri-settings-3-line"></i>
          Systems View
        </button>
        <button
          onClick={() => setView('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${
            view === 'ai' ? 'bg-[#0B1F33] text-white' : 'bg-white text-[#6B7C8F] border border-gray-200'
          }`}
        >
          <i className="ri-robot-line"></i>
          AI Summary
        </button>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-4">
          {timelineEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-[#6B7C8F]">{event.date}</span>
                    <span className="px-3 py-1 bg-[#F9F9FB] text-[#0B1F33] rounded-full text-xs font-semibold">
                      {event.type}
                    </span>
                    <span className="px-3 py-1 bg-[#D4B483]/20 text-[#0B1F33] rounded-full text-xs font-semibold">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F33] mb-1">{event.title}</h3>
                  <p className="text-sm text-[#6B7C8F] mb-2">{event.property}</p>
                  <p className="text-[#6B7C8F] mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <i className="ri-user-line text-[#6B7C8F]"></i>
                      <span className="text-[#6B7C8F]">{event.contractor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="ri-image-line text-[#6B7C8F]"></i>
                      <span className="text-[#6B7C8F]">{event.photos} photos</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0B1F33] mb-1">${event.cost}</div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Systems View */}
      {view === 'systems' && (
        <div className="space-y-6">
          {systemsData.map((system) => (
            <div key={system.category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
                  <i className={`${system.icon} text-2xl text-[#D4B483]`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33]">{system.category}</h3>
              </div>
              <div className="space-y-4">
                {system.items.map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0B1F33] mb-1">{item.system}</h4>
                        <p className="text-sm text-[#6B7C8F] mb-2">{item.property}</p>
                        <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                          <i className="ri-user-line"></i>
                          <span>{item.contractor}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[#6B7C8F] mb-1">Last Service</div>
                        <div className="font-semibold text-[#0B1F33]">{item.lastService}</div>
                      </div>
                      <div>
                        <div className="text-[#6B7C8F] mb-1">Next Service</div>
                        <div className="font-semibold text-[#0B1F33]">{item.nextService}</div>
                      </div>
                      <div>
                        <div className="text-[#6B7C8F] mb-1">Cost</div>
                        <div className="font-semibold text-[#0B1F33]">${item.cost}</div>
                      </div>
                      <div>
                        <div className="text-[#6B7C8F] mb-1">Photos</div>
                        <div className="font-semibold text-[#0B1F33]">{item.photos} photos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary View */}
      {view === 'ai' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#D4B483]/5 rounded-xl border border-[#D4B483]/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#D4B483] rounded-lg flex items-center justify-center">
                <i className="ri-robot-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33]">AI Portfolio Analysis</h3>
            </div>
            <p className="text-[#0B1F33] leading-relaxed">{aiInsights.summary}</p>
          </div>

          {/* Recurring Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-4">Recurring Issues Detected</h3>
            <div className="space-y-3">
              {aiInsights.recurringIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <i className="ri-alert-line text-yellow-600 text-xl mt-0.5"></i>
                  <p className="text-[#0B1F33]">{issue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-4">Priority Recommendations</h3>
            <div className="space-y-3">
              {aiInsights.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <i className="ri-lightbulb-line text-blue-600 text-xl mt-0.5"></i>
                  <p className="text-[#0B1F33]">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

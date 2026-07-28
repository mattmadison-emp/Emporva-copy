import { useState } from 'react';

export default function SeasonalMaintenance() {
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('spring');

  const seasons: Array<{ id: 'spring' | 'summer' | 'fall' | 'winter'; label: string; icon: string; color: string }> = [
    { id: 'spring', label: 'Spring', icon: 'ri-leaf-line', color: 'bg-green-500' },
    { id: 'summer', label: 'Summer', icon: 'ri-sun-line', color: 'bg-[#FDC500]' },
    { id: 'fall', label: 'Fall', icon: 'ri-maple-leaf-line', color: 'bg-orange-500' },
    { id: 'winter', label: 'Winter', icon: 'ri-snowy-line', color: 'bg-blue-500' }
  ];

  const seasonalTasks = {
    spring: [
      { task: 'Clean gutters and downspouts', urgency: 'high', category: 'Exterior', estimated: '$150-$300' },
      { task: 'Inspect roof for winter damage', urgency: 'high', category: 'Roof', estimated: '$200-$400' },
      { task: 'Service AC unit before summer', urgency: 'high', category: 'HVAC', estimated: '$150-$250' },
      { task: 'Check grading and drainage', urgency: 'medium', category: 'Exterior', estimated: '$100-$200' },
      { task: 'Inspect and repair window screens', urgency: 'low', category: 'Windows', estimated: '$50-$150' },
      { task: 'Power wash exterior surfaces', urgency: 'low', category: 'Exterior', estimated: '$200-$400' },
      { task: 'Pest prevention treatment', urgency: 'medium', category: 'Pest Control', estimated: '$150-$300' },
      { task: 'Test sump pump operation', urgency: 'high', category: 'Plumbing', estimated: '$100-$200' }
    ],
    summer: [
      { task: 'Clean AC coils and filters', urgency: 'high', category: 'HVAC', estimated: '$100-$200' },
      { task: 'Inspect and seal deck/patio', urgency: 'medium', category: 'Exterior', estimated: '$300-$600' },
      { task: 'Check attic ventilation', urgency: 'medium', category: 'Attic', estimated: '$150-$300' },
      { task: 'Inspect exterior paint and caulking', urgency: 'low', category: 'Exterior', estimated: '$200-$500' },
      { task: 'Service lawn irrigation system', urgency: 'medium', category: 'Landscaping', estimated: '$100-$250' },
      { task: 'Clean dryer vents', urgency: 'high', category: 'Appliances', estimated: '$100-$200' }
    ],
    fall: [
      { task: 'Clean gutters before winter', urgency: 'high', category: 'Exterior', estimated: '$150-$300' },
      { task: 'Service heating system', urgency: 'high', category: 'HVAC', estimated: '$150-$250' },
      { task: 'Inspect and clean chimney', urgency: 'high', category: 'Fireplace', estimated: '$200-$400' },
      { task: 'Seal windows and doors', urgency: 'medium', category: 'Weatherization', estimated: '$100-$300' },
      { task: 'Drain outdoor faucets and sprinklers', urgency: 'high', category: 'Plumbing', estimated: '$100-$200' },
      { task: 'Check insulation in attic', urgency: 'medium', category: 'Attic', estimated: '$200-$500' },
      { task: 'Test smoke and CO detectors', urgency: 'high', category: 'Safety', estimated: '$50-$100' }
    ],
    winter: [
      { task: 'Monitor for ice dams on roof', urgency: 'high', category: 'Roof', estimated: '$300-$800' },
      { task: 'Check for frozen pipe risks', urgency: 'high', category: 'Plumbing', estimated: '$150-$400' },
      { task: 'Inspect heating system performance', urgency: 'high', category: 'HVAC', estimated: '$150-$250' },
      { task: 'Clear snow from vents and exhausts', urgency: 'high', category: 'Safety', estimated: '$100-$200' },
      { task: 'Test backup generator', urgency: 'medium', category: 'Electrical', estimated: '$100-$200' },
      { task: 'Check humidity levels', urgency: 'medium', category: 'Indoor Air', estimated: '$50-$150' }
    ]
  };

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
      {/* Season Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-[#2D2A74] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Seasonal Maintenance Calendar
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season.id)}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                selectedSeason === season.id
                  ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                  : 'border-gray-200 hover:border-[#0B1F33]/50'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center ${season.color} rounded-full text-white`}>
                <i className={`${season.icon} text-2xl`}></i>
              </div>
              <div className="text-center font-bold text-[#2D2A74]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {season.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Task Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {seasons.find(s => s.id === selectedSeason)?.label} Checklist
          </h2>
          <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a2f47] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
            <i className="ri-download-line mr-2"></i>
            Export Checklist
          </button>
        </div>

        <div className="space-y-3">
          {seasonalTasks[selectedSeason].map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#0B1F33] transition-colors">
              <input type="checkbox" className="mt-1 w-5 h-5 cursor-pointer" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {item.task}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ml-4 whitespace-nowrap ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="flex items-center gap-1">
                    <i className="ri-folder-line text-[#0B1F33]"></i>
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-money-dollar-circle-line text-[#0B1F33]"></i>
                    {item.estimated}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a2f47] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                  Get Quote
                </button>
                <button className="px-4 py-2 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#0B1F33] hover:text-[#0B1F33] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                  DIY Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-lg">
              <i className="ri-alert-line text-xl text-red-600"></i>
            </div>
            <div className="text-3xl font-bold text-[#2D2A74]">
              {seasonalTasks[selectedSeason].filter(t => t.urgency === 'high').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            High Priority Tasks
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-[#FDC500]/10 rounded-lg">
              <i className="ri-time-line text-xl text-[#FDC500]"></i>
            </div>
            <div className="text-3xl font-bold text-[#2D2A74]">
              {seasonalTasks[selectedSeason].filter(t => t.urgency === 'medium').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Medium Priority Tasks
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-[#0B1F33]/10 rounded-lg">
              <i className="ri-checkbox-circle-line text-xl text-[#0B1F33]"></i>
            </div>
            <div className="text-3xl font-bold text-[#2D2A74]">
              {seasonalTasks[selectedSeason].filter(t => t.urgency === 'low').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Low Priority Tasks
          </div>
        </div>
      </div>
    </div>
  );
}

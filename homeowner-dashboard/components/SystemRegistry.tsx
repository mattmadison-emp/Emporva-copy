import { useState } from 'react';
import { exportToPDF } from '../../../utils/pdfExport';

export default function SystemRegistry() {
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const systems = [
    {
      id: 1,
      name: 'HVAC System',
      type: 'Heat Pump',
      brand: 'Carrier',
      model: 'Infinity 18VS',
      serialNumber: 'HP2408156732',
      installDate: 'June 2015',
      age: 9,
      typicalLifespan: '15-20 years',
      remainingYears: '6-11 years',
      replacementCost: '$6,000-$9,000',
      healthScore: 82,
      lastService: 'March 2024',
      nextService: 'September 2024',
      warrantyStatus: 'Expired',
      maintenanceSchedule: 'Twice yearly',
      notes: 'Spring and fall tune-ups recommended'
    },
    {
      id: 2,
      name: 'Water Heater',
      type: 'Electric Tank',
      brand: 'Rheem',
      model: 'Performance Platinum',
      serialNumber: 'RH13G045821',
      installDate: 'March 2013',
      age: 11,
      typicalLifespan: '12-15 years',
      remainingYears: '1-4 years',
      replacementCost: '$1,200-$1,800',
      healthScore: 65,
      lastService: 'January 2024',
      nextService: 'January 2025',
      warrantyStatus: 'Expired',
      maintenanceSchedule: 'Annual flush',
      notes: 'Entering expected failure window. Consider replacement soon.'
    },
    {
      id: 3,
      name: 'Roof',
      type: 'Asphalt Shingles',
      brand: 'GAF',
      model: 'Timberline HDZ',
      serialNumber: 'N/A',
      installDate: 'May 2008',
      age: 16,
      typicalLifespan: '20-25 years',
      remainingYears: '4-9 years',
      replacementCost: '$8,500-$12,000',
      healthScore: 75,
      lastService: 'April 2024',
      nextService: 'April 2027',
      warrantyStatus: 'Active (25-year)',
      maintenanceSchedule: 'Inspection every 3 years',
      notes: 'Minor granule loss observed. Monitor for accelerated wear.'
    },
    {
      id: 4,
      name: 'Sump Pump',
      type: 'Submersible',
      brand: 'Zoeller',
      model: 'M53',
      serialNumber: 'ZL2019042156',
      installDate: 'April 2019',
      age: 5,
      typicalLifespan: '7-10 years',
      remainingYears: '2-5 years',
      replacementCost: '$400-$800',
      healthScore: 88,
      lastService: 'May 2024',
      nextService: 'November 2024',
      warrantyStatus: 'Active (5-year)',
      maintenanceSchedule: 'Test every 6 months',
      notes: 'Operating normally. Battery backup recommended.'
    },
    {
      id: 5,
      name: 'Dishwasher',
      type: 'Built-in',
      brand: 'Bosch',
      model: 'SHPM88Z75N',
      serialNumber: 'FD9408125634',
      installDate: 'August 2020',
      age: 4,
      typicalLifespan: '10-13 years',
      remainingYears: '6-9 years',
      replacementCost: '$800-$1,200',
      healthScore: 92,
      lastService: 'N/A',
      nextService: 'As needed',
      warrantyStatus: 'Expired',
      maintenanceSchedule: 'Clean filter monthly',
      notes: 'Excellent condition. No issues reported.'
    },
    {
      id: 6,
      name: 'Garage Door Opener',
      type: 'Belt Drive',
      brand: 'LiftMaster',
      model: '8500W',
      serialNumber: 'LM2021073421',
      installDate: 'July 2021',
      age: 3,
      typicalLifespan: '10-15 years',
      remainingYears: '7-12 years',
      replacementCost: '$300-$600',
      healthScore: 95,
      lastService: 'February 2024',
      nextService: 'February 2025',
      warrantyStatus: 'Active (5-year)',
      maintenanceSchedule: 'Annual inspection',
      notes: 'WiFi-enabled. Battery backup installed.'
    }
  ];

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-[#D4B483]';
    if (score >= 70) return 'text-[#FDC500]';
    return 'text-red-600';
  };

  const getHealthBg = (score: number) => {
    if (score >= 85) return 'bg-[#D4B483]';
    if (score >= 70) return 'bg-[#FDC500]';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Systems & Appliances Registry
            </h2>
            <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track all major systems, warranties, and maintenance schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-line"></i>
                Export
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 w-44">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        const header = 'Name,Type,Brand,Model,Install Date,Age,Health Score,Warranty,Replacement Cost';
                        const rows = systems.map(s =>
                          [s.name, s.type, s.brand, s.model, s.installDate, `${s.age} yrs`, s.healthScore, s.warrantyStatus, s.replacementCost]
                            .map(v => `"${v}"`).join(',')
                        );
                        const csv = [header, ...rows].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `home-systems-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] transition-colors cursor-pointer rounded-t-lg"
                    >
                      <i className="ri-file-text-line text-[#6B7C8F]"></i>
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        exportToPDF({
                          title: 'Systems & Appliances Registry',
                          subtitle: 'All major home systems, warranties, and maintenance schedules',
                          headers: ['Name', 'Type', 'Brand/Model', 'Installed', 'Health', 'Warranty', 'Est. Replacement'],
                          rows: systems.map(s => [
                            s.name, s.type, `${s.brand} ${s.model}`, s.installDate, `${s.healthScore}%`, s.warrantyStatus, s.replacementCost,
                          ]),
                          summaryLines: [
                            `Total Systems: ${systems.length}`,
                            `Average Health Score: ${Math.round(systems.reduce((sum, s) => sum + s.healthScore, 0) / systems.length)}%`,
                            `Under Warranty: ${systems.filter(s => s.warrantyStatus.includes('Active')).length}`,
                          ],
                          filename: `home-systems-${new Date().toISOString().split('T')[0]}.pdf`,
                        });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] transition-colors cursor-pointer rounded-b-lg"
                    >
                      <i className="ri-file-pdf-line text-red-500"></i>
                      Export as PDF
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors font-semibold whitespace-nowrap cursor-pointer">
              <i className="ri-add-line mr-2"></i>
              Add System
            </button>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {systems.map((system) => (
          <div
            key={system.id}
            onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
              selectedSystem === system.id ? 'border-[#D4B483]' : 'border-gray-100 hover:border-[#D4B483]/50'
            }`}
          >
            {/* System Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {system.name}
                </h3>
                <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {system.brand} {system.model}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthColor(system.healthScore)}`}>
                  {system.healthScore}
                </div>
                <div className="text-xs text-gray-500">Health Score</div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${getHealthBg(system.healthScore)}`}
                style={{ width: `${system.healthScore}%` }}
              ></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Age</div>
                <div className="font-bold text-[#0B1F33]">{system.age} years</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Remaining Life</div>
                <div className="font-bold text-[#0B1F33]">{system.remainingYears}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Last Service</div>
                <div className="font-bold text-[#0B1F33]">{system.lastService}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Warranty</div>
                <div className={`font-bold ${system.warrantyStatus === 'Active' ? 'text-[#D4B483]' : 'text-gray-400'}`}>
                  {system.warrantyStatus}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedSystem === system.id && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <div className="font-semibold text-[#333645]">{system.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Serial Number</div>
                    <div className="font-semibold text-[#333645]">{system.serialNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Install Date</div>
                    <div className="font-semibold text-[#333645]">{system.installDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Typical Lifespan</div>
                    <div className="font-semibold text-[#333645]">{system.typicalLifespan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Next Service</div>
                    <div className="font-semibold text-[#333645]">{system.nextService}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Replacement Cost</div>
                    <div className="font-semibold text-[#333645]">{system.replacementCost}</div>
                  </div>
                </div>

                <div className="bg-[#F9F9FB] p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Notes</div>
                  <div className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {system.notes}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                    Schedule Service
                  </button>
                  <button className="flex-1 px-4 py-2 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#D4B483] hover:text-[#D4B483] transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer">
                    View History
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-3xl font-bold text-[#0B1F33] mb-1">{systems.length}</div>
          <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Total Systems
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {systems.filter(s => s.healthScore < 70).length}
          </div>
          <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Need Attention
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-3xl font-bold text-[#D4B483] mb-1">
            {systems.filter(s => s.warrantyStatus.includes('Active')).length}
          </div>
          <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Under Warranty
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-3xl font-bold text-[#0B1F33] mb-1">
            {systems.reduce((sum, s) => sum + s.age, 0) / systems.length}
          </div>
          <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Avg System Age
          </div>
        </div>
      </div>
    </div>
  );
}

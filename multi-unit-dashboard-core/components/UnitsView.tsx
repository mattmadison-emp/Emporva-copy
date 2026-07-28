import { useState } from 'react';

export default function UnitsView() {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [units] = useState([
    { id: 1, property: 'Building A', unit: '101', status: 'Occupied', lastMaintenance: '2 weeks ago', upcomingTasks: 2 },
    { id: 2, property: 'Building A', unit: '102', status: 'Occupied', lastMaintenance: '1 month ago', upcomingTasks: 1 },
    { id: 3, property: 'Building A', unit: '103', status: 'Vacant', lastMaintenance: '3 days ago', upcomingTasks: 0 },
    { id: 4, property: 'Building A', unit: '104', status: 'Occupied', lastMaintenance: '2 weeks ago', upcomingTasks: 3 },
    { id: 5, property: 'Building B', unit: '201', status: 'Occupied', lastMaintenance: '1 week ago', upcomingTasks: 1 },
    { id: 6, property: 'Building B', unit: '202', status: 'Occupied', lastMaintenance: '3 weeks ago', upcomingTasks: 2 },
    { id: 7, property: 'Building B', unit: '203', status: 'Occupied', lastMaintenance: '2 days ago', upcomingTasks: 0 },
    { id: 8, property: 'Building C', unit: '301', status: 'Occupied', lastMaintenance: '1 month ago', upcomingTasks: 4 },
    { id: 9, property: 'Building C', unit: '302', status: 'Occupied', lastMaintenance: '2 weeks ago', upcomingTasks: 1 },
    { id: 10, property: 'Building C', unit: '303', status: 'Vacant', lastMaintenance: '1 week ago', upcomingTasks: 0 }
  ]);

  const filteredUnits = selectedProperty === 'all' 
    ? units 
    : units.filter(unit => unit.property === selectedProperty);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Units</h2>
          <p className="text-[#6B7C8F]">Track unit-level details and maintenance</p>
        </div>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483]"
        >
          <option value="all">All Properties</option>
          <option value="Building A">Building A</option>
          <option value="Building B">Building B</option>
          <option value="Building C">Building C</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F9FB] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Last Maintenance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Upcoming Tasks</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-6 py-4 text-sm text-[#333645]">{unit.property}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">{unit.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      unit.status === 'Occupied' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7C8F]">{unit.lastMaintenance}</td>
                  <td className="px-6 py-4">
                    {unit.upcomingTasks > 0 ? (
                      <span className="px-3 py-1 bg-[#D4B483]/10 text-[#D4B483] rounded-full text-xs font-medium">
                        {unit.upcomingTasks} tasks
                      </span>
                    ) : (
                      <span className="text-sm text-[#6B7C8F]">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium text-sm whitespace-nowrap cursor-pointer">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

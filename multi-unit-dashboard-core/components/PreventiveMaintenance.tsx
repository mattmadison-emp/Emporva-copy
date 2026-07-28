import { useState } from 'react';

export default function PreventiveMaintenance() {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [maintenanceTasks] = useState([
    {
      id: 1,
      property: 'Building A',
      task: 'HVAC Filter Replacement',
      frequency: 'Quarterly',
      lastCompleted: '2 weeks ago',
      nextDue: 'In 10 weeks',
      affectedUnits: '101-116',
      status: 'Scheduled'
    },
    {
      id: 2,
      property: 'Building B',
      task: 'Fire Extinguisher Inspection',
      frequency: 'Annual',
      lastCompleted: '8 months ago',
      nextDue: 'In 4 months',
      affectedUnits: 'All units',
      status: 'Upcoming'
    },
    {
      id: 3,
      property: 'Building C',
      task: 'Smoke Detector Testing',
      frequency: 'Semi-Annual',
      lastCompleted: '5 months ago',
      nextDue: 'Next month',
      affectedUnits: 'All units',
      status: 'Upcoming'
    },
    {
      id: 4,
      property: 'Building A',
      task: 'Gutter Cleaning',
      frequency: 'Bi-Annual',
      lastCompleted: '3 months ago',
      nextDue: 'In 3 months',
      affectedUnits: 'All units',
      status: 'Upcoming'
    },
    {
      id: 5,
      property: 'Building B',
      task: 'Water Heater Flush',
      frequency: 'Annual',
      lastCompleted: '11 months ago',
      nextDue: 'Overdue',
      affectedUnits: '201-216',
      status: 'Overdue'
    },
    {
      id: 6,
      property: 'Building C',
      task: 'Roof Inspection',
      frequency: 'Annual',
      lastCompleted: '10 months ago',
      nextDue: 'In 2 months',
      affectedUnits: 'All units',
      status: 'Upcoming'
    }
  ]);

  const filteredTasks = selectedProperty === 'all' 
    ? maintenanceTasks 
    : maintenanceTasks.filter(task => task.property === selectedProperty);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-green-100 text-green-700';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Preventive Maintenance</h2>
          <p className="text-[#6B7C8F]">Schedule and track maintenance across your portfolio</p>
        </div>
        <div className="flex items-center gap-4">
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
          <button className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap flex items-center gap-2">
            <i className="ri-add-line text-xl"></i>
            Add Task
          </button>
        </div>
      </div>

      {/* Seasonal Checklists */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Seasonal Checklists</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-[#D4B483] bg-[#D4B483]/5 rounded-lg text-left hover:bg-[#D4B483]/10 transition-colors">
            <i className="ri-sun-line text-2xl text-[#D4B483] mb-2"></i>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Spring</h4>
            <p className="text-sm text-[#6B7C8F]">12 tasks</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <i className="ri-sun-foggy-line text-2xl text-[#6B7C8F] mb-2"></i>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Summer</h4>
            <p className="text-sm text-[#6B7C8F]">8 tasks</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <i className="ri-leaf-line text-2xl text-[#6B7C8F] mb-2"></i>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Fall</h4>
            <p className="text-sm text-[#6B7C8F]">15 tasks</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <i className="ri-snowy-line text-2xl text-[#6B7C8F] mb-2"></i>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Winter</h4>
            <p className="text-sm text-[#6B7C8F]">10 tasks</p>
          </button>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F9FB] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Task</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Frequency</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Affected Units</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Last Completed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Next Due</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-6 py-4 text-sm text-[#333645]">{task.property}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">{task.task}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7C8F]">{task.frequency}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7C8F]">{task.affectedUnits}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7C8F]">{task.lastCompleted}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7C8F]">{task.nextDue}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium text-sm whitespace-nowrap cursor-pointer">
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Tracking */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Equipment & Appliance Tracking</h3>
        <p className="text-[#6B7C8F] mb-6">Track HVAC systems, water heaters, filters, detectors, and other equipment per unit</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F9F9FB] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <i className="ri-temp-cold-line text-2xl text-[#D4B483]"></i>
              <span className="text-xs font-medium text-[#6B7C8F]">48 units</span>
            </div>
            <h4 className="font-semibold text-[#0B1F33] mb-1">HVAC Systems</h4>
            <p className="text-sm text-[#6B7C8F]">Track age, maintenance, filters</p>
          </div>
          <div className="p-4 bg-[#F9F9FB] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <i className="ri-drop-line text-2xl text-[#D4B483]"></i>
              <span className="text-xs font-medium text-[#6B7C8F]">48 units</span>
            </div>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Water Heaters</h4>
            <p className="text-sm text-[#6B7C8F]">Monitor age and service history</p>
          </div>
          <div className="p-4 bg-[#F9F9FB] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <i className="ri-alarm-warning-line text-2xl text-[#D4B483]"></i>
              <span className="text-xs font-medium text-[#6B7C8F]">96 devices</span>
            </div>
            <h4 className="font-semibold text-[#0B1F33] mb-1">Smoke Detectors</h4>
            <p className="text-sm text-[#6B7C8F]">Track testing and battery changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

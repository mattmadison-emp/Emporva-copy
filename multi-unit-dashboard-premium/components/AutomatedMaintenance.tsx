export default function AutomatedMaintenance() {
  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
              <i className="ri-calendar-check-line text-2xl text-[#D4B483]"></i>
            </div>
            <div>
              <p className="text-sm text-[#6B7C8F]">Active Schedules</p>
              <p className="text-2xl font-bold text-[#0B1F33]">24</p>
            </div>
          </div>
          <p className="text-sm text-[#6B7C8F]">Automated maintenance tasks running</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-[#6B7C8F]">Completed This Month</p>
              <p className="text-2xl font-bold text-[#0B1F33]">47</p>
            </div>
          </div>
          <p className="text-sm text-[#6B7C8F]">Tasks completed automatically</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-[#6B7C8F]">Time Saved</p>
              <p className="text-2xl font-bold text-[#0B1F33]">38h</p>
            </div>
          </div>
          <p className="text-sm text-[#6B7C8F]">Hours saved through automation</p>
        </div>
      </div>

      {/* Active Automation Rules */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0B1F33]">Active Automation Rules</h3>
          <button className="px-4 py-2 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-[#C4A473] transition-colors">
            <i className="ri-add-line mr-2"></i>
            Create New Rule
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-[#F9F9FB] rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-[#0B1F33]">HVAC Filter Replacement</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Active</span>
                </div>
                <p className="text-sm text-[#6B7C8F] mb-3">Automatically schedule filter replacements every 90 days for all units</p>
              </div>
              <button className="text-[#6B7C8F] hover:text-[#0B1F33]">
                <i className="ri-more-2-fill text-xl"></i>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#6B7C8F]"><i className="ri-building-line mr-2"></i>All Buildings</span>
              <span className="text-[#6B7C8F]"><i className="ri-repeat-line mr-2"></i>Every 90 days</span>
              <span className="text-[#6B7C8F]"><i className="ri-calendar-line mr-2"></i>Next: Feb 15</span>
            </div>
          </div>

          <div className="p-5 bg-[#F9F9FB] rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-[#0B1F33]">Smoke Detector Testing</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Active</span>
                </div>
                <p className="text-sm text-[#6B7C8F] mb-3">Quarterly testing and battery replacement for all smoke detectors</p>
              </div>
              <button className="text-[#6B7C8F] hover:text-[#0B1F33]">
                <i className="ri-more-2-fill text-xl"></i>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#6B7C8F]"><i className="ri-building-line mr-2"></i>All Buildings</span>
              <span className="text-[#6B7C8F]"><i className="ri-repeat-line mr-2"></i>Quarterly</span>
              <span className="text-[#6B7C8F]"><i className="ri-calendar-line mr-2"></i>Next: Jan 20</span>
            </div>
          </div>

          <div className="p-5 bg-[#F9F9FB] rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-[#0B1F33]">Seasonal Gutter Cleaning</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Active</span>
                </div>
                <p className="text-sm text-[#6B7C8F] mb-3">Schedule gutter cleaning before winter and after spring</p>
              </div>
              <button className="text-[#6B7C8F] hover:text-[#0B1F33]">
                <i className="ri-more-2-fill text-xl"></i>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#6B7C8F]"><i className="ri-building-line mr-2"></i>Building A, B</span>
              <span className="text-[#6B7C8F]"><i className="ri-repeat-line mr-2"></i>Bi-annually</span>
              <span className="text-[#6B7C8F]"><i className="ri-calendar-line mr-2"></i>Next: May 1</span>
            </div>
          </div>

          <div className="p-5 bg-[#F9F9FB] rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-[#0B1F33]">Water Heater Inspection</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Active</span>
                </div>
                <p className="text-sm text-[#6B7C8F] mb-3">Annual inspection for all water heaters, prioritize units 7+ years old</p>
              </div>
              <button className="text-[#6B7C8F] hover:text-[#0B1F33]">
                <i className="ri-more-2-fill text-xl"></i>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#6B7C8F]"><i className="ri-building-line mr-2"></i>All Buildings</span>
              <span className="text-[#6B7C8F]"><i className="ri-repeat-line mr-2"></i>Annually</span>
              <span className="text-[#6B7C8F]"><i className="ri-calendar-line mr-2"></i>Next: Mar 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Templates */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Recommended Automation Templates</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#D4B483] transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-drop-line text-2xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-2">Plumbing Preventive Care</h4>
                <p className="text-sm text-[#6B7C8F] mb-3">Bi-annual plumbing inspections to prevent leaks and water damage</p>
                <button className="text-sm font-semibold text-[#D4B483] hover:text-[#C4A473]">
                  Enable Template →
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#D4B483] transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-flashlight-line text-2xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-2">Electrical Safety Checks</h4>
                <p className="text-sm text-[#6B7C8F] mb-3">Annual electrical system inspections and outlet testing</p>
                <button className="text-sm font-semibold text-[#D4B483] hover:text-[#C4A473]">
                  Enable Template →
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#D4B483] transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-paint-brush-line text-2xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-2">Exterior Maintenance</h4>
                <p className="text-sm text-[#6B7C8F] mb-3">Seasonal exterior painting, siding, and weatherproofing checks</p>
                <button className="text-sm font-semibold text-[#D4B483] hover:text-[#C4A473]">
                  Enable Template →
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#D4B483] transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-home-gear-line text-2xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-2">Appliance Lifecycle Management</h4>
                <p className="text-sm text-[#6B7C8F] mb-3">Track appliance age and schedule replacements before failure</p>
                <button className="text-sm font-semibold text-[#D4B483] hover:text-[#C4A473]">
                  Enable Template →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

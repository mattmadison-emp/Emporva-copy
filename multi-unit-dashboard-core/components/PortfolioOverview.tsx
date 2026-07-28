export default function PortfolioOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
              <i className="ri-building-line text-2xl text-[#D4B483]"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">12</p>
          <p className="text-sm text-[#6B7C8F]">Total Properties</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
              <i className="ri-home-4-line text-2xl text-[#D4B483]"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">48</p>
          <p className="text-sm text-[#6B7C8F]">Total Units</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
              <i className="ri-briefcase-line text-2xl text-[#D4B483]"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">7</p>
          <p className="text-sm text-[#6B7C8F]">Active Jobs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
              <i className="ri-alert-line text-2xl text-[#D4B483]"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">3</p>
          <p className="text-sm text-[#6B7C8F]">High Priority Alerts</p>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Upcoming Milestones</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-[#F9F9FB] rounded-lg">
            <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-calendar-line text-xl text-[#D4B483]"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#0B1F33]">HVAC Maintenance - Building A</h4>
                  <p className="text-sm text-[#6B7C8F]">Units 101-108</p>
                </div>
                <span className="text-sm font-medium text-[#D4B483]">This Week</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Scheduled filter replacement and system check</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#F9F9FB] rounded-lg">
            <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-calendar-line text-xl text-[#D4B483]"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#0B1F33]">Roof Inspection - Building C</h4>
                  <p className="text-sm text-[#6B7C8F]">All units</p>
                </div>
                <span className="text-sm font-medium text-[#6B7C8F]">Next Week</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Annual roof inspection and gutter cleaning</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#F9F9FB] rounded-lg">
            <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-calendar-line text-xl text-[#D4B483]"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#0B1F33]">Plumbing Upgrade - Building B</h4>
                  <p className="text-sm text-[#6B7C8F]">Unit 205</p>
                </div>
                <span className="text-sm font-medium text-[#6B7C8F]">2 Weeks</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Water heater replacement and pipe inspection</p>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">High Priority Alerts</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-alert-line text-xl text-red-600"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#0B1F33]">Water Leak - Building A, Unit 304</h4>
                  <p className="text-sm text-red-600">Urgent - Reported 2 hours ago</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7C8F] mb-3">Tenant reported water leak from ceiling. Requires immediate attention.</p>
              <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-medium hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                Create Emergency Job
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-alert-line text-xl text-yellow-600"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#0B1F33]">HVAC Not Cooling - Building C, Unit 102</h4>
                  <p className="text-sm text-yellow-600">High Priority - Reported yesterday</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7C8F] mb-3">AC unit not producing cold air. Tenant requesting service.</p>
              <button className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-medium hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                Schedule Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spend Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Monthly Spend Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-[#6B7C8F] mb-2">This Month</p>
            <p className="text-3xl font-bold text-[#0B1F33]">$12,450</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7C8F] mb-2">Last Month</p>
            <p className="text-3xl font-bold text-[#6B7C8F]">$9,820</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7C8F] mb-2">Annual Total</p>
            <p className="text-3xl font-bold text-[#6B7C8F]">$118,340</p>
          </div>
        </div>
      </div>
    </div>
  );
}

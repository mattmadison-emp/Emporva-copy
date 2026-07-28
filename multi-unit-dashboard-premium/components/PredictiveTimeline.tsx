export default function PredictiveTimeline() {
  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0B1F33]">Predictive Maintenance Timeline</h3>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-[#F9F9FB] text-[#333645] rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
              <i className="ri-calendar-line mr-2"></i>
              Next 30 Days
            </button>
            <button className="px-4 py-2 bg-[#F9F9FB] text-[#333645] rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
              <i className="ri-calendar-2-line mr-2"></i>
              Next 90 Days
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Week 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#D4B483] rounded-full"></div>
              <span className="font-semibold text-[#0B1F33]">Week of Jan 15-21</span>
            </div>
            <div className="ml-4 space-y-3">
              <div className="p-4 bg-[#FFF9F0] border-l-4 border-[#D4B483] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F33] mb-1">HVAC Filter Replacement</p>
                    <p className="text-sm text-[#6B7C8F]">Building A, Units 101-108 • Scheduled maintenance</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D4B483] text-[#0B1F33] rounded-full text-xs font-semibold whitespace-nowrap">
                    High Priority
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7C8F]">
                  <span><i className="ri-time-line mr-1"></i>Est. 4 hours</span>
                  <span><i className="ri-money-dollar-circle-line mr-1"></i>$320</span>
                </div>
              </div>

              <div className="p-4 bg-[#F9F9FB] border-l-4 border-gray-300 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F33] mb-1">Smoke Detector Testing</p>
                    <p className="text-sm text-[#6B7C8F]">All Buildings • Quarterly inspection</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 text-[#333645] rounded-full text-xs font-semibold whitespace-nowrap">
                    Routine
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7C8F]">
                  <span><i className="ri-time-line mr-1"></i>Est. 6 hours</span>
                  <span><i className="ri-money-dollar-circle-line mr-1"></i>$180</span>
                </div>
              </div>
            </div>
          </div>

          {/* Week 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#D4B483] rounded-full"></div>
              <span className="font-semibold text-[#0B1F33]">Week of Jan 22-28</span>
            </div>
            <div className="ml-4 space-y-3">
              <div className="p-4 bg-[#FFF9F0] border-l-4 border-[#D4B483] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F33] mb-1">Water Heater Inspection</p>
                    <p className="text-sm text-[#6B7C8F]">Building C, Unit 304 • Predicted issue based on age</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D4B483] text-[#0B1F33] rounded-full text-xs font-semibold whitespace-nowrap">
                    High Priority
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7C8F]">
                  <span><i className="ri-time-line mr-1"></i>Est. 2 hours</span>
                  <span><i className="ri-money-dollar-circle-line mr-1"></i>$450</span>
                </div>
              </div>

              <div className="p-4 bg-[#F9F9FB] border-l-4 border-gray-300 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F33] mb-1">Gutter Cleaning</p>
                    <p className="text-sm text-[#6B7C8F]">Building B • Seasonal maintenance</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 text-[#333645] rounded-full text-xs font-semibold whitespace-nowrap">
                    Routine
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7C8F]">
                  <span><i className="ri-time-line mr-1"></i>Est. 3 hours</span>
                  <span><i className="ri-money-dollar-circle-line mr-1"></i>$280</span>
                </div>
              </div>
            </div>
          </div>

          {/* Week 3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#D4B483] rounded-full"></div>
              <span className="font-semibold text-[#0B1F33]">Week of Jan 29 - Feb 4</span>
            </div>
            <div className="ml-4 space-y-3">
              <div className="p-4 bg-[#FFF9F0] border-l-4 border-[#D4B483] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F33] mb-1">Plumbing System Check</p>
                    <p className="text-sm text-[#6B7C8F]">Building A, Units 304-308 • Predicted leak risk</p>
                  </div>
                  <span className="px-3 py-1 bg-[#D4B483] text-[#0B1F33] rounded-full text-xs font-semibold whitespace-nowrap">
                    High Priority
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6B7C8F]">
                  <span><i className="ri-time-line mr-1"></i>Est. 5 hours</span>
                  <span><i className="ri-money-dollar-circle-line mr-1"></i>$680</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Upcoming Maintenance Windows</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg">
              <div>
                <p className="font-semibold text-[#0B1F33] mb-1">HVAC Systems</p>
                <p className="text-sm text-[#6B7C8F]">12 units due for service</p>
              </div>
              <span className="text-sm font-semibold text-[#D4B483]">Next 2 weeks</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg">
              <div>
                <p className="font-semibold text-[#0B1F33] mb-1">Water Heaters</p>
                <p className="text-sm text-[#6B7C8F]">3 units approaching end of life</p>
              </div>
              <span className="text-sm font-semibold text-[#D4B483]">Next 30 days</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg">
              <div>
                <p className="font-semibold text-[#0B1F33] mb-1">Appliances</p>
                <p className="text-sm text-[#6B7C8F]">8 units need inspection</p>
              </div>
              <span className="text-sm font-semibold text-[#D4B483]">Next 45 days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Risk Forecasting</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="ri-alert-line text-xl text-red-600 mt-1"></i>
                <div>
                  <p className="font-semibold text-[#0B1F33] mb-1">High Risk Alert</p>
                  <p className="text-sm text-[#6B7C8F]">Building C water heater (Unit 304) shows signs of failure. Recommend immediate inspection.</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="ri-error-warning-line text-xl text-yellow-600 mt-1"></i>
                <div>
                  <p className="font-semibold text-[#0B1F33] mb-1">Medium Risk</p>
                  <p className="text-sm text-[#6B7C8F]">5 HVAC units in Building A are 8+ years old. Plan for replacement within 6 months.</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-xl text-blue-600 mt-1"></i>
                <div>
                  <p className="font-semibold text-[#0B1F33] mb-1">Optimization Opportunity</p>
                  <p className="text-sm text-[#6B7C8F]">Bundling HVAC maintenance across all buildings could save 15% on service costs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

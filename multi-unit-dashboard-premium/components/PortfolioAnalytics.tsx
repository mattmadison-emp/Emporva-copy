export default function PortfolioAnalytics() {
  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-[#6B7C8F] mb-2">This Month</p>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">$12,450</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <i className="ri-arrow-down-line"></i>
            8% vs last month
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-[#6B7C8F] mb-2">This Quarter</p>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">$34,820</p>
          <p className="text-sm text-red-600 flex items-center gap-1">
            <i className="ri-arrow-up-line"></i>
            12% vs last quarter
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-[#6B7C8F] mb-2">Annual Total</p>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">$118,340</p>
          <p className="text-sm text-[#6B7C8F]">Year to date</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-[#6B7C8F] mb-2">Avg Cost Per Unit</p>
          <p className="text-3xl font-bold text-[#0B1F33] mb-1">$2,465</p>
          <p className="text-sm text-[#6B7C8F]">Annual average</p>
        </div>
      </div>

      {/* Spending by Property */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Spending by Property</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#0B1F33]">Building A</span>
              <span className="font-bold text-[#0B1F33]">$42,340</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#D4B483] h-3 rounded-full" style={{ width: '36%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#0B1F33]">Building B</span>
              <span className="font-bold text-[#0B1F33]">$38,120</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#D4B483] h-3 rounded-full" style={{ width: '32%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#0B1F33]">Building C</span>
              <span className="font-bold text-[#0B1F33]">$37,880</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#D4B483] h-3 rounded-full" style={{ width: '32%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Spending by Category</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#D4B483] rounded-full"></div>
                <span className="text-[#333645]">HVAC</span>
              </div>
              <span className="font-bold text-[#0B1F33]">$28,450</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#0B1F33] rounded-full"></div>
                <span className="text-[#333645]">Plumbing</span>
              </div>
              <span className="font-bold text-[#0B1F33]">$24,120</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#6B7C8F] rounded-full"></div>
                <span className="text-[#333645]">Electrical</span>
              </div>
              <span className="font-bold text-[#0B1F33]">$18,340</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-[#333645]">Painting</span>
              </div>
              <span className="font-bold text-[#0B1F33]">$15,680</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span className="text-[#333645]">Other</span>
              </div>
              <span className="font-bold text-[#0B1F33]">$31,750</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Maintenance Trends</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#F9F9FB] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0B1F33]">Preventive Maintenance</span>
                <span className="text-sm text-green-600 font-medium">↑ 24%</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Increased preventive work reducing emergency calls</p>
            </div>
            <div className="p-4 bg-[#F9F9FB] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0B1F33]">Emergency Repairs</span>
                <span className="text-sm text-green-600 font-medium">↓ 18%</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Fewer emergencies due to proactive maintenance</p>
            </div>
            <div className="p-4 bg-[#F9F9FB] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0B1F33]">Average Response Time</span>
                <span className="text-sm text-green-600 font-medium">↓ 32%</span>
              </div>
              <p className="text-sm text-[#6B7C8F]">Faster issue resolution with better coordination</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Top Spending Units (This Year)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F9FB] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Total Spend</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Jobs Completed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Primary Issue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333645]">Building A</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">304</td>
                <td className="px-6 py-4 text-sm font-bold text-[#0B1F33]">$8,450</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">7</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">Plumbing</td>
              </tr>
              <tr className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333645]">Building C</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">102</td>
                <td className="px-6 py-4 text-sm font-bold text-[#0B1F33]">$7,820</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">5</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">HVAC</td>
              </tr>
              <tr className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333645]">Building B</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">205</td>
                <td className="px-6 py-4 text-sm font-bold text-[#0B1F33]">$6,940</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">6</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">Electrical</td>
              </tr>
              <tr className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333645]">Building A</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">108</td>
                <td className="px-6 py-4 text-sm font-bold text-[#0B1F33]">$6,120</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">4</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">Appliances</td>
              </tr>
              <tr className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-6 py-4 text-sm text-[#333645]">Building C</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0B1F33]">301</td>
                <td className="px-6 py-4 text-sm font-bold text-[#0B1F33]">$5,680</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">5</td>
                <td className="px-6 py-4 text-sm text-[#6B7C8F]">Flooring</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

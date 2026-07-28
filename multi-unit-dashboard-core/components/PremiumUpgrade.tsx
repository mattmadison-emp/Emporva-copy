import { Link } from 'react-router-dom';

export default function PremiumUpgrade() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/80 rounded-2xl p-12 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-[#D4B483]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-vip-crown-line text-5xl text-[#D4B483]"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-white/90 mb-8">
            Get portfolio analytics, predictive insights, and priority coordination for your multi-unit properties
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-5xl font-bold mb-2">$99</p>
              <p className="text-white/80">per month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#0B1F33] mb-6 text-center">Core vs Premium</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0B1F33]">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#0B1F33]">Core (Current)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#D4B483]">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Portfolio Overview</td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Properties & Units Tracking</td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Job Coordination</td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Basic Maintenance Checklists</td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-green-600"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">AI Diagnosis</td>
                  <td className="px-6 py-4 text-center text-sm text-[#6B7C8F]">Limited</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-[#D4B483]">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Portfolio Analytics & Insights</td>
                  <td className="px-6 py-4 text-center"><i className="ri-close-line text-xl text-gray-400"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-[#D4B483]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Preventive Maintenance Automation</td>
                  <td className="px-6 py-4 text-center"><i className="ri-close-line text-xl text-gray-400"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-[#D4B483]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Cost Reporting by Property & Unit</td>
                  <td className="px-6 py-4 text-center"><i className="ri-close-line text-xl text-gray-400"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-[#D4B483]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Predictive Timeline & Forecasting</td>
                  <td className="px-6 py-4 text-center"><i className="ri-close-line text-xl text-gray-400"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-[#D4B483]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Priority Provider Matching</td>
                  <td className="px-6 py-4 text-center"><i className="ri-close-line text-xl text-gray-400"></i></td>
                  <td className="px-6 py-4 text-center"><i className="ri-check-line text-xl text-[#D4B483]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-[#333645]">Document Storage</td>
                  <td className="px-6 py-4 text-center text-sm text-[#6B7C8F]">5 GB</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-[#D4B483]">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Premium Features Detail */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-line-chart-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Portfolio Analytics</h3>
          <p className="text-[#6B7C8F] mb-4">
            Get detailed insights into spending patterns, maintenance trends, and property performance across your entire portfolio.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Cost breakdown by property and unit</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Maintenance trend analysis</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>ROI tracking and reporting</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-calendar-check-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Automated Maintenance</h3>
          <p className="text-[#6B7C8F] mb-4">
            Schedule preventive maintenance at scale with automated reminders, recurring tasks, and completion tracking.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Automated scheduling across properties</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Equipment lifecycle tracking</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Predictive replacement alerts</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-time-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Predictive Forecasting</h3>
          <p className="text-[#6B7C8F] mb-4">
            Anticipate maintenance needs, budget for upcoming expenses, and plan workload across your portfolio.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Predictive timeline for all properties</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Budget forecasting and planning</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Workload distribution insights</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-team-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Priority Coordination</h3>
          <p className="text-[#6B7C8F] mb-4">
            Get matched with top-rated contractors and receive priority support for your portfolio needs.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Priority contractor matching</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Dedicated support team</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-[#333645]">
              <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
              <span>Bulk project coordination</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Ready to Upgrade?</h3>
        <p className="text-[#6B7C8F] mb-6 max-w-2xl mx-auto">
          Join multi-unit owners who are saving time and money with portfolio-level insights and automated maintenance.
        </p>
        <Link
          to="/multi-unit-dashboard-premium"
          className="inline-block px-8 py-4 bg-[#D4B483] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap"
        >
          Upgrade to Premium - $99/month
        </Link>
      </div>
    </div>
  );
}

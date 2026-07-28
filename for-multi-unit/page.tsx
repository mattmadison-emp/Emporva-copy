import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ForMultiUnit() {
  const navigate = useNavigate();
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" 
              alt="Emporva Logo" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-primary-navy" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className="font-medium text-neutral-dark hover:text-accent-sand transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              How It Works
            </Link>
            
            {/* Solutions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button className="font-medium text-neutral-dark hover:text-accent-sand transition-colors whitespace-nowrap flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Solutions
                <i className={`ri-arrow-down-s-line transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 pt-4 -mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                  <Link 
                    to="/for-homeowners" 
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[#0B1F33] mb-1">Homeowners</div>
                    <div className="text-sm text-[#6B7C8F]">Property organization and intelligence</div>
                  </Link>
                  <Link 
                    to="/for-multi-unit" 
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[#0B1F33] mb-1">Multi-Unit Owners</div>
                    <div className="text-sm text-[#6B7C8F]">Portfolio operations and utility analytics</div>
                  </Link>
                  <Link 
                    to="/for-contractors" 
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-[#0B1F33] mb-1">Contractors</div>
                    <div className="text-sm text-[#6B7C8F]">CRM, scheduling, and client growth</div>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/providers" className="font-medium text-neutral-dark hover:text-accent-sand transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              Find Pros
            </Link>
            <Link to="/blog" className="font-medium text-neutral-dark hover:text-accent-sand transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              Blog
            </Link>
            <Link to="/login" className="btn-primary whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Log In
            </Link>
          </div>

          <button 
            className="md:hidden text-primary-navy"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              <Link 
                to="/how-it-works" 
                className="block font-medium text-neutral-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              
              {/* Solutions Mobile */}
              <div>
                <button 
                  className="w-full text-left font-medium text-neutral-dark flex items-center justify-between"
                  onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                >
                  Solutions
                  <i className={`ri-arrow-down-s-line transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isSolutionsOpen && (
                  <div className="mt-2 ml-4 space-y-3">
                    <Link 
                      to="/for-homeowners" 
                      className="block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-semibold text-[#0B1F33] text-sm">Homeowners</div>
                      <div className="text-xs text-[#6B7C8F]">Property organization and intelligence</div>
                    </Link>
                    <Link 
                      to="/for-multi-unit" 
                      className="block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-semibold text-[#0B1F33] text-sm">Multi-Unit Owners</div>
                      <div className="text-xs text-[#6B7C8F]">Portfolio operations and utility analytics</div>
                    </Link>
                    <Link 
                      to="/for-contractors" 
                      className="block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-semibold text-[#0B1F33] text-sm">Contractors</div>
                      <div className="text-xs text-[#6B7C8F]">CRM, scheduling, and client growth</div>
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                to="/providers" 
                className="block font-medium text-neutral-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Pros
              </Link>
              <Link 
                to="/blog" 
                className="block font-medium text-neutral-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/login" 
                className="block btn-primary text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/80"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#F9F9FB]">
            Operate Your Portfolio with Intelligence, Not Reactive Maintenance
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#F9F9FB]/90">
            An operational intelligence platform for landlords, portfolio owners, and property management firms.
          </p>
          <Link to="/role-selection" className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
            Start Managing Your Portfolio
          </Link>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-8">
            The Multi-Unit Challenge
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
            <p>
              Managing multiple properties means juggling dozens of units, hundreds of maintenance tasks, and constant coordination across contractors and tenants. Most landlords and operators are forced to react to emergencies instead of planning ahead, track everything in spreadsheets, and lose visibility once work begins.
            </p>
            
            <p>
              Emporva gives multi-unit owners a portfolio command center that brings clarity to complexity. Track every property and unit, schedule preventive maintenance at scale, coordinate multi-trade projects across your portfolio, and get insights that help you plan instead of react.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Common Pain Points</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1"></i>
                  <span>Reactive maintenance across multiple properties</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1"></i>
                  <span>No visibility into unit-level history</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1"></i>
                  <span>Scattered documentation and records</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1"></i>
                  <span>Unclear spending and cost tracking</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Emporva's Solution</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Portfolio-level overview and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Unit-level tracking and property memory</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Preventive maintenance at scale</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Centralized job coordination</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">Built for Portfolio Operators</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-dashboard-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Portfolio Command Center</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                See all properties, units, active jobs, and upcoming milestones in one unified dashboard. Track high-priority alerts and monthly spend across your entire portfolio.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Total properties and units overview</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Active jobs across all properties</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>High-priority alerts and urgent issues</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-building-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Unit-Level Tracking</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                Track every unit with detailed history, maintenance records, photos, and documents. Know exactly what's been done, when, and by whom.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Property and unit organization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Unit-level notes and history</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Photos and documents per unit</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-calendar-check-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Preventive Maintenance at Scale</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                Schedule seasonal checklists, track equipment by unit, and automate recurring maintenance tasks across your entire portfolio.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Seasonal checklists across all properties</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Equipment tracking per unit</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Recurring task automation</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-briefcase-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Centralized Job Coordination</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                Manage all jobs across your portfolio with shared job rooms, multi-trade visibility, and clear scheduling windows.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Filter jobs by property and unit</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Shared communication and approvals</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Scheduling windows and dependencies</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-robot-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">AI Assistance for Every Issue</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                Upload photos, describe issues, and tag them to specific properties and units. Get AI diagnosis and convert issues into scoped jobs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Photo upload and AI diagnosis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Tag issues to property and unit</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Convert to jobs and route to providers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-line-chart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Portfolio Analytics (Premium)</h3>
              <p className="text-[#6B7C8F] text-lg mb-4">
                Get insights into spending, maintenance trends, and predictive forecasting to plan ahead and avoid expensive surprises.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Cost reporting by property and unit</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Predictive timeline and forecasting</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#333645]">
                  <i className="ri-check-line text-[#D4B483] mt-0.5"></i>
                  <span>Priority provider matching</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing That Scales With You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hidden fees. No penalties for growing your portfolio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Core Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-all">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Core</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">Free</div>
                <p className="text-gray-600">Essential portfolio management</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Portfolio overview dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Properties and units tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Basic AI diagnosis (limited)</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Jobs tracking and shared job rooms</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Basic maintenance checklists</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-teal-600 mt-0.5"></i>
                  <span className="text-gray-700">Read-only scheduling timeline</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/enroll-multi-unit')}
                className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Start Managing Your Portfolio
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-8 relative hover:border-amber-500 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 px-6 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                Most Popular
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">$29/month</div>
                  <div className="text-lg text-gray-700 mt-1">platform fee</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">+ $1 per unit/month</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                  <div>10 units → $29 + $10 = <span className="font-semibold">$39/month</span></div>
                  <div>42 units → $29 + $42 = <span className="font-semibold">$71/month</span></div>
                  <div>100 units → $29 + $100 = <span className="font-semibold">$129/month</span></div>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-900 font-medium">Everything in Core, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Unlimited AI diagnosis and follow-up</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Portfolio analytics and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Preventive maintenance automation at scale</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Cost reporting by property and unit</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Predictive timeline and forecasting</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Priority provider matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-xl text-amber-600 mt-0.5"></i>
                  <span className="text-gray-700">Unlimited storage</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/enroll-multi-unit')}
                className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Start Managing Your Portfolio
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            No hidden fees. No penalties for growing your portfolio.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Take Control of Your Portfolio?</h2>
          <p className="text-xl text-[#6B7C8F] mb-8">
            Join multi-unit owners who are managing their properties with clarity, coordination, and confidence.
          </p>
          <Link to="/role-selection" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
            Start Managing Your Portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}

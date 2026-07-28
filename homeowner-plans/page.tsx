import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useProfile } from '../../hooks/useProfile';

export default function HomeownerPlans() {
  const { profile } = useProfile();
  const isCore = profile?.tier === 'core';
  const isPremium = profile?.tier === 'premium';

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Property Owner Plans</h1>
          <p className="text-xl md:text-2xl text-[#F9F9FB]/90">
            Choose the plan that fits your homeownership journey
          </p>
        </div>
      </section>

      {/* Who Each Tier Is For */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">Which Plan Is Right for You?</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-[#F9F9FB] rounded-xl p-8">
              <div className="w-16 h-16 bg-[#0B1F33]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-home-4-line text-3xl text-[#0B1F33]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Core Is Best For:</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>New homeowners getting organized</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Occasional repair and maintenance needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Homeowners who want a central place to track work</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Anyone starting their first project with Emporva</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#D4B483]/10 rounded-xl p-8 border-2 border-[#D4B483]">
              <div className="w-16 h-16 bg-[#D4B483]/20 rounded-full flex items-center justify-center mb-6">
                <i className="ri-line-chart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Premium Is Best For:</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Homeowners planning renovations or major projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Property owners who want complete property history</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Anyone who wants to stay ahead of maintenance</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>Homeowners preparing for resale or refinancing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">Complete Feature Comparison</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Tier Detailed */}
            <div className={`bg-white rounded-xl shadow-sm p-8 border-2 relative ${isCore ? 'border-[#00B8A9]' : 'border-gray-200'}`}>
              {isCore && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00B8A9] text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  Your Plan
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Core</h3>
              <p className="text-[#6B7C8F] mb-6">Get started with limited monthly credits</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#0B1F33]">Free</span>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Monthly Credits</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">3 AI Diagnostic Credits</p>
                        <p className="text-sm text-[#6B7C8F]">Upload photos and get AI diagnosis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">3 Utility Upload Credits</p>
                        <p className="text-sm text-[#6B7C8F]">Track utility usage and costs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">1 Export Credit Every 6 Months</p>
                        <p className="text-sm text-[#6B7C8F]">Generate property history reports</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Property Management</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Property Overview Dashboard</p>
                        <p className="text-sm text-[#6B7C8F]">Property profile and system registry</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Photo & Document Uploads</p>
                        <p className="text-sm text-[#6B7C8F]">Keep your home records organized</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Basic Maintenance Checklists</p>
                        <p className="text-sm text-[#6B7C8F]">Seasonal maintenance reminders</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-3">Project Coordination</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Shared Job Rooms</p>
                        <p className="text-sm text-[#6B7C8F]">Collaborate with contractors in one place</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Read-Only Project Timelines</p>
                        <p className="text-sm text-[#6B7C8F]">View milestone visibility and updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isCore ? (
                <button disabled className="block w-full mt-8 bg-gray-200 text-[#6B7C8F] text-center py-3 rounded-lg font-semibold cursor-not-allowed whitespace-nowrap">
                  Current Plan
                </button>
              ) : (
                <Link to="/ai-intake" className="block w-full mt-8 bg-[#0B1F33] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                  Get Started Free
                </Link>
              )}
            </div>

            {/* Premium Tier Detailed */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#D4B483] relative">
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${isPremium ? 'bg-[#00B8A9] text-white' : 'bg-[#D4B483] text-[#0B1F33]'}`}>
                {isPremium ? 'Your Plan' : 'Most Popular'}
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Premium</h3>
              <p className="text-[#6B7C8F] mb-6">Unlock Property Memory, Utility Insights, and resale-ready history</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#0B1F33]">$12</span>
                <span className="text-[#6B7C8F] text-lg">/month</span>
                <p className="text-sm text-[#6B7C8F] mt-2">or $120/year <span className="text-[#D4B483] font-semibold">(2 months free)</span></p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#D4B483]/10 rounded-lg p-4 mb-4">
                  <p className="font-bold text-[#0B1F33]">Everything in Core, plus:</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Unlimited Usage</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Unlimited AI Diagnostics</p>
                        <p className="text-sm text-[#6B7C8F]">Follow-up clarification and deep analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Unlimited Utility Uploads</p>
                        <p className="text-sm text-[#6B7C8F]">Track all your utility bills without limits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Unlimited Exports</p>
                        <p className="text-sm text-[#6B7C8F]">Generate resale and history reports anytime</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Property Intelligence</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Property Memory</p>
                        <p className="text-sm text-[#6B7C8F]">Complete history of all repairs, upgrades, and systems</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Utility Insights</p>
                        <p className="text-sm text-[#6B7C8F]">Predictions and anomaly detection for all utilities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Resale Packet Generation</p>
                        <p className="text-sm text-[#6B7C8F]">Comprehensive reports for buyers, lenders, inspectors</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Planning & Forecasting</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">System Lifecycle Forecasting</p>
                        <p className="text-sm text-[#6B7C8F]">Predict when systems will need replacement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Preventive Maintenance Scheduling</p>
                        <p className="text-sm text-[#6B7C8F]">Stay ahead of problems</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-3">Storage & Support</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Unlimited Storage</p>
                        <p className="text-sm text-[#6B7C8F]">Never worry about space for docs and photos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Priority Contractor Matching</p>
                        <p className="text-sm text-[#6B7C8F]">Get matched faster with top pros</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isPremium ? (
                <button disabled className="block w-full mt-8 bg-gray-200 text-[#6B7C8F] text-center py-3 rounded-lg font-semibold cursor-not-allowed whitespace-nowrap">
                  Current Plan
                </button>
              ) : (
                <Link to="/checkout?type=homeowner-premium" className="block w-full mt-8 bg-[#D4B483] text-[#0B1F33] text-center py-3 rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
                  Start Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value of Proactive Ownership */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-12">
            The Value of Property Intelligence
          </h2>
          
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
            <p>
              Most homeowners operate reactively—waiting for something to break before taking action. This approach leads to emergency repairs, rushed decisions, and expensive surprises.
            </p>
            
            <p>
              Premium members shift from reactive to proactive. With Property Memory, Utility Insights, and unlimited AI diagnostics, you can understand your home's patterns, catch anomalies early, and plan ahead with confidence.
            </p>
            
            <p>
              Whether you're planning a major renovation, preparing for resale, or simply want to stay ahead of maintenance, Premium gives you the visibility and intelligence to make confident decisions about your property.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-database-2-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Complete History</h3>
              <p className="text-[#6B7C8F]">Property Memory tracks everything for resale or refinancing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Catch Anomalies</h3>
              <p className="text-[#6B7C8F]">Utility Insights detect problems before they become expensive</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Plan Ahead</h3>
              <p className="text-[#6B7C8F]">Forecast system lifecycles and budget accurately</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-[#6B7C8F] mb-8">
            Start with Core and upgrade anytime as your needs grow.
          </p>
          <Link to="/checkout?type=homeowner-premium" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function ContractorPlans() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Contractor Plans</h1>
          <p className="text-xl md:text-2xl text-[#F9F9FB]/90">
            Pay per lead or go unlimited — you choose how to grow
          </p>
        </div>
      </section>

      {/* Who Each Tier Is For */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">
            Which Plan Is Right for You?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-[#F9F9FB] rounded-xl p-8">
              <div className="w-16 h-16 bg-[#0B1F33]/10 rounded-full flex items-center justify-center mb-6">
                <i className="ri-copper-coin-line text-3xl text-[#0B1F33]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Core Is Best For:</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Solo contractors who want to{' '}
                    <strong className="text-[#0B1F33]">pay only for leads they pursue</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Contractors who take on{' '}
                    <strong className="text-[#0B1F33]">fewer than 7 new leads per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Professionals who want{' '}
                    <strong className="text-[#0B1F33]">pre-scoped jobs</strong> without a monthly
                    commitment
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Anyone starting with Emporva who wants to{' '}
                    <strong className="text-[#0B1F33]">test the platform risk-free</strong>
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#D4B483]/10 rounded-xl p-8 border-2 border-[#D4B483]">
              <div className="w-16 h-16 bg-[#D4B483]/20 rounded-full flex items-center justify-center mb-6">
                <i className="ri-vip-crown-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Premium Is Best For:</h3>
              <ul className="space-y-3 text-[#6B7C8F]">
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Growing businesses that need{' '}
                    <strong className="text-[#0B1F33]">unlimited lead access</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Contractors managing{' '}
                    <strong className="text-[#0B1F33]">multiple jobs simultaneously</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Professionals ready to{' '}
                    <strong className="text-[#0B1F33]">scale with CRM, automation, and analytics</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                  <span>
                    Anyone spending{' '}
                    <strong className="text-[#0B1F33]">$100+ per month on leads</strong> already
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">
            Complete Feature Comparison
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Tier */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contractor Core</h3>
              <p className="text-[#6B7C8F] mb-6">Pay only for the leads you want to pursue.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#0B1F33]">$15</span>
                <span className="text-[#6B7C8F] text-lg">/lead</span>
              </div>
              <p className="text-sm text-[#6B7C8F] mb-6 bg-[#F9F9FB] rounded-lg p-3">
                <i className="ri-information-line mr-1"></i>
                No monthly fees. Buy credit packs and use them to unlock leads in the marketplace.
                Credits never expire.
              </p>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Lead Access</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Pay-Per-Lead Marketplace</p>
                        <p className="text-sm text-[#6B7C8F]">
                          Browse jobs free, pay 1 credit to unlock and quote
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">AI-Scoped Job Details</p>
                        <p className="text-sm text-[#6B7C8F]">Every lead comes with photos, scope, and expectations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Q&amp;A Before Quoting</p>
                        <p className="text-sm text-[#6B7C8F]">Ask homeowners questions before committing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Job Management</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Active Job Dashboard</p>
                        <p className="text-sm text-[#6B7C8F]">Manage all your Emporva jobs in one place</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Shared Job Rooms</p>
                        <p className="text-sm text-[#6B7C8F]">Messaging, photos, documents, and approvals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Multi-Trade Coordination</p>
                        <p className="text-sm text-[#6B7C8F]">See dependencies and coordinate with other trades</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-3">Basics</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Contractor Profile Page</p>
                        <p className="text-sm text-[#6B7C8F]">Showcase your work and credentials</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Manual Lead Import</p>
                        <p className="text-sm text-[#6B7C8F]">Add your own leads for AI clarification</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/enroll-contractor"
                className="block w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap text-center"
              >
                Get Started — Pay Per Lead
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#D4B483] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4B483] text-[#0B1F33] px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                Best Value
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contractor Premium</h3>
              <p className="text-[#6B7C8F] mb-6">Unlimited leads plus a full business toolkit.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#0B1F33]">$99</span>
                <span className="text-[#6B7C8F] text-lg">/month</span>
              </div>

              <div className="space-y-4">
                <div className="bg-[#D4B483]/10 rounded-lg p-4 mb-4">
                  <p className="font-bold text-[#0B1F33]">Everything in Core, plus:</p>
                  <p className="text-sm text-[#6B7C8F] mt-1">
                    No per-lead costs — unlimited marketplace access included
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Unlimited Lead Access</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Unlimited Marketplace Access</p>
                        <p className="text-sm text-[#6B7C8F]">
                          Browse, unlock, and quote on any job — no credit cost
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">AI-Powered Quotes Hub</p>
                        <p className="text-sm text-[#6B7C8F]">
                          Generate professional proposals with AI assistance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Customer Management</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Full CRM &amp; Customer History</p>
                        <p className="text-sm text-[#6B7C8F]">Track all interactions and past work</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Automated Follow-Ups &amp; Reminders</p>
                        <p className="text-sm text-[#6B7C8F]">Never miss a follow-up again</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Email &amp; SMS Communication Hub</p>
                        <p className="text-sm text-[#6B7C8F]">All client communication in one place</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-bold text-[#0B1F33] mb-3">Pipeline &amp; Scheduling</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Job Pipeline Tracking</p>
                        <p className="text-sm text-[#6B7C8F]">Manage leads through completion</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Multi-Job Calendar</p>
                        <p className="text-sm text-[#6B7C8F]">
                          See all jobs, appointments, and crew assignments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0B1F33] mb-3">Growth Tools</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Business Performance Analytics</p>
                        <p className="text-sm text-[#6B7C8F]">
                          Revenue, win rates, and growth insights
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-[#333645]">Marketing &amp; Review Automation</p>
                        <p className="text-sm text-[#6B7C8F]">Build your reputation automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout?type=contractor-premium"
                className="block w-full mt-8 bg-[#D4B483] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap text-center"
              >
                Start Premium Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Math Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-12">
            When Does Premium Make Sense?
          </h2>

          <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] rounded-xl p-8 text-white mb-12">
            <h3 className="text-2xl font-bold mb-6 text-center">The Simple Math</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-6">
                <p className="text-4xl font-bold text-[#D4B483] mb-2">$15</p>
                <p className="text-white/80 text-sm">per lead on Core</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="text-4xl font-bold text-[#D4B483] mb-2">7+</p>
                <p className="text-white/80 text-sm">leads/month = $105+</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="text-4xl font-bold text-[#D4B483] mb-2">$99</p>
                <p className="text-white/80 text-sm">Premium = unlimited</p>
              </div>
            </div>
            <p className="text-center text-white/70 mt-6 text-sm">
              If you pursue 7 or more leads per month, Premium saves you money — and you get CRM,
              automation, analytics, and everything else included.
            </p>
          </div>

          <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
            <p>
              <strong>Contractor Core</strong> is perfect for contractors who want to test the waters.
              Pay $15 per lead, only for the jobs you actually want to pursue. No monthly commitment,
              no wasted spend on leads you never wanted.
            </p>
            <p>
              <strong>Contractor Premium</strong> is for contractors ready to grow. Unlimited marketplace
              access means you never think twice about unlocking a lead. Plus, you get the full business
              toolkit — CRM, pipeline management, automated follow-ups, scheduling, analytics, and
              marketing tools — all for one flat monthly rate.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-copper-coin-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Start Flexible</h3>
              <p className="text-[#6B7C8F]">Pay per lead with no commitment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Scale Smart</h3>
              <p className="text-[#6B7C8F]">Upgrade when the math makes sense</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Grow Unlimited</h3>
              <p className="text-[#6B7C8F]">One price for everything you need</p>
            </div>
          </div>
        </div>
      </section>

      {/* Not a Lead Marketplace */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#D4B483]/10 border-l-4 border-[#D4B483] p-8 rounded-r-lg">
            <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Better Than Traditional Lead Marketplaces</h3>
            <p className="text-[#333645] text-lg leading-relaxed">
              Unlike platforms that sell the same lead to 10 contractors, Emporva delivers{' '}
              <strong>pre-scoped, AI-clarified jobs</strong> with photos, expectations, and clear
              details. On Core, you only pay for leads you choose to pursue. On Premium, you get
              unlimited access plus the tools to run your entire business. Either way, you get better
              leads than anywhere else.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Join?</h2>
          <p className="text-xl text-[#6B7C8F] mb-8">
            Start with Core and upgrade when you're ready to go unlimited.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/enroll-contractor"
              className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap"
            >
              Start with Core — $15/lead
            </Link>
            <Link
              to="/checkout?type=contractor-premium"
              className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap"
            >
              Go Premium — $99/mo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

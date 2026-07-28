import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function EarlyAccessContractors() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    primaryTrade: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/early-access/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          primaryTrade: formData.primaryTrade,
          location: formData.location
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          companyName: '',
          primaryTrade: '',
          location: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (_error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const formSection = document.getElementById('signup');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-light via-white to-[#D4B483]/10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#D4B483]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1F33]/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4B483]/20 text-primary-navy rounded-full text-sm font-semibold mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <i className="ri-sparkling-line text-accent-sand"></i>
            <span>Early Contractor Partner Access</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary-navy mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Better Leads. Clear Scope.<br />Pay Only When You're Ready.
          </h1>
          
          <p className="text-xl text-secondary-slate mb-10 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva delivers AI-scoped jobs with photos, details, and realistic expectations. Browse for free, pay <strong className="text-primary-navy">$15 per lead</strong> only when you want to quote — no monthly fees, no wasted spend.
          </p>
          
          <button 
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-navy text-white rounded-lg font-semibold hover:bg-primary-navy/90 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Join as an Early Contractor Partner
            <i className="ri-arrow-right-line"></i>
          </button>
          
          <p className="text-sm text-secondary-slate mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Early partners get bonus credits and preferred visibility at launch.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Traditional lead platforms waste your money.
          </h2>
          
          <div className="space-y-6 text-lg text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p className="text-center max-w-3xl mx-auto">
              You pay for leads that are vague, shared with 10 other contractors, and rarely turn into real work. Important details are missing, expectations aren't aligned, and you're quoting blind.
            </p>
            
            <div className="bg-gradient-to-br from-neutral-light to-[#D4B483]/10 border-l-4 border-accent-sand p-6 rounded-r-lg">
              <p className="text-neutral-dark font-medium">
                <strong className="text-accent-sand">Emporva flips the model.</strong> Every lead is AI-scoped with photos, clear expectations, and homeowner details before you spend a dime. You browse the marketplace for free and only pay $15 when you're ready to unlock a lead and submit your quote.
              </p>
              <p className="text-neutral-dark mt-4">
                No monthly fees on Core. No blind bidding. No wasted credits on leads you never wanted. And when you're ready to scale, upgrade to Premium for unlimited access at $99/month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-neutral-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            See the full picture before you pay.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-search-eye-line text-accent-sand text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Browse jobs for free</strong> — see scope, trade, location, and budget before spending a credit
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-copper-coin-line text-primary-navy text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Pay $15 per lead</strong> only when you choose to unlock and quote — credits never expire
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#6B7C8F]/15 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-file-list-3-line text-secondary-slate text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Every lead is AI-scoped</strong> with photos, urgency, homeowner notes, and clear expectations
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-question-answer-line text-accent-sand text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Ask questions before committing</strong> — Q&A with homeowners is free, no credit required
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow md:col-span-2">
              <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-line-chart-line text-primary-navy text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Scale when you're ready</strong> — upgrade to Premium ($99/mo) for unlimited leads, CRM, automation, and analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-[#F9F9FB] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4B483] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0B1F33] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4 font-['Poppins']">
              How It Works
            </h2>
            <p className="text-lg text-[#6B7C8F] max-w-2xl mx-auto">
              From lead to completed job in four simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#D4B483]/20 via-[#D4B483] to-[#D4B483]/20 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">1</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-notification-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Receive Scoped Jobs
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Get notified about jobs that match your trade. Each job comes pre-scoped with AI analysis, photos, and clear details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">2</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-search-eye-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Review & Decide
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      See all the details upfront—photos, urgency level, homeowner notes. Choose which jobs align with your business.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">3</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-file-edit-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Submit Your Quote
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Build and send professional quotes directly through the platform. Communicate with homeowners in one organized place.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">4</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-tools-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Manage & Grow
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Track active jobs, manage customer relationships, and build your reputation—all without paying per lead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-lg text-[#6B7C8F] mb-6">
              Ready to grow your business with better jobs?
            </p>
            <button
              onClick={scrollToForm}
              className="px-10 py-4 bg-gradient-to-r from-[#0B1F33] to-[#1a3a5c] text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 font-['Montserrat'] whitespace-nowrap cursor-pointer"
            >
              Get Early Access Now
            </button>
          </div>
        </div>
      </section>

      {/* How It's Different Section */}
      <section className="py-20 px-6 bg-primary-navy">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Smarter than traditional lead platforms.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-sand rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-eye-line text-2xl text-primary-navy"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    See before you spend
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Browse full job details for free — only pay when you're ready to quote
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-sand rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-2xl text-primary-navy"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    No blind bidding wars
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Leads aren't sold to 10 contractors — limited competition per job
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-sand rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-copper-coin-line text-2xl text-primary-navy"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    $15/lead — no monthly fees
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Buy credits in bulk, use them when you want — they never expire
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-sand rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-vip-crown-line text-2xl text-primary-navy"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Upgrade path to unlimited
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    When 7+ leads/month makes sense, go Premium for $99/mo unlimited
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Why join early?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#D4B483]/20 rounded-full flex items-center justify-center">
                  <i className="ri-copper-coin-line text-accent-sand"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Bonus Launch Credits</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Early partners receive free lead credits to start quoting on day one</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0B1F33]/10 rounded-full flex items-center justify-center">
                  <i className="ri-eye-line text-primary-navy"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Preferred Visibility</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Priority placement in the marketplace when the platform launches</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#6B7C8F]/15 rounded-full flex items-center justify-center">
                  <i className="ri-lightbulb-line text-secondary-slate"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Shape the Product</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Direct input on quoting tools, credit pricing, and workflow features</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#D4B483]/20 rounded-full flex items-center justify-center">
                  <i className="ri-price-tag-3-line text-accent-sand"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Locked-In Pricing</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Early partners lock in $15/lead pricing and get discounted Premium rates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-20 px-6 bg-gradient-to-br from-neutral-light via-white to-[#D4B483]/10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-primary-navy mb-3 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Request Early Contractor Access
            </h2>
            <p className="text-secondary-slate mb-8 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              Be notified as tools become available
            </p>

            <form id="contractor-early-access-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="Smith Construction LLC"
                />
              </div>

              <div>
                <label htmlFor="primaryTrade" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Primary Trade <span className="text-red-500">*</span>
                </label>
                <select
                  id="primaryTrade"
                  name="primaryTrade"
                  value={formData.primaryTrade}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base cursor-pointer"
                >
                  <option value="">Select your primary trade</option>
                  <option value="General Contractor">General Contractor</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="Flooring">Flooring</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Masonry">Masonry</option>
                  <option value="Drywall">Drywall</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Windows & Doors">Windows & Doors</option>
                  <option value="Siding">Siding</option>
                  <option value="Kitchen & Bath Remodeling">Kitchen & Bath Remodeling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  City or ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="Austin, TX or 78701"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <i className="ri-checkbox-circle-line text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium">Welcome to early access!</p>
                    <p className="text-sm mt-1">We'll notify you as tools become available.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <i className="ri-error-warning-line text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium">Something went wrong</p>
                    <p className="text-sm mt-1">Please try again or contact support.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-primary-navy text-white rounded-lg font-semibold hover:bg-primary-navy/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Submitting...
                  </span>
                ) : (
                  'Request Early Access'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva is currently in development. Early contractor partners will be notified as tools become available.
          </p>
          <div className="mt-6">
            <Link to="/" className="text-sm text-accent-sand hover:text-primary-navy font-medium whitespace-nowrap transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              ← Back to Emporva Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

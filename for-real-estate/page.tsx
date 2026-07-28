import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const features = [
  {
    icon: 'ri-building-line',
    title: 'Portfolio Management',
    description: 'Manage maintenance across hundreds or thousands of properties from a single dashboard'
  },
  {
    icon: 'ri-robot-line',
    title: 'AI-Powered Triage',
    description: 'Automatically categorize and prioritize maintenance requests based on urgency and type'
  },
  {
    icon: 'ri-team-line',
    title: 'Contractor Network',
    description: 'Access verified contractors in every market you operate, with consistent quality standards'
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Complete Documentation',
    description: 'Every work order includes photos, timestamps, and detailed records for compliance and reporting'
  },
  {
    icon: 'ri-line-chart-line',
    title: 'Analytics & Reporting',
    description: 'Track costs, response times, and contractor performance across your entire portfolio'
  },
  {
    icon: 'ri-smartphone-line',
    title: 'Tenant Communication',
    description: 'Keep tenants informed with automated updates and transparent timelines'
  }
];

const useCases = [
  {
    title: 'Residential Property Management',
    description: 'Manage maintenance for apartment complexes, single-family rentals, and multi-unit properties',
    icon: 'ri-home-4-line',
    benefits: [
      'Reduce maintenance costs by 25%',
      'Improve tenant satisfaction scores',
      'Faster response to urgent issues',
      'Complete audit trail for every repair'
    ]
  },
  {
    title: 'Commercial Real Estate',
    description: 'Handle complex commercial property maintenance with specialized contractor networks',
    icon: 'ri-building-2-line',
    benefits: [
      'Minimize tenant downtime',
      'Coordinate multiple trades efficiently',
      'Track capital improvements',
      'Ensure code compliance'
    ]
  },
  {
    title: 'Real Estate Investment Firms',
    description: 'Streamline property operations across acquisition, renovation, and ongoing management',
    icon: 'ri-funds-line',
    benefits: [
      'Accurate renovation budgeting',
      'Faster property turnover',
      'Data-driven investment decisions',
      'Scalable operations'
    ]
  }
];

export default function ForRealEstate() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Modern%20commercial%20real%20estate%20property%20management%20office%20with%20professionals%20using%20technology%20and%20tablets%20to%20manage%20multiple%20properties%20with%20bright%20professional%20atmosphere&width=1920&height=600&seq=realestate-hero-001&orientation=landscape"
            alt="Real Estate Partners"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/75 via-[#0B1F33]/65 to-[#0B1F33]/75"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            For Property Managers & Real Estate
          </h1>
          <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your operating system for property operations—manage maintenance, coordinate contractors, and keep tenants happy across your entire portfolio
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            The Portfolio Operating System
          </h2>
          <p className="text-xl text-[#333645] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Managing properties shouldn't mean juggling spreadsheets, phone calls, and unreliable contractors. Emporva brings AI-powered intelligence and workflow automation to every maintenance request—from tenant report to final repair.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>25%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Lower Maintenance Costs</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>50%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Faster Response Time</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>95%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Tenant Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Platform Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-14 h-14 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-3xl text-[#D4B483]`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How It Works
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>1</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tenant Submits Request
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tenants report issues through your branded portal or directly via Emporva, with photos and descriptions
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>2</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI Triages & Prioritizes
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Our AI analyzes the issue, determines urgency, estimates costs, and routes to the appropriate team
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>3</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Contractor Dispatch
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Verified contractors are automatically matched and dispatched based on location, specialty, and your preferred vendor list
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>4</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Automated Updates & Documentation
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tenants receive automatic updates. Every step is documented with photos and timestamps for your records
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Built for Your Business
            </h2>
          </div>

          <div className="space-y-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${useCase.icon} text-3xl text-[#D4B483]`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {useCase.title}
                    </h3>
                    <p className="text-[#333645] leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {useCase.description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {useCase.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                          <span className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API & Integration */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Seamless Integration
            </h2>
            <p className="text-lg text-[#333645] max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Emporva integrates with your existing property management software via API, or works as a standalone platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-plug-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                API Access
              </h3>
              <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Full REST API
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-webhook-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Webhooks
              </h3>
              <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Real-time updates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-palette-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                White Label
              </h3>
              <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your branding
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-chart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Reporting
              </h3>
              <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Custom dashboards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Modernize Your Operations?
          </h2>
          <p className="text-white/95 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Schedule a demo to see how Emporva can transform your property management workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Schedule a Demo
            </button>
            <button className="px-8 py-4 bg-[#D4B483] text-white rounded-lg hover:bg-[#c9a876] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              View Pricing
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/90 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>Contact Enterprise Sales:</strong>
            </p>
            <p className="text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
              enterprise@emporva.com | (555) 123-4567
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
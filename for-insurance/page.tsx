import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const benefits = [
  {
    icon: 'ri-time-line',
    title: 'Reduce Assessment Time by 60%',
    description: 'AI-powered diagnostics provide instant preliminary assessments, reducing the time from claim to resolution'
  },
  {
    icon: 'ri-money-dollar-circle-line',
    title: 'Lower Claim Costs',
    description: 'Accurate diagnostics prevent unnecessary work and ensure claims are scoped correctly from the start'
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Verified Contractor Network',
    description: 'Access our pre-vetted network of licensed, insured contractors with proven track records'
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Complete Documentation',
    description: 'Every project includes timestamped photos, detailed workflows, and comprehensive records for claims processing'
  },
  {
    icon: 'ri-customer-service-2-line',
    title: 'Improved Customer Satisfaction',
    description: 'Policyholders get clarity and faster service, reducing complaints and improving retention'
  },
  {
    icon: 'ri-line-chart-line',
    title: 'Data-Driven Insights',
    description: 'Aggregate data helps identify patterns, prevent fraud, and optimize claim handling processes'
  }
];

const useCases = [
  {
    title: 'Home Insurance Claims',
    description: 'Streamline water damage, fire damage, and storm damage claims with instant AI diagnostics and verified contractor matching',
    icon: 'ri-home-4-line'
  },
  {
    title: 'Home Warranty Programs',
    description: 'Reduce service call costs and improve response times with AI-powered triage and contractor dispatch',
    icon: 'ri-shield-star-line'
  },
  {
    title: 'Property Management',
    description: 'Manage maintenance requests across portfolios with centralized workflows and contractor coordination',
    icon: 'ri-building-line'
  },
  {
    title: 'Commercial Property Insurance',
    description: 'Handle complex commercial claims with detailed documentation and specialized contractor networks',
    icon: 'ri-store-2-line'
  }
];

export default function ForInsurance() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Professional%20insurance%20and%20business%20partnership%20meeting%20with%20executives%20reviewing%20property%20assessment%20data%20on%20modern%20tablets%20and%20documents%20in%20bright%20corporate%20office%20setting&width=1920&height=600&seq=insurance-hero-001&orientation=landscape"
            alt="Insurance Partners"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/75 via-[#0B1F33]/65 to-[#0B1F33]/75"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            For Insurance & Warranty Partners
          </h1>
          <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Reduce claim costs, accelerate resolution times, and improve customer satisfaction with Emporva's AI-powered property assessment platform
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            The Emporva Advantage
          </h2>
          <p className="text-xl text-[#333645] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Traditional claims processing is slow, expensive, and frustrating for everyone involved. Emporva brings AI-powered intelligence to every step of the process—from initial assessment to final repair.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>60%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Faster Assessment</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>35%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Lower Claim Costs</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#D4B483] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>90%</div>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Key Benefits
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-14 h-14 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${benefit.icon} text-3xl text-[#D4B483]`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {benefit.title}
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {benefit.description}
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
                  Policyholder Submits Claim
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Through your existing claims portal or directly via Emporva, policyholders upload photos and describe the issue
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>2</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI Provides Instant Assessment
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Our AI analyzes the damage, estimates severity, and generates a preliminary scope of work—all within minutes
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>3</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Verified Contractor Dispatch
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Qualified contractors from our network are matched and dispatched based on location, specialty, and availability
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>4</span>
              </div>
              <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Complete Documentation & Tracking
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Every step is documented with photos, timestamps, and detailed records—perfect for claims processing and audits
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
              Use Cases
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${useCase.icon} text-2xl text-[#D4B483]`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Seamless Integration
            </h2>
            <p className="text-lg text-[#333645] max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Emporva integrates with your existing claims management systems via API, or can be white-labeled for your brand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-plug-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                API Integration
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Connect to your existing systems
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-palette-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                White Label Option
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Brand it as your own service
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-2-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Dedicated Support
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Enterprise-level support team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Transform Your Claims Process?
          </h2>
          <p className="text-white/95 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Schedule a demo to see how Emporva can reduce costs and improve customer satisfaction
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Schedule a Demo
            </button>
            <button className="px-8 py-4 bg-[#D4B483] text-white rounded-lg hover:bg-[#c9a876] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Download Case Study
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
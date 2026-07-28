import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const problems = [
  {
    icon: 'ri-drop-line',
    title: 'Leaking Pipe',
    description: 'Water dripping from pipes, ceiling stains, or unexplained water pooling',
    urgency: 'High',
    color: '#FF6B6B',
    image: 'https://readdy.ai/api/search-image?query=Close-up%20of%20water%20leaking%20from%20residential%20pipe%20with%20water%20droplets%20visible%20in%20modern%20home%20setting%20with%20clean%20simple%20background%20emphasizing%20the%20plumbing%20issue&width=600&height=400&seq=problem-leak-001&orientation=landscape'
  },
  {
    icon: 'ri-water-flash-line',
    title: 'Basement Flooding',
    description: 'Standing water in basement, foundation cracks, or drainage issues',
    urgency: 'Critical',
    color: '#C92A2A',
    image: 'https://readdy.ai/api/search-image?query=Basement%20with%20water%20damage%20and%20flooding%20showing%20wet%20floor%20and%20moisture%20in%20residential%20property%20with%20simple%20background%20highlighting%20the%20water%20problem&width=600&height=400&seq=problem-flood-001&orientation=landscape'
  },
  {
    icon: 'ri-flashlight-line',
    title: 'Electrical Outlet Buzzing',
    description: 'Outlets making noise, sparking, or not working properly',
    urgency: 'High',
    color: '#FF6B6B',
    image: 'https://readdy.ai/api/search-image?query=Close-up%20of%20electrical%20outlet%20on%20wall%20in%20residential%20home%20with%20focus%20on%20the%20outlet%20showing%20potential%20electrical%20issue%20with%20clean%20simple%20background&width=600&height=400&seq=problem-electric-001&orientation=landscape'
  },
  {
    icon: 'ri-home-heart-line',
    title: 'Roof Leak',
    description: 'Water stains on ceiling, missing shingles, or attic moisture',
    urgency: 'High',
    color: '#FF6B6B',
    image: 'https://readdy.ai/api/search-image?query=Residential%20roof%20with%20visible%20damage%20or%20leak%20showing%20shingles%20and%20roofing%20material%20with%20simple%20sky%20background%20emphasizing%20the%20roofing%20problem&width=600&height=400&seq=problem-roof-001&orientation=landscape'
  },
  {
    icon: 'ri-temp-cold-line',
    title: 'Heat Not Working',
    description: 'Furnace not starting, cold air blowing, or thermostat issues',
    urgency: 'Critical',
    color: '#C92A2A',
    image: 'https://readdy.ai/api/search-image?query=Modern%20home%20thermostat%20on%20wall%20showing%20temperature%20settings%20in%20residential%20interior%20with%20clean%20simple%20background%20highlighting%20HVAC%20system&width=600&height=400&seq=problem-hvac-001&orientation=landscape'
  },
  {
    icon: 'ri-door-open-line',
    title: 'Door Won\'t Close',
    description: 'Doors sticking, gaps, or alignment issues',
    urgency: 'Medium',
    color: '#FDC500',
    image: 'https://readdy.ai/api/search-image?query=Residential%20interior%20door%20showing%20alignment%20or%20closing%20issue%20in%20modern%20home%20with%20clean%20simple%20background%20emphasizing%20the%20door%20problem&width=600&height=400&seq=problem-door-001&orientation=landscape'
  },
  {
    icon: 'ri-bug-line',
    title: 'Pest Infestation',
    description: 'Rodents, insects, or signs of pest activity',
    urgency: 'Medium',
    color: '#FDC500',
    image: 'https://readdy.ai/api/search-image?query=Signs%20of%20pest%20activity%20in%20residential%20home%20showing%20areas%20where%20pests%20might%20enter%20with%20clean%20simple%20background%20emphasizing%20pest%20control%20needs&width=600&height=400&seq=problem-pest-001&orientation=landscape'
  },
  {
    icon: 'ri-paint-brush-line',
    title: 'Cracked Walls',
    description: 'Cracks in drywall, plaster damage, or structural concerns',
    urgency: 'Medium',
    color: '#FDC500',
    image: 'https://readdy.ai/api/search-image?query=Interior%20wall%20with%20visible%20crack%20in%20drywall%20or%20plaster%20in%20residential%20home%20with%20clean%20simple%20background%20highlighting%20the%20structural%20issue&width=600&height=400&seq=problem-crack-001&orientation=landscape'
  },
  {
    icon: 'ri-water-percent-line',
    title: 'Mold Growth',
    description: 'Visible mold, musty odors, or moisture problems',
    urgency: 'High',
    color: '#FF6B6B',
    image: 'https://readdy.ai/api/search-image?query=Signs%20of%20moisture%20and%20mold%20growth%20on%20residential%20wall%20or%20ceiling%20with%20visible%20dampness%20in%20home%20interior%20with%20simple%20background&width=600&height=400&seq=problem-mold-001&orientation=landscape'
  },
  {
    icon: 'ri-window-line',
    title: 'Broken Window',
    description: 'Cracked glass, broken seals, or drafty windows',
    urgency: 'Medium',
    color: '#FDC500',
    image: 'https://readdy.ai/api/search-image?query=Residential%20window%20with%20visible%20damage%20or%20crack%20in%20glass%20pane%20in%20modern%20home%20interior%20with%20clean%20simple%20background&width=600&height=400&seq=problem-window-001&orientation=landscape'
  },
  {
    icon: 'ri-water-flash-line',
    title: 'Clogged Drain',
    description: 'Slow draining sinks, backed up toilets, or sewage odors',
    urgency: 'Medium',
    color: '#FDC500',
    image: 'https://readdy.ai/api/search-image?query=Residential%20sink%20or%20drain%20with%20water%20pooling%20showing%20drainage%20issue%20in%20modern%20bathroom%20or%20kitchen%20with%20clean%20simple%20background&width=600&height=400&seq=problem-drain-001&orientation=landscape'
  },
  {
    icon: 'ri-fire-line',
    title: 'Water Heater Issues',
    description: 'No hot water, strange noises, or leaking tank',
    urgency: 'High',
    color: '#FF6B6B',
    image: 'https://readdy.ai/api/search-image?query=Residential%20water%20heater%20tank%20in%20utility%20room%20or%20basement%20showing%20plumbing%20connections%20with%20clean%20simple%20background%20highlighting%20the%20equipment&width=600&height=400&seq=problem-heater-001&orientation=landscape'
  }
];

export default function ProblemsSolve() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#0B1F33] to-[#14B8A6]">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Problems We Solve
          </h1>
          <p className="text-xl text-white/95 leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            From emergency repairs to ongoing maintenance, Emporva helps you understand what's wrong and connects you with the right professionals to fix it
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input 
              type="text"
              placeholder="Describe your issue... (e.g., 'water leaking from ceiling')"
              className="w-full px-6 py-5 pr-14 rounded-xl border-2 border-gray-200 focus:border-[#14B8A6] focus:outline-none text-lg cursor-text"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#14B8A6] rounded-lg flex items-center justify-center hover:bg-[#0ea89a] transition-colors cursor-pointer">
              <i className="ri-search-line text-white text-xl"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Problems Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Common Property Issues
            </h2>
            <p className="text-lg text-[#6B7C8F] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Click any issue to get AI-powered diagnostics and connect with verified contractors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={problem.image}
                    alt={problem.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span 
                      className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                      style={{ backgroundColor: problem.color, fontFamily: 'Inter, sans-serif' }}
                    >
                      {problem.urgency}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${problem.icon} text-2xl text-[#14B8A6]`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {problem.title}
                    </h3>
                  </div>
                  <p className="text-[#6B7C8F] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {problem.description}
                  </p>
                  <button className="w-full px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a3a52] transition-all duration-300 font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Get Help Now
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
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
              How Emporva Helps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#14B8A6] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-camera-line text-4xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                1. Describe the Issue
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Upload photos and describe what's happening. Our AI analyzes the problem and provides initial diagnostics
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#14B8A6] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-search-line text-4xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                2. Get Matched
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                We connect you with verified contractors who specialize in your specific issue
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#14B8A6] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-tools-line text-4xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                3. Get It Fixed
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Review quotes, choose your contractor, and track the entire project from start to finish
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#14B8A6] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Don't See Your Problem?
          </h2>
          <p className="text-white/95 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva can help with almost any property issue. Describe your problem and we'll connect you with the right experts
          </p>
          <button className="px-10 py-5 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Describe Your Issue
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
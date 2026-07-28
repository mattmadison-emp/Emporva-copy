import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

export default function CSR() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';
  
  useSEO({
    title: 'Corporate Social Responsibility - Emporva & Habitat for Humanity',
    description: 'Learn about Emporva\'s commitment to community impact and our partnership with Habitat for Humanity to strengthen neighborhoods through safe, stable housing.',
    keywords: 'corporate social responsibility, habitat for humanity, community impact, giving back, affordable housing, volunteer construction',
    canonical: '/csr',
    schema: generateWebPageSchema(
      'Corporate Social Responsibility',
      'Learn about Emporva\'s commitment to community impact and our partnership with Habitat for Humanity.',
      `${siteUrl}/csr`
    )
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Diverse%20volunteers%20working%20together%20building%20affordable%20housing%20construction%20site%20with%20community%20members%20helping%20families%20create%20safe%20homes%20bright%20hopeful%20atmosphere%20showing%20teamwork%20and%20purpose%20driven%20service&width=1920&height=600&seq=csr-hero-001&orientation=landscape"
            alt="Community Impact"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/60 via-[#0B1F33]/50 to-[#0B1F33]/60"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Giving Back
          </h1>
          <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Building stronger communities through meaningful partnership and shared purpose
          </p>
        </div>
      </section>

      {/* Emporva and Community Impact */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Emporva and Community Impact
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Emporva believes that improving homes should also improve lives. Our platform is built to make property work clearer, fairer, and more accessible, but we want our impact to reach beyond the digital experience. We believe that every community deserves safe, stable, and dignified housing, and that those who build and repair homes play a vital role in strengthening neighborhoods.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership With Habitat for Humanity */}
      <section className="py-20 px-6 bg-[#F9F9FB]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Partnership With Habitat for Humanity
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Emporva is committed to supporting Habitat for Humanity because our missions intersect in a meaningful way. Habitat creates homes and stability through service and volunteer-driven construction. Emporva creates clarity and coordination in the world of property work. Both share a vision of homes that are livable, safe, and supported by people who care.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How Emporva Contributes
            </h3>
            <ul className="space-y-4 text-lg text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li className="flex items-start gap-3">
                <i className="ri-hand-heart-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Providing financial donations to support Habitat for Humanity builds</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-tools-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Sharing platform access that can help coordinate certain volunteer projects in the future</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-team-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Exploring long-term ways to connect skilled trades, volunteers, and resources</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-community-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Encouraging qualified contractors and homeowners on our platform to learn more about Habitat involvement</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-[#0B1F33]/5 border-l-4 border-[#0B1F33] rounded-lg p-6">
            <p className="text-lg text-[#333645] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
              Emporva sees this as an ongoing partnership, not a marketing gesture.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Why It Matters
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-home-heart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Better Housing
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Strengthens communities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-community-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Stronger Communities
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Empower families
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-parent-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Empowered Families
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Build better futures
              </p>
            </div>
          </div>

          <div className="text-center space-y-6 text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Emporva sees housing as the foundation for stability and dignity. Habitat for Humanity makes that foundation real for those who need it most.
            </p>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="py-20 px-6 bg-[#F9F9FB]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Future Goals
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Emporva aims to expand this partnership into meaningful, scalable initiatives that create lasting impact:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-map-pin-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Local Project Coordination
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Supporting volunteer builds with better planning and resource coordination
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-hammer-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Contractor Involvement
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Creating opportunities for skilled professionals to volunteer or contribute services
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-book-open-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Homeowner Education
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Providing resources for families entering affordable housing programs
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg text-[#333645] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
              This is a growing initiative, and Emporva will continue shaping it responsibly as the company scales.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join the Mission
          </h2>
          <p className="text-white/95 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Learn more about how Habitat for Humanity is building homes, communities, and hope around the world
          </p>
          <a 
            href="https://www.habitat.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" 
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Learn More About Habitat for Humanity
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
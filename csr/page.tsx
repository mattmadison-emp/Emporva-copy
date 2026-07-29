import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

export default function CSR() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';
  
  useSEO({
    title: 'Giving Back | Building Stronger Communities with Emporva',
    description: 'Learn how Emporva is committed to supporting communities, housing initiatives, environmental efforts, and charitable programs as we grow.',
    keywords: 'Emporva giving back, corporate social responsibility, community giving, social impact, charitable partnerships, housing initiatives, sustainability, philanthropy, community support, corporate giving',
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
            Our Commitment to Community
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              We are committed to creating a company that gives back through charitable donations, community partnerships, volunteer efforts, and initiatives that align with our mission and values. As Emporva grows, we intend for our impact to grow alongside it.
          </div>
        </div>
      </section>

      {/* Partnership With Habitat for Humanity */}
      <section className="py-20 px-6 bg-[#F9F9FB]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            How We Give
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              We're taking an intentional, open-ended approach to our giving. Rather than locking into a single partnership before we've scaled, we're building a giving model that grows with us and stays responsive to real community needs.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Our Giving Model
            </h3>
            <ul className="space-y-4 text-lg text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li className="flex items-start gap-3">
                <i className="ri-hand-heart-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Revenue-based giving: A percentage of Emporva's revenue is directed to vetted nonprofits operating in the areas we serve</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-tools-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Locally focused: We prioritize organizations making a tangible difference in the specific communities where our homeowners live</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-team-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Open-ended by design: As we grow, we'll evaluate and select nonprofit partners based on impact, alignment, and community need — not predetermined commitments</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-community-line text-2xl text-[#D4B483] flex-shrink-0 mt-1"></i>
                <span>Transparent reporting: We'll share where our contributions go and what they help accomplish, so our community can see the impact</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-[#0B1F33]/5 border-l-4 border-[#0B1F33] rounded-lg p-6">
            <p className="text-lg text-[#333645] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
              This is a genuine commitment, not a marketing gesture. Our giving grows as we grow — and we're building it into how Emporva operates from day one.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Where We Focus
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-home-heart-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Housing Equity
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Supporting access to safe, stable, and affordable housing for all
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-community-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Community Development
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Strengthening neighborhoods through local investment and revitalization
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-parent-line text-3xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sustainable Impact
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Supporting initiatives that create lasting, generational change
              </p>
            </div>
          </div>

          <div className="text-center space-y-6 text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Emporva sees housing as the foundation for stability and dignity. The organizations we support will reflect that belief, focusing on making home a source of security and opportunity for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="py-20 px-6 bg-[#F9F9FB]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Where We're Headed
          </h2>
          <div className="space-y-6 text-lg text-[#333645] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              As Emporva grows, we plan to expand our community impact in meaningful ways:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-map-pin-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Nonprofit Partnerships
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Forming relationships with high-impact nonprofits in each market we enter
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-hammer-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Homeowner Education
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Creating resources that help first-time and underserved homeowners navigate property ownership
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-book-open-line text-2xl text-[#D4B483]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Community Projects
              </h3>
              <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Supporting local housing and neighborhood improvement initiatives in our operating areas
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
       <section className="py-16 px-6" aria-label="Our team">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-6">Join Us in Building Stronger Communities</h2>
            <p className="text-lg text-[#333645] leading-relaxed mb-8">
              Every homeowner on Emporva contributes to our giving. Together, we're making homes better — and communities stronger.
            </p>
            <Link to="/login" className="inline-block bg-[#0B1F33] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Get Started Free
            </Link>
          </div>
        </section>

      <Footer />
    </div>
  );
}

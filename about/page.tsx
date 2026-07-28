
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema, generateBreadcrumbSchema } from '../../utils/seo';

export default function About() {
  useSEO({
    title: 'About Emporva | AI-Powered Property Services Platform',
    description: 'Learn about Emporva's mission to simplify homeownership through AI, Property Memory, and personalized guidance that helps homeowners organize, maintain, and understand their homes.',
    keywords: 'about Emporva, property services platform, AI contractor matching, home improvement technology, contractor coordination, property intelligence',
    canonical: '/about',
    schema: [
      generateWebPageSchema(
        'About Emporva',
        'Learn about Emporva\'s mission and approach to home improvement',
        '/about',
        [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]
      ),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' }
      ])
    ]
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6" aria-label="Hero">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-[#0B1F33] mb-6">
              Building a Smarter Future for Homeowners
            </h1>
            <p className="text-xl text-[#6B7C8F] leading-relaxed">
              Homeownership should feel empowering—not overwhelming. At Emporva, we're reimagining how people care for their homes by combining intelligent technology with practical homeowner guidance.
            </p>
          </div>
        </section>

        {/* Name Explanation Section */}
        <section className="py-16 px-6" aria-label="Why Emporva">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-xl shadow-sm p-12 border-l-4 border-[#D4B483]">
              <h2 className="text-3xl font-bold text-[#0B1F33] mb-6">Why Emporva?</h2>
              <p className="text-lg text-[#333645] leading-relaxed">
                Emporva is an AI-powered homeowner platform designed to help people organize, understand, and care for their homes. By combining personalized AI guidance with a living digital record of your property, Emporva helps homeowners manage maintenance, plan projects, store important documents, and make informed decisions throughout the life of their home.
              </p>
            </article>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-6" aria-label="Our mission">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-xl shadow-sm p-12">
              <h2 className="text-3xl font-bold text-[#0B1F33] mb-6">Our Mission</h2>
              <p className="text-lg text-[#333645] leading-relaxed mb-6">
                <strong>Helping Every Homeowner Feel More Confident.</strong> Owning a home is one of life's biggest investments, yet many homeowners are left navigating repairs, maintenance, renovations, warranties, manuals, and unexpected problems on their own. Information is scattered, advice is generic, and important records are often difficult to find when they're needed most.Emporva was created to change that.
              </p>
              <p className="text-lg text-[#333645] leading-relaxed mb-6">
                We believe every homeowner deserves a trusted platform that keeps everything connected—from home systems and maintenance history to AI-powered guidance tailored to their property. By bringing organization, intelligence, and proactive planning together in one place, we're helping homeowners spend less time searching for answers and more time enjoying their homes.
              </p>
              <p className="text-lg text-[#333645] leading-relaxed">
                Our vision is to become the trusted digital companion homeowners rely on throughout every stage of homeownership.
              </p>
            </article>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-6 bg-white" aria-label="Our values">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0B1F33] text-center mb-12">What We Believe</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-focus-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Homeowners Deserve Better</h3>
                <p className="text-[#6B7C8F]">
                  Owning a home shouldn't mean juggling spreadsheets, file folders, sticky notes, and endless internet searches. We believe technology should make homeownership simpler, more organized, and less stressful.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Knowledge Should Be Personal</h3>
                <p className="text-[#6B7C8F]">
                  <strong>Every home is different. Great guidance comes from understanding your property's unique systems, history, documents, and maintenance—not just providing generic answers.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Prevention Is Better Than Repair</h3>
                <p className="text-[#6B7C8F]">
                  The best home problems are the ones that never happen. By helping homeowners stay organized and proactive, we believe we can reduce costly surprises and protect one of life's biggest investments.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-6" aria-label="Our team">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-6">Built by People Who Understand</h2>
            <p className="text-lg text-[#333645] leading-relaxed mb-8">
              Our team includes former contractors, project managers, and technologists who have lived through the chaos of uncoordinated <strong>home improvement</strong>. We're building the platform we wish existed.
            </p>
            <Link to="/for-contractors" className="inline-block bg-[#0B1F33] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Join Our Network
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

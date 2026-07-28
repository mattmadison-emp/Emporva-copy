
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema, generateBreadcrumbSchema } from '../../utils/seo';

export default function About() {
  useSEO({
    title: 'About Emporva | AI-Powered Property Services Platform',
    description: 'Learn about Emporva\'s mission to transform home improvement through AI-powered coordination. We connect homeowners with verified contractors using intelligent scoping and shared workspaces.',
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
              About Emporva
            </h1>
            <p className="text-xl text-[#6B7C8F] leading-relaxed">
              We're building the operating system for <strong>home improvement</strong>, connecting homeowners, contractors, and the entire ecosystem around clarity, coordination, and trust.
            </p>
          </div>
        </section>

        {/* Name Explanation Section */}
        <section className="py-16 px-6" aria-label="Why Emporva">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-xl shadow-sm p-12 border-l-4 border-[#D4B483]">
              <h2 className="text-3xl font-bold text-[#0B1F33] mb-6">Why Emporva?</h2>
              <p className="text-lg text-[#333645] leading-relaxed">
                <strong>Emporva</strong> is built from the idea of an emporium, a bustling place of commerce and exchange, reimagined for today's digital age. Historically, an emporium brought people together around trusted trade. Emporva brings that same spirit into modern <strong>property work</strong> by creating smarter systems that connect property owners, contractors, and the work itself through clarity, coordination, and shared context.
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
                <strong>Home improvement is broken.</strong> Homeowners don't know what they need. Contractors waste time on unscoped requests. Projects start without clarity and end in frustration.
              </p>
              <p className="text-lg text-[#333645] leading-relaxed mb-6">
                Emporva exists to fix that. We use <strong>AI to turn vague ideas into structured scopes</strong>. We coordinate multi-trade projects so nothing falls through the cracks. We create shared workspaces where everyone operates from the same plan.
              </p>
              <p className="text-lg text-[#333645] leading-relaxed">
                We're not a lead generation platform. We're not a directory. We're a <strong>coordination layer</strong> that makes home improvement work the way it should.
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
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Clarity First</h3>
                <p className="text-[#6B7C8F]">
                  Every project should start with a <strong>clear scope</strong>, realistic timeline, and shared expectations.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Coordination Over Chaos</h3>
                <p className="text-[#6B7C8F]">
                  <strong>Multi-trade projects</strong> need orchestration, not just matching. We handle the sequencing.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Trust Through Transparency</h3>
                <p className="text-[#6B7C8F]">
                  <strong>Shared workspaces</strong>, visible progress, and clear communication build confidence.
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

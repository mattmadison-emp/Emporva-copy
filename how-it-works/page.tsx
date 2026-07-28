
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema, generateHowToSchema, generateBreadcrumbSchema } from '../../utils/seo';

const howItWorksSteps = [
  {
    name: 'Describe Your Project',
    text: 'Upload photos and describe what you need. Our AI helps you clarify the scope, identify potential complications, and set realistic expectations—all before you talk to a contractor.',
    image: 'https://readdy.ai/api/search-image?query=person%20using%20smartphone%20to%20photograph%20home%20renovation%20area%20modern%20clean%20interface%20professional%20lighting&width=600&height=400&seq=hiw1&orientation=landscape'
  },
  {
    name: 'Get Matched with Pros',
    text: 'Based on your project scope, we connect you with qualified contractors who have the right skills, availability, and track record. No more guessing or endless searching.',
    image: 'https://readdy.ai/api/search-image?query=professional%20contractors%20reviewing%20project%20details%20on%20digital%20tablet%20modern%20workspace%20collaborative%20setting&width=600&height=400&seq=hiw2&orientation=landscape'
  },
  {
    name: 'Review and Approve',
    text: 'Contractors provide detailed quotes based on the AI-generated scope. You can compare options, ask questions, and make informed decisions—all within the platform.',
    image: 'https://readdy.ai/api/search-image?query=homeowner%20reviewing%20contractor%20quotes%20on%20laptop%20modern%20home%20office%20professional%20setting%20with%20documents&width=600&height=400&seq=hiw3&orientation=landscape'
  },
  {
    name: 'Track Everything',
    text: 'Once work begins, your shared workspace keeps everyone aligned. Track progress, approve changes, share photos, and manage payments—all in one place.',
    image: 'https://readdy.ai/api/search-image?query=construction%20progress%20tracking%20with%20digital%20dashboard%20showing%20timeline%20and%20milestones%20professional%20workspace&width=600&height=400&seq=hiw4&orientation=landscape'
  }
];

export default function HowItWorks() {
  useSEO({
    title: 'How Emporva Works | AI-Powered Home Improvement Process',
    description: 'Learn how Emporva coordinates your home improvement projects from start to finish. AI diagnosis, contractor matching, shared workspaces, and multi-trade coordination explained.',
    keywords: 'how Emporva works, home improvement process, contractor matching, AI diagnosis, project coordination, multi-trade projects, home renovation steps',
    canonical: '/how-it-works',
    schema: [
      generateWebPageSchema(
        'How Emporva Works',
        'Step-by-step guide to using Emporva for home improvement projects',
        '/how-it-works',
        [{ name: 'Home', url: '/' }, { name: 'How It Works', url: '/how-it-works' }]
      ),
      generateHowToSchema(
        'How to Use Emporva for Home Improvement Projects',
        'Complete guide to using Emporva\'s AI-powered platform for home repairs and renovations',
        howItWorksSteps
      ),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'How It Works', url: '/how-it-works' }
      ])
    ]
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="how-it-works" />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F]" aria-label="Hero">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              How Emporva Works
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              From initial idea to project completion, <strong>Emporva</strong> coordinates every step of your <strong>home improvement</strong> journey.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 px-6" aria-label="Process steps">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-16">
              {/* Step 1 */}
              <article className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-full flex items-center justify-center text-[#0B1F33] font-bold text-xl">
                      1
                    </div>
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Describe Your Project</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Start by uploading photos and describing what you need. Our <strong>AI helps you clarify</strong> the scope, identify potential complications, and set realistic expectations—all before you talk to a contractor.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Upload photos from any device</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>AI analyzes</strong> materials and conditions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Get instant scope recommendations</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <img 
                    src="https://readdy.ai/api/search-image?query=person%20using%20smartphone%20to%20photograph%20home%20renovation%20area%20modern%20clean%20interface%20professional%20lighting&width=600&height=400&seq=hiw1&orientation=landscape"
                    alt="Homeowner photographing home repair area with smartphone for AI diagnosis"
                    title="Step 1: Describe your home improvement project to Emporva"
                    className="w-full h-auto rounded-lg"
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                </div>
              </article>

              {/* Step 2 */}
              <article className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 bg-white rounded-xl shadow-sm p-8">
                  <img 
                    src="https://readdy.ai/api/search-image?query=professional%20contractors%20reviewing%20project%20details%20on%20digital%20tablet%20modern%20workspace%20collaborative%20setting&width=600&height=400&seq=hiw2&orientation=landscape"
                    alt="Verified contractors reviewing project scope on tablet"
                    title="Step 2: Get matched with qualified contractors"
                    className="w-full h-auto rounded-lg"
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-full flex items-center justify-center text-[#0B1F33] font-bold text-xl">
                      2
                    </div>
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Get Matched with Pros</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Based on your project scope, we connect you with <strong>qualified contractors</strong> who have the right skills, availability, and track record. No more guessing or endless searching.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Verified licenses</strong> and insurance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Real reviews from homeowners</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Matched by specialty and location</span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Step 3 */}
              <article className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-full flex items-center justify-center text-[#0B1F33] font-bold text-xl">
                      3
                    </div>
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Review and Approve</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Contractors provide detailed quotes based on the <strong>AI-generated scope</strong>. You can compare options, ask questions, and make informed decisions—all within the platform.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Transparent pricing</strong> breakdowns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Timeline and milestone clarity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Direct messaging with contractors</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <img 
                    src="https://readdy.ai/api/search-image?query=homeowner%20reviewing%20contractor%20quotes%20on%20laptop%20modern%20home%20office%20professional%20setting%20with%20documents&width=600&height=400&seq=hiw3&orientation=landscape"
                    alt="Homeowner comparing contractor quotes on laptop"
                    title="Step 3: Review and approve contractor quotes"
                    className="w-full h-auto rounded-lg"
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                </div>
              </article>

              {/* Step 4 */}
              <article className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 bg-white rounded-xl shadow-sm p-8">
                  <img 
                    src="https://readdy.ai/api/search-image?query=construction%20progress%20tracking%20with%20digital%20dashboard%20showing%20timeline%20and%20milestones%20professional%20workspace&width=600&height=400&seq=hiw4&orientation=landscape"
                    alt="Digital dashboard showing project progress and milestones"
                    title="Step 4: Track project progress in real-time"
                    className="w-full h-auto rounded-lg"
                    width="600"
                    height="400"
                    loading="lazy"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-full flex items-center justify-center text-[#0B1F33] font-bold text-xl">
                      4
                    </div>
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Track Everything</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Once work begins, your <strong>shared workspace</strong> keeps everyone aligned. Track progress, approve changes, share photos, and manage payments—all in one place.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Real-time progress</strong> updates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Photo documentation timeline</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Secure milestone payments</strong></span>
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Multi-Trade Coordination */}
        <section className="py-20 px-6 bg-white" aria-label="Multi-trade coordination">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">
                Multi-Trade Coordination Made Simple
              </h2>
              <p className="text-xl text-[#6B7C8F] max-w-3xl mx-auto">
                Many projects require multiple contractors working in sequence. <strong>Emporva handles the coordination</strong> so you don't have to.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-calendar-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Smart Sequencing</h3>
                <p className="text-[#6B7C8F]">
                  We automatically determine the right order for trades to work, avoiding delays and rework.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Unified Communication</h3>
                <p className="text-[#6B7C8F]">
                  All contractors see the same plan, timeline, and updates—no miscommunication.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Quality Checkpoints</h3>
                <p className="text-[#6B7C8F]">
                  Each phase is verified before the next trade begins, ensuring quality throughout.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6" aria-label="Call to action">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-[#6B7C8F] mb-8">
              Join thousands of homeowners who trust <strong>Emporva</strong> to coordinate their <strong>home improvement projects</strong>.
            </p>
            <Link to="/ai-intake" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Start Your Project
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

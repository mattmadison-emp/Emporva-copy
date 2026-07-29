
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema, generateHowToSchema, generateBreadcrumbSchema } from '../../utils/seo';

const howItWorksSteps = [
  {
    name: 'Create Your Home Profile',
    text: 'Start by creating your free account and adding your property. You can enter basic information about your home, upload important documents, and begin building your home's digital memory.',
    image: 'https://readdy.ai/api/search-image?query=person%20using%20smartphone%20to%20photograph%20home%20renovation%20area%20modern%20clean%20interface%20professional%20lighting&width=600&height=400&seq=hiw1&orientation=landscape'
  },
  {
    name: 'Ask Questions and Explore',
    text: 'Whether you're troubleshooting a problem, planning a renovation, or learning about your home's systems, Emporva AI is ready to help. Get practical guidance and discover homeowner resources tailored to your needs.',
    image: 'https://readdy.ai/api/search-image?query=professional%20contractors%20reviewing%20project%20details%20on%20digital%20tablet%20modern%20workspace%20collaborative%20setting&width=600&height=400&seq=hiw2&orientation=landscape'
  },
  {
    name: 'Organize Everything in One Place',
    text: 'Store manuals, warranties, receipts, maintenance records, inspection reports, and project information so it's always available when you need it.',
    image: 'https://readdy.ai/api/search-image?query=homeowner%20reviewing%20contractor%20quotes%20on%20laptop%20modern%20home%20office%20professional%20setting%20with%20documents&width=600&height=400&seq=hiw3&orientation=landscape'
  },
  {
    name: 'Stay Ahead of Homeownership',
    text: 'Track maintenance, manage projects, receive reminders, and continue building a complete history of your home over time. The more information you add, the more personalized your experience becomes.',
    image: 'https://readdy.ai/api/search-image?query=construction%20progress%20tracking%20with%20digital%20dashboard%20showing%20timeline%20and%20milestones%20professional%20workspace&width=600&height=400&seq=hiw4&orientation=landscape'
  }
];

export default function HowItWorks() {
  useSEO({
    title: 'How Emporva Works | The AI-Powered Homeowner Platform',
    description: 'Learn how Emporva helps homeowners organize their homes, ask AI questions, manage maintenance, store important documents, and plan projects in just a few simple steps.',
    keywords: 'how Emporva works, homeowner platform, AI homeowner platform, home management, property memory, home maintenance, home organization, home systems, home projects, AI home assistant',
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
              Getting started with Emporva takes just a few minutes. Build your home's profile, ask questions, organize important information, and let Emporva help you stay one step ahead of homeownership.
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
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Create Your Home Profile</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Getting started is simple. Create your account and add your property to begin building your home's digital memory. The more information you provide, the more personalized your experience becomes.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Add your property details in minutes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Upload manuals, warranties, and important documents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Build the foundation for personalized recommendations</span>
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
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Ask Emporva AI</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Have a question about your home? Whether you're troubleshooting an issue, planning a project, or looking for maintenance advice, Emporva AI is here to help with practical homeowner guidance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Ask questions about repairs, maintenance, or improvements</strong> and insurance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Explore homeowner resources and project guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Receive recommendations tailored to your home's needs</span>
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
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Organize Your Home</h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Keep everything related to your home in one secure place. From maintenance records to project history, Emporva helps you stay organized and prepared whenever you need important information.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Store manuals, warranties, receipts, and inspection reports</strong> breakdowns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Track home systems, appliances, utility bills, and completed projects</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Quickly find important information whenever you need it</span>
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
                    <h2 className="text-3xl font-bold text-[#0B1F33]">Stay Ahead of Homeownership/h2>
                  </div>
                  <p className="text-lg text-[#333645] leading-relaxed mb-6">
                    Emporva helps you move from reacting to home problems to staying ahead of them. Keep track of maintenance, receive reminders, and continue building your home's history over time.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><strong>Receive personalized maintenance reminders</strong> updates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]">Plan future repairs and improvement projects</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                      <span className="text-[#6B7C8F]"><Build a complete history that grows more valuable every year</span>
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
                Everything You Need to Manage Your Home
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
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Smarter Over Time</h3>
                <p className="text-[#6B7C8F]">
                  As you continue using Emporva, your home's digital memory grows, allowing the platform to deliver increasingly personalized insights and recommendations.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Personalized Guidance</h3>
                <p className="text-[#6B7C8F]">
                  Ask questions with confidence and receive AI-powered recommendations designed to help you make informed homeowner decisions.
                </p>
              </article>
              <article className="text-center">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">Built Around Your Home</h3>
                <p className="text-[#6B7C8F]">
                  Emporva keeps your home's systems, documents, projects, and maintenance history connected in one organized platform.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6" aria-label="Call to action">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Build Your Home's Digital Memory?</h2>
            <p className="text-xl text-[#6B7C8F] mb-8">
             Join homeowners who are taking a smarter approach to managing, maintaining, and understanding their homes with Emporva.
            </p>
            <Link to="/login" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import FaqSection, { flattenFaqs } from '../../components/base/FaqSection';
import { useFaqList } from '../../hooks/useStoryblok';
import { useSEO, generateWebPageSchema, generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema } from '../../utils/seo';

const homeownerFAQs = [
  {
    question: 'What can I do with Emporva?',
    answer: 'Emporva helps homeowners organize home information, ask AI questions, track maintenance, store documents, plan projects, and build a complete digital history of their property.'
  },
  {
    question: 'Is Emporva only for new homeowners?',
    answer: 'No. Whether you've owned your home for one month or twenty years, Emporva helps you stay organized and make informed decisions.'
  },
  {
    question: 'Can I upload manuals and warranties?',
    answer: 'Yes. Store manuals, warranties, inspection reports, receipts, and maintenance records securely in your account. Use out AI tool to search the documents and find the answer you need fast'
  },
  {
    question: 'How does Emporva personalize recommendations?',
    answer: 'As you add information about your home's systems, documents, maintenance history, and projects, Emporva uses that information to provide guidance that's more relevant to your property.'
  }
];

export default function ForHomeowners() {
  const { data: faqStory } = useFaqList('homeowners');
  const faqs = flattenFaqs(faqStory?.content);
  const faqsForSchema = faqs.length ? faqs : homeownerFAQs;

  useSEO({
    title: 'Emporva for Homeowners | Organize, Maintain & Understand Your Home',
    description: 'Discover how Emporva helps homeowners organize home information, manage maintenance, store documents, plan projects, and receive personalized AI guidance through one intelligent platform.',
    keywords: 'Emporva for homeowners, homeowner platform, AI homeowner platform, home management, property memory, home maintenance, home organization, home maintenance app, home systems, home projects, digital home records',
    canonical: '/for-homeowners',
    schema: [
      generateWebPageSchema(
        'Emporva for Homeowners',
        'AI-powered property intelligence platform for homeowners',
        '/for-homeowners',
        [{ name: 'Home', url: '/' }, { name: 'For Homeowners', url: '/for-homeowners' }]
      ),
      generateServiceSchema(
        'Homeowner Property Intelligence',
        'AI-powered property management tools including diagnosis, Property Memory, and utility insights for homeowners',
        '/for-homeowners',
        'Property Management Software',
        'Free - $12/month'
      ),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'For Homeowners', url: '/for-homeowners' }
      ]),
      generateFAQSchema(faqsForSchema)
    ]
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="solutions" />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden" aria-label="Hero">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/80"></div>
          <div className="relative max-w-6xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#F9F9FB]">
              Everything You Need to Manage Your Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#F9F9FB]/90">
              Homeownership comes with constant questions, unexpected repairs, and endless information to keep track of. Emporva brings everything together in one intelligent platform, helping you organize your home, stay ahead of maintenance, and make confident decisions every step of the way.
            </p>
            <Link to="/login" className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </section>

        {/* Supporting Content Section */}
        <section className="py-20 px-6 bg-white" aria-label="Platform overview">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-8">
              Built for the Way Homeowners Actually Live
            </h2>
            <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
              <p>
                Owning a home is rewarding, but it can also feel overwhelming. Manuals disappear, warranties are forgotten, maintenance gets postponed, and finding trustworthy answers often means searching through dozens of websites.
              </p>
              <p>
                Emporva changes that experience.
              </p>
               <p>
                By combining AI guidance with your home's unique information, Emporva helps you organize everything in one place while providing personalized recommendations that become more valuable over time.
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Common Pain Points</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Important documents scattered across emails and file cabinets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Forgetting maintenance until something breaks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Generic online advice that doesn't fit your home</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Uncertainty about repairs and improvement projects</span>
                  </li>
                </ul>
              </article>

              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Emporva's Intelligence</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Organize your home's information in one secure location</strong> and clarification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Receive AI guidance designed specifically for homeowners</strong> tracks your home's history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Build a digital memory of your property over time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Make smarter decisions with confidence</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20 px-6" aria-label="Key benefits">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">One Platform. Every Part of Homeownership.</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-brain-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">AI Home Guidance</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Get practical answers to maintenance, repairs, projects, and everyday homeowner questions.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-database-2-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Property Memory</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Create a living record of your home's systems, maintenance history, warranties, manuals, and improvements.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-line-chart-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Maintenance Tracking</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Keep maintenance organized with reminders, schedules, and completed service history.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-alarm-warning-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Project Planning</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Plan repairs and renovations, organize project information, and keep everything connected.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-file-text-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Document Vault</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Securely organize inspection reports, receipts, warranties, manuals, and important home records.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Homeowner Resources</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Browse trusted guides covering maintenance, home systems, repairs, remodeling, and project planning.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-white" aria-label="How it works">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">How Emporva Works For You</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-chat-upload-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">1. Create Your Home/h3>
                <p className="text-[#6B7C8F] text-lg">
                  Build your property profile and begin organizing your home's information.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-team-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">2. Ask and Learn</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Use AI to answer questions, troubleshoot issues, and plan projects with confidence.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-checkbox-circle-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">3. Stay Organized</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Continue adding documents, maintenance history, and projects while Emporva becomes increasingly personalized.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6" aria-label="Pricing plans">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#0B1F33] mb-4">Unlock Property Intelligence</h2>
              <p className="text-xl text-[#6B7C8F]">
                Choose the Plan That's Right for You
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Core Tier */}
              <article className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Core</h3>
                <p className="text-[#6B7C8F] mb-6">Get started with limited monthly credits</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#0B1F33]">Free</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>3 AI Diagnostic Credits</strong> per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>3 Utility Upload Credits</strong> per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Seasonal task reminders tailored to your home</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Property overview and system registry</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Basic maintenance checklists</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">DIY project planning and guidance</span>
                  </li>
                </ul>

                <Link to="/login" className="block w-full bg-[#0B1F33] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                  Get Started Free
                </Link>
              </article>

              {/* Premium Tier */}
              <article className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#D4B483] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4B483] text-[#0B1F33] px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Premium</h3>
                <p className="text-[#6B7C8F] mb-6">Unlock Property Memory, Utility Insights, resale-ready history, and much more.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#0B1F33]">$12</span>
                  <span className="text-[#6B7C8F] text-lg">/month</span>
                  <p className="text-sm text-[#6B7C8F] mt-2">or $120/year <span className="text-[#D4B483] font-semibold">(2 months free)</span></p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Unlimited AI diagnostics</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Unlimited utility uploads</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Unlimited exports</strong> (Resale &amp; History)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Property Memory</strong> tracks all history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Utility Insights</strong> with predictions &amp; anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Resale packet generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Unlimited storage for docs &amp; photos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Everything else you might need</span>
                  </li>
                </ul>

                <Link to="/login" className="block w-full bg-[#D4B483] text-[#0B1F33] text-center py-3 rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
                  Upgrade to Premium
                </Link>
              </article>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[#6B7C8F] text-lg">
                <strong>Core users receive limited monthly credits</strong> for diagnostics, utility uploads, and exports.<br />
                Upgrade to Premium for unlimited usage and full intelligence features.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-[#F9F9FB]" aria-label="Frequently asked questions">
          <div className="max-w-3xl mx-auto">
            <FaqSection content={faqStory?.content} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-white" aria-label="Call to action">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Your Home Has a Story. Start Building It Today.</h2>
            <p className="text-xl text-[#6B7C8F] mb-8">
              Every maintenance record, project, warranty, and improvement adds to your home's history. Create your free Emporva account and begin building a smarter way to manage your home.
            </p>
            <Link to="/ai-intake" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

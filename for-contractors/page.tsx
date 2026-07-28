import Footer from '../home/components/Footer';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import FaqSection, { flattenFaqs } from '../../components/base/FaqSection';
import { useFaqList } from '../../hooks/useStoryblok';
import { useSEO, generateWebPageSchema, generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema } from '../../utils/seo';

const contractorFAQs = [
  {
    question: 'How does Emporva help contractors get better leads?',
    answer: 'Unlike traditional lead generation platforms, Emporva provides pre-scoped jobs with clear requirements. Our AI helps homeowners clarify their needs before you get involved, so you receive detailed project scopes, photos, and realistic expectations—reducing wasted site visits and miscommunication.'
  },
  {
    question: 'What is included in Emporva\'s Contractor Core plan?',
    answer: 'Contractor Core is a pay-per-lead model at $15 per lead — no monthly fees or commitments. You browse the marketplace for free, then spend one credit to unlock a lead and submit your quote. Every lead comes AI-scoped with photos and clear homeowner expectations. You also get active job management, shared workspaces, and direct homeowner communication. Credits never expire, so you only pay when you\'re ready to pursue work.'
  },
  {
    question: 'What additional features does Contractor Premium offer?',
    answer: 'Contractor Premium at $99/month gives you unlimited marketplace access with no per-lead cost, plus a full CRM system, pipeline management, automated follow-ups, multi-job calendar and scheduling, invoicing and payment processing, performance analytics, and growth insights. If you\'re unlocking 7 or more leads per month on Core, Premium saves you money while giving you powerful business tools.'
  },
  {
    question: 'How is Emporva different from HomeAdvisor or Thumbtack?',
    answer: 'Emporva focuses on project coordination rather than lead volume. Jobs arrive with AI-generated scopes, clear expectations, and shared workspaces. We don\'t blast leads to dozens of contractors — we facilitate better communication between homeowners and contractors throughout the entire project lifecycle. On Core, you choose exactly which leads to pursue at $15 each. On Premium, you get unlimited access plus business management tools.'
  },
  {
    question: 'When should I upgrade from Core to Premium?',
    answer: 'The math is simple: if you\'re consistently unlocking 7 or more leads per month on Core ($105+), Premium at $99/month saves you money and gives you unlimited access. Plus you get CRM, pipeline management, automated follow-ups, scheduling tools, and analytics — everything you need to run and grow your business from one platform.'
  }
];

export default function ForContractors() {
  const { data: faqStory } = useFaqList('contractors');
  const faqs = flattenFaqs(faqStory?.content);
  const faqsForSchema = faqs.length ? faqs : contractorFAQs;

  useSEO({
    title: 'Emporva for Contractors | CRM, Scoped Jobs & Business Growth Tools',
    description: 'Stop chasing unscoped leads. Emporva connects contractors with pre-scoped projects, provides CRM tools, and coordinates multi-trade jobs. Free to join, Pro tools available.',
    keywords: 'contractor software, contractor CRM, scoped jobs, contractor leads, project management, contractor business tools, home improvement contractors, trade coordination',
    canonical: '/for-contractors',
    schema: [
      generateWebPageSchema(
        'Emporva for Contractors',
        'Business tools and scoped job matching for contractors',
        '/for-contractors',
        [{ name: 'Home', url: '/' }, { name: 'For Contractors', url: '/for-contractors' }]
      ),
      generateServiceSchema(
        'Contractor Business Platform',
        'CRM, scoped job matching, and business growth tools for contractors and trade professionals',
        '/for-contractors',
        'Business Software',
        '$15/lead - $99/month'
      ),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'For Contractors', url: '/for-contractors' }
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
              Built for Contractors Who Value Their Time
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#F9F9FB]/90">
              Stop chasing unscoped leads. Get matched with homeowners who know what they need, backed by <strong>clear scopes</strong> and realistic timelines.
            </p>
            <Link to="/enroll-contractor" className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
              Join the Network
            </Link>
          </div>
        </section>

        {/* Supporting Content Section */}
        <section className="py-20 px-6 bg-white" aria-label="Platform overview">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-8">
              The Problem with Traditional Contractor Work
            </h2>
            <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
              <p>
                Contractors lose time and money to unclear scopes, misaligned expectations, and constant back-and-forth before the real work even begins. Most systems either sell leads or manage operations after the job exists.
              </p>
              <p>
                <strong>Emporva</strong> focuses on what comes before and during the work. Projects arrive <strong>scoped, sequenced, and coordinated</strong>. Homeowners, contractors, and trades operate from the same shared plan, reducing friction and keeping jobs moving forward.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Common Pain Points</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Vague homeowner requests and unclear scopes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Scope creep and surprise changes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Poor communication and lost messages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Disorganized handoffs between trades</span>
                  </li>
                </ul>
              </article>

              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Emporva's Innovation</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>AI-generated scopes</strong> and clarity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Shared job rooms</strong> for all communication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Dependency-aware</strong> project timelines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Coordination instead of lead chasing</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Competitive Comparison Section */}
        <section className="py-20 px-6" aria-label="Competitive comparison">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-12">
              Built for Real Work, Not Lead Chasing
            </h2>
            
            <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
              <p>
                Most <strong>contractor software</strong> focuses on running your business after the job already exists, or selling you more leads to chase. Emporva is built for what happens before and during the work.
              </p>
              <p>
                Instead of sending unscoped requests or forcing contractors to decipher vague homeowner descriptions, Emporva creates clarity first. Every project starts with <strong>structured intake</strong>, <strong>AI-assisted scoping</strong>, and defined expectations.
              </p>
              <p>
                Emporva is not a directory and it is not a volume-based lead engine. It is a <strong>coordination layer</strong>. Jobs live in shared workspaces where homeowners and contractors operate from the same plan, the same materials list, the same approvals, and the same timeline.
              </p>
            </div>

            <div className="mt-12 bg-[#D4B483]/10 border-l-4 border-[#D4B483] p-6 rounded-r-lg">
              <p className="text-[#333645] font-semibold mb-2">Example:</p>
              <p className="text-[#6B7C8F]">
                Instead of "I have a leaking faucet," you receive: "Kitchen faucet replacement required. Delta model preferred. Shutoff valves accessible. No countertop removal needed. Homeowner available Tuesday-Thursday mornings."
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-white" aria-label="How it works">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">How Emporva Works for Contractors</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-file-list-3-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">1. Receive Scoped Jobs</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Every job comes with <strong>AI-assisted scoping</strong>, photos, and clear expectations—no guessing games.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-message-3-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">2. Communicate in Shared Workspaces</h3>
                <p className="text-[#6B7C8F] text-lg">
                  All communication, approvals, and updates happen in one organized hub—no lost messages.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-money-dollar-circle-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">3. Get Paid Faster</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Integrated <strong>payment processing</strong> and milestone tracking mean less chasing, more building.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Simplified Pricing */}
        <section className="py-20 px-6" aria-label="Pricing plans">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#0B1F33] mb-4">Choose Your Starting Point</h2>
              <p className="text-xl text-[#6B7C8F]">
                Pay per lead or go unlimited — you decide how to grow
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Core Tier */}
              <article className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contractor Core</h3>
                <p className="text-[#6B7C8F] mb-6">Pay only for leads you want to pursue.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#0B1F33]">$15</span>
                  <span className="text-[#6B7C8F] text-lg">/lead</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Pay-per-lead marketplace</strong> — no monthly fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Every lead comes <strong>AI-scoped with photos</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Active job management and shared workspaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Credits never expire — buy only what you need</span>
                  </li>
                </ul>

                <Link to="/contractor-plans" className="block w-full bg-[#0B1F33] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                  Start with Core
                </Link>
              </article>

              {/* Premium Tier */}
              <article className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#D4B483] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4B483] text-[#0B1F33] px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  Best Value
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contractor Premium</h3>
                <p className="text-[#6B7C8F] mb-6">Unlimited leads plus your full business toolkit.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#0B1F33]">$99</span>
                  <span className="text-[#6B7C8F] text-lg">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Unlimited marketplace access</strong> — no per-lead cost</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>CRM</strong>, pipelines, and automated follow-ups</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]">Multi-job calendar and scheduling tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span className="text-[#333645]"><strong>Analytics, marketing, and growth insights</strong></span>
                  </li>
                </ul>

                <Link to="/contractor-plans" className="block w-full bg-[#D4B483] text-[#0B1F33] text-center py-3 rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
                  Go Premium
                </Link>
              </article>
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
            <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Join?</h2>
            <p className="text-xl text-[#6B7C8F] mb-8">
              Join hundreds of contractors who are building better businesses with <strong>Emporva</strong>.
            </p>
            <Link to="/enroll-contractor" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Get Started Today
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

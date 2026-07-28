
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import FaqSection, { flattenFaqs } from '../../components/base/FaqSection';
import { useFaqList } from '../../hooks/useStoryblok';
import { useSEO, generateWebPageSchema, generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema } from '../../utils/seo';

const homeownerFAQs = [
  {
    question: 'How does Emporva help homeowners diagnose home issues?',
    answer: 'Emporva uses AI-powered diagnosis to analyze photos and descriptions of your home issues. Simply upload images and describe the problem, and our AI will identify potential causes, suggest solutions, and help you understand the scope of work needed before connecting with contractors.'
  },
  {
    question: 'What is Property Memory and how does it work?',
    answer: 'Property Memory is Emporva\'s system for tracking your home\'s complete history including repairs, upgrades, system installations, and maintenance records. It creates a comprehensive digital record that\'s valuable for insurance claims, resale, and ongoing maintenance planning.'
  },
  {
    question: 'Can Emporva help predict utility costs and detect anomalies?',
    answer: 'Yes, Emporva\'s Premium plan includes Utility Insights which analyzes your utility bills to predict future costs, detect unusual usage patterns that might indicate problems like leaks or HVAC issues, and help you optimize energy efficiency.'
  },
  {
    question: 'How much does Emporva cost for homeowners?',
    answer: 'Emporva offers a free Core plan with 3 AI diagnostic credits, 3 utility upload credits, and 1 export credit every 6 months. The Premium plan at $12/month (or $120/year) includes unlimited diagnostics, Property Memory, utility insights, and resale packet generation.'
  }
];

export default function ForHomeowners() {
  const { data: faqStory } = useFaqList('homeowners');
  const faqs = flattenFaqs(faqStory?.content);
  const faqsForSchema = faqs.length ? faqs : homeownerFAQs;

  useSEO({
    title: 'Emporva for Homeowners | AI Property Intelligence & Home Maintenance',
    description: 'Take control of your home with Emporva\'s AI-powered property intelligence. Diagnose issues, track home history with Property Memory, predict utility costs, and connect with verified contractors. Free to start.',
    keywords: 'homeowner tools, property intelligence, home maintenance, AI diagnosis, Property Memory, utility insights, home repair, verified contractors, property management',
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
              Take Control of Your Home with Intelligence, Not Guesswork
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#F9F9FB]/90">
              <strong>Diagnose issues with AI</strong>. Track your home's history. Anticipate costs and catch problems before they become expensive.
            </p>
            <Link to="/ai-intake" className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
              Start Your Project
            </Link>
          </div>
        </section>

        {/* Supporting Content Section */}
        <section className="py-20 px-6 bg-white" aria-label="Platform overview">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-8">
              A Property Intelligence System, Not a Marketplace
            </h2>
            <div className="space-y-6 text-lg text-[#333645] leading-relaxed">
              <p>
                Homeownership comes with constant decisions, unclear priorities, and expensive surprises. Most people are forced to react to problems without understanding what they mean, how urgent they are, or what should happen next.
              </p>
              <p>
                <strong>Emporva</strong> gives homeowners a clear command center for their property. Using <strong>AI-assisted diagnosis</strong>, <strong>Property Memory</strong>, and <strong>utility insights</strong>, Emporva helps homeowners understand their home, plan ahead, and move forward with confidence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Common Pain Points</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Unclear repair decisions and priorities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Reactive maintenance instead of planning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Lost property history and documentation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-red-500 text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Unexpected utility costs and anomalies</span>
                  </li>
                </ul>
              </article>

              <article>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Emporva's Intelligence</h3>
                <ul className="space-y-3 text-[#6B7C8F]">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>AI diagnosis</strong> and clarification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Property Memory</strong> tracks your home's history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span><strong>Utility insights</strong> predict usage and catch anomalies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1" aria-hidden="true"></i>
                    <span>Generate <strong>resale packets</strong> for buyers and lenders</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20 px-6" aria-label="Key benefits">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">What Emporva Does for You</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-brain-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Diagnose Issues with AI</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Upload photos and describe problems. Get instant <strong>AI diagnosis</strong>, follow-up questions, and suggested scope—no guesswork required.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-database-2-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Track Your Home's History</h3>
                <p className="text-[#6B7C8F] text-lg">
                  <strong>Property Memory</strong> stores every repair, upgrade, and system detail. Perfect for resale, insurance claims, or your own peace of mind.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-line-chart-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Anticipate Utility Costs</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Upload utility bills and get predictions, <strong>anomaly detection</strong>, and insights that help you catch problems before they become expensive.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-alarm-warning-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Catch Anomalies Early</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Spot unusual patterns in utility usage, system performance, or maintenance needs before they turn into major repairs.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-file-text-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Generate Resale Packets</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Create comprehensive <strong>property history reports</strong> for buyers, lenders, or inspectors—showing every improvement and system detail.
                </p>
              </article>
              <article className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-team-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">Connect with Verified Contractors</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Get matched with <strong>background-checked professionals</strong>. Shared job rooms keep communication, approvals, and documentation in one place.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-white" aria-label="How it works">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#0B1F33] text-center mb-16">How Emporva Works for You</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-chat-upload-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">1. Describe What You Need</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Upload photos, describe the issue, or share renovation ideas. Our <strong>AI helps you clarify</strong> the scope.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-team-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">2. Get Matched with Pros</h3>
                <p className="text-[#6B7C8F] text-lg">
                  We connect you with <strong>qualified contractors</strong> who can handle your specific project—no guesswork.
                </p>
              </article>
              <article className="text-center">
                <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-checkbox-circle-line text-4xl text-[#D4B483]" aria-hidden="true"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">3. Track Everything in One Place</h3>
                <p className="text-[#6B7C8F] text-lg">
                  Shared workspace for communication, approvals, photos, payments, and <strong>progress updates</strong>.
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
                Start with Core and upgrade to Premium for unlimited intelligence features
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
                    <span className="text-[#333645]"><strong>1 Export Credit</strong> every 6 months</span>
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
                    <span className="text-[#333645]">Shared job rooms with contractors</span>
                  </li>
                </ul>

                <Link to="/ai-intake" className="block w-full bg-[#0B1F33] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
                  Get Started Free
                </Link>
              </article>

              {/* Premium Tier */}
              <article className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#D4B483] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4B483] text-[#0B1F33] px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Premium</h3>
                <p className="text-[#6B7C8F] mb-6">Unlock Property Memory, Utility Insights, and resale-ready history</p>
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
                </ul>

                <Link to="/homeowner-plans" className="block w-full bg-[#D4B483] text-[#0B1F33] text-center py-3 rounded-lg font-semibold hover:bg-[#D4B483]/90 transition-colors whitespace-nowrap">
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
            <h2 className="text-4xl font-bold text-[#0B1F33] mb-6">Ready to Take Control?</h2>
            <p className="text-xl text-[#6B7C8F] mb-8">
              Join thousands of homeowners who use <strong>Emporva</strong> to understand their property and plan ahead.
            </p>
            <Link to="/ai-intake" className="inline-block bg-[#0B1F33] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

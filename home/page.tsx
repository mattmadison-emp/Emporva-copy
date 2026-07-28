
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Trust from './components/Trust';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import FaqSection, { flattenFaqs } from '../../components/base/FaqSection';
import { useFaqList } from '../../hooks/useStoryblok';
import { useSEO, generateOrganizationSchema, generateWebSiteSchema, generateSoftwareApplicationSchema, generateFAQSchema } from '../../utils/seo';

const homepageFAQs = [
  {
    question: 'What is Emporva and how does it work?',
    answer: 'Emporva is an AI-powered property services platform that helps homeowners diagnose home issues, get clear project scopes, and connect with verified local contractors. Simply describe your problem or upload photos, and our AI will help clarify what you need before matching you with qualified professionals.'
  },
  {
    question: 'How much does Emporva cost?',
    answer: 'Emporva offers a free Core plan with limited monthly credits for AI diagnostics and utility uploads. Our Premium plan is $12/month (or $120/year) and includes unlimited AI diagnostics, Property Memory, utility insights, and resale packet generation.'
  },
  {
    question: 'Are the contractors on Emporva verified?',
    answer: 'Yes, all contractors on Emporva undergo verification including license checks, insurance verification, and background screening. We maintain high standards to ensure homeowners connect with trustworthy professionals.'
  },
  {
    question: 'What types of home services does Emporva cover?',
    answer: 'Emporva covers a wide range of property services including plumbing, electrical, HVAC, roofing, renovation, painting, landscaping, and general home repairs. Our AI can help diagnose issues across all major home systems.'
  },
  {
    question: 'How is Emporva different from other contractor platforms?',
    answer: 'Unlike traditional lead generation platforms, Emporva focuses on clarity and coordination. Our AI helps scope projects before contractors get involved, reducing miscommunication. We also coordinate multi-trade projects and provide shared workspaces for seamless communication.'
  }
];

export default function Home() {
  const { data: faqStory } = useFaqList('home');
  const faqs = flattenFaqs(faqStory?.content);
  const faqsForSchema = faqs.length ? faqs : homepageFAQs;

  useSEO({
    title: 'Emporva | AI-Powered Property Services & Contractor Platform',
    description: 'Emporva is your AI-powered digital general contractor. Diagnose home issues with AI, connect with verified contractors, and manage property maintenance with clarity. Expert plumbing, electrical, roofing, and renovation services.',
    keywords: 'AI contractor, property services, home repair, plumbing services, electrical contractor, roofing contractor, renovation services, property maintenance, verified contractors, home improvement, AI diagnosis',
    canonical: '/',
    ogImage: 'https://emporva.com/og-image.jpg',
    schema: [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateSoftwareApplicationSchema(),
      generateFAQSchema(faqsForSchema)
    ]
  });

  return (
    <div className="min-h-screen">
      <header>
        <Navbar />
      </header>
      <main>
        <Hero />
        <Categories />
        <Trust />
        <HowItWorks />
        <section className="py-20 px-6 bg-[#F9F9FB]" aria-label="Frequently asked questions">
          <div className="max-w-3xl mx-auto">
            <FaqSection content={faqStory?.content} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

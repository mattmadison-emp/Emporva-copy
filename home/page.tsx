
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
    answer: 'Emporva is an AI-powered homeowner platform that helps you organize your home's information, understand your systems, plan projects, and stay on top of maintenance—all from one place.'
  },
  {
    question: 'How is Emporva different from other AI assistants?',
    answer: 'Emporva is designed specifically for homeowners. Beyond answering questions, it helps you build a digital record of your home by organizing documents, tracking systems, remembering maintenance history, and providing guidance based on your property's unique information.'
  },
  {
    question: 'Can I upload manuals, warranties, and home documents?',
    answer: 'Yes. Emporva lets you securely store important home documents like manuals, warranties, receipts, inspection reports, and maintenance records, making them easy to search and reference whenever you need them.'
  },
  {
    question: 'Is Emporva free to use?',
    answer: 'Yes. You can create a free account and start organizing your home, asking AI questions, and exploring homeowner resources. Additional premium features will be available for users looking for more advanced tools and automation.'
  },
  {
    question: 'Who is Emporva for?',
    answer: 'Emporva is built for homeowners of every experience level—from first-time buyers learning the basics to experienced homeowners managing repairs, renovations, and long-term maintenance.'
  }
];

export default function Home() {
  const { data: faqStory } = useFaqList('home');
  const faqs = flattenFaqs(faqStory?.content);
  const faqsForSchema = faqs.length ? faqs : homepageFAQs;

  useSEO({
    title: 'Emporva | The AI-Powered Homeowner Platform',
    description: 'Organize your home, manage maintenance, plan projects, and get personalized guidance with Emporva. Store documents, track home systems, and simplify homeownership with AI.',
    keywords: 'AI homeowner platform, Home management, Home maintenance, Homeowner tools, Home organization, Home maintenance app, Home project planning, Property management for homeowners, Home systems tracker, Home maintenance reminders, Home improvement planning, Digital home records, Homeowner AI',
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

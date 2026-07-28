
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFaqList } from '../../../hooks/useStoryblok';
import { flattenFaqs } from '../../../components/base/FaqSection';

export default function ContractorAccountHelp() {
  const { data: faqStory } = useFaqList('contractor-help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: 'ri-rocket-line', count: 8 },
    { id: 'leads', label: 'Leads & Jobs', icon: 'ri-briefcase-line', count: 12 },
    { id: 'billing', label: 'Billing & Plans', icon: 'ri-bank-card-line', count: 6 },
    { id: 'profile', label: 'Profile & Settings', icon: 'ri-user-settings-line', count: 9 },
    { id: 'messaging', label: 'Messaging', icon: 'ri-message-3-line', count: 5 },
    { id: 'reviews', label: 'Reviews & Ratings', icon: 'ri-star-line', count: 7 }
  ];

  const fallbackFaqs = [
    {
      id: 1,
      question: 'How do I respond to a new lead?',
      answer: 'When you receive a new lead, you\'ll get a notification via email and in your dashboard. Navigate to your Lead Inbox, click on the lead to view details, and use the "Send Quote" button to respond with your pricing and availability. Quick responses typically lead to higher conversion rates.'
    },
    {
      id: 2,
      question: 'How does the credit system work?',
      answer: 'Credits are used to unlock and respond to leads. Each lead requires a certain number of credits based on the job type and value. Premium plan members receive unlimited lead responses, while Core plan members receive a monthly credit allocation. You can purchase additional credits if needed.'
    },
    {
      id: 3,
      question: 'How can I improve my profile visibility?',
      answer: 'To improve your visibility: 1) Complete your profile 100% with photos and detailed service descriptions, 2) Maintain a high response rate to leads, 3) Collect positive reviews from completed jobs, 4) Keep your credentials and insurance up to date, 5) Upgrade to Premium for priority placement in search results.'
    },
    {
      id: 4,
      question: 'What happens if a homeowner cancels a job?',
      answer: 'If a homeowner cancels a job before work begins, you\'ll be notified immediately. Any credits used to respond to that lead will be refunded to your account. If work has already started, you should communicate directly with the homeowner to resolve any payment for completed work.'
    },
    {
      id: 5,
      question: 'How do I update my service area?',
      answer: 'Go to your Profile settings and select "Service Area." You can add or remove cities, ZIP codes, and set your travel radius. You can also specify travel fees for jobs outside your primary service area. Changes take effect immediately.'
    },
    {
      id: 6,
      question: 'How are reviews verified?',
      answer: 'Reviews on Emporva are only accepted from homeowners who have completed a job with you through our platform. This ensures all reviews are from genuine customers. We also have systems in place to detect and remove fraudulent reviews.'
    }
  ];

  const sbFaqs = flattenFaqs(faqStory?.content).map((f, i) => ({ id: i + 1, ...f }));
  const faqs = sbFaqs.length ? sbFaqs : fallbackFaqs;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setContactForm({ subject: '', message: '' });
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" 
              alt="Emporva Logo" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>
          <Link 
            to="/contractor-dashboard-premium" 
            className="flex items-center gap-2 text-[#0B1F33] hover:text-[#D4B483] transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Help & Support
            </h1>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Find answers to common questions or contact our support team
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all text-[#333645]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#D4B483]/20 transition-colors">
                  <i className={`${category.icon} text-[#D4B483] text-2xl`}></i>
                </div>
                <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {category.label}
                </h3>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {category.count} articles
                </p>
              </button>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <i className="ri-question-line text-[#D4B483] mr-2"></i>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-[#0B1F33] pr-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {faq.question}
                    </span>
                    <i className={`ri-arrow-down-s-line text-[#6B7C8F] text-xl transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}></i>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <i className="ri-customer-service-2-line text-[#D4B483] mr-2"></i>
              Contact Support
            </h2>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
                <span className="text-green-700 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your message has been sent! We\'ll respond within 24 hours.
                </span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Subject
                  </label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all cursor-pointer"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select a topic</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="leads">Leads & Jobs</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account & Profile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    maxLength={500}
                    placeholder="Describe your issue or question..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">{contactForm.message.length}/500 characters</p>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-semibold whitespace-nowrap cursor-pointer"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Send Message
                </button>
              </form>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="p-6 bg-[#F9F9FB] rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-lg flex items-center justify-center">
                      <i className="ri-mail-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email Support</h3>
                      <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Response within 24 hours</p>
                    </div>
                  </div>
                  <a href="mailto:support@emporva.com" className="text-[#D4B483] hover:text-[#c5a574] font-medium cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                    support@emporva.com
                  </a>
                </div>

                <div className="p-6 bg-[#F9F9FB] rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#D4B483] rounded-lg flex items-center justify-center">
                      <i className="ri-phone-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Phone Support</h3>
                      <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Mon-Fri, 9am-6pm PST</p>
                    </div>
                  </div>
                  <a href="tel:1-800-555-0123" className="text-[#D4B483] hover:text-[#c5a574] font-medium cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                    1-800-555-0123
                  </a>
                </div>

                <div className="p-6 bg-gradient-to-r from-[#D4B483]/10 to-[#0B1F33]/10 rounded-xl border border-[#D4B483]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="ri-vip-crown-line text-[#D4B483] text-xl"></i>
                    <h3 className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Premium Support</h3>
                  </div>
                  <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    As a Premium member, you have access to priority support with faster response times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

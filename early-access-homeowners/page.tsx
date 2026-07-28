import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function EarlyAccessHomeowners() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    zipCode: '',
    ownership: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const scrollToForm = () => {
    const formSection = document.getElementById('signup');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/early-access/homeowner-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
          zipCode: formData.zipCode,
          ownership: formData.ownership
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ firstName: '', email: '', zipCode: '', ownership: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (_error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-light via-white to-[#D4B483]/10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#D4B483]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1F33]/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4B483]/20 text-primary-navy rounded-full text-sm font-semibold mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <i className="ri-sparkling-line text-accent-sand"></i>
            <span>Early Access Now Open</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary-navy mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Your Home.<br />One Command Center.
          </h1>
          
          <p className="text-xl text-secondary-slate mb-10 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva is building an AI-powered platform to help homeowners diagnose issues, plan projects, and keep everything about their home in one place.
          </p>
          
          <button 
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-navy text-white rounded-lg font-semibold hover:bg-primary-navy/90 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Get Early Access
            <i className="ri-arrow-right-line"></i>
          </button>
          
          <p className="text-sm text-secondary-slate mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Be among the first to try Emporva when we launch.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Homeownership is more complex than ever.
          </h2>
          
          <div className="space-y-6 text-lg text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p>
              Homes are aging, systems are more interconnected, and repairs often involve multiple contractors. Yet most homeowners still manage everything through scattered emails, text messages, photos, and notes.
            </p>
            
            <div className="bg-gradient-to-br from-neutral-light to-[#D4B483]/10 border-l-4 border-accent-sand p-6 rounded-r-lg">
              <p className="text-neutral-dark font-medium">
                Emporva isn't just built to react when something breaks. It's designed to educate homeowners, help them understand how their home actually works, and give them confidence to plan, maintain, and improve it over time.
              </p>
            </div>
            
            <p>
              Whether you're troubleshooting an issue, planning a renovation, or exploring ideas for your space, Emporva helps turn uncertainty into clear next steps and real outcomes, all in one organized place.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-neutral-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Emporva brings it all together.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-search-eye-line text-accent-sand text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Diagnose home issues</strong> and start planning your projects using AI from photos and descriptions
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-dashboard-line text-primary-navy text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Track repairs, projects, and maintenance</strong> in one dashboard
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#6B7C8F]/15 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-message-3-line text-secondary-slate text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Communicate with contractors</strong> in one organized place
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#D4B483]/20 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-folder-line text-accent-sand text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Store documents, photos, warranties, and receipts</strong>
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-history-line text-primary-navy text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Build a living record</strong> of how your home is cared for
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#6B7C8F]/15 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-notification-3-line text-secondary-slate text-2xl"></i>
              </div>
              <p className="text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong className="text-primary-navy">Get smart maintenance reminders</strong> based on your home's systems and seasonal needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-[#F9F9FB] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4B483] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0B1F33] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4 font-['Poppins']">
              How It Works
            </h2>
            <p className="text-lg text-[#6B7C8F] max-w-2xl mx-auto">
              From problem to solution in four simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#D4B483]/20 via-[#D4B483] to-[#D4B483]/20 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">1</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-camera-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Capture the Issue
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Take a photo or describe what's happening. Our AI analyzes the problem and helps you understand what might be wrong.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">2</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-lightbulb-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Get Smart Guidance
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Receive instant insights about potential causes, urgency level, and whether it's a DIY fix or needs a professional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">3</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-team-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Connect with Pros
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Get matched with verified contractors who can help. Communicate, share photos, and get quotes all in one place.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D4B483]/20 h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white font-['Poppins']">4</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/10 rounded-2xl flex items-center justify-center">
                      <i className="ri-folder-history-line text-4xl text-[#D4B483]"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-3 font-['Poppins']">
                      Track Everything
                    </h3>
                    <p className="text-[#6B7C8F] leading-relaxed">
                      Store photos, receipts, warranties, and project history. Build a complete record of your home's care over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-lg text-[#6B7C8F] mb-6">
              Ready to take control of your home?
            </p>
            <button
              onClick={scrollToForm}
              className="px-10 py-4 bg-gradient-to-r from-[#0B1F33] to-[#1a3a5c] text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 font-['Montserrat'] whitespace-nowrap cursor-pointer"
            >
              Get Early Access Now
            </button>
          </div>
        </div>
      </section>

      {/* Early Access Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-12 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            What does early access include?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#D4B483]/20 rounded-full flex items-center justify-center">
                  <i className="ri-vip-crown-line text-accent-sand"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Early Dashboard Access</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Early access to the homeowner dashboard</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0B1F33]/10 rounded-full flex items-center justify-center">
                  <i className="ri-lightbulb-line text-primary-navy"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Shape the Product</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Opportunity to help shape features and workflows</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#6B7C8F]/15 rounded-full flex items-center justify-center">
                  <i className="ri-rocket-line text-secondary-slate"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Priority Access</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Priority access when premium tools launch</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#D4B483]/20 rounded-full flex items-center justify-center">
                  <i className="ri-price-tag-3-line text-accent-sand"></i>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-primary-navy mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Special Pricing</h3>
                <p className="text-secondary-slate" style={{ fontFamily: 'Inter, sans-serif' }}>Early adopter pricing when available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-20 px-6 bg-gradient-to-br from-neutral-light via-white to-[#D4B483]/10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-primary-navy mb-3 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Join the Early Access List
            </h2>
            <p className="text-secondary-slate mb-8 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              Be notified as features become available
            </p>

            <form id="early-access-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base"
                  placeholder="12345"
                />
              </div>

              <div>
                <label htmlFor="ownership" className="block text-sm font-medium text-primary-navy mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Do you own or rent? (Optional)
                </label>
                <select
                  id="ownership"
                  name="ownership"
                  value={formData.ownership}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-sand focus:border-transparent text-base cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="Own">Own</option>
                  <option value="Landlord">Landlord</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <i className="ri-checkbox-circle-line text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium">Welcome to early access!</p>
                    <p className="text-sm mt-1">We'll notify you as features become available.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <i className="ri-error-warning-line text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-medium">Something went wrong</p>
                    <p className="text-sm mt-1">Please try again or contact support.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-primary-navy text-white rounded-lg font-semibold hover:bg-primary-navy/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Joining...
                  </span>
                ) : (
                  'Join Early Access'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-secondary-slate leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva is currently in development. Early access users will be notified as features become available.
          </p>
          <div className="mt-6">
            <Link to="/" className="text-sm text-accent-sand hover:text-primary-navy font-medium whitespace-nowrap transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              ← Back to Emporva Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

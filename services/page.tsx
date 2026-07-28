import { useParams, Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateServiceSchema } from '../../utils/seo';
import { useService } from '../../hooks/useStoryblok';
import FeatureCallout, { hasFeatureContent } from '../../components/base/FeatureCallout';

export default function ServiceLanding() {
  const { service } = useParams<{ service: string }>();
  const { data: story, loading, error } = useService(service);
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';

  const serviceData = story?.content;

  useSEO({
    title: serviceData?.seo_title || (serviceData?.title ? `${serviceData.title} - Emporva` : 'Service - Emporva'),
    description: serviceData?.seo_description || serviceData?.description || '',
    keywords: serviceData?.keywords,
    canonical: `/services/${service}`,
    schema: serviceData
      ? generateServiceSchema(
          serviceData.title,
          serviceData.description,
          `${siteUrl}/services/${service}`,
          serviceData.avg_cost,
        )
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FB]">
        <Navbar activePage="services" />
        <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 mx-auto mb-6 animate-pulse"></div>
            <div className="h-12 bg-white/20 rounded mx-auto mb-6 animate-pulse w-2/3"></div>
            <div className="h-6 bg-white/20 rounded mx-auto animate-pulse w-3/4"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-[#F9F9FB]">
        <Navbar activePage="services" />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="text-4xl font-bold text-[#0B1F33] mb-4">Service Not Found</h1>
          <p className="text-[#333645] mb-8">The service you're looking for doesn't exist or hasn't been published yet.</p>
          <Link
            to="/services"
            className="inline-block px-8 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors font-semibold"
          >
            View all services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const heroImage = serviceData.hero_image?.filename;
  const heroAlt = serviceData.hero_image?.alt || serviceData.title;

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="services" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <img
              src={heroImage}
              alt={heroAlt}
              className="w-full h-full object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/70 via-[#0B1F33]/60 to-[#0B1F33]/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className={`${serviceData.icon} text-5xl text-white`} aria-hidden="true"></i>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {serviceData.title}
          </h1>
          <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-8">
            {serviceData.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#D4B483]/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
              Get Started Now
            </button>
            <button className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
              View Contractors
            </button>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-[#F9F9FB] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-2">
              Typical Cost Range
            </h3>
            <p className="text-2xl font-bold text-[#D4B483]">
              {serviceData.avg_cost}
            </p>
          </div>
          <div className="bg-[#F9F9FB] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#0B1F33] mb-2">
              Response Time
            </h3>
            <p className="text-lg text-[#333645]">
              {serviceData.urgency}
            </p>
          </div>
        </div>
      </section>

      {/* Feature callout */}
      {hasFeatureContent(serviceData.feature_title, serviceData.feature) && (
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <FeatureCallout title={serviceData.feature_title} doc={serviceData.feature} />
          </div>
        </section>
      )}

      {/* Common Issues */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-12 text-center">
            Common Issues We Solve
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {serviceData.common_issues.map((issue) => (
              <div key={issue._uid} className="bg-white rounded-xl p-6 shadow-lg flex items-start gap-4">
                <i className="ri-checkbox-circle-fill text-2xl text-[#D4B483] flex-shrink-0 mt-1" aria-hidden="true"></i>
                <p className="text-lg text-[#333645]">
                  {issue.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-12 text-center">
            How Emporva Works
          </h2>
          <div className="space-y-6">
            {serviceData.process_steps.map((step, index) => (
              <div key={step._uid} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 bg-[#F9F9FB] rounded-xl p-6">
                  <p className="text-lg text-[#333645]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Emporva */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-12 text-center">
            Why Choose Emporva
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3">
                Verified Contractors
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed">
                All contractors are licensed, insured, and background-checked
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-brain-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3">
                AI-Powered Diagnostics
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed">
                Understand the problem before you spend a dollar
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-3xl text-[#D4B483]" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-3">
                Transparent Pricing
              </h3>
              <p className="text-[#6B7C8F] leading-relaxed">
                Compare quotes and choose the best option for your budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/95 text-lg mb-8 max-w-2xl mx-auto">
            Describe your issue and get matched with verified contractors in minutes
          </p>
          <button className="px-10 py-5 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#D4B483]/90 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
            Describe Your Issue
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Link } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useSEO, generateWebPageSchema, generateBreadcrumbSchema } from '../../../utils/seo';
import { useServices, useServicesIndex } from '../../../hooks/useStoryblok';

export default function ServicesIndex() {
  const { data: index, loading: indexLoading, error: indexError } = useServicesIndex();
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();

  const headline = index?.content.headline || 'Our Services';
  const subhead = index?.content.subhead || '';

  useSEO({
    title: index?.content.seo_title || 'Home Improvement Services - Emporva',
    description:
      index?.content.seo_description ||
      'Browse all home improvement services available through Emporva.',
    canonical: '/services',
    schema: [
      generateWebPageSchema(headline, subhead, '/services', [
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
      ]),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
      ]),
    ],
  });

  const loading = indexLoading || servicesLoading;
  const error = indexError || servicesError;
  const slugFromFullSlug = (fullSlug: string) => fullSlug.replace(/^services\//, '');

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="services" />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {headline}
          </h1>
          {subhead && (
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {subhead}
            </p>
          )}
        </div>
      </section>

      {/* Service grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-8 shadow-lg animate-pulse">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-3">We couldn't load the services right now</h2>
              <p className="text-[#6B7C8F]">Please try refreshing the page in a moment.</p>
            </div>
          )}

          {!loading && !error && services && services.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <p className="text-[#6B7C8F]">No services published yet.</p>
            </div>
          )}

          {!loading && !error && services && services.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((story) => {
                const slug = slugFromFullSlug(story.full_slug);
                const { title, description, icon } = story.content;
                return (
                  <Link
                    key={story.uuid}
                    to={`/services/${slug}`}
                    className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col"
                  >
                    <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mb-4">
                      <i className={`${icon} text-3xl text-[#D4B483]`} aria-hidden="true"></i>
                    </div>
                    <h2 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {title}
                    </h2>
                    <p className="text-[#6B7C8F] leading-relaxed flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[#0B1F33] font-semibold">
                      Learn more
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

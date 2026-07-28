import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateBlogListingSchema, generateBreadcrumbSchema } from '../../utils/seo';
import { useArticles, useBlogIndex, useServices } from '../../hooks/useStoryblok';
import NewsletterSignup from '../../components/base/NewsletterSignup';

const slugFromFullSlug = (fullSlug: string) => fullSlug.replace(/^blog\//, '');

const formatDate = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';

  const { data: index, loading: indexLoading } = useBlogIndex();
  const { data: articles, loading: articlesLoading, error: articlesError } = useArticles();
  const { data: services } = useServices();

  const headline = index?.content.headline || 'Emporva Blog';
  const subhead =
    index?.content.subhead ||
    'Guides, checklists, and real world insights to help you care for your property with confidence.';

  const sortedArticles = useMemo(() => {
    if (!articles) return [];
    return [...articles].sort((a, b) => {
      const aDate = a.content.published_date ? new Date(a.content.published_date).getTime() : 0;
      const bDate = b.content.published_date ? new Date(b.content.published_date).getTime() : 0;
      return bDate - aDate;
    });
  }, [articles]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    sortedArticles.forEach((s) => {
      if (s.content.category) set.add(s.content.category);
    });
    return ['All', ...Array.from(set)];
  }, [sortedArticles]);

  const recentServices = useMemo(() => (services || []).slice(0, 4), [services]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ];

  useSEO({
    title: index?.content.seo_title || 'Emporva Blog - Property Maintenance Guides & Home Repair Tips',
    description:
      index?.content.seo_description ||
      'Guides, checklists, and real world insights to help you care for your property with confidence.',
    keywords:
      'home maintenance blog, property repair guides, plumbing tips, electrical safety, roofing advice, HVAC maintenance, home improvement',
    canonical: '/blog',
    schema: [
      generateBlogListingSchema(
        sortedArticles.map((s) => ({
          title: s.content.title,
          url: `${siteUrl}/blog/${slugFromFullSlug(s.full_slug)}`,
          datePublished: s.content.published_date,
          image: s.content.hero_image?.filename,
          description: s.content.excerpt,
        })),
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  });

  const filteredPosts = sortedArticles.filter((s) => {
    const { title, excerpt, category } = s.content;
    const matchesSearch =
      !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loading = indexLoading || articlesLoading;

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="blog" />

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {headline}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {subhead}
          </p>
        </div>
      </header>

      <main>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-[#333645]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li><a href="/" className="hover:text-[#D4B483] transition-colors">Home</a></li>
            <li><i className="ri-arrow-right-s-line text-xs"></i></li>
            <li aria-current="page" className="text-[#D4B483] font-medium">Blog</li>
          </ol>
        </nav>

        {/* Search and Filter */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 mb-8 sm:mb-12" aria-label="Search and filter articles">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex-1 relative">
                <i className="ri-search-line absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#333645]/50 text-lg sm:text-xl"></i>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  aria-label="Search blog articles"
                />
              </div>

              <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-[#D4B483] text-white'
                        : 'bg-gray-100 text-[#333645] hover:bg-gray-200'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                    aria-pressed={selectedCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Posts + Sidebar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20" aria-label="Blog articles">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Main */}
            <div className="flex-1">
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 sm:h-56 bg-gray-200"></div>
                      <div className="p-5 sm:p-6">
                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && articlesError && (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <h2 className="text-2xl font-bold text-[#0B1F33] mb-3">We couldn't load articles right now</h2>
                  <p className="text-[#6B7C8F]">Please try refreshing the page in a moment.</p>
                </div>
              )}

              {!loading && !articlesError && filteredPosts.length === 0 && (
                <div className="text-center py-12 sm:py-20">
                  <i className="ri-file-search-line text-5xl sm:text-6xl text-[#333645]/20 mb-4"></i>
                  <p className="text-lg sm:text-xl text-[#333645]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No articles found matching your search.
                  </p>
                </div>
              )}

              {!loading && !articlesError && filteredPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {filteredPosts.map((story) => {
                    const slug = slugFromFullSlug(story.full_slug);
                    const { title, excerpt, category, hero_image, published_date, read_time } = story.content;
                    return (
                      <article key={story.uuid} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                        <Link to={`/blog/${slug}`} className="block cursor-pointer" aria-label={`Read article: ${title}`}>
                          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                            {hero_image?.filename && (
                              <img
                                src={hero_image.filename}
                                alt={hero_image.alt || `${title} - ${category}`}
                                title={`${title} | Emporva Blog`}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                              <span
                                className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#D4B483] text-white text-xs font-semibold rounded-full"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                {category}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#333645]/60 mb-2 sm:mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                              <time dateTime={published_date?.split(' ')[0]}>{formatDate(published_date)}</time>
                              <span>•</span>
                              <span>{read_time}</span>
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F33] mb-2 sm:mb-3 group-hover:text-[#D4B483] transition-colors line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {title}
                            </h2>

                            <p className="text-[#333645]/80 text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {excerpt}
                            </p>

                            <div className="flex items-center gap-2 text-[#D4B483] font-semibold text-sm group-hover:gap-3 transition-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              Read More
                              <i className="ri-arrow-right-line"></i>
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-[#D4B483]/10 rounded-lg">
                    <i className="ri-tools-fill text-[#D4B483] text-lg sm:text-xl"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Recent Services
                  </h3>
                </div>

                <div className="space-y-4">
                  {recentServices.map((story) => {
                    const slug = story.full_slug.replace(/^services\//, '');
                    const { title, description, icon } = story.content;
                    return (
                      <Link key={story.uuid} to={`/services/${slug}`} className="flex gap-3 sm:gap-4 group cursor-pointer">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#0B1F33] text-white rounded-lg flex-shrink-0">
                          <i className={`${icon || 'ri-tools-line'} text-base`} aria-hidden="true"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#333645] group-hover:text-[#D4B483] transition-colors leading-snug mb-1 line-clamp-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {title}
                          </h4>
                          <p className="text-xs text-[#333645]/50 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
                  <Link
                    to="/services"
                    className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    View All Services
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] rounded-2xl shadow-lg p-5 sm:p-6 mt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 rounded-xl mb-4">
                  <i className="ri-mail-send-line text-white text-xl sm:text-2xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Stay Updated
                </h3>
                <p className="text-white/80 text-xs sm:text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Get the latest home maintenance tips delivered to your inbox.
                </p>
                <NewsletterSignup source="blog" />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

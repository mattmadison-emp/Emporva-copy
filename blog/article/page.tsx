import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useSEO, generateArticleSchema, generateBreadcrumbSchema } from '../../../utils/seo';
import { useArticle, useArticles } from '../../../hooks/useStoryblok';
import RichText from '../../../components/base/RichText';
import FeatureCallout from '../../../components/base/FeatureCallout';
import type { RichTextDocument, RichTextNode } from '../../../services/storyblokService';

const slugFromFullSlug = (fullSlug: string) => fullSlug.replace(/^blog\//, '');

const formatDate = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function flattenText(node: RichTextNode | RichTextDocument | undefined): string {
  if (!node) return '';
  if ('text' in node && node.text) return node.text;
  const children = (node as RichTextNode).content || (node as RichTextDocument).content;
  if (!children) return '';
  return children.map(flattenText).join(' ').replace(/\s+/g, ' ').trim();
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';

  const { data: story, loading, error } = useArticle(slug);
  const { data: allArticles } = useArticles();

  const article = story?.content;

  const bodyText = useMemo(() => flattenText(article?.body), [article?.body]);
  const wordCount = useMemo(() => (bodyText ? bodyText.split(/\s+/).length : 0), [bodyText]);
  const dateISO = useMemo(() => (article?.published_date ? article.published_date.split(' ')[0] : ''), [article?.published_date]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    ...(article ? [{ name: article.title, url: `/blog/${slug}` }] : []),
  ];

  useSEO({
    title: article ? article.seo_title || `${article.title} - Emporva Blog` : 'Article Not Found - Emporva Blog',
    description: article ? article.seo_description || article.excerpt : 'Article not found',
    keywords: article?.keywords || 'home maintenance, property repair',
    canonical: `/blog/${slug}`,
    ogType: 'article',
    ogImage: article?.hero_image?.filename,
    schema: article
      ? [
          generateArticleSchema(
            article.title,
            article.excerpt,
            `${siteUrl}/blog/${slug}`,
            dateISO,
            dateISO,
            article.hero_image?.filename,
            article.author || undefined,
            {
              wordCount,
              articleSection: article.category,
              keywords: article.keywords?.split(',').map((k) => k.trim()).filter(Boolean),
              articleBody: bodyText.substring(0, 500),
            },
          ),
          generateBreadcrumbSchema(breadcrumbs),
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FB]">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-2/3 mb-8 animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Article Not Found
          </h1>
          <Link to="/blog" className="text-[#6B7C8F] hover:underline cursor-pointer">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  const sortedOtherArticles = (allArticles || [])
    .filter((s) => slugFromFullSlug(s.full_slug) !== slug)
    .sort((a, b) => {
      const aDate = a.content.published_date ? new Date(a.content.published_date).getTime() : 0;
      const bDate = b.content.published_date ? new Date(b.content.published_date).getTime() : 0;
      return bDate - aDate;
    });

  const popularArticles = sortedOtherArticles.slice(0, 4);
  const relatedArticles = sortedOtherArticles.slice(0, 2);
  const allCategories = Array.from(new Set((allArticles || []).map((s) => s.content.category).filter(Boolean)));
  const keywords = article.keywords?.split(',').map((k) => k.trim()).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />

      <main>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 pt-28 pb-4">
          <ol className="flex items-center gap-2 text-sm text-[#333645]/60 flex-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li><a href="/" className="hover:text-[#D4B483] transition-colors">Home</a></li>
            <li><i className="ri-arrow-right-s-line text-xs"></i></li>
            <li><a href="/blog" className="hover:text-[#D4B483] transition-colors">Blog</a></li>
            <li><i className="ri-arrow-right-s-line text-xs"></i></li>
            <li aria-current="page" className="text-[#D4B483] font-medium truncate max-w-xs">{article.title}</li>
          </ol>
        </nav>

        <article itemScope itemType="https://schema.org/Article">
          <header className="pt-4 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
              <Link to="/blog" className="inline-flex items-center gap-2 text-[#6B7C8F] hover:gap-3 transition-all mb-8 cursor-pointer">
                <i className="ri-arrow-left-line"></i>
                <span className="font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Back to Blog</span>
              </Link>

              <div className="mb-6">
                <span
                  className="px-4 py-1.5 bg-[#6B7C8F] text-white text-sm font-semibold rounded-full"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  itemProp="articleSection"
                >
                  {article.category}
                </span>
              </div>

              <h1 className="text-5xl font-bold text-[#0B1F33] mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }} itemProp="headline">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-[#333645]/60 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                <time dateTime={dateISO} itemProp="datePublished">{formatDate(article.published_date)}</time>
                <span>•</span>
                <span>{article.read_time}</span>
                {wordCount > 0 && (
                  <>
                    <span>•</span>
                    <span itemProp="wordCount">{wordCount} words</span>
                  </>
                )}
              </div>

              <meta itemProp="dateModified" content={dateISO} />
              <div itemProp="author" itemScope itemType="https://schema.org/Organization" className="hidden">
                <meta itemProp="name" content={article.author || 'Emporva'} />
              </div>
              <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" className="hidden">
                <meta itemProp="name" content="Emporva" />
              </div>

              {/* Social Sharing */}
              <nav className="flex items-center gap-3 pb-8 border-b border-gray-200" aria-label="Share this article">
                <span className="text-sm font-medium text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${siteUrl}/blog/${slug}`} target="_blank" rel="nofollow noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg transition-colors cursor-pointer" aria-label="Share on Facebook">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${siteUrl}/blog/${slug}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="nofollow noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg transition-colors cursor-pointer" aria-label="Share on X">
                  <i className="ri-twitter-x-line"></i>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${siteUrl}/blog/${slug}&title=${encodeURIComponent(article.title)}`} target="_blank" rel="nofollow noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg transition-colors cursor-pointer" aria-label="Share on LinkedIn">
                  <i className="ri-linkedin-fill"></i>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Check out this article: ${siteUrl}/blog/${slug}`)}`} className="w-10 h-10 flex items-center justify-center bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg transition-colors cursor-pointer" aria-label="Share via email">
                  <i className="ri-mail-line"></i>
                </a>
              </nav>
            </div>
          </header>

          {/* Featured Image */}
          {article.hero_image?.filename && (
            <div className="px-6 mb-12">
              <div className="max-w-5xl mx-auto">
                <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={article.hero_image.filename}
                    alt={article.hero_image.alt || `${article.title} - ${article.category}`}
                    title={`${article.title} | Emporva Blog`}
                    className="w-full h-full object-cover object-top"
                    itemProp="image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Body + Sidebar */}
          <div className="px-6 pb-20" itemProp="articleBody">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 max-w-3xl">
                  <FeatureCallout title={article.feature_title} doc={article.feature} className="mb-8" />

                  <div className="bg-white rounded-2xl shadow-lg p-12">
                    <RichText doc={article.body} />

                    {/* Excerpt as lead-in if body lacks intro paragraph (fallback) */}
                    {keywords.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-[#333645]/70 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Related Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-3 py-1.5 bg-gray-100 text-[#333645]/70 text-xs rounded-full"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-16 pt-12 border-t border-gray-200">
                      <div className="bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-10 text-center">
                        <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Need Help with Your Property?
                        </h3>
                        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Let <strong>Emporva</strong> diagnose your issue and connect you with the right professionals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link to="/" className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Describe an Issue
                          </Link>
                          <Link to="/providers" className="px-8 py-4 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c5a574] transition-colors font-semibold whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Find a Contractor
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <section className="mt-16" aria-label="Related articles">
                      <h4 className="text-2xl font-bold text-[#0B1F33] mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <Link to="/blog" className="hover:text-[#D4B483] transition-colors">More from the Blog</Link>
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {relatedArticles.map((related) => {
                          const relatedSlug = slugFromFullSlug(related.full_slug);
                          const r = related.content;
                          return (
                            <Link
                              key={related.uuid}
                              to={`/blog/${relatedSlug}`}
                              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            >
                              <div className="relative h-44 w-full overflow-hidden">
                                {r.hero_image?.filename && (
                                  <img
                                    src={r.hero_image.filename}
                                    alt={r.hero_image.alt || `${r.title} - ${r.category}`}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                )}
                                <div className="absolute top-3 left-3">
                                  <span className="px-3 py-1 bg-[#D4B483] text-white text-xs font-semibold rounded-full" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {r.category}
                                  </span>
                                </div>
                              </div>
                              <div className="p-5">
                                <time className="text-xs text-[#333645]/60 mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {formatDate(r.published_date)}
                                </time>
                                <h3 className="text-lg font-bold text-[#0B1F33] group-hover:text-[#D4B483] transition-colors leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {r.title}
                                </h3>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                  <div className="sticky top-24 space-y-6">
                    {popularArticles.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 flex items-center justify-center bg-[#D4B483]/10 rounded-lg">
                            <i className="ri-fire-fill text-[#D4B483] text-xl"></i>
                          </div>
                          <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Recent Articles
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {popularArticles.map((p) => {
                            const pSlug = slugFromFullSlug(p.full_slug);
                            return (
                              <Link key={p.uuid} to={`/blog/${pSlug}`} className="flex gap-3 group cursor-pointer">
                                <div className="w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                                  {p.content.hero_image?.filename && (
                                    <img
                                      src={p.content.hero_image.filename}
                                      alt={p.content.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-[#333645] group-hover:text-[#D4B483] transition-colors leading-snug line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {p.content.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-[#333645]/50 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <span>{p.content.read_time}</span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <Link
                            to="/blog"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#0B1F33] hover:bg-[#6B7C8F] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            View All Articles
                            <i className="ri-arrow-right-line"></i>
                          </Link>
                        </div>
                      </div>
                    )}

                    {allCategories.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 flex items-center justify-center bg-[#6B7C8F]/10 rounded-lg">
                            <i className="ri-folder-3-line text-[#6B7C8F] text-xl"></i>
                          </div>
                          <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Categories
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {allCategories.map((category) => (
                            <Link
                              key={category}
                              to="/blog"
                              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                              <span className="text-sm text-[#333645] group-hover:text-[#D4B483] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {category}
                              </span>
                              <i className="ri-arrow-right-s-line text-[#333645]/30 group-hover:text-[#D4B483] transition-colors"></i>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Newsletter */}
                    <div className="bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] rounded-2xl shadow-lg p-6">
                      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl mb-4">
                        <i className="ri-mail-send-line text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Stay Updated
                      </h3>
                      <p className="text-white/80 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Get the latest home maintenance tips delivered to your inbox.
                      </p>
                      <Link
                        to="/early-access-homeowners"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4B483] hover:bg-[#c5a574] text-[#0B1F33] rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Join Waitlist
                        <i className="ri-arrow-right-line"></i>
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schema?: object | object[];
  geoPosition?: string;
  geoRegion?: string;
  geoPlacename?: string;
}

const SITE_URL = 'https://emporva.com';
const SITE_NAME = 'Emporva';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  geoPosition,
  geoRegion,
  geoPlacename
}: SEOProps) {
  const location = useLocation();
  const fullUrl = canonical ? `${SITE_URL}${canonical}` : `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);

    // Last modified
    updateMetaTag('last-modified', new Date().toISOString().split('T')[0]);

    // Robots
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph tags
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', SITE_NAME, true);
    updateMetaTag('og:locale', 'en_US', true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@emporva');

    // Geo tags for local SEO
    if (geoPosition) updateMetaTag('geo.position', geoPosition);
    if (geoRegion) updateMetaTag('geo.region', geoRegion);
    if (geoPlacename) updateMetaTag('geo.placename', geoPlacename);

    // Schema.org JSON-LD - handle multiple schemas
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-seo="true"]');
    existingScripts.forEach(script => script.remove());

    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((schemaItem) => {
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('data-seo', 'true');
        scriptTag.textContent = JSON.stringify(schemaItem);
        document.head.appendChild(scriptTag);
      });
    }

    // Cleanup function
    return () => {
      const schemaScripts = document.querySelectorAll('script[type="application/ld+json"][data-seo="true"]');
      schemaScripts.forEach(script => script.remove());
    };
  }, [title, description, keywords, fullUrl, ogType, ogImage, schema, geoPosition, geoRegion, geoPlacename]);
}

// Schema.org generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512
  },
  description: 'AI-powered digital general contractor and property operations platform connecting homeowners with verified contractors.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['English'],
    areaServed: 'US'
  },
  sameAs: [
    'https://x.com/emporva',
    'https://www.instagram.com/emporva/',
    'https://www.linkedin.com/company/emporva/'
  ]
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: 'AI-powered property services platform for homeowners and contractors',
  publisher: {
    '@id': `${SITE_URL}/#organization`
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/providers?search={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

export const generateWebPageSchema = (
  title: string, 
  description: string, 
  url: string,
  breadcrumbs?: Array<{ name: string; url: string }>
) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${url}#webpage`,
    name: title,
    description: description,
    url: `${SITE_URL}${url}`,
    isPartOf: {
      '@id': `${SITE_URL}/#website`
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    dateModified: new Date().toISOString()
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = {
      '@id': `${SITE_URL}${url}#breadcrumb`
    };
  }

  return schema;
};

export const generateSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Emporva',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AI-powered property services platform that diagnoses home issues, connects homeowners with verified contractors, and coordinates multi-trade projects.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Core Plan',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with limited monthly credits for AI diagnostics and utility uploads'
    },
    {
      '@type': 'Offer',
      name: 'Premium Plan',
      price: '12',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '12',
        priceCurrency: 'USD',
        unitCode: 'MON'
      },
      description: 'Unlimited AI diagnostics, Property Memory, and utility insights'
    }
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1'
  }
});

export const generateServiceSchema = (
  serviceName: string,
  description: string,
  url: string,
  serviceType?: string,
  priceRange?: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}${url}#service`,
  name: serviceName,
  description: description,
  url: `${SITE_URL}${url}`,
  serviceType: serviceType || 'Property Services',
  provider: {
    '@id': `${SITE_URL}/#organization`
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States'
  },
  ...(priceRange && { priceRange })
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${SITE_URL}${items[items.length - 1]?.url || '/'}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`
  }))
});

export const generateArticleSchema = (
  title: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified: string,
  image?: string,
  author?: string,
  options?: {
    wordCount?: number;
    articleSection?: string;
    keywords?: string[];
    articleBody?: string;
  }
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${url}#article`,
  headline: title,
  description: description,
  url: url,
  datePublished: datePublished,
  dateModified: dateModified,
  image: image || DEFAULT_OG_IMAGE,
  inLanguage: 'en-US',
  ...(options?.wordCount && { wordCount: options.wordCount }),
  ...(options?.articleSection && { articleSection: options.articleSection }),
  ...(options?.keywords && { keywords: options.keywords.join(', ') }),
  ...(options?.articleBody && { articleBody: options.articleBody }),
  author: {
    '@type': author ? 'Person' : 'Organization',
    name: author || SITE_NAME,
    ...(author ? {} : { '@id': `${SITE_URL}/#organization` })
  },
  publisher: {
    '@id': `${SITE_URL}/#organization`
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${url}#webpage`
  },
  isPartOf: {
    '@id': `${SITE_URL}/blog#webpage`
  }
});

export const generateHowToSchema = (
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: name,
  description: description,
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
    ...(step.image && { image: step.image })
  }))
});

export const generateLocalBusinessSchema = (
  city: string,
  state: string,
  serviceArea?: string[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: `Emporva ${city}`,
  description: `AI-powered property services and contractor matching in ${city}, ${state}. Connect with verified local contractors for home repairs, renovations, and maintenance.`,
  url: `${SITE_URL}/locations/${city.toLowerCase().replace(/\s+/g, '-')}`,
  areaServed: serviceArea?.map(area => ({
    '@type': 'City',
    name: area
  })) || [{
    '@type': 'City',
    name: city
  }],
  address: {
    '@type': 'PostalAddress',
    addressLocality: city,
    addressRegion: state,
    addressCountry: 'US'
  },
  parentOrganization: {
    '@id': `${SITE_URL}/#organization`
  }
});

export const generateProductSchema = (
  name: string,
  description: string,
  price: string,
  priceCurrency: string = 'USD'
) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: name,
  description: description,
  brand: {
    '@type': 'Brand',
    name: SITE_NAME
  },
  offers: {
    '@type': 'Offer',
    price: price,
    priceCurrency: priceCurrency,
    availability: 'https://schema.org/InStock'
  }
});

export const generateBlogListingSchema = (
  articles: Array<{
    title: string;
    url: string;
    datePublished: string;
    image?: string;
    description?: string;
  }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/blog#collectionpage`,
  name: 'Emporva Blog',
  description: 'Guides, checklists, and real world insights to help you care for your property with confidence.',
  url: `${SITE_URL}/blog`,
  isPartOf: {
    '@id': `${SITE_URL}/#website`
  },
  publisher: {
    '@id': `${SITE_URL}/#organization`
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: article.url,
      name: article.title,
      image: article.image || DEFAULT_OG_IMAGE
    }))
  }
});

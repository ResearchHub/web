import { SITE_CONFIG } from '@/lib/metadata';

interface Document {
  title?: string;
  abstract?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    type?: string;
    alt?: string;
  }>;
  createdDate?: string;
  updatedDate?: string;
  expirationDate?: string;
  authors?: Array<{ name: string; url?: string }>;
  citations?: Array<{ name: string; url?: string }>;
  tags?: string[];
  section?: string;
  type?: string;
}

export function generateDocumentStructuredData(document: Document) {
  if (!document) return null;

  const headline = document.title || '';
  const truncatedHeadline = headline.length > 60 ? headline.substring(0, 57) + '...' : headline;

  return {
    '@context': 'https://schema.org',
    '@type': getSchemaType(document),
    headline: truncatedHeadline,
    description: document.abstract || document.title || '',
    ...(document.images?.[0]?.url && {
      image: {
        '@type': 'ImageObject',
        url: document.images[0].url,
        width: document.images[0].width || 1200,
        height: document.images[0].height || 630,
        ...(document.images[0].type && { encodingFormat: document.images[0].type }),
        ...(document.images[0].alt && { caption: document.images[0].alt }),
      },
    }),
    ...(document.createdDate && { datePublished: document.createdDate }),
    ...(document.updatedDate && { dateModified: document.updatedDate }),
    ...(document.expirationDate && { dateCreated: document.expirationDate }),
    ...(document.authors &&
      document.authors.length > 0 && {
        author: document.authors.map((author) => ({
          '@type': 'Person',
          name: author.name,
          ...(author.url && { url: author.url }),
        })),
      }),
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
        width: 512,
        height: 512,
      },
      url: SITE_CONFIG.url,
    },
    ...(document.section && { articleSection: document.section }),
    ...(document.tags && document.tags.length > 0 && { keywords: document.tags.join(', ') }),
    ...(document.citations &&
      document.citations.length > 0 && {
        citation: document.citations.map((citation) => ({
          '@type': 'CreativeWork',
          name: citation.name || 'Citation',
          ...(citation.url && { url: citation.url }),
        })),
      }),
    inLanguage: 'en-US',
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      'https://twitter.com/researchhub',
      'https://github.com/ResearchHub',
      'https://www.linkedin.com/company/researchhub',
    ],
    foundingDate: '2019',
    founders: [
      {
        '@type': 'Person',
        name: 'Brian Armstrong',
      },
      {
        '@type': 'Person',
        name: 'Patrick Joyce',
      },
      {
        '@type': 'Person',
        name: 'Kobe Attias',
      },
    ],
  };
}

export function buildProfileSEOMeta(profile: {
  name: string;
  firstName?: string;
  lastName?: string;
  url: string;
  image?: string;
  headline?: string;
  description?: string;
}): Record<string, string> {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      ...(profile.firstName && { givenName: profile.firstName }),
      ...(profile.lastName && { familyName: profile.lastName }),
      url: `${SITE_CONFIG.url}${profile.url}`,
      ...(profile.image && { image: profile.image }),
      ...(profile.headline && { jobTitle: profile.headline }),
      ...(profile.description && { description: profile.description }),
    },
  };

  return {
    ...(profile.firstName && { 'profile:first_name': profile.firstName }),
    ...(profile.lastName && { 'profile:last_name': profile.lastName }),
    'application/ld+json': JSON.stringify(jsonLd),
  };
}

export function generateFAQStructuredData(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function getSchemaType(document: Document): string {
  switch (document.type) {
    case 'Paper':
      return 'ScholarlyArticle';
    case 'Grant Proposal':
      return 'Grant';
    case 'Proposal':
      return 'CreativeWork';
    case 'Post':
      return 'Article';
    default:
      return 'Article';
  }
}

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

  // Practice #2: Keep titles concise
  const headline = document.title || '';
  const truncatedHeadline = headline.length > 60 ? headline.substring(0, 57) + '...' : headline;

  return {
    '@context': 'https://schema.org',
    '@type': getSchemaType(document),
    headline: truncatedHeadline,
    description: document.abstract || document.title || '',

    // Image with structured properties
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

    // Article-specific dates
    ...(document.createdDate && { datePublished: document.createdDate }),
    ...(document.updatedDate && { dateModified: document.updatedDate }),
    ...(document.expirationDate && { dateCreated: document.expirationDate }),

    // Authors with proper structure
    ...(document.authors &&
      document.authors.length > 0 && {
        author: document.authors.map((author: any) => ({
          '@type': 'Person',
          name: author.name,
          ...(author.url && { url: author.url }),
        })),
      }),

    // Publisher information
    publisher: {
      '@type': 'Organization',
      name: 'ResearchHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://researchhub.com/logo.png',
        width: 512,
        height: 512,
      },
      url: 'https://researchhub.com',
    },

    // Article-specific properties
    ...(document.section && { articleSection: document.section }),
    ...(document.tags && document.tags.length > 0 && { keywords: document.tags.join(', ') }),

    // Citations
    ...(document.citations &&
      document.citations.length > 0 && {
        citation: document.citations.map((citation: any) => ({
          '@type': 'CreativeWork',
          name: citation.name || 'Citation',
          ...(citation.url && { url: citation.url }),
        })),
      }),

    // Language and locale
    inLanguage: 'en-US',
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

import { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'ResearchHub',
  description:
    'ResearchHub is a collaborative community seeking to improve prioritization, collaboration, reproducibility, and funding of scientific research. Join us to discuss and discover academic research.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://researchhub.com',
  ogImage: '/og-card-preview.png',
  twitterHandle: '@researchhub',
  locale: 'en_US',
} as const;

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  authors?: string[];
  tags?: string[];
  section?: string;
  determiner?: 'a' | 'an' | 'the' | '' | 'auto';
  locale?: string;
}

export function buildOpenGraphMetadata(data: OpenGraphData): Metadata {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    expirationTime,
    authors,
    tags,
    section,
    determiner,
    locale = SITE_CONFIG.locale,
  } = data;

  // Practice #2: Keep titles under 55-60 characters, descriptions under 60-65 characters
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const truncatedDescription =
    description.length > 65 ? description.substring(0, 62) + '...' : description;

  // Use dynamic OG image generation if no custom image is provided
  const ogImage =
    image ||
    `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(truncatedTitle)}&description=${encodeURIComponent(truncatedDescription)}`;

  const fullUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;

  return {
    title: truncatedTitle,
    description: truncatedDescription,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      // Practice #1: Specify content type
      type,
      // Practice #7: Use unique locale
      locale,
      // Practice #5: Canonical URL
      url: fullUrl,
      // Practice #6: Site name for brand consistency
      siteName: SITE_CONFIG.name,
      title: truncatedTitle,
      description: truncatedDescription,
      // Practice #3 & #4: High-quality images with dimensions
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: truncatedTitle,
        },
      ],
      // Practice #9: Include updated time
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(expirationTime && { expirationTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
      ...(section && { section }),
      ...(determiner && { determiner }),
    },
    // Practice #14: Leverage Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: truncatedTitle,
      description: truncatedDescription,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
    },
  };
}

export function buildArticleMetadata(
  data: OpenGraphData & {
    publishedTime: string;
    authors: string[];
    tags?: string[];
    section?: string;
  }
): Metadata {
  return buildOpenGraphMetadata({
    ...data,
    type: 'article',
  });
}

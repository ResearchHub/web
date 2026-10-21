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

const truncateOgTitle = (title: string) =>
  title.length > 60 ? title.substring(0, 57) + '...' : title;

const truncateOgDescription = (description: string) =>
  description.length > 155 ? description.substring(0, 152) + '...' : description;

/** The generated card image a page gets when it has no image of its own. */
export function buildDefaultOgImageUrl(title: string, description: string): string {
  return `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(truncateOgTitle(title))}&description=${encodeURIComponent(truncateOgDescription(description))}`;
}

export function buildOpenGraphMetadata(data: OpenGraphData): Metadata {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    authors,
    tags,
    determiner,
    locale = SITE_CONFIG.locale,
  } = data;

  const truncatedTitle = truncateOgTitle(title);
  const truncatedDescription = truncateOgDescription(description);

  // Use dynamic OG image generation if no custom image is provided
  const ogImage = image || buildDefaultOgImageUrl(title, description);

  const fullUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;

  return {
    title: truncatedTitle,
    description: truncatedDescription,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type,
      locale,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      title: truncatedTitle,
      description: truncatedDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: truncatedTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
      ...(determiner && { determiner }),
    },
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
  const base = buildOpenGraphMetadata({ ...data, type: 'article' });

  const articleMeta: Record<string, string> = {};
  if (data.modifiedTime) articleMeta['article:modified_time'] = data.modifiedTime;
  if (data.expirationTime) articleMeta['article:expiration_time'] = data.expirationTime;
  if (data.section) articleMeta['article:section'] = data.section;

  return {
    ...base,
    other: Object.keys(articleMeta).length > 0 ? articleMeta : undefined,
  };
}

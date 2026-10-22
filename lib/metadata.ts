import { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'ResearchHub',
  description:
    'ResearchHub is a collaborative community seeking to improve prioritization, collaboration, reproducibility, and funding of scientific research. Join us to discuss and discover academic research.',
  // The www host is the one the site is served from; the bare domain 308s to it.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.researchhub.com',
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

/**
 * Bump when the generated card design or the share-image resizing changes, so
 * link cards stop matching URLs that browsers and crawlers already cached.
 */
const OG_IMAGE_VERSION = '1';

/**
 * Card images are keyed by their URL, so content edits get new URLs. The CDN
 * keeps them until the next deploy; downstream caches recheck daily.
 */
export const OG_IMAGE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000';

/** Hosts whose uploads `/api/og/image` will resize into share images. */
export const SHARE_IMAGE_HOSTS = [
  'storage.prod.researchhub.com',
  'storage.staging.researchhub.com',
  'storage.dev.researchhub.com',
  'researchhub-dev-storage.s3.amazonaws.com',
];

/** The generated card image a page gets when it has no image of its own. */
export function buildDefaultOgImageUrl(title: string, description: string): string {
  return `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(truncateOgTitle(title))}&description=${encodeURIComponent(truncateOgDescription(description))}&v=${OG_IMAGE_VERSION}`;
}

/**
 * Routes an uploaded image through `/api/og/image`, which serves a small JPEG
 * instead of the multi-megabyte original. Other images pass through as is.
 */
export function buildShareImageUrl(image: string): string {
  let host: string;
  try {
    host = new URL(image).hostname;
  } catch {
    // A relative path is one of our static assets, already sized for cards.
    return image;
  }
  if (!SHARE_IMAGE_HOSTS.includes(host)) return image;
  return `${SITE_CONFIG.url}/api/og/image?url=${encodeURIComponent(image)}&v=${OG_IMAGE_VERSION}`;
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
  const ogImage = image ? buildShareImageUrl(image) : buildDefaultOgImageUrl(title, description);

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

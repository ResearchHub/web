import type { ContentType } from '@/types/work';

export const ALL_CONTENT_TYPES: readonly ContentType[] = [
  'paper',
  'post',
  'preregistration',
  'question',
  'discussion',
  'funding_request',
];

// URL path segment (first path segment) → ContentType. Aligns with app routes: /paper/, /post/, /question/, /fund/, /grant/
const ROUTE_SEGMENT_TO_CONTENT_TYPE: Record<string, ContentType> = {
  paper: 'paper',
  post: 'post',
  question: 'question',
  fund: 'preregistration',
  grant: 'funding_request',
};

const SUPPORTED_ROUTE_SEGMENTS = Object.keys(ROUTE_SEGMENT_TO_CONTENT_TYPE).join(', ');

export type ParsedResearchHubUrl = {
  contentType: ContentType;
  documentId: string;
};

/**
 * Parses a ResearchHub URL and extracts the content type and document ID.
 *
 * Supported URL patterns (aligned with app routes):
 *   /paper/:id/..., /post/:id/..., /question/:id/..., /fund/:id/..., /grant/:id/...
 *
 * @throws {Error} if the URL is not from the current site or can't be parsed
 */
export function parseResearchHubUrl(url: string): ParsedResearchHubUrl {
  const result = validateResearchHubUrl(url);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.parsed;
}

/**
 * Validates a ResearchHub URL without throwing.
 * Use this for Zod refinements and when you need the parsed result or a user-facing error message.
 */
export function validateResearchHubUrl(
  url: string
): { success: true; parsed: ParsedResearchHubUrl } | { success: false; error: string } {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { success: false, error: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmedUrl);
  } catch {
    return {
      success: false,
      error: 'Invalid URL format, e.g., https://researchhub.com/paper/123/...',
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (siteUrl) {
    let siteOrigin: string;
    try {
      siteOrigin = new URL(siteUrl).origin;
    } catch {
      siteOrigin = siteUrl;
    }
    if (parsed.origin !== siteOrigin) {
      return {
        success: false,
        error: `URL must be from ${siteOrigin}. Received a URL from ${parsed.origin}`,
      };
    }
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    return {
      success: false,
      error: 'URL must include a content type and ID (e.g., /paper/123/...)',
    };
  }

  const segmentRaw = segments[0].toLowerCase();
  const documentId = segments[1];

  const contentType = ROUTE_SEGMENT_TO_CONTENT_TYPE[segmentRaw];
  if (!contentType) {
    return {
      success: false,
      error: `Unsupported content type "${segmentRaw}". Supported route segments: ${SUPPORTED_ROUTE_SEGMENTS}`,
    };
  }

  if (!/^\d+$/.test(documentId)) {
    return {
      success: false,
      error: `Invalid document ID "${documentId}". Expected a numeric ID`,
    };
  }

  return { success: true, parsed: { contentType, documentId } };
}

/**
 * Converts a string to a URL-friendly slug
 * Example: "Hello World!" -> "hello-world"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Builds a work URL from an ID and optional slug
 */
export const buildWorkUrl = ({
  id,
  contentType,
  doi,
  slug,
  tab,
}: {
  id?: string | number | null;
  contentType: ContentType;
  doi?: string | null;
  slug?: string;
  tab?: 'reviews' | 'bounties' | 'conversation';
}) => {
  let baseUrl = '';

  switch (contentType) {
    case 'post':
    case 'discussion':
      if (!id) return '#'; // Return a safe fallback for posts or discussions without ID
      baseUrl = slug ? `/post/${id}/${slug}` : `/post/${id}`;
      break;
    case 'funding_request':
      if (!id) return '#'; // Return a safe fallback for grants without ID
      baseUrl = slug ? `/grant/${id}/${slug}` : `/grant/${id}`;
      break;
    case 'preregistration':
      if (!id) return '#'; // Return a safe fallback for proposals without ID
      baseUrl = slug ? `/fund/${id}/${slug}` : `/fund/${id}`;
      break;
    case 'question':
      if (!id) return '#'; // Return a safe fallback for questions without ID
      baseUrl = slug ? `/question/${id}/${slug}` : `/question/${id}`;
      break;
    case 'paper':
      if (id) {
        baseUrl = slug ? `/paper/${id}/${slug}` : `/paper/${id}`;
      } else if (doi) {
        baseUrl = `/paper?doi=${encodeURIComponent(doi)}`;
      } else {
        return '#'; // Return a safe fallback URL when neither id nor doi is available
      }
      break;
    default:
      // Fallback for unknown content types
      if (id) {
        baseUrl = slug ? `/paper/${id}/${slug}` : `/paper/${id}`;
      } else if (doi) {
        baseUrl = `/paper?doi=${encodeURIComponent(doi)}`;
      } else {
        return '#'; // Return a safe fallback URL when neither id nor doi is available
      }
      break;
  }

  // Append tab if provided
  if (tab) {
    baseUrl += `/${tab}`;
  }

  return baseUrl;
};

/**
 * Builds an author URL from an ID and optional name
 */
export const buildAuthorUrl = (id: string | number) => {
  return `/author/${id}`;
};

/**
 * Builds a topic URL from a slug
 */
export const buildTopicUrl = (slug: string) => {
  return `/topic/${slug}`;
};

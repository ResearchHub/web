import { ContentType } from '@/types/work';

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
  contentType: 'paper' | 'post' | 'funding_request' | 'preregistration';
  doi?: string | null;
  slug?: string;
  tab?: 'reviews' | 'bounties' | 'conversation';
}) => {
  let baseUrl = '';

  if (contentType === 'post') {
    if (!id) return '#'; // Return a safe fallback for posts without ID
    baseUrl = slug ? `/post/${id}/${slug}` : `/post/${id}`;
  } else if (contentType === 'funding_request' || contentType === 'preregistration') {
    if (!id) return '#'; // Return a safe fallback for funding requests without ID
    baseUrl = slug ? `/fund/${id}/${slug}` : `/fund/${id}`;
  } else {
    // For papers
    if (id) {
      baseUrl = slug ? `/paper/${id}/${slug}` : `/paper/${id}`;
    } else if (doi) {
      baseUrl = `/paper?doi=${encodeURIComponent(doi)}`;
    } else {
      return '#'; // Return a safe fallback URL when neither id nor doi is available
    }
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

export const WORK_ROUTE_PATTERNS: Array<{
  pattern: RegExp;
  contentType: ContentType;
}> = [
  { pattern: /^\/paper\/(\d+)\/([^\/]+)/, contentType: 'paper' },
  { pattern: /^\/post\/(\d+)\/([^\/]+)/, contentType: 'post' },
  { pattern: /^\/fund\/(\d+)\/([^\/]+)/, contentType: 'preregistration' },
  { pattern: /^\/question\/(\d+)\/([^\/]+)/, contentType: 'question' },
  { pattern: /^\/grant\/(\d+)\/([^\/]+)/, contentType: 'funding_request' },
];

/**
 * Extracts work document information from a pathname
 * Returns null if the pathname doesn't match any work document pattern
 */
export const extractWorkDocumentInfo = (
  pathname: string
): {
  contentType: ContentType;
  workId: string;
  workSlug: string;
} | null => {
  const match = WORK_ROUTE_PATTERNS.find(({ pattern }) => pattern.test(pathname));

  if (match) {
    const [, workId, workSlug] = pathname.match(match.pattern) || [];

    if (workId) {
      return {
        contentType: match.contentType,
        workId,
        workSlug,
      };
    }
  }

  return null;
};

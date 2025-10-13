import { ContentType } from '@/types/work';
import { ID } from '@/types/root';

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
  id?: ID;
  contentType: ContentType;
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

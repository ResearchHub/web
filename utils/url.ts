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
      if (!id) return '#'; // Return a safe fallback for opportunities without ID
      baseUrl = slug ? `/opportunity/${id}/${slug}` : `/opportunity/${id}`;
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

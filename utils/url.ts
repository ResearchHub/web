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
}: {
  id?: string | number | null;
  contentType: 'paper' | 'post';
  doi?: string | null;
  slug?: string;
}) => {
  if (contentType === 'post') {
    if (!id) return '#'; // Return a safe fallback for posts without ID
    return `/post/${id}`;
  }

  // For papers
  if (id) {
    return `/paper/${id}`;
  }

  if (doi) {
    return `/paper?doi=${encodeURIComponent(doi)}`;
  }

  return '#'; // Return a safe fallback URL when neither id nor doi is available
};

/**
 * Builds an author URL from an ID and optional name
 */
export const buildAuthorUrl = (id: string | number) => {
  return `/author/${id}`;
};

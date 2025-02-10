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
export function buildWorkUrl(id: number | string, title?: string): string {
  const slug = title ? generateSlug(title) : '';
  return `/work/${id}${slug ? '/' + slug : ''}`;
}

/**
 * Builds an author URL from an ID and optional name
 */
export function buildAuthorUrl(id: number | string, name?: string): string {
  const slug = name ? generateSlug(name) : '';
  return `/author/${id}${slug ? '/' + slug : ''}`;
}

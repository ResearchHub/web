import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML to only allow <mark> tags for search highlighting
 * All other tags will be escaped to prevent XSS attacks
 */
export function sanitizeHighlightHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['mark'],
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  });
}

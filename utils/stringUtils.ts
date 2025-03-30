/**
 * Utility functions for string manipulation
 */

/**
 * Truncates a string to a specified maximum length and adds an ellipsis if truncated
 * @param text The text to truncate
 * @param maxLength The maximum length of the text (default: 200)
 * @returns The truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Strips HTML tags from a string
 * @param html The HTML string to strip
 * @returns The plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim();
};

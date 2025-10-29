/**
 * Highlights search query terms in text by wrapping them in <mark> tags
 * @param text The text to highlight terms in
 * @param query The search query containing terms to highlight
 * @returns Text with terms wrapped in <mark> tags
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!text || !query) {
    return text;
  }

  // Split query into individual terms and clean them
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2) // Only highlight terms longer than 2 chars
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex special chars

  if (terms.length === 0) {
    return text;
  }

  // Create a regex pattern that matches any of the terms (case-insensitive, whole word)
  const pattern = new RegExp(`\\b(${terms.join('|')})\\w*`, 'gi');

  // Replace matches with marked versions
  const highlighted = text.replace(pattern, '<mark>$&</mark>');

  return highlighted;
}

/**
 * Extracts plain text from an already highlighted string (removes <mark> tags)
 * @param highlightedText Text that may contain <mark> tags
 * @returns Plain text without any HTML tags
 */
export function stripHighlightTags(highlightedText: string): string {
  return highlightedText.replace(/<\/?mark>/g, '');
}

/**
 * Checks if text already contains highlight markers
 * @param text Text to check
 * @returns True if text contains <mark> tags
 */
export function hasHighlights(text: string): boolean {
  return text.includes('<mark>');
}

/**
 * Highlights search terms in text, but only if it doesn't already have highlights
 * @param text The text to highlight
 * @param query The search query
 * @returns Highlighted text
 */
export function ensureHighlights(text: string, query: string): string {
  if (hasHighlights(text)) {
    return text;
  }
  return highlightSearchTerms(text, query);
}

import { FeedEntry } from './feed';

/**
 * SearchResult wraps a FeedEntry with search-specific metadata
 * including highlighting and match information.
 */
export interface SearchResult {
  entry: FeedEntry;
  highlightedTitle?: string;
  highlightedSnippet?: string;
  matchedField?: string;
}

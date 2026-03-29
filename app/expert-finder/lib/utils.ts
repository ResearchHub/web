import type { ExpertSearchListItem } from '@/types/expertFinder';
import type { AuthorProfile } from '@/types/authorProfile';

/** Default max length for picker / list item titles */
export const SEARCH_DISPLAY_DEFAULT_MAX = 80;
/** Max length for library table name column */
export const SEARCH_DISPLAY_TABLE_MAX = 60;

export interface GetSearchDisplayTextOptions {
  maxLength?: number;
  /** Shown when name and query are both empty */
  emptyLabel?: string;
}

/**
 * Display string for an expert search (name, else query), truncated with ellipsis.
 */
export function getSearchDisplayText(
  search: ExpertSearchListItem,
  options?: GetSearchDisplayTextOptions
): string {
  const maxLength = options?.maxLength ?? SEARCH_DISPLAY_DEFAULT_MAX;
  const emptyLabel = options?.emptyLabel ?? 'Untitled search';
  const text = (search.name || search.query || '').trim();
  if (!text) return emptyLabel;
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;
}

/** Library table / mobile card: shorter truncate, em dash when empty */
export function getSearchTableDisplayText(search: ExpertSearchListItem): string {
  return getSearchDisplayText(search, {
    maxLength: SEARCH_DISPLAY_TABLE_MAX,
    emptyLabel: '—',
  });
}

/**
 * Short author label for compact UI, e.g. "Nick T." from first name + last initial.
 */
export function getShortAuthorName(author: AuthorProfile | null | undefined): string {
  if (!author) return '';
  const first = author.firstName?.trim();
  const last = author.lastName?.trim();
  if (first && last) return `${first} ${last.charAt(0)}.`;
  if (author.fullName?.trim()) {
    const parts = author.fullName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    return parts[0];
  }
  return '';
}

export const EXPERT_FINDER_LIST_PAGE_SIZE = 10;

export const EXPERT_FINDER_OUTREACH_PAGE_SIZE = 100;

export const PAGE_QUERY = 'page';

/**
 * Parses a positive integer page from the query string. Invalid or missing → 1.
 */
export function parsePageQueryParam(value: string | null): number {
  if (value == null || value === '') return 1;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

import activityFeed from './demo-fixtures/activity-feed.json';
import grantFeed from './demo-fixtures/grant-feed.json';
import fundingFeed from './demo-fixtures/funding-feed.json';

const EMPTY_PAGE = { count: 0, next: null, previous: null, results: [] };

/**
 * Returns demo fixture data for known endpoints, or undefined to fall through
 * to the real network. Only active when NEXT_PUBLIC_DEMO_MODE=true.
 *
 * Handles pagination: fixture data is returned for page 1 (or no page param);
 * subsequent pages return an empty list so hasMore terminates cleanly.
 */
export function getDemoResponse(path: string): unknown | undefined {
  const url = path.split('?')[0].replace(/\/$/, '');
  const qs = path.includes('?') ? new URLSearchParams(path.split('?')[1]) : null;
  const page = qs ? parseInt(qs.get('page') ?? '1', 10) : 1;

  if (url.endsWith('/api/activity_feed')) {
    // Drop `next` so hasMore terminates after the fixture page.
    return page === 1 ? { ...activityFeed, next: null } : EMPTY_PAGE;
  }

  if (url.endsWith('/api/grant_feed')) {
    return page === 1 ? { ...grantFeed, next: null } : EMPTY_PAGE;
  }

  if (url.endsWith('/api/funding_feed')) {
    return page === 1 ? { ...fundingFeed, next: null } : EMPTY_PAGE;
  }

  return undefined;
}

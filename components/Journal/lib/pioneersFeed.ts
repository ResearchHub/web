import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import rawPioneersEntries from './pioneersFeedEntries.json';

/**
 * The Pioneers page lists everything published under the previous journal format.
 * That catalog is closed, so the entries are a frozen snapshot of `/api/journal_feed`
 * (`journal_status=IN_JOURNAL`) rather than a live request.
 */
export function buildPioneersFeedEntries(): FeedEntry[] {
  return (rawPioneersEntries as unknown as RawApiFeedEntry[])
    .map((entry) => {
      try {
        return transformFeedEntry(entry);
      } catch (error) {
        console.error('Error transforming pioneers feed entry:', error);
        return null;
      }
    })
    .filter((entry): entry is FeedEntry => !!entry);
}

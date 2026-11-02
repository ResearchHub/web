'use client';

import { ActivityCardCompact } from '@/components/Activity/cards/ActivityCardCompact';
import { Button } from '@/components/ui/Button';
import { SidebarCard, SidebarCardSkeleton } from '@/components/ui/SidebarCard';
import type { FeedEntry } from '@/types/feed';
import { ID } from '@/types/root';

/** The sidebar shows the latest few; a page with an Activity tab has the rest. */
export const RECENT_ACTIVITY_MAX_SHOWN = 8;

interface RecentActivityCardProps {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore?: boolean;
  /** The page's own post: its title isn't repeated on every row. */
  currentDocumentId?: ID;
  /** Opens the page's full activity. Without it the card has no "See all". */
  onSeeAll?: () => void;
}

/**
 * A page's recent activity as one sidebar card, each row linking to what it is
 * about. The page brings the feed, so the card fits any document's activity.
 */
export function RecentActivityCard({
  entries,
  isLoading,
  hasMore = false,
  currentDocumentId,
  onSeeAll,
}: RecentActivityCardProps) {
  if (isLoading && entries.length === 0) return <SidebarCardSkeleton />;
  if (entries.length === 0) return null;

  return (
    <SidebarCard title="Recent activity">
      <div className="-mx-2 mt-2 flex flex-col">
        {entries.slice(0, RECENT_ACTIVITY_MAX_SHOWN).map((entry) => (
          <ActivityCardCompact
            key={entry.id}
            entry={entry}
            currentDocumentId={currentDocumentId}
            rowLink
          />
        ))}
      </div>
      {onSeeAll && (hasMore || entries.length > RECENT_ACTIVITY_MAX_SHOWN) && (
        <Button variant="outlined" size="sm" onClick={onSeeAll} className="mt-3 w-full">
          See all activity
        </Button>
      )}
    </SidebarCard>
  );
}

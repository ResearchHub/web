'use client';

import { useGrantPage } from '@/components/Funding/GrantPageContent';
import { ActivityCardCompact } from '@/components/Activity/cards/ActivityCardCompact';
import { Button } from '@/components/ui/Button';
import { SidebarCard, SidebarCardSkeleton } from '@/components/ui/SidebarCard';
import { ID } from '@/types/root';

/**
 * The RFP's recent activity as one card under the pool card. Each row links to
 * what it is about. Reads the feed the page already loads for the Activity tab.
 */
export function GrantActivityCard({
  currentDocumentId,
}: {
  /** The RFP's own post: its title isn't repeated on every row. */
  currentDocumentId?: ID;
}) {
  const { activity } = useGrantPage();
  const { entries, isLoading, hasMore, isLoadingMore, loadMore } = activity;

  if (isLoading && entries.length === 0) return <SidebarCardSkeleton />;
  if (entries.length === 0) return null;

  return (
    <SidebarCard title="Recent activity">
      <div className="-mx-2 mt-2 flex flex-col">
        {entries.map((entry) => (
          <ActivityCardCompact
            key={entry.id}
            entry={entry}
            currentDocumentId={currentDocumentId}
            rowLink
          />
        ))}
      </div>
      {hasMore && (
        <Button
          variant="outlined"
          size="sm"
          onClick={loadMore}
          disabled={isLoadingMore}
          className="mt-3 w-full"
        >
          {isLoadingMore ? 'Loading…' : 'Show more'}
        </Button>
      )}
    </SidebarCard>
  );
}

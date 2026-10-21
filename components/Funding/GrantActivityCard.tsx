'use client';

import { useGrantActivity, useGrantPage } from '@/components/Funding/GrantPageContext';
import { ActivityCardCompact } from '@/components/Activity/cards/ActivityCardCompact';
import { Button } from '@/components/ui/Button';
import { SidebarCard, SidebarCardSkeleton } from '@/components/ui/SidebarCard';
import { ID } from '@/types/root';

/** The sidebar shows the latest few; the Activity tab has the rest. */
const MAX_SHOWN = 5;

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
  const { showTab } = useGrantPage();
  const { entries, isLoading, hasMore } = useGrantActivity();

  if (isLoading && entries.length === 0) return <SidebarCardSkeleton />;
  if (entries.length === 0) return null;

  return (
    <SidebarCard title="Recent activity">
      <div className="-mx-2 mt-2 flex flex-col">
        {entries.slice(0, MAX_SHOWN).map((entry) => (
          <ActivityCardCompact
            key={entry.id}
            entry={entry}
            currentDocumentId={currentDocumentId}
            rowLink
          />
        ))}
      </div>
      {(hasMore || entries.length > MAX_SHOWN) && (
        <Button
          variant="outlined"
          size="sm"
          onClick={() => showTab('activity')}
          className="mt-3 w-full"
        >
          See all activity
        </Button>
      )}
    </SidebarCard>
  );
}

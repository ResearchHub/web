'use client';

import { FeedContent } from '@/components/Feed/FeedContent';
import { PillTabs } from '@/components/ui/PillTabs';
import { useFeed } from '@/hooks/useFeed';

export const ACTIVITY_PILLS = [
  { id: 'publications', label: 'Publications' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'peer-reviews', label: 'Peer Reviews' },
  { id: 'comments', label: 'Comments' },
  { id: 'bounties', label: 'Bounties' },
];

export type ActivityPillId = (typeof ACTIVITY_PILLS)[number]['id'];

export function isActivityPill(id: string): id is ActivityPillId {
  return ACTIVITY_PILLS.some((pill) => pill.id === id);
}

interface ProfileActivityTabProps {
  activePill: ActivityPillId;
  onPillChange: (pillId: ActivityPillId) => void;
  userId?: number;
  children: React.ReactNode;
}

function ProposalsContent({ userId }: { userId: number }) {
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    contentType: 'PREREGISTRATION',
    createdBy: userId,
    ordering: 'newest',
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No proposals yet</p>
        </div>
      }
    />
  );
}

/**
 * Activity tab — thin wrapper rendering the pill bar + whatever feed the
 * parent decided to render for the active pill. Proposals is rendered
 * internally since it uses a different data source than the contributions feed.
 */
export function ProfileActivityTab({
  activePill,
  onPillChange,
  userId,
  children,
}: ProfileActivityTabProps) {
  return (
    <div>
      <div className="mb-4">
        <PillTabs
          tabs={ACTIVITY_PILLS}
          activeTab={activePill}
          onTabChange={(id) => onPillChange(id as ActivityPillId)}
          size="sm"
        />
      </div>
      {activePill === 'proposals' && userId ? <ProposalsContent userId={userId} /> : children}
    </div>
  );
}

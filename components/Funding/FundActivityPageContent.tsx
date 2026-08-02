'use client';

import { useInView } from 'react-intersection-observer';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';
import { useActivityFeed } from '@/hooks/useActivityFeed';

export function FundActivityPageContent() {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useActivityFeed({});

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
  });

  return (
    <div>
      {entries.map((entry) => (
        <ActivityCardFull key={entry.id} entry={entry} />
      ))}

      {(isLoading || isLoadingMore) &&
        [...Array(6)].map((_, i) => <ActivityCardSkeleton key={i} />)}

      {!isLoading && !isLoadingMore && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No activity found</p>
        </div>
      )}

      {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}

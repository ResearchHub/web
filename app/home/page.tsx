'use client';

import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeletonList } from '@/components/Activity/ActivityCardSkeleton';
import { HomeRightSidebar } from '@/components/Home/HomeRightSidebar';
import { useActivityFeed } from '@/hooks/useActivityFeed';

export default function HomePage() {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useActivityFeed();

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: useCallback(
      (inView: boolean) => {
        if (inView && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      [hasMore, isLoading, isLoadingMore, loadMore]
    ),
  });

  return (
    <PageLayout rightSidebar={<HomeRightSidebar />}>
      <div className="max-w-[600px] mx-auto">
        <div>
          {entries.map((entry) => (
            <ActivityCardFull
              key={entry.id}
              entry={entry}
              hideReviewToggle
              showThumbnail
              highlightReviewOpportunities
            />
          ))}

          {(isLoading || isLoadingMore) && <ActivityCardSkeletonList />}

          {!isLoading && !isLoadingMore && entries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No activity found</p>
            </div>
          )}
        </div>

        {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
      </div>
    </PageLayout>
  );
}

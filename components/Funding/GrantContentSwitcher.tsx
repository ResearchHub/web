'use client';

import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';

interface GrantContentSwitcherProps {
  children: ReactNode;
  content?: string;
  imageUrl?: string;
}

export function GrantContentSwitcher({ children, content, imageUrl }: GrantContentSwitcherProps) {
  const { activeTab, activity } = useGrantTab();
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = activity;

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
    <>
      <div className={activeTab !== 'proposals' ? 'hidden' : undefined}>{children}</div>
      <div className={activeTab !== 'details' ? 'hidden' : undefined}>
        <GrantDetailsInline content={content} imageUrl={imageUrl} />
      </div>
      <div className={activeTab !== 'activity' ? 'hidden' : undefined}>
        <div className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <ActivityCardFull key={entry.id} entry={entry} />
          ))}

          {(isLoading || isLoadingMore) &&
            [...Array(8)].map((_, i) => <ActivityCardSkeleton key={i} />)}

          {!isLoading && !isLoadingMore && entries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No activity found</p>
            </div>
          )}

          {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
        </div>
      </div>
    </>
  );
}

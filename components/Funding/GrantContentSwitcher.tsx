'use client';

import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';

interface GrantContentSwitcherProps {
  children: ReactNode;
  content?: string;
  imageUrl?: string;
  hasDescription: boolean;
  grantId?: number | string;
}

export function GrantContentSwitcher({
  children,
  content,
  imageUrl,
  hasDescription,
  grantId,
}: GrantContentSwitcherProps) {
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
        <div>
          {entries.map((entry) => (
            <ActivityCardFull key={entry.id} entry={entry} />
          ))}

          {(isLoading || isLoadingMore) && (
            <div className="py-8 space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Tabs } from '@/components/ui/Tabs';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { useActivityFeed, ActivityTab } from '@/hooks/useActivityFeed';
import { ActivityScope } from '@/services/activity.service';

const TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'peer_reviews' as const, label: 'Peer Reviews' },
];

const TAB_TO_SCOPE: Record<ActivityTab, ActivityScope | undefined> = {
  all: undefined,
  peer_reviews: 'peer_reviews',
};

function isValidTab(value: string | null): value is ActivityTab {
  return value === 'all' || value === 'peer_reviews';
}

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: ActivityTab = isValidTab(tabParam) ? tabParam : 'all';
  const scope = TAB_TO_SCOPE[activeTab];

  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useActivityFeed({ scope });

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
  });

  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === 'all') {
        params.delete('tab');
      } else {
        params.set('tab', tabId);
      }
      const qs = params.toString();
      router.push(`/activity${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, searchParams]
  );

  const tabsElement = useMemo(
    () => <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />,
    [activeTab, handleTabChange]
  );

  return (
    <PageLayout rightSidebar={false}>
      <div className="max-w-3xl mx-auto">
        {tabsElement}

        <div className="mt-4">
          {entries.map((entry) => (
            <ActivityCardFull key={entry.id} entry={entry} />
          ))}

          {(isLoading || isLoadingMore) && (
            <div className="py-8 space-y-6">
              {[...Array(3)].map((_, i) => (
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
        </div>

        {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
      </div>
    </PageLayout>
  );
}

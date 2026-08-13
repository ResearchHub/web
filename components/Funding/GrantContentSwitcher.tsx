'use client';

import { ReactNode, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';
import { ActivityFeedList } from '@/components/Activity/ActivityFeedList';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { getFeedKey } from '@/contexts/NavigationContext';

interface GrantContentSwitcherProps {
  children: ReactNode;
  content?: string;
  imageUrl?: string;
}

export function GrantContentSwitcher({ children, content, imageUrl }: GrantContentSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeTab, activity } = useGrantTab();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = activity;

  const feedKey = useMemo(() => {
    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }
    return getFeedKey({
      pathname,
      tab: restorationTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }, [pathname, restorationTab, searchParams]);

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId: lastClickedEntryId ?? undefined,
  });

  return (
    <>
      <div className={activeTab !== 'proposals' ? 'hidden' : undefined}>{children}</div>
      <div className={activeTab !== 'details' ? 'hidden' : undefined}>
        <GrantDetailsInline content={content} imageUrl={imageUrl} />
      </div>
      <div className={activeTab !== 'activity' ? 'hidden' : undefined}>
        <ActivityFeedList
          entries={entries}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </div>
    </>
  );
}

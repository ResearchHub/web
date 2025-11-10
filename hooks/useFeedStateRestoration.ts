import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigation, getFeedKey, StoredFeedState } from '@/contexts/NavigationContext';
import { FeedEntry } from '@/types/feed';

interface UseFeedStateRestorationOptions {
  activeTab?: string;
  shouldRestore?: (isBackNavigation: boolean) => boolean;
}

interface UseFeedStateRestorationReturn {
  queryParams: Record<string, string>;
  restoredState: StoredFeedState | null;
  initialEntries: FeedEntry[];
  restoredScrollPosition: number | null;
  lastClickedEntryId: string | null;
}

export function useFeedStateRestoration(
  options: UseFeedStateRestorationOptions = {}
): UseFeedStateRestorationReturn {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  }, [searchParams]);

  const restoredState = useMemo(() => {
    const shouldRestore = options.shouldRestore
      ? options.shouldRestore(isBackNavigation)
      : isBackNavigation;

    if (!shouldRestore) {
      return null;
    }

    const feedKey = getFeedKey({
      pathname,
      tab: options.activeTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      clearFeedState(feedKey);
      return savedState;
    }

    return null;
  }, [
    isBackNavigation,
    pathname,
    options.activeTab,
    queryParams,
    getFeedState,
    clearFeedState,
    options.shouldRestore,
  ]);

  const initialEntries = restoredState?.entries || [];
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId ?? null;

  return {
    queryParams,
    restoredState,
    initialEntries,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { BountyService } from '@/services/bounty.service';
import { useNavigation, getFeedKey } from '@/contexts/NavigationContext';

export const useBounties = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();

  // Read sort from URL params, default to 'personalized'
  const sortFromUrl = searchParams.get('sort') || 'personalized';

  // Check for restored state synchronously before initializing state
  const restoredState = useMemo(() => {
    const feedKey = getFeedKey({
      pathname,
      tab: undefined, // Earn page doesn't have tabs
      queryParams: { sort: sortFromUrl },
    });

    if (!isBackNavigation) {
      return null;
    }

    const savedState = getFeedState(feedKey);
    if (savedState) {
      clearFeedState(feedKey);
      return savedState;
    }
    return null;
  }, [isBackNavigation, pathname, getFeedState, clearFeedState, sortFromUrl]);

  const initialEntries = restoredState?.entries || [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState<string>(sortFromUrl);
  const hasInitialFetchRef = useRef<boolean>(false);
  const previousSortRef = useRef<string>(sortFromUrl);
  const isFetchingRef = useRef<boolean>(false);

  // Store scroll position for FeedContent to use
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId ?? null;

  // Sync sort state with URL params (don't inject default into URL)
  useEffect(() => {
    const currentSort = searchParams.get('sort');
    if (currentSort && currentSort !== sort) {
      setSort(currentSort);
    }
  }, [searchParams, sort]);

  const fetchBounties = async (reset = false) => {
    if (reset) {
      setEntries([]);
    }
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const status = 'OPEN';

      const result = await BountyService.fetchBounties({
        status,
        personalized: true,
        sort,
        onlyParentBounties: true,
        page: currentPage,
        pageSize: 10,
      });

      if (reset) {
        setEntries(result.entries);
      } else {
        setEntries((prev) => [...prev, ...result.entries]);
      }

      setHasMore(result.hasMore);
      setTotal(result.total);

      if (!reset) {
        setPage(currentPage + 1);
      } else {
        setPage(2);
      }
    } catch (error) {
      console.error('[useBounties] Error fetching bounties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const loadMore = () => {
    fetchBounties();
  };

  useEffect(() => {
    if (hasRestoredEntries && entries.length > 0) {
      hasInitialFetchRef.current = true;
      previousSortRef.current = sort;
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    const sortChanged = previousSortRef.current !== sort;

    if (!hasInitialFetchRef.current || sortChanged) {
      previousSortRef.current = sort;

      hasInitialFetchRef.current = true;
      isFetchingRef.current = true;
      setPage(1);
      fetchBounties(true).finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [sort]);

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    handleSortChange,
    restoredScrollPosition,
    page,
    total,
    lastClickedEntryId,
  };
};

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { BountyService } from '@/services/bounty.service';
import { useNavigation, getFeedKey } from '@/contexts/NavigationContext';
import { useClickContext } from '@/contexts/ClickContext';
import { Hub } from '@/components/Earn/BountyHubSelector';

export const useBounties = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();
  const { event, clearEvent } = useClickContext();

  // Read sort from URL params, default to 'personalized'
  const sortFromUrl = searchParams.get('sort') || 'personalized';

  // Read topic IDs from URL params (comma-separated)
  const hubsFromUrl = useMemo(() => {
    const topicsParam = searchParams.get('topics');
    if (!topicsParam) return [];
    return topicsParam
      .split(',')
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0);
  }, [searchParams]);

  // Check for restored state synchronously before initializing state
  const restoredState = useMemo(() => {
    const queryParams: Record<string, string> = {
      sort: sortFromUrl,
    };
    // Include topic IDs in feed key if present
    if (hubsFromUrl.length > 0) {
      queryParams.topics = hubsFromUrl.join(',');
    }

    const feedKey = getFeedKey({
      pathname,
      tab: undefined, // Earn page doesn't have tabs
      queryParams,
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
  }, [isBackNavigation, pathname, getFeedState, clearFeedState, sortFromUrl, hubsFromUrl]);

  const initialEntries = restoredState?.entries || [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);
  const selectedHubsRef = useRef<Hub[]>([]);
  const [sort, setSort] = useState<string>(sortFromUrl);
  const previousHubsParamRef = useRef<string>('');
  const hasInitialFetchRef = useRef<boolean>(false);
  const previousSortRef = useRef<string>(sortFromUrl);
  const isFetchingRef = useRef<boolean>(false);

  // Store scroll position for FeedContent to use
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId ?? null;

  // Sync sort state with URL params and set default if missing
  useEffect(() => {
    const currentSort = searchParams.get('sort');
    if (!currentSort) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', 'personalized');
      router.replace(`?${params.toString()}`, { scroll: false });
    } else if (currentSort !== sort) {
      // Sync sort state with URL (e.g., when user uses back button or handleSortChange)
      setSort(currentSort);
    }
  }, [searchParams, sort, router]);

  // Sync selected hubs with URL params (e.g., when user uses back button)
  // Only syncs FROM URL TO state, not the other way around
  useEffect(() => {
    const currentHubsParam = searchParams.get('topics') || '';
    const currentHubIds = currentHubsParam
      ? currentHubsParam
          .split(',')
          .map((id) => String(id).trim())
          .filter((id) => id.length > 0)
      : [];

    const currentHubIdsStr = currentHubIds.sort().join(',');

    // Only sync if URL param string actually changed (not from our own updates)
    if (currentHubIdsStr !== previousHubsParamRef.current) {
      previousHubsParamRef.current = currentHubIdsStr;

      // Check if selected hubs match the URL (use ref to get current value)
      const currentSelectedIds = selectedHubsRef.current
        .map((h) => String(h.id))
        .sort()
        .join(',');

      // Only update if URL has different topic IDs than current selection
      if (currentHubIdsStr !== currentSelectedIds) {
        if (currentHubIds.length === 0) {
          // URL has no topics - clear selected hubs
          setSelectedHubs([]);
        } else {
          // Merge URL topic IDs with existing selectedHubs
          // Keep existing hubs that match URL IDs (they have full data)
          // Create minimal Hub objects with just IDs for new ones (BountyHubSelector will populate them)
          const newHubs: Hub[] = currentHubIds.map((idStr) => {
            // If hub already exists in selectedHubs, keep it (it has full data)
            const existingHub = selectedHubsRef.current.find((h) => String(h.id) === idStr);
            if (existingHub) {
              return existingHub;
            }
            // Otherwise, create minimal Hub object with just ID
            // BountyHubSelector will populate name/description when it fetches
            return {
              id: Number(idStr) || idStr,
              name: '',
            };
          });

          setSelectedHubs(newHubs);
        }
      }
    }
  }, [searchParams]);

  const fetchBounties = async (reset = false, hubs: Hub[] = selectedHubs) => {
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
        hubIds: hubs.map((h) => h.id),
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

  const handleHubsChange = (hubs: Hub[]) => {
    // Check if this is just a name population (same IDs) or actual selection change
    const currentHubIds = selectedHubs
      .map((h) => String(h.id))
      .sort((a, b) => a.localeCompare(b))
      .join(',');
    const newHubIds = hubs
      .map((h) => String(h.id))
      .sort((a, b) => a.localeCompare(b))
      .join(',');
    const isOnlyNameUpdate = currentHubIds === newHubIds;

    setSelectedHubs(hubs);
    selectedHubsRef.current = hubs;

    if (isOnlyNameUpdate) {
      return;
    }

    // Update URL with topic IDs
    const params = new URLSearchParams(searchParams.toString());
    if (hubs.length > 0) {
      const hubIds = hubs.map((h) => String(h.id)).join(',');
      params.set('topics', hubIds);
      previousHubsParamRef.current = hubs
        .map((h) => String(h.id))
        .sort((a, b) => a.localeCompare(b))
        .join(',');
    } else {
      params.delete('topics');
      previousHubsParamRef.current = '';
    }
    router.replace(`?${params.toString()}`, { scroll: false });
    setPage(1);
    fetchBounties(true, hubs);
  };

  useEffect(() => {
    selectedHubsRef.current = selectedHubs;
  }, [selectedHubs]);

  useEffect(() => {
    if (selectedHubs.length > 0 && !hasInitialFetchRef.current && !hasRestoredEntries) {
      hasInitialFetchRef.current = true;
      setPage(1);
      fetchBounties(true, selectedHubs);
    }
  }, [selectedHubs, hasRestoredEntries]);

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

      const hubsToUse =
        hubsFromUrl.length > 0 && selectedHubs.length === 0
          ? hubsFromUrl.map((id) => ({
              id: Number(id) || id,
              name: '',
            }))
          : selectedHubs;

      hasInitialFetchRef.current = true;
      isFetchingRef.current = true;
      setPage(1);
      fetchBounties(true, hubsToUse).finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [sort]);

  useEffect(() => {
    if (event && event.type === 'topic') {
      const topic = event.payload;

      const newHub: Hub = {
        id: topic.id,
        name: topic.name,
        description: topic.description,
      };
      setSelectedHubs([newHub]);
      const params = new URLSearchParams(searchParams.toString());
      params.set('topics', String(topic.id));
      previousHubsParamRef.current = String(topic.id);
      router.replace(`?${params.toString()}`, { scroll: false });
      setPage(1);
      fetchBounties(true, [newHub]);
      clearEvent();
    }
  }, [event, router, searchParams]);

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    handleSortChange,
    selectedHubs,
    handleHubsChange,
    restoredScrollPosition,
    page,
    total,
    lastClickedEntryId,
  };
};

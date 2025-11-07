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
    // Build query params for feed key (inside useMemo to avoid recreating object)
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

    console.log('[useBounties] Checking restored state', {
      isBackNavigation,
      pathname,
      sortFromUrl,
      hubsFromUrl,
      feedKey,
    });

    if (!isBackNavigation) {
      return null;
    }

    const savedState = getFeedState(feedKey);
    if (savedState) {
      console.log('[useBounties] Found restored state', {
        feedKey,
        entriesCount: savedState.entries?.length || 0,
        scrollPosition: savedState.scrollPosition,
        lastClickedEntryId: savedState.lastClickedEntryId,
      });
      // Clear the state after using it
      clearFeedState(feedKey);
      return savedState;
    }
    return null;
  }, [isBackNavigation, pathname, getFeedState, clearFeedState, sortFromUrl, hubsFromUrl]);

  // Use restored entries if available
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
      // Set default sort in URL if missing
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
    const timestamp = Date.now();
    console.log('[useBounties] fetchBounties called', {
      timestamp,
      reset,
      currentPage: reset ? 1 : page,
      sort,
      hubIds: hubs.map((h) => h.id),
      hubCount: hubs.length,
      currentEntriesCount: entries.length,
      currentIsLoading: isLoading,
    });

    if (reset) {
      // Clear current bounties so skeleton loaders show instead of stale data
      console.log('[useBounties] Clearing entries (reset=true)', {
        timestamp,
        previousEntriesCount: entries.length,
      });
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

      console.log('[useBounties] fetchBounties result', {
        entriesCount: result.entries.length,
        hasMore: result.hasMore,
        total: result.total,
        reset,
      });

      if (reset) {
        console.log('[useBounties] Setting entries (reset=true)', {
          timestamp,
          newEntriesCount: result.entries.length,
        });
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
      .sort()
      .join(',');
    const newHubIds = hubs
      .map((h) => String(h.id))
      .sort()
      .join(',');
    const isOnlyNameUpdate = currentHubIds === newHubIds;

    setSelectedHubs(hubs);
    selectedHubsRef.current = hubs;

    // If only names changed (IDs are the same), don't update URL or fetch
    if (isOnlyNameUpdate) {
      return;
    }

    // Update URL with topic IDs
    const params = new URLSearchParams(searchParams.toString());
    if (hubs.length > 0) {
      const hubIds = hubs.map((h) => String(h.id)).join(',');
      params.set('topics', hubIds);
      // Track the URL param we're setting
      previousHubsParamRef.current = hubs
        .map((h) => String(h.id))
        .sort()
        .join(',');
    } else {
      params.delete('topics');
      previousHubsParamRef.current = '';
    }
    router.replace(`?${params.toString()}`, { scroll: false });
    // Reset pagination and fetch bounties based on new hubs selection
    setPage(1);
    fetchBounties(true, hubs);
  };

  // Track entries changes for debugging
  useEffect(() => {
    console.log('[useBounties] entries state changed', {
      entriesCount: entries.length,
      isLoading,
      hasMore,
      page,
      sort,
      selectedHubsCount: selectedHubs.length,
    });
  }, [entries, isLoading, hasMore, page, sort, selectedHubs]);

  // Update ref when selectedHubs changes
  useEffect(() => {
    selectedHubsRef.current = selectedHubs;
  }, [selectedHubs]);

  // Trigger fetch when selectedHubs changes (from URL or user selection)
  useEffect(() => {
    if (selectedHubs.length > 0 && !hasInitialFetchRef.current && !hasRestoredEntries) {
      console.log('[useBounties] Fetching bounties due to selectedHubs change', {
        selectedHubsCount: selectedHubs.length,
        hubIds: selectedHubs.map((h) => h.id),
      });
      hasInitialFetchRef.current = true;
      setPage(1);
      fetchBounties(true, selectedHubs);
    }
  }, [selectedHubs, hasRestoredEntries]);

  const handleSortChange = (newSort: string) => {
    console.log('[useBounties] handleSortChange called', {
      oldSort: sort,
      newSort,
      currentEntriesCount: entries.length,
    });
    // Only update URL - the sync effect will update state from URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const loadMore = () => {
    fetchBounties();
  };

  // Consolidated effect: handles initial load and sort changes
  useEffect(() => {
    const timestamp = Date.now();
    console.log('[useBounties] useEffect triggered [sort]', {
      timestamp,
      sort,
      hasRestoredEntries,
      entriesCount: entries.length,
      hasInitialFetch: hasInitialFetchRef.current,
      previousSort: previousSortRef.current,
      hubsFromUrl,
      selectedHubsCount: selectedHubs.length,
      isLoading,
      isFetching: isFetchingRef.current,
    });

    // If we restored entries from sessionStorage, mark as fetched and don't fetch
    if (hasRestoredEntries && entries.length > 0) {
      hasInitialFetchRef.current = true;
      previousSortRef.current = sort;
      return;
    }

    // Skip if we're already fetching to prevent duplicate fetches
    if (isFetchingRef.current) {
      console.log('[useBounties] Skipping fetch - already fetching', { timestamp });
      return;
    }

    // Check if sort actually changed (not just initial mount)
    const sortChanged = previousSortRef.current !== sort;

    // On initial load (first mount), fetch if we haven't already
    // On sort change (after initial load), also fetch
    // Use hubs from URL if available, otherwise use selectedHubs
    if (!hasInitialFetchRef.current || sortChanged) {
      // Update previous sort before fetching to prevent duplicate fetches
      previousSortRef.current = sort;

      // If there are hubs in URL but selectedHubs is empty, create Hub objects from URL
      const hubsToUse =
        hubsFromUrl.length > 0 && selectedHubs.length === 0
          ? hubsFromUrl.map((id) => ({
              id: Number(id) || id,
              name: '',
            }))
          : selectedHubs;

      console.log('[useBounties] Fetching bounties due to sort change or initial load', {
        timestamp,
        sortChanged,
        hubsToUseCount: hubsToUse.length,
        hubIds: hubsToUse.map((h) => h.id),
      });

      hasInitialFetchRef.current = true;
      isFetchingRef.current = true;
      setPage(1);
      fetchBounties(true, hubsToUse).finally(() => {
        isFetchingRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // Apply clicked topic filter
  useEffect(() => {
    if (event && event.type === 'topic') {
      const topic = event.payload;

      const newHub: Hub = {
        id: topic.id,
        name: topic.name,
        description: topic.description,
      };
      setSelectedHubs([newHub]);
      // Update URL with topic ID
      const params = new URLSearchParams(searchParams.toString());
      params.set('topics', String(topic.id));
      // Track the URL param we're setting
      previousHubsParamRef.current = String(topic.id);
      router.replace(`?${params.toString()}`, { scroll: false });
      setPage(1);
      fetchBounties(true, [newHub]);
      clearEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { getFeedKey } from '@/contexts/NavigationContext';
import { FeedEntry } from '@/types/feed';

interface UseFeedScrollTrackingOptions {
  feedKey: string;
  entries: FeedEntry[];
  hasMore?: boolean;
  page?: number;
  restoredScrollPosition?: number | null;
  activeTab?: string;
}

/**
 * Hook that handles all feed scroll tracking, restoration, and state saving.
 * Keeps FeedContent component clean by moving all scroll-related logic here.
 */
export const useFeedScrollTracking = ({
  feedKey,
  entries,
  hasMore,
  page,
  restoredScrollPosition,
  activeTab,
}: UseFeedScrollTrackingOptions) => {
  const pathname = usePathname();
  const scrollContainerRef = useScrollContainer();
  const scrollPositionRef = useRef(0);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const { startTrackingFeed, stopTrackingFeed, saveFeedState, resetBackNavigation } =
    useNavigation();

  // Track scroll position continuously
  useEffect(() => {
    const updateScrollPosition = () => {
      if (scrollContainerRef?.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
      }
    };

    const container = scrollContainerRef?.current;
    if (!container) {
      console.warn(
        `Cannot track scroll position for ${feedKey} because scrollContainer is missing`
      );
      return;
    }

    container.addEventListener('scroll', updateScrollPosition, { passive: true });
    updateScrollPosition();

    return () => {
      container.removeEventListener('scroll', updateScrollPosition);
    };
  }, [scrollContainerRef, feedKey]);

  // Restore scroll position if provided from useFeed
  useEffect(() => {
    if (
      restoredScrollPosition !== null &&
      restoredScrollPosition !== undefined &&
      !hasRestoredScroll
    ) {
      const scrollPos = restoredScrollPosition;
      setHasRestoredScroll(true);

      requestAnimationFrame(() => {
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTop = scrollPos;
        } else {
          console.warn(
            `Skipping feed scroll restoration for ${feedKey} because scrollContainer is missing`
          );
        }
        resetBackNavigation();
      });
    }
  }, [restoredScrollPosition, resetBackNavigation, scrollContainerRef, hasRestoredScroll, feedKey]);

  // Reset scroll restoration flag when pathname or tab changes
  useEffect(() => {
    setHasRestoredScroll(false);
  }, [pathname, activeTab]);

  // Start tracking on mount, save feed state and stop tracking on unmount
  useEffect(() => {
    startTrackingFeed();
    return () => {
      // Save feed state while tracking is still active
      if (entries.length > 0) {
        const scrollPos = scrollPositionRef.current;
        if (!scrollContainerRef?.current) {
          console.warn(
            `Skipping feed scroll position save for ${feedKey} because scrollContainer is missing`
          );
        }
        saveFeedState({
          feedKey,
          entries,
          scrollPosition: scrollPos,
          hasMore,
          page,
        });
      }
      stopTrackingFeed();
    };
  }, [
    feedKey,
    entries,
    hasMore,
    page,
    startTrackingFeed,
    stopTrackingFeed,
    saveFeedState,
    scrollContainerRef,
  ]);
};

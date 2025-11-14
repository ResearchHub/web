import { useEffect, useRef } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { FeedEntry } from '@/types/feed';

interface UseFeedScrollTrackingOptions {
  feedKey: string;
  entries: FeedEntry[];
  hasMore?: boolean;
  page?: number;
  restoredScrollPosition?: number | null;
  activeTab?: string;
  lastClickedEntryId?: string;
}

export const useFeedScrollTracking = ({
  feedKey,
  entries,
  hasMore,
  page,
  restoredScrollPosition,
  lastClickedEntryId,
}: UseFeedScrollTrackingOptions) => {
  const scrollContainerRef = useScrollContainer();
  const scrollPositionRef = useRef(0);
  const hasRestoredScrollRef = useRef(false);
  const { startTrackingFeed, stopTrackingFeed, saveFeedState, resetBackNavigation } =
    useNavigation();

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

  useEffect(() => {
    if (
      restoredScrollPosition !== null &&
      restoredScrollPosition !== undefined &&
      !hasRestoredScrollRef.current
    ) {
      hasRestoredScrollRef.current = true;

      const scrollPos = restoredScrollPosition;

      if (scrollContainerRef?.current) {
        // First, try to scroll to the last clicked entry if available
        if (lastClickedEntryId) {
          const clickedElement = document.querySelector(
            `[data-entry-id="${lastClickedEntryId}"]`
          ) as HTMLElement;

          if (clickedElement) {
            const container = scrollContainerRef.current;
            const elementRect = clickedElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate the scroll position needed to show the element with spacing above
            const spacingAbove = 64;
            const scrollTop =
              container.scrollTop + elementRect.top - containerRect.top - spacingAbove;

            container.scrollTop = scrollTop;

            clickedElement.focus();

            resetBackNavigation();
            return;
          }
        }

        // Fallback to stored scroll position if:
        // 1. lastClickedEntryId doesn't exist, OR
        // 2. lastClickedEntryId exists but element not found
        scrollContainerRef.current.scrollTop = scrollPos;
      } else {
        console.warn(
          `Skipping feed scroll restoration for ${feedKey} because scrollContainer is missing`
        );
      }
      resetBackNavigation();
    }
  }, [
    restoredScrollPosition,
    resetBackNavigation,
    scrollContainerRef,
    feedKey,
    lastClickedEntryId,
  ]);

  useEffect(() => {
    if (restoredScrollPosition === null || restoredScrollPosition === undefined) {
      hasRestoredScrollRef.current = false;
    }
  }, [restoredScrollPosition]);

  useEffect(() => {
    startTrackingFeed();
    return () => {
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

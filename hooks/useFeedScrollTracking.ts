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
  lastClickedEntryId?: string;
}

export const useFeedScrollTracking = ({
  feedKey,
  entries,
  hasMore,
  page,
  restoredScrollPosition,
  activeTab,
  lastClickedEntryId,
}: UseFeedScrollTrackingOptions) => {
  const pathname = usePathname();
  const scrollContainerRef = useScrollContainer();
  const scrollPositionRef = useRef(0);
  const hasRestoredScrollRef = useRef(false); // Change from useState to useRef
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
    console.log('useEffect triggered [useFeedScrollTracking]', {
      restoredScrollPosition,
      hasRestoredScroll: hasRestoredScrollRef.current,
      lastClickedEntryId,
    });

    if (
      restoredScrollPosition !== null &&
      restoredScrollPosition !== undefined &&
      !hasRestoredScrollRef.current
    ) {
      // Set the ref immediately to prevent re-running
      hasRestoredScrollRef.current = true;

      const scrollPos = restoredScrollPosition;

      if (scrollContainerRef?.current) {
        // First, try to scroll to the last clicked entry if available
        if (lastClickedEntryId) {
          console.log('[useFeedScrollTracking] Attempting to scroll to last clicked entry', {
            feedKey,
            lastClickedEntryId,
            restoredScrollPosition: scrollPos,
          });

          const clickedElement = document.querySelector(
            `[data-entry-id="${lastClickedEntryId}"]`
          ) as HTMLElement;

          if (clickedElement) {
            console.log('[useFeedScrollTracking] Found clicked element', {
              feedKey,
              lastClickedEntryId,
              elementExists: true,
            });

            // Scroll the element into view within the scroll container
            const container = scrollContainerRef.current;
            const elementRect = clickedElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            console.log('[useFeedScrollTracking] Element and container positions', {
              feedKey,
              elementTop: elementRect.top,
              elementLeft: elementRect.left,
              elementHeight: elementRect.height,
              containerTop: containerRect.top,
              containerLeft: containerRect.left,
              containerHeight: containerRect.height,
              currentScrollTop: container.scrollTop,
            });

            // Calculate the scroll position needed to show the element with spacing above
            const spacingAbove = 64; // Space above the element (in pixels)
            const scrollTop =
              container.scrollTop + elementRect.top - containerRect.top - spacingAbove;

            console.log('[useFeedScrollTracking] Calculating scroll position', {
              feedKey,
              spacingAbove,
              calculatedScrollTop: scrollTop,
              previousScrollTop: container.scrollTop,
              scrollDelta: scrollTop - container.scrollTop,
            });

            container.scrollTop = scrollTop;

            console.log('[useFeedScrollTracking] Scrolled to element', {
              feedKey,
              finalScrollTop: container.scrollTop,
            });

            // Add a class to show focus styles programmatically
            clickedElement.classList.add('programmatic-focus');

            // Remove the class when the element loses focus
            const handleBlur = () => {
              console.log(
                '[useFeedScrollTracking] Element lost focus, removing programmatic-focus class',
                {
                  feedKey,
                  lastClickedEntryId,
                }
              );
              clickedElement.classList.remove('programmatic-focus');
              clickedElement.removeEventListener('blur', handleBlur);
            };
            clickedElement.addEventListener('blur', handleBlur);

            // Focus the element to apply focus styles
            clickedElement.focus();

            console.log('[useFeedScrollTracking] Focused element and resetting back navigation', {
              feedKey,
              lastClickedEntryId,
            });

            resetBackNavigation();
            return;
          } else {
            console.log('[useFeedScrollTracking] Clicked element not found in DOM', {
              feedKey,
              lastClickedEntryId,
              elementExists: false,
            });
          }
        } else {
          // If lastClickedEntryId is undefined but we have a scroll position,
          // it means the state was cleared or lastClickedEntryId was never set
          // Use the fallback scroll position
          console.log(
            '[useFeedScrollTracking] No lastClickedEntryId, using fallback scroll position',
            {
              feedKey,
              restoredScrollPosition: scrollPos,
              previousScrollTop: scrollContainerRef.current.scrollTop,
            }
          );
          scrollContainerRef.current.scrollTop = scrollPos;
          console.log('[useFeedScrollTracking] Restored scroll position', {
            feedKey,
            finalScrollTop: scrollContainerRef.current.scrollTop,
          });
        }
      } else {
        console.warn(
          `Skipping feed scroll restoration for ${feedKey} because scrollContainer is missing`
        );
      }
      resetBackNavigation();
    } else {
      console.log('[useFeedScrollTracking] Skipping scroll restoration', {
        feedKey,
        restoredScrollPosition,
        hasRestoredScroll: hasRestoredScrollRef.current,
        lastClickedEntryId,
      });
    }
  }, [
    restoredScrollPosition,
    resetBackNavigation,
    scrollContainerRef,
    feedKey,
    lastClickedEntryId,
  ]);

  useEffect(() => {
    // Reset the ref when restoredScrollPosition becomes null
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
        console.log('Saving feed state(feed key)', {
          feedKey,
        });
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

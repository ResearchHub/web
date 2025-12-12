import { useState, useEffect, useRef, RefObject } from 'react';

interface UseMobileNavScrollOptions {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  threshold?: number;
  hideAfterScrollY?: number;
}

/**
 * Hook to handle mobile top navigation hide/show on scroll
 * - Hides nav when scrolling down (after passing initial threshold)
 * - Shows nav when scrolling up
 */
export function useMobileNavScroll({
  scrollContainerRef,
  threshold = 10,
  hideAfterScrollY = 64,
}: UseMobileNavScrollOptions) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const lastToggleTime = useRef(0);
  const debounceMs = 100; // Minimum time between state changes

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const currentScrollY = container.scrollTop;
      const scrollDelta = currentScrollY - lastScrollY.current;

      // Check if we're near the bottom (within 50px) - ignore scroll events to prevent bounce loop
      const isNearBottom = container.scrollHeight - container.clientHeight - currentScrollY < 50;

      // Only trigger if scroll exceeds threshold and not near bottom
      if (Math.abs(scrollDelta) >= threshold && !isNearBottom) {
        const now = Date.now();

        // Debounce rapid state changes
        if (now - lastToggleTime.current >= debounceMs) {
          // Scrolling down - hide nav (only if we've scrolled past the initial threshold)
          if (scrollDelta > 0 && currentScrollY > hideAfterScrollY) {
            if (!isHidden) {
              setIsHidden(true);
              lastToggleTime.current = now;
            }
          }
          // Scrolling up - show nav
          else if (scrollDelta < 0) {
            if (isHidden) {
              setIsHidden(false);
              lastToggleTime.current = now;
            }
          }
        }

        lastScrollY.current = currentScrollY;
      } else if (isNearBottom) {
        // Update lastScrollY even when near bottom to prevent jump when scrolling back up
        lastScrollY.current = currentScrollY;
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollContainerRef, threshold, hideAfterScrollY, isHidden]);

  return { isHidden, setIsHidden };
}

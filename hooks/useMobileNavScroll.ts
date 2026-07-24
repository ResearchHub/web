import { useState, useEffect, useRef, RefObject } from 'react';

interface UseMobileNavScrollOptions {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  threshold?: number;
  hideAfterScrollY?: number;
}

/**
 * Hook to handle mobile top navigation hide/show on scroll
 * - Hides nav when scrolling down (only if content is taller than the viewport)
 * - Shows nav when scrolling up
 * - Always shows nav when content fits on screen (nothing to scroll)
 */
export function useMobileNavScroll({
  scrollContainerRef,
  threshold = 10,
  hideAfterScrollY = 64,
}: UseMobileNavScrollOptions) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const lastToggleTime = useRef(0);
  const debounceMs = 100;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isScrollable = () => container.scrollHeight > container.clientHeight;
    const forceShowIfNotScrollable = () => {
      if (!isScrollable() && isHidden) {
        setIsHidden(false);
      }
      lastScrollY.current = container.scrollTop;
    };

    const handleScroll = () => {
      if (!isScrollable()) {
        if (isHidden) setIsHidden(false);
        lastScrollY.current = container.scrollTop;
        return;
      }

      const currentScrollY = container.scrollTop;
      const scrollDelta = currentScrollY - lastScrollY.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const isNearBottom = maxScroll - currentScrollY < 50;

      if (Math.abs(scrollDelta) < threshold) return;

      // Ignore rubber-band bounce near the bottom
      if (isNearBottom && scrollDelta > 0) {
        lastScrollY.current = currentScrollY;
        return;
      }

      const now = Date.now();
      if (now - lastToggleTime.current < debounceMs) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (scrollDelta > 0 && currentScrollY > hideAfterScrollY) {
        if (!isHidden) {
          setIsHidden(true);
        }
        lastToggleTime.current = now;
      } else if (scrollDelta < 0) {
        if (isHidden) {
          setIsHidden(false);
        }
        lastToggleTime.current = now;
      }

      lastScrollY.current = currentScrollY;
    };

    // Tab/body content can swap without a scroll event (e.g. empty Conversation tab).
    const mutationObserver = new MutationObserver(forceShowIfNotScrollable);
    mutationObserver.observe(container, { childList: true, subtree: true });

    container.addEventListener('scroll', handleScroll, { passive: true });
    forceShowIfNotScrollable();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      mutationObserver.disconnect();
    };
  }, [scrollContainerRef, threshold, hideAfterScrollY, isHidden]);

  return { isHidden, setIsHidden };
}

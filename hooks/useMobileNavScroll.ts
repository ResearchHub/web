import { useEffect, useState, RefObject } from 'react';
import type { MobileTopNavStore } from '@/contexts/ScrollContainerContext';

/** From the tablet breakpoint up the top bar never hides, so nothing is tracked there. */
const TABLET_UP_QUERY = '(min-width: 768px)';
const DEBOUNCE_MS = 100;

interface UseMobileNavScrollOptions {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /**
   * Marked `data-top-bar-hidden` while the bar is hidden. The bar and anything
   * that moves with it style themselves from that attribute, in CSS.
   */
  shellRef: RefObject<HTMLElement | null>;
  threshold?: number;
  hideAfterScrollY?: number;
}

function createMobileTopNavStore() {
  let isHidden = false;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => isHidden,
    subscribe: (onChange: () => void) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    set: (hidden: boolean) => {
      isHidden = hidden;
      listeners.forEach((onChange) => onChange());
    },
  };
}

/**
 * Hides the phone top bar on scrolling down and shows it again on scrolling up:
 * - only once the page is taller than the screen (with nothing to scroll, it stays)
 * - at most once a frame, and without React state, so a scroll re-renders nothing
 *
 * Returns the store that useIsMobileTopNavHidden reads, for ScrollContainerProvider.
 */
export function useMobileNavScroll({
  scrollContainerRef,
  shellRef,
  threshold = 10,
  hideAfterScrollY = 64,
}: UseMobileNavScrollOptions): MobileTopNavStore {
  const [store] = useState(createMobileTopNavStore);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const tabletUp = window.matchMedia(TABLET_UP_QUERY);

    let lastScrollY = container.scrollTop;
    let lastToggleTime = 0;
    let scrollFrame = 0;
    let contentFrame = 0;

    const setHidden = (hidden: boolean) => {
      if (store.getSnapshot() === hidden) return;
      shellRef.current?.toggleAttribute('data-top-bar-hidden', hidden);
      store.set(hidden);
    };

    const isScrollable = () => container.scrollHeight > container.clientHeight;

    const update = () => {
      scrollFrame = 0;
      const currentScrollY = container.scrollTop;

      if (!isScrollable()) {
        setHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      const scrollDelta = currentScrollY - lastScrollY;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const isNearBottom = maxScroll - currentScrollY < 50;

      if (Math.abs(scrollDelta) < threshold) return;

      // Ignore rubber-band bounce near the bottom
      if (isNearBottom && scrollDelta > 0) {
        lastScrollY = currentScrollY;
        return;
      }

      const now = Date.now();
      if (now - lastToggleTime < DEBOUNCE_MS) {
        lastScrollY = currentScrollY;
        return;
      }

      if (scrollDelta > 0 && currentScrollY > hideAfterScrollY) {
        setHidden(true);
        lastToggleTime = now;
      } else if (scrollDelta < 0) {
        setHidden(false);
        lastToggleTime = now;
      }

      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (tabletUp.matches || scrollFrame) return;
      scrollFrame = requestAnimationFrame(update);
    };

    // Tab or body content can swap without a scroll event (an empty Conversation
    // tab, say). Once a frame, not on every change, take the new scroll position
    // as the baseline and bring the bar back if the page no longer scrolls.
    const handleContentChange = () => {
      if (tabletUp.matches || contentFrame) return;
      contentFrame = requestAnimationFrame(() => {
        contentFrame = 0;
        if (!isScrollable()) setHidden(false);
        lastScrollY = container.scrollTop;
      });
    };

    const handleBreakpointChange = () => {
      if (tabletUp.matches) setHidden(false);
      lastScrollY = container.scrollTop;
    };

    const mutationObserver = new MutationObserver(handleContentChange);
    mutationObserver.observe(container, { childList: true, subtree: true });

    container.addEventListener('scroll', handleScroll, { passive: true });
    tabletUp.addEventListener('change', handleBreakpointChange);
    if (!isScrollable()) setHidden(false);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      tabletUp.removeEventListener('change', handleBreakpointChange);
      mutationObserver.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(contentFrame);
    };
  }, [scrollContainerRef, shellRef, store, threshold, hideAfterScrollY]);

  return store;
}

'use client';

import { useEffect, useRef } from 'react';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { useFeedTabsVisibility } from '@/contexts/FeedTabsVisibilityContext';

/**
 * Observes a sentinel in the scroll container and reports when content tabs
 * have scrolled out of view (so the TopBar can show a sticky copy).
 */
export function useContentTabsVisibilitySentinel(enabled = true) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollContainer();
  const { setContentTabsHidden } = useFeedTabsVisibility();

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = scrollContainerRef?.current ?? null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setContentTabsHidden(!entry.isIntersecting);
      },
      { root, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      setContentTabsHidden(false);
    };
  }, [enabled, scrollContainerRef, setContentTabsHidden]);

  return sentinelRef;
}

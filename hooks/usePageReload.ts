'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current page load is from a browser refresh.
 *
 * Uses the Navigation Timing API to detect reload type navigation.
 * Returns true only on the initial mount if the page was reloaded.
 *
 * @returns boolean - true if page was reloaded, false otherwise
 *
 * @example
 * ```tsx
 * const isReload = usePageReload();
 *
 * if (isReload) {
 *   // Fetch fresh data on reload
 *   fetchData({ forceRefresh: true });
 * }
 * ```
 */
export function usePageReload(): boolean {
  const [isReload, setIsReload] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Modern Navigation Timing API Level 2
      const navigationEntries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[];

      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === 'reload') {
          setIsReload(true);
        }
      } else {
        // Fallback for older browsers (Navigation Timing API Level 1)
        // @ts-ignore - deprecated API
        if (window.performance.navigation && window.performance.navigation.type === 1) {
          setIsReload(true);
        }
      }
    } catch (error) {
      console.warn('Failed to detect page reload:', error);
    }
  }, []); // Empty dependency array - only run once on mount

  return isReload;
}

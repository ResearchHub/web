'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the current window matches a media query
 * @param query - The media query to check
 * @returns boolean if the current window matches the media query is known, null during SSR or initial render
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

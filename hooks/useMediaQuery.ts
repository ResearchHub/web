'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** One MediaQueryList per query, so a render reads it without allocating a new one. */
const mediaQueryLists = new Map<string, MediaQueryList>();

function mediaQueryList(query: string): MediaQueryList {
  let media = mediaQueryLists.get(query);
  if (!media) {
    media = window.matchMedia(query);
    mediaQueryLists.set(query, media);
  }
  return media;
}

const unknownOnServer = () => null;

/**
 * Custom hook to check if the current window matches a media query
 * @param query - The media query to check
 * @returns boolean if the current window matches the media query is known, null during SSR
 * and while hydrating what the server rendered. A component that first mounts on the client
 * (after a navigation, or one loaded with `ssr: false`) has the answer on its first render.
 */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = mediaQueryList(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query]
  );
  const matches = useCallback(() => mediaQueryList(query).matches, [query]);
  return useSyncExternalStore(subscribe, matches, unknownOnServer);
}

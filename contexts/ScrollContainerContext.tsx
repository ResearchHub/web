'use client';

import { createContext, useContext, ReactNode, RefObject } from 'react';

// Only the scrollport's ref, which never changes, so reading it never
// re-renders on a scroll. Whether the phone top bar is hidden is not here: it
// is PageLayout's shell attribute `data-top-bar-hidden`, which whatever moves
// with the bar follows in CSS (see WorkPageTabs).
const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function ScrollContainerProvider({
  children,
  scrollContainerRef,
}: {
  children: ReactNode;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      {children}
    </ScrollContainerContext.Provider>
  );
}

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

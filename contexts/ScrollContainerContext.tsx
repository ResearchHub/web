'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode, RefObject } from 'react';

/**
 * Whether the phone top bar has slid away. It lives outside React state: the
 * bar and whatever moves with it follow the shell's `data-top-bar-hidden`
 * attribute in CSS, so hiding or showing the bar re-renders nothing. The few
 * components that need to know in JavaScript subscribe to it here.
 */
export interface MobileTopNavStore {
  getSnapshot: () => boolean;
  subscribe: (onChange: () => void) => () => void;
}

const ALWAYS_SHOWN: MobileTopNavStore = {
  getSnapshot: () => false,
  subscribe: () => () => {},
};

// Two contexts, so reading the scrollport never re-renders on a scroll: the
// ref never changes, and the store is one object for the page's lifetime.
const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);
const MobileTopNavContext = createContext<MobileTopNavStore>(ALWAYS_SHOWN);

export function ScrollContainerProvider({
  children,
  scrollContainerRef,
  mobileTopNav = ALWAYS_SHOWN,
}: {
  children: ReactNode;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  mobileTopNav?: MobileTopNavStore;
}) {
  return (
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      <MobileTopNavContext.Provider value={mobileTopNav}>{children}</MobileTopNavContext.Provider>
    </ScrollContainerContext.Provider>
  );
}

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

/**
 * Re-renders the caller, and only the caller, each time the phone top bar
 * hides or shows. Where CSS can do the job, follow `data-top-bar-hidden`
 * instead (see WorkPageTabs).
 */
export function useIsMobileTopNavHidden() {
  const store = useContext(MobileTopNavContext);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, ALWAYS_SHOWN.getSnapshot);
}

'use client';

import { createContext, useContext, useMemo, ReactNode, RefObject } from 'react';

interface ScrollContainerContextType {
  scrollContainerRef: RefObject<HTMLDivElement | null> | null;
  isMobileTopNavHidden: boolean;
}

const ScrollContainerContext = createContext<ScrollContainerContextType>({
  scrollContainerRef: null,
  isMobileTopNavHidden: false,
});

export function ScrollContainerProvider({
  children,
  scrollContainerRef,
  isMobileTopNavHidden = false,
}: {
  children: ReactNode;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  isMobileTopNavHidden?: boolean;
}) {
  const value = useMemo(
    () => ({ scrollContainerRef, isMobileTopNavHidden }),
    [scrollContainerRef, isMobileTopNavHidden]
  );

  return (
    <ScrollContainerContext.Provider value={value}>{children}</ScrollContainerContext.Provider>
  );
}

export function useScrollContainer() {
  const context = useContext(ScrollContainerContext);
  return context.scrollContainerRef;
}

export function useIsMobileTopNavHidden() {
  const context = useContext(ScrollContainerContext);
  return context.isMobileTopNavHidden;
}

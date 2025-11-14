'use client';

import { createContext, useContext, ReactNode, RefObject } from 'react';

interface ScrollContainerContextType {
  scrollContainerRef: RefObject<HTMLDivElement> | null;
}

const ScrollContainerContext = createContext<ScrollContainerContextType>({
  scrollContainerRef: null,
});

export function ScrollContainerProvider({
  children,
  scrollContainerRef,
}: {
  children: ReactNode;
  scrollContainerRef: RefObject<HTMLDivElement>;
}) {
  return (
    <ScrollContainerContext.Provider value={{ scrollContainerRef }}>
      {children}
    </ScrollContainerContext.Provider>
  );
}

export function useScrollContainer() {
  const context = useContext(ScrollContainerContext);
  return context.scrollContainerRef;
}

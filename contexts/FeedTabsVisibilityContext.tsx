'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FeedTabsVisibilityContextType {
  contentTabsHidden: boolean;
  setContentTabsHidden: (hidden: boolean) => void;
}

const FeedTabsVisibilityContext = createContext<FeedTabsVisibilityContextType>({
  contentTabsHidden: false,
  setContentTabsHidden: () => {},
});

export function FeedTabsVisibilityProvider({ children }: { children: ReactNode }) {
  const [contentTabsHidden, setContentTabsHidden] = useState(false);

  return (
    <FeedTabsVisibilityContext.Provider value={{ contentTabsHidden, setContentTabsHidden }}>
      {children}
    </FeedTabsVisibilityContext.Provider>
  );
}

export function useFeedTabsVisibility() {
  return useContext(FeedTabsVisibilityContext);
}

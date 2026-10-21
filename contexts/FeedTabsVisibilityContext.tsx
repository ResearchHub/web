'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface FeedTabsVisibilityContextType {
  contentTabsHidden: boolean;
  setContentTabsHidden: (hidden: boolean) => void;
}

const FeedTabsVisibilityContext = createContext<FeedTabsVisibilityContextType>({
  contentTabsHidden: false,
  setContentTabsHidden: () => {},
});

// The setter on its own, so the tabs that report scrolling out of view don't
// re-render each time they do; only the top bar, which shows a copy, does.
const SetContentTabsHiddenContext = createContext<(hidden: boolean) => void>(() => {});

export function FeedTabsVisibilityProvider({ children }: { children: ReactNode }) {
  const [contentTabsHidden, setContentTabsHidden] = useState(false);
  const value = useMemo(() => ({ contentTabsHidden, setContentTabsHidden }), [contentTabsHidden]);

  return (
    <SetContentTabsHiddenContext.Provider value={setContentTabsHidden}>
      <FeedTabsVisibilityContext.Provider value={value}>
        {children}
      </FeedTabsVisibilityContext.Provider>
    </SetContentTabsHiddenContext.Provider>
  );
}

export function useFeedTabsVisibility() {
  return useContext(FeedTabsVisibilityContext);
}

export function useSetContentTabsHidden() {
  return useContext(SetContentTabsHiddenContext);
}

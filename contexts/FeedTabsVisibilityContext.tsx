'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const FeedTabsVisibilityContext = createContext(false);

// The setter on its own, so the tabs that report scrolling out of view don't
// re-render each time they do; only the top bar, which shows a copy, does.
const SetContentTabsHiddenContext = createContext<(hidden: boolean) => void>(() => {});

export function FeedTabsVisibilityProvider({ children }: { children: ReactNode }) {
  const [contentTabsHidden, setContentTabsHidden] = useState(false);

  return (
    <SetContentTabsHiddenContext.Provider value={setContentTabsHidden}>
      <FeedTabsVisibilityContext.Provider value={contentTabsHidden}>
        {children}
      </FeedTabsVisibilityContext.Provider>
    </SetContentTabsHiddenContext.Provider>
  );
}

export function useFeedTabsVisibility() {
  return { contentTabsHidden: useContext(FeedTabsVisibilityContext) };
}

export function useSetContentTabsHidden() {
  return useContext(SetContentTabsHiddenContext);
}

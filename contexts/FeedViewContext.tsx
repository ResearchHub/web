'use client';

import { createContext, useContext, ReactNode, FC } from 'react';

/**
 * Represents the different views where feed items can be rendered.
 * This context helps components make UI decisions based on where they're displayed.
 */
export type FeedView = 'feed' | 'search' | 'profile' | 'lists';

const FeedViewContext = createContext<FeedView>('feed');

/**
 * Hook to access the current feed view context.
 * Returns 'feed' by default if not wrapped in a provider.
 */
export const useFeedView = (): FeedView => useContext(FeedViewContext);

interface FeedViewProviderProps {
  value: FeedView;
  children: ReactNode;
}

/**
 * Provider component for setting the feed view context.
 * Wrap feed content with this provider to specify the view type.
 *
 * @example
 * ```tsx
 * <FeedViewProvider value="search">
 *   <FeedContent ... />
 * </FeedViewProvider>
 * ```
 */
export const FeedViewProvider: FC<FeedViewProviderProps> = ({ value, children }) => {
  return <FeedViewContext.Provider value={value}>{children}</FeedViewContext.Provider>;
};

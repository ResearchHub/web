'use client';

import { type ReactNode } from 'react';
import { ActivityFeedProvider } from '@/contexts/ActivityFeedContext';
import { GrantFeedProvider } from '@/contexts/GrantFeedContext';

/** Keeps homepage Activity + Grant feed state mounted across tab switches. */
export function HomeFeedsProvider({ children }: { children: ReactNode }) {
  return (
    <ActivityFeedProvider>
      <GrantFeedProvider>{children}</GrantFeedProvider>
    </ActivityFeedProvider>
  );
}

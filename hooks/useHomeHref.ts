'use client';

import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';

/** Classic research-feed home: logged in → /for-you, logged out → /popular. */
export function useHomeHref() {
  const { user } = useUser();
  return useMemo(() => (user ? '/for-you' : '/popular'), [user]);
}

export function isClassicHomeFeedPath(pathname: string): boolean {
  return ['/popular', '/for-you', '/following', '/latest'].includes(pathname);
}

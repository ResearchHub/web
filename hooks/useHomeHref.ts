'use client';

import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';

export function useHomeHref() {
  const { user } = useUser();
  return useMemo(() => (user ? '/for-you' : '/popular'), [user]);
}

export function isClassicHomeFeedPath(pathname: string): boolean {
  return ['/popular', '/for-you', '/following', '/latest'].includes(pathname);
}

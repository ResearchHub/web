'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHANGELOG_STORAGE_KEY } from '@/constants/changelog';

/**
 * Whether this browser has opened the changelog since its last entry, kept in
 * localStorage. Starts as seen so the "new" marker never flashes before the
 * stored value is read after mount.
 */
export function useChangelogSeen() {
  const [hasSeen, setHasSeen] = useState(true);

  useEffect(() => {
    setHasSeen(!!localStorage.getItem(CHANGELOG_STORAGE_KEY));
  }, []);

  const markSeen = useCallback(() => {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, 'true');
    setHasSeen(true);
  }, []);

  return { hasSeen, markSeen };
}

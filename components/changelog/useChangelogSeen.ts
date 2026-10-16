'use client';

import { useCallback, useEffect, useState } from 'react';
import { getChangelogStorageKey } from '@/constants/changelog';
import { PostService } from '@/services/post.service';

/**
 * Whether this browser has opened the changelog since its latest entry, kept in
 * localStorage. Starts as seen so the "new" marker never flashes before the
 * latest entry and the stored value are read after mount.
 */
export function useChangelogSeen() {
  const [hasSeen, setHasSeen] = useState(true);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    PostService.getLatestChangelog()
      .then((latest) => {
        if (isCancelled || !latest) return;
        const key = getChangelogStorageKey(latest.id);
        setStorageKey(key);
        setHasSeen(!!localStorage.getItem(key));
      })
      .catch((error) => console.error('Failed to fetch the latest changelog:', error));

    return () => {
      isCancelled = true;
    };
  }, []);

  const markSeen = useCallback(() => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    setHasSeen(true);
  }, [storageKey]);

  return { hasSeen, markSeen };
}

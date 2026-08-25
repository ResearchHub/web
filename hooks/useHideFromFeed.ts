'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FeedModerationService } from '@/services/feed-moderation.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';

interface UseHideFromFeedReturn {
  /** Hides one or more feed entries. Multiple IDs are excluded in parallel. */
  hideFromFeed: (feedEntryIds: ID | ID[]) => Promise<boolean>;
  isHiding: boolean;
}

function toIdList(feedEntryIds: ID | ID[]): ID[] {
  const list = Array.isArray(feedEntryIds) ? feedEntryIds : [feedEntryIds];
  return list.filter((id) => id != null && id !== '');
}

export function useHideFromFeed(): UseHideFromFeedReturn {
  const [isHiding, setIsHiding] = useState(false);

  const hideFromFeed = useCallback(async (feedEntryIds: ID | ID[]): Promise<boolean> => {
    const ids = toIdList(feedEntryIds);
    if (ids.length === 0) {
      return false;
    }

    setIsHiding(true);
    try {
      await Promise.all(ids.map((id) => FeedModerationService.excludeFromFeed(id)));
      toast.success('Hidden from feed.');
      return true;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to hide from feed'));
      return false;
    } finally {
      setIsHiding(false);
    }
  }, []);

  return { hideFromFeed, isHiding };
}

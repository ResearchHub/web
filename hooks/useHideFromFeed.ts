'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FeedModerationService } from '@/services/feed-moderation.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';

export const HIDE_FROM_FEED_CONFIRM_MESSAGE = 'This feed entry will be hidden from public feeds.';

interface UseHideFromFeedReturn {
  hideFromFeed: (feedEntryId: ID) => Promise<boolean>;
  isHiding: boolean;
}

export function useHideFromFeed(): UseHideFromFeedReturn {
  const [isHiding, setIsHiding] = useState(false);

  const hideFromFeed = useCallback(async (feedEntryId: ID): Promise<boolean> => {
    if (feedEntryId == null || feedEntryId === '') {
      return false;
    }

    setIsHiding(true);
    try {
      await FeedModerationService.excludeFromFeed(feedEntryId);
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

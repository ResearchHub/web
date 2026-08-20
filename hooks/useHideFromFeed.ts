'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FeedModerationService } from '@/services/feed-moderation.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';

export const HIDE_FROM_FEED_CONFIRM_MESSAGE =
  'This document and related entries will be removed from feeds.';

interface UseHideFromFeedReturn {
  hideFromFeed: (unifiedDocumentId: ID) => Promise<boolean>;
  isHiding: boolean;
}

export function useHideFromFeed(): UseHideFromFeedReturn {
  const [isHiding, setIsHiding] = useState(false);

  const hideFromFeed = useCallback(async (unifiedDocumentId: ID): Promise<boolean> => {
    if (unifiedDocumentId == null || unifiedDocumentId === '') {
      return false;
    }

    setIsHiding(true);
    try {
      await FeedModerationService.excludeFromFeed(unifiedDocumentId);
      toast.success('Hidden from feeds.');
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

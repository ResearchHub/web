import { useState, useCallback } from 'react';
import { ContentType } from '@/types/work';
import { toast } from 'react-hot-toast';
import { ApiError } from '@/services/types';
import { ReactionService, DocumentType } from '@/services/reaction.service';
import { FeedContentType } from '@/types/feed';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import {
  mapAppContentTypeToApiType,
  mapAppFeedContentTypeToApiType,
} from '@/utils/contentTypeMapping';

interface UseInterestOptions {
  entityId: number;
  feedContentType?: FeedContentType;
  workContentType?: ContentType;
  onMarkNotInterestedSuccess?: (response: any) => void;
  onMarkNotInterestedError?: (error: any) => void;
}

/**
 * A reusable hook for handling "not interested" functionality across different content types
 */
export function useInterest({
  entityId,
  feedContentType,
  workContentType,
  onMarkNotInterestedSuccess,
  onMarkNotInterestedError,
}: UseInterestOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();

  /**
   * Mark content as not interested
   */
  const markNotInterested = useCallback(async () => {
    // Don't allow marking if not logged in
    if (!user) {
      toast.error('Please sign in to mark content as not interested');
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Determine document type
      let documentType: DocumentType;
      if (workContentType) {
        documentType = mapAppContentTypeToApiType(workContentType);
      } else if (feedContentType) {
        documentType = mapAppFeedContentTypeToApiType(feedContentType);
      } else {
        throw new Error('No content type provided for marking as not interested');
      }

      if (!entityId) {
        throw new Error('Entity ID is required for marking as not interested');
      }

      const response = await ReactionService.markNotInterested({
        documentId: entityId,
        documentType,
      });

      toast.success('Marked as not interested');

      // Call success callback with the server response
      if (onMarkNotInterestedSuccess) {
        onMarkNotInterestedSuccess(response);
      }
    } catch (error: any) {
      console.error('Mark not interested error:', error);

      if (error instanceof ApiError) {
        console.error(error);
        toast.error(error.message || 'Failed to mark as not interested. Please try again.');
      } else {
        toast.error('Failed to mark as not interested. Please try again.');
      }

      if (onMarkNotInterestedError) {
        onMarkNotInterestedError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    entityId,
    feedContentType,
    workContentType,
    isProcessing,
    user,
    onMarkNotInterestedSuccess,
    onMarkNotInterestedError,
  ]);

  return {
    markNotInterested,
    isProcessing,
  };
}

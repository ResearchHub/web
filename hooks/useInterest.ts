import { useState, useCallback } from 'react';
import { ContentType } from '@/types/work';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ApiError } from '@/services/types';
import { ReactionService, DocumentType } from '@/services/reaction.service';
import { FeedContentType } from '@/types/feed';
import { Topic } from '@/types/topic';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';

interface UseInterestOptions {
  votableEntityId: number;
  feedContentType?: FeedContentType;
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
  relatedDocumentUnifiedDocumentId?: string;
  relatedDocumentTopics?: Topic[];
  onMarkNotInterestedSuccess?: (response: any) => void;
  onMarkNotInterestedError?: (error: any) => void;
}

/**
 * Maps FeedContentType to DocumentType for API calls
 */
function mapFeedContentTypeToDocumentType(feedContentType?: FeedContentType): DocumentType {
  if (!feedContentType) {
    return 'paper'; // Default to paper if no feedContentType is provided
  }

  switch (feedContentType) {
    case 'PAPER':
      return 'paper';
    case 'POST':
    case 'PREREGISTRATION':
    case 'GRANT':
      return 'researchhubpost';
    case 'BOUNTY':
    case 'COMMENT':
    case 'APPLICATION':
      // These should not be dismissible, but we'll default to researchhubpost
      return 'researchhubpost';
    default:
      return 'researchhubpost';
  }
}

/**
 * A reusable hook for handling "not interested" functionality across different content types
 */
export function useInterest({
  votableEntityId,
  feedContentType,
  relatedDocumentId,
  relatedDocumentContentType,
  relatedDocumentUnifiedDocumentId,
  relatedDocumentTopics,
  onMarkNotInterestedSuccess,
  onMarkNotInterestedError,
}: UseInterestOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const deviceType = useDeviceType();

  /**
   * Mark content as not interested
   */
  const markNotInterested = useCallback(async () => {
    // Don't allow marking if not logged in
    if (!user) {
      toast.error('Please sign in to mark content as not interested');
      return;
    }

    // Don't allow multiple requests at once
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Determine document type
      let documentType: DocumentType;
      if (relatedDocumentContentType) {
        // Use the related document content type when available (e.g., `paper`)
        documentType = relatedDocumentContentType === 'paper' ? 'paper' : 'researchhubpost';
      } else {
        // Fallback to feed content type mapping
        documentType = mapFeedContentTypeToDocumentType(feedContentType);
      }

      // Ensure we have a valid entity ID
      if (!votableEntityId) {
        throw new Error('Entity ID is required for marking as not interested');
      }

      const response = await ReactionService.markNotInterested({
        documentId: votableEntityId,
        documentType,
      });

      // Show success message
      toast.success('Marked as not interested');

      // Call success callback with the server response
      if (onMarkNotInterestedSuccess) {
        onMarkNotInterestedSuccess(response);
      }
    } catch (error: any) {
      console.error('Mark not interested error:', error);

      // Handle specific error cases
      if (error instanceof ApiError) {
        console.error(error);
        toast.error(error.message || 'Failed to mark as not interested. Please try again.');
      } else {
        toast.error('Failed to mark as not interested. Please try again.');
      }

      // Call the error callback
      if (onMarkNotInterestedError) {
        onMarkNotInterestedError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    votableEntityId,
    feedContentType,
    relatedDocumentId,
    relatedDocumentContentType,
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

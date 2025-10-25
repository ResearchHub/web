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
  entityId: number;
  contentType?: FeedContentType;
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
  relatedDocumentUnifiedDocumentId?: string;
  relatedDocumentTopics?: Topic[];
  onMarkNotInterestedSuccess?: (response: any) => void;
  onMarkNotInterestedError?: (error: any) => void;
}

/**
 * Maps ContentType to DocumentType for API calls
 */
function mapContentTypeToDocumentType(contentType?: FeedContentType): DocumentType {
  if (!contentType) {
    return 'paper';
  }

  switch (contentType) {
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
  entityId,
  contentType,
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

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Determine document type
      let documentType: DocumentType;
      if (relatedDocumentContentType) {
        // Use the related document content type when available (e.g., `paper`)
        documentType = relatedDocumentContentType === 'paper' ? 'paper' : 'researchhubpost';
      } else {
        // Fallback to content type mapping
        documentType = mapContentTypeToDocumentType(contentType);
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
    contentType,
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

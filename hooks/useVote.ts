import { useState, useCallback } from 'react';
import { ContentType } from '@/types/work';
import { toast } from 'react-hot-toast';
import { ApiError } from '@/services/types';
import { ReactionService, DocumentType } from '@/services/reaction.service';
import { UserVoteType, VotableContentType } from '@/types/reaction';
import { FeedContentType } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { VoteActionEvent } from '@/types/analytics';

interface UseVoteOptions {
  votableEntityId: number;
  feedContentType?: FeedContentType;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  onVoteSuccess?: (updatedItem: any, voteType: UserVoteType) => void;
  onVoteError?: (error: any) => void;
}

/**
 * Maps FeedContentType to VotableContentType for API calls
 */
function mapFeedContentTypeToVotable(feedContentType?: FeedContentType): VotableContentType {
  if (!feedContentType) {
    return 'paper'; // Default to paper if no feedContentType is provided
  }

  switch (feedContentType) {
    case 'BOUNTY':
    case 'COMMENT':
      return 'comment';
    case 'PAPER':
      return 'paper';
    case 'POST':
    case 'PREREGISTRATION':
    default:
      return 'researchhubpost';
  }
}

/**
 * A reusable hook for handling voting functionality across different content types
 */
export function useVote({
  votableEntityId,
  feedContentType,
  relatedDocumentId,
  relatedDocumentContentType,
  onVoteSuccess,
  onVoteError,
}: UseVoteOptions) {
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useUser();

  /**
   * Vote on a document, comment or other content item
   * @param voteType The type of vote (UPVOTE or NEUTRAL)
   */
  const vote = useCallback(
    async (voteType: UserVoteType) => {
      // Don't allow voting if not logged in
      if (!user) {
        toast.error('Please sign in to vote');
        return;
      }

      // Don't allow multiple votes at once
      if (isVoting) return;

      try {
        setIsVoting(true);

        let response;
        const votableContentType = mapFeedContentTypeToVotable(feedContentType);

        // Determine document type
        let documentType: DocumentType;
        if (relatedDocumentContentType) {
          // Use the related document content type when available (e.g., `paper`)
          documentType = relatedDocumentContentType === 'paper' ? 'paper' : 'researchhubpost';
        } else {
          // Fallback to votable content type (e.g., `comment`)
          documentType = votableContentType === 'paper' ? 'paper' : 'researchhubpost';
        }

        // Use the appropriate service method based on feed content type
        if (feedContentType === 'COMMENT' || feedContentType === 'BOUNTY') {
          response = await ReactionService.voteOnComment({
            commentId: votableEntityId,
            documentId: relatedDocumentId,
            voteType,
            contentType: votableContentType,
            documentType: documentType,
          });
        } else {
          // For documents (papers, posts, etc.)
          // Ensure we have a valid entity ID
          if (!votableEntityId) {
            throw new Error('Entity ID is required for voting');
          }

          response = await ReactionService.voteOnDocument({
            documentId: votableEntityId,
            documentType,
            voteType: voteType === 'UPVOTE' ? 'upvote' : 'neutralvote',
          });
        }

        const payload: VoteActionEvent = {
          vote_type: voteType,
          content_type: votableContentType,
          related_work:
            relatedDocumentId && relatedDocumentContentType
              ? {
                  id: relatedDocumentId ? relatedDocumentId.toString() : votableEntityId.toString(),
                  content_type: relatedDocumentContentType,
                }
              : undefined,
          document_type: documentType,
        };
        AnalyticsService.logEventWithUserProperties(LogEvent.VOTE_ACTION, payload, user);
        // Call success callback with the server response
        if (onVoteSuccess) {
          onVoteSuccess(response, voteType);
        }
      } catch (error: any) {
        console.error('Vote error:', error);

        // Handle specific error cases
        if (error instanceof ApiError) {
          console.error(error);

          if (error.status === 403) {
            toast.error('Cannot vote on your own content');
          } else {
            toast.error(error.message || 'Failed to vote. Please try again.');
          }
        } else {
          toast.error('Failed to vote. Please try again.');
        }

        // Call the error callback
        if (onVoteError) {
          onVoteError(error);
        }
      } finally {
        setIsVoting(false);
      }
    },
    [
      votableEntityId,
      feedContentType,
      relatedDocumentId,
      relatedDocumentContentType,
      isVoting,
      user,
      onVoteSuccess,
      onVoteError,
    ]
  );

  return {
    vote,
    isVoting,
    onVoteSuccess,
  };
}

import { useState, useCallback } from 'react';
import { ContentType } from '@/types/work';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ApiError } from '@/services/types';
import { ReactionService } from '@/services/reaction.service';
import { UserVoteType, VotableContentType } from '@/types/reaction';
import { FeedContentType } from '@/types/feed';

interface UseVoteOptions {
  votableEntityId: number;
  feedContentType?: FeedContentType;
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
  onVoteSuccess,
  onVoteError,
}: UseVoteOptions) {
  const [isVoting, setIsVoting] = useState(false);
  const { data: session } = useSession();

  /**
   * Vote on a document, comment or other content item
   * @param item The item to vote on (must have id and userVote properties)
   * @param voteType The type of vote (UPVOTE or NEUTRAL)
   */
  const vote = useCallback(
    async (
      item: { id: number; userVote?: UserVoteType; score?: number },
      voteType: UserVoteType
    ) => {
      // Don't allow voting if not logged in
      if (!session?.user) {
        toast.error('Please sign in to vote');
        return;
      }

      // Don't allow multiple votes at once
      if (isVoting) return;

      try {
        setIsVoting(true);

        let response;
        const votableContentType = mapFeedContentTypeToVotable(feedContentType);

        // Use the appropriate service method based on feed content type
        if (feedContentType === 'COMMENT') {
          response = await ReactionService.voteOnComment({
            commentId: item.id,
            documentId: votableEntityId,
            voteType,
            contentType: votableContentType,
          });
        } else {
          // For documents (papers, posts, etc.)
          const documentType = votableContentType === 'paper' ? 'paper' : 'researchhubpost';

          // Ensure we have a valid entity ID
          if (!votableEntityId) {
            throw new Error('Entity ID is required for voting');
          }

          // Use the item's ID if votableEntityId is not provided or is invalid
          const targetEntityId = votableEntityId || item.id;

          response = await ReactionService.voteOnDocument({
            documentId: targetEntityId,
            documentType,
            voteType: voteType === 'UPVOTE' ? 'upvote' : 'neutralvote',
          });
        }

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
    [votableEntityId, feedContentType, isVoting, session, onVoteSuccess, onVoteError]
  );

  return {
    vote,
    isVoting,
    onVoteSuccess,
  };
}

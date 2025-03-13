import { useState, useCallback } from 'react';
import { UserVoteType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ApiError } from '@/services/types';

interface UseVoteOptions {
  documentId: number;
  contentType: ContentType;
  onVoteSuccess?: (updatedItem: any, voteType: UserVoteType) => void;
  onVoteError?: (error: any) => void;
}

/**
 * A reusable hook for handling voting functionality across different content types
 */
export function useVote({ documentId, contentType, onVoteSuccess, onVoteError }: UseVoteOptions) {
  const [isVoting, setIsVoting] = useState(false);
  const { data: session } = useSession();

  /**
   * Vote on a comment or other content item
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

        // Make the API call directly using CommentService.voteComment
        const response = await CommentService.voteComment({
          commentId: item.id,
          documentId,
          voteType,
          contentType,
        });

        // Call success callback with the server response
        if (onVoteSuccess) {
          onVoteSuccess(response, voteType);
        }
      } catch (error: any) {
        console.error('Vote error:', error);

        // Handle specific error cases
        if (error instanceof ApiError) {
          console.log('&error', error.status);

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
    [documentId, contentType, isVoting, session, onVoteSuccess, onVoteError]
  );

  return {
    vote,
    isVoting,
    onVoteSuccess,
  };
}

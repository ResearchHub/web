import { ArrowUp, MessageCircle } from 'lucide-react';
import { FC } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useVote } from '@/hooks/useVote';
import { ContentType } from '@/types/work';
import { UserVoteType } from '@/types/comment';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface UpvoteAndCommentButtonProps {
  // Rendering options
  className?: string;
  isUpvoted?: boolean;
  upvoteCount?: number;
  commentCount?: number;

  // Callback functions
  onUpvote?: () => void;
  onComment?: () => void;

  // Votable entity mode (uses CommentService)
  votableEntityId?: number;
  documentId?: number;
  contentType?: ContentType;
  userVote?: UserVoteType;
  score?: number;
  onVoteSuccess?: (updatedItem: any, voteType: UserVoteType) => void;
}

/**
 * A combined button for upvote and comment actions with independent hover states
 * This component can work in two modes:
 * 1. Direct callback mode: Uses onUpvote and onComment callbacks
 * 2. Votable entity mode: Uses CommentService to handle voting
 */
export const UpvoteAndCommentButton: FC<UpvoteAndCommentButtonProps> = ({
  // Rendering options
  className,
  isUpvoted: propIsUpvoted,
  upvoteCount: propUpvoteCount = 0,
  commentCount = 0,

  // Callback functions
  onUpvote,
  onComment,

  // Votable entity mode
  votableEntityId,
  documentId,
  contentType,
  userVote,
  score,
  onVoteSuccess,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  // Determine if we're in votable mode
  const isVotableMode =
    votableEntityId !== undefined && documentId !== undefined && contentType !== undefined;

  // Use the vote hook if in votable mode
  const { vote, isVoting } = useVote({
    onVoteSuccess: (updatedItem, voteType) => {
      if (onVoteSuccess) {
        onVoteSuccess(updatedItem, voteType);
      }
    },
    documentId: documentId || 0,
    contentType: contentType || 'paper',
  });

  // Determine the effective upvote state and count
  const effectiveIsUpvoted = isVotableMode ? userVote === 'UPVOTE' : propIsUpvoted;
  const effectiveUpvoteCount = isVotableMode ? score || 0 : propUpvoteCount;

  // Handle voting based on the mode
  const handleVote = () => {
    if (isVoting) return;

    if (isVotableMode && votableEntityId) {
      executeAuthenticatedAction(async () => {
        const newVoteType: UserVoteType = effectiveIsUpvoted ? 'NEUTRAL' : 'UPVOTE';
        await vote({ id: votableEntityId, userVote, score }, newVoteType);
      });
    } else if (onUpvote) {
      onUpvote();
    }
  };

  return (
    <div
      className={`inline-flex items-center h-8 border border-gray-200 rounded-md overflow-hidden ${className || ''}`}
    >
      <Tooltip content="Upvote" position="top">
        <button
          onClick={handleVote}
          className={`w-full h-full px-3 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            effectiveIsUpvoted ? 'text-blue-600' : 'text-gray-700'
          } hover:text-gray-700 ${isVoting ? 'opacity-70 cursor-wait' : ''}`}
          type="button"
          disabled={isVoting}
        >
          <ArrowUp
            className={`w-4 h-4 ${effectiveIsUpvoted ? 'text-blue-600' : 'text-gray-700'}`}
          />
          {effectiveUpvoteCount > 0 && (
            <span
              className={`text-xs font-medium ${effectiveIsUpvoted ? 'text-blue-600' : 'text-gray-700'}`}
            >
              {effectiveUpvoteCount}
            </span>
          )}
          <span className="sr-only">Upvote</span>
        </button>
      </Tooltip>

      <div className="h-full w-px bg-gray-300"></div>

      <Tooltip content="Comment" position="top">
        <button
          onClick={onComment}
          className="w-full h-full px-3 flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          type="button"
        >
          <MessageCircle className="w-4 h-4 text-gray-700" />
          {commentCount > 0 && (
            <span className="text-xs font-medium text-gray-700">{commentCount}</span>
          )}
          <span className="sr-only">Comment</span>
        </button>
      </Tooltip>
    </div>
  );
};

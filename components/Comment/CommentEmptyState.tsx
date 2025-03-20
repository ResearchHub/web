import { Button } from '@/components/ui/Button';
import { CommentType } from '@/types/comment';
import { MessageSquare, Plus, Coins, Star } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface CommentEmptyStateProps {
  commentType: CommentType;
  onCreateBounty: () => void;
}

export const CommentEmptyState = ({ commentType, onCreateBounty }: CommentEmptyStateProps) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const message =
    commentType === 'REVIEW'
      ? 'No reviews yet.'
      : commentType === 'BOUNTY'
        ? 'No bounties yet.'
        : 'No comments yet. Start the conversation!';

  const description =
    commentType === 'REVIEW'
      ? 'Be the first to review this paper.'
      : commentType === 'BOUNTY'
        ? 'Bounties help attract experts to solve problems or contribute to research.'
        : 'Your contribution could help open science.';

  const icon =
    commentType === 'BOUNTY' ? (
      <Coins className="h-6 w-6 text-gray-400" />
    ) : commentType === 'REVIEW' ? (
      <Star className="h-6 w-6 text-gray-400" />
    ) : (
      <MessageSquare className="h-6 w-6 text-gray-400" />
    );

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">{icon}</div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{message}</h3>
      <p className="text-sm text-gray-500">{description}</p>

      {commentType === 'BOUNTY' && (
        <div className="mt-6">
          <Button
            onClick={() => executeAuthenticatedAction(onCreateBounty)}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bounty
          </Button>
        </div>
      )}
    </div>
  );
};

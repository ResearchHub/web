import { Button } from '@/components/ui/Button';
import { CommentType } from '@/types/comment';
import { Work } from '@/types/work';
import { MessageSquare, Plus, Coins, Star, Bell } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface CommentEmptyStateProps {
  commentType: CommentType;
  onCreateBounty: () => void;
  canCreateBounty?: boolean;
  work?: Work;
  readOnly?: boolean;
}

interface EmptyStateCopy {
  message: string;
  description: string;
}

function getEmptyStateCopy(
  commentType: CommentType,
  readOnly: boolean,
  postType?: Work['postType']
): EmptyStateCopy {
  if (commentType === 'REVIEW') {
    return readOnly
      ? {
          message: 'No peer reviews available.',
          description: 'The source proposal has not received any peer reviews.',
        }
      : {
          message: 'No reviews yet.',
          description: 'Be the first to review this paper.',
        };
  }

  if (commentType === 'BOUNTY') {
    return {
      message: 'No bounties yet.',
      description: 'Bounties help attract experts to solve problems or contribute to research.',
    };
  }

  if (commentType === 'AUTHOR_UPDATE') {
    return {
      message: 'No updates from the authors',
      description: 'Authors will be providing regular monthly updates',
    };
  }

  return postType === 'QUESTION'
    ? {
        message: 'No answers yet. Submit the first one!',
        description: 'Help the community by providing an answer.',
      }
    : {
        message: 'No comments yet. Start the conversation!',
        description: 'Your contribution could help open science.',
      };
}

function EmptyStateIcon({ commentType }: Readonly<Pick<CommentEmptyStateProps, 'commentType'>>) {
  if (commentType === 'BOUNTY') {
    return <Coins className="h-6 w-6 text-gray-400" />;
  }

  if (commentType === 'REVIEW') {
    return <Star className="h-6 w-6 text-gray-400" />;
  }

  if (commentType === 'AUTHOR_UPDATE') {
    return <Bell className="h-6 w-6 text-gray-400" />;
  }

  return <MessageSquare className="h-6 w-6 text-gray-400" />;
}

export const CommentEmptyState = ({
  commentType,
  onCreateBounty,
  canCreateBounty = false,
  work,
  readOnly = false,
}: CommentEmptyStateProps) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { message, description } = getEmptyStateCopy(commentType, readOnly, work?.postType);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <EmptyStateIcon commentType={commentType} />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{message}</h3>
      <p className="text-sm text-gray-500">{description}</p>

      {commentType === 'BOUNTY' && canCreateBounty && !readOnly && (
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

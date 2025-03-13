import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { ClipboardCheck, MessageSquare, Plus } from 'lucide-react';
import { UpvoteAndCommentButton } from '@/components/ui/UpvoteAndCommentButton';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { ContentType } from '@/types/work';
import { UserVoteType } from '@/types/comment';
import { Bounty } from '@/types/bounty';

interface BountyActionsProps {
  isOpen: boolean;
  isCreator: boolean;
  isPeerReviewBounty: boolean;
  onAwardClick: () => void;
  onNavigationClick: (tab: 'reviews' | 'conversation') => void;
  onContributeClick: () => void;
  onUpvote?: () => void;
  onComment?: () => void;
  isUpvoted?: boolean;
  upvoteCount?: number;
  commentCount?: number;
  contributors?: Array<{
    profile: {
      profileImage?: string;
      fullName: string;
      [key: string]: any;
    };
    amount: number;
  }>;

  // Votable entity properties
  votableEntityId?: number;
  documentId?: number;
  contentType?: ContentType;
  userVote?: UserVoteType;
  score?: number;
}

export const BountyActions = ({
  isOpen,
  isCreator,
  isPeerReviewBounty,
  onAwardClick,
  onNavigationClick,
  onContributeClick,
  onUpvote,
  onComment,
  isUpvoted = false,
  upvoteCount = 0,
  commentCount = 0,
  contributors = [],

  // Votable entity properties
  votableEntityId,
  documentId,
  contentType,
  userVote,
  score,
}: BountyActionsProps) => {
  if (!isOpen) {
    return null;
  }

  // Determine whether to use votable mode
  const isVotableMode =
    votableEntityId !== undefined && documentId !== undefined && contentType !== undefined;

  return (
    <div className="flex flex-col gap-3">
      {isCreator ? (
        <>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onAwardClick}
                className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrophy} className="h-4 w-4" />
                Award bounty
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex gap-2 items-center">
              <UpvoteAndCommentButton
                // Direct callback props
                onUpvote={onUpvote}
                onComment={onComment}
                isUpvoted={isUpvoted}
                upvoteCount={upvoteCount}
                commentCount={commentCount}
                // Votable entity props
                votableEntityId={votableEntityId}
                documentId={documentId}
                contentType={contentType}
                userVote={userVote}
                score={score}
              />

              {isPeerReviewBounty ? (
                <Button
                  onClick={() => onNavigationClick('reviews')}
                  size="sm"
                  variant="secondary"
                  className="shadow-sm flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Review
                </Button>
              ) : (
                <Button
                  onClick={() => onNavigationClick('conversation')}
                  size="sm"
                  variant="secondary"
                  className="shadow-sm flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  Answer
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onContributeClick}
                className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Contribute
              </Button>

              {contributors.length > 0 && (
                <div className="ml-2">
                  <ContributorsButton contributors={contributors} label="Contributors" />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-2 items-center">
          <UpvoteAndCommentButton
            // Direct callback props
            onVoteSuccess={onUpvote}
            onComment={onComment}
            isUpvoted={isUpvoted}
            upvoteCount={upvoteCount}
            commentCount={commentCount}
            // Votable entity props
            votableEntityId={votableEntityId}
            documentId={documentId}
            contentType={contentType}
            userVote={userVote}
            score={score}
          />

          {isPeerReviewBounty ? (
            <Button
              variant="secondary"
              onClick={() => onNavigationClick('reviews')}
              size="sm"
              className="shadow-sm flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Review
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => onNavigationClick('conversation')}
              size="sm"
              className="shadow-sm flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            >
              <MessageSquare className="h-4 w-4" />
              Answer
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onContributeClick}
            className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Contribute
          </Button>

          {contributors.length > 0 && (
            <div className="ml-2">
              <ContributorsButton contributors={contributors} label="Contributors" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

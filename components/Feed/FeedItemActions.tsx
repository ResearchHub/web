'use client';

import { FC, useState } from 'react';
import { FeedContentType, FeedEntry } from '@/types/feed';
import { MessageCircle, Flag, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/useVote';
import { UserVoteType } from '@/types/reaction';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ContentType } from '@/types/work';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  isActive = false,
  isDisabled = false,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`flex items-center space-x-1.5 ${isActive ? 'text-primary' : 'text-gray-900'} hover:text-gray-900`}
    tooltip={tooltip}
    onClick={onClick}
    disabled={isDisabled}
  >
    <Icon className="w-5 h-5" />
    {count !== undefined && count > 0 && <span className="text-sm font-medium">{count}</span>}
    <span className="sr-only">{label}</span>
  </Button>
);

interface FeedItemActionsProps {
  metrics?: FeedEntry['metrics'];
  feedContentType: FeedContentType;
  votableEntityId: number;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  userVote?: UserVoteType;
}

export const FeedItemActions: FC<FeedItemActionsProps> = ({
  metrics,
  userVote,
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [localVoteCount, setLocalVoteCount] = useState(metrics?.votes || 0);
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const { vote, isVoting } = useVote({
    votableEntityId,
    feedContentType,
    relatedDocumentId,
    onVoteSuccess: (response, voteType) => {
      // Update local state based on vote type
      if (voteType === 'UPVOTE' && localUserVote !== 'UPVOTE') {
        setLocalVoteCount((prev) => prev + 1);
      } else if (voteType === 'NEUTRAL' && localUserVote === 'UPVOTE') {
        setLocalVoteCount((prev) => Math.max(0, prev - 1));
      }
      setLocalUserVote(voteType);
    },
  });

  // Use the flag modal hook
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const handleVote = () => {
    executeAuthenticatedAction(() => {
      // Toggle vote: if already upvoted, neutralize, otherwise upvote
      const newVoteType: UserVoteType = localUserVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';
      vote(newVoteType);
    });
  };

  const handleReport = () => {
    executeAuthenticatedAction(() => {
      // Map feedContentType to ContentType
      let contentType: ContentType;
      let commentId: string | undefined;

      if (feedContentType === 'PAPER') {
        contentType = 'paper';
      } else if (feedContentType === 'POST' || feedContentType === 'PREREGISTRATION') {
        contentType = 'post';
      } else if (feedContentType === 'BOUNTY' && relatedDocumentContentType) {
        contentType = relatedDocumentContentType;
        commentId = votableEntityId.toString(); // Use votableEntityId as commentId for bounties
      } else {
        contentType = 'post'; // Default fallback
      }

      openFlagModal(
        // For comments and bounties, use relatedDocumentId as the documentId
        (feedContentType === 'COMMENT' || feedContentType === 'BOUNTY') && relatedDocumentId
          ? relatedDocumentId.toString()
          : votableEntityId.toString(),
        contentType,
        commentId
      );
    });
  };

  return (
    <>
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-4">
          <ActionButton
            icon={ArrowUp}
            count={localVoteCount}
            tooltip="Upvote"
            label="Upvote"
            onClick={handleVote}
            isActive={localUserVote === 'UPVOTE'}
            isDisabled={isVoting}
          />
          <ActionButton
            icon={MessageCircle}
            count={metrics?.comments}
            tooltip="Comment"
            label="Comment"
          />
        </div>
        <div className="ml-auto">
          <ActionButton icon={Flag} tooltip="Report" label="Report" onClick={handleReport} />
        </div>
      </div>

      {/* Flag Content Modal */}
      {contentToFlag && (
        <FlagContentModal
          isOpen={isOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}
    </>
  );
};

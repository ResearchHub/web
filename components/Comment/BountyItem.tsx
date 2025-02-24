import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { formatDeadline } from '@/utils/date';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Clock } from 'lucide-react';
import { CommentReadOnly } from './CommentReadOnly';
import { useState } from 'react';
import { AwardBountyModal } from './AwardBountyModal';

interface BountyItemProps {
  comment: Comment;
  contentType: ContentType;
  onSubmitSolution: () => void;
  isCreator?: boolean;
}

export const BountyItem = ({
  comment,
  contentType,
  onSubmitSolution,
  isCreator = false,
}: BountyItemProps) => {
  const [showAwardModal, setShowAwardModal] = useState(false);

  console.log('BountyItem rendering', {
    commentType: comment.commentType,
    bounties: comment.bounties,
    activeBounty: comment.bounties.find(
      (bounty) => bounty.status === 'OPEN' && !bounty.isContribution
    ),
  });

  // Find the first open, non-contribution bounty
  const activeBounty = comment.bounties.find(
    (bounty) => bounty.status === 'OPEN' && !bounty.isContribution
  );

  if (!activeBounty) {
    console.log('No active bounty found, returning null');
    return null;
  }

  // Get contributors from bounties that are contributions
  const contributors = comment.bounties
    .filter((bounty) => bounty.isContribution && bounty.createdBy.authorProfile)
    .map((bounty) => ({
      profile: bounty.createdBy.authorProfile!,
      amount: Number(bounty.amount),
    }));

  const getBountyTitle = () => {
    if (activeBounty.bountyType === 'REVIEW') {
      return 'Bounty: Peer Review';
    }
    return 'Bounty';
  };

  return (
    <>
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">{getBountyTitle()}</h3>

        {/* Top row with amount and expiration */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <ResearchCoinIcon />
            <span className="text-base font-medium text-orange-600">
              {formatRSC({ amount: Number(activeBounty.amount), shorten: true })} RSC
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {activeBounty.expirationDate && formatDeadline(activeBounty.expirationDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <CommentReadOnly content={comment.content} contentFormat={comment.contentFormat} />

        {/* Action buttons and contributors */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {isCreator ? (
              <Button
                variant="outlined"
                onClick={() => setShowAwardModal(true)}
                className="flex items-center gap-2"
              >
                <ResearchCoinIcon size={16} />
                Award
              </Button>
            ) : (
              <Button variant="start-task" onClick={onSubmitSolution}>
                Start
              </Button>
            )}
          </div>
          {contributors.length > 0 && (
            <ContributorsButton
              contributors={contributors}
              onContribute={onSubmitSolution}
              label="Contributors"
            />
          )}
        </div>
      </div>

      {/* Award Modal */}
      <AwardBountyModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        comment={comment}
        contentType={contentType}
      />
    </>
  );
};

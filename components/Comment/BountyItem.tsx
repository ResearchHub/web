import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { formatDeadline, formatTimestamp } from '@/utils/date';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import {
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { CommentReadOnly } from './CommentReadOnly';
import { useState } from 'react';
import { AwardBountyModal } from './AwardBountyModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faCheckCircle,
  faEye,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { SolutionModal } from './SolutionModal';
import { ID } from '@/types/root';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { AvatarStack } from '@/components/ui/AvatarStack';

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
  const [showSolutions, setShowSolutions] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<{
    id: ID;
    authorName: string;
    awardedAmount?: string;
  } | null>(null);

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

  // Find the first closed, non-contribution bounty if there's no active one
  const closedBounty = !activeBounty
    ? comment.bounties.find((bounty) => bounty.status === 'CLOSED' && !bounty.isContribution)
    : null;

  // If there's neither an active nor a closed bounty, don't render anything
  if (!activeBounty && !closedBounty) {
    console.log('No bounty found, returning null');
    return null;
  }

  // Use either the active or closed bounty for display
  const displayBounty = activeBounty || closedBounty;
  const isOpen = !!activeBounty;

  // Get all contributors including the main bounty creator
  const allContributors = comment.bounties
    .filter((bounty) => bounty.createdBy.authorProfile)
    .map((bounty) => ({
      profile: bounty.createdBy.authorProfile!,
      amount: Number(bounty.amount),
      isCreator: bounty.id === displayBounty?.id && !bounty.isContribution,
    }));

  // Calculate total amount including contributions
  const totalAmount = comment.bounties.reduce((sum, bounty) => sum + parseFloat(bounty.amount), 0);

  // Check if there are any solutions for the closed bounty
  const hasSolutions = !isOpen && displayBounty?.solutions && displayBounty.solutions.length > 0;

  // Calculate total awarded amount
  const totalAwardedAmount = hasSolutions
    ? displayBounty.solutions.reduce(
        (sum, solution) => sum + (solution.awardedAmount ? parseFloat(solution.awardedAmount) : 0),
        0
      )
    : 0;

  const getBountyTitle = () => {
    if (displayBounty?.bountyType === 'REVIEW') {
      return isOpen ? 'Bounty: Peer Review' : 'Awarded Bounty: Peer Review';
    }
    return isOpen ? 'Bounty' : 'Awarded Bounty';
  };

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    setSelectedSolution({
      id: solutionId,
      authorName,
      awardedAmount,
    });
  };

  return (
    <>
      <div className={`space-y-4 ${!isOpen ? '' : ''}`}>
        {/* Title with status indicator */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{getBountyTitle()}</h3>
          <div className="flex items-center gap-2">
            {!isOpen && (
              <div className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-md text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                <span>Awarded</span>
              </div>
            )}
            {/* RSC Amount */}
            <div className="flex items-center border border-orange-100 bg-orange-50 rounded-md px-3 py-1.5">
              <div className="flex items-center">
                <ResearchCoinIcon size={16} />
                <span className="ml-1 text-orange-800 text-sm mr-1">
                  {formatRSC({ amount: totalAmount })}
                </span>
                <span className="text-orange-600 text-xs">RSC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line items for metadata - Updated to match the image layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5 text-gray-500" />
              <div className="text-sm font-medium text-gray-500">Awarded by</div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <AvatarStack
                  items={allContributors.map(({ profile }) => ({
                    src: profile.profileImage || '',
                    alt: profile.fullName,
                    tooltip: profile.fullName,
                  }))}
                  size="xs"
                  maxItems={3}
                  spacing={-8}
                />
                <button
                  onClick={() => setShowContributorsModal(true)}
                  className="text-sm -mt-2 text-gray-700 hover:text-gray-900 hover:underline"
                >
                  {(() => {
                    // Find the creator first
                    const creator = allContributors.find((c) => c.isCreator);
                    const creatorName =
                      creator?.profile.fullName || allContributors[0].profile.fullName;

                    if (allContributors.length === 1) {
                      // Case 1: Just one contributor
                      return creatorName;
                    } else if (allContributors.length === 2) {
                      // Case 2: Two contributors
                      const otherContributor = allContributors.find(
                        (c) => c.profile.fullName !== creatorName
                      );
                      return `${creatorName} and ${otherContributor?.profile.fullName}`;
                    } else {
                      // Case 3: More than two contributors
                      // Find the second contributor (not the creator)
                      const secondContributor = allContributors.find(
                        (c) => c.profile.fullName !== creatorName
                      );
                      return `${creatorName}, ${secondContributor?.profile.fullName} and others`;
                    }
                  })()}
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <Clock className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
              )}
              <div className="text-sm font-medium text-gray-500">
                {isOpen ? 'Date' : 'Awarded date'}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-gray-700">
              {isOpen ? (
                <>
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {displayBounty?.expirationDate
                      ? `Deadline: ${formatDeadline(displayBounty.expirationDate)}`
                      : 'No deadline'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm">{formatTimestamp(comment.updatedDate)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-0">
          <CommentReadOnly content={comment.content} contentFormat={comment.contentFormat} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {isOpen ? (
              isCreator ? (
                <Button
                  variant="default"
                  onClick={() => setShowAwardModal(true)}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrophy} className="text-white h-4 w-4" />
                  Award
                </Button>
              ) : (
                <Button variant="start-task" onClick={onSubmitSolution}>
                  Start
                </Button>
              )
            ) : (
              hasSolutions && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setShowSolutions(!showSolutions)}
                  className="flex items-center gap-1.5"
                >
                  <MessageCircle className="h-4 w-4 text-indigo-500" />
                  <span>Solutions ({displayBounty?.solutions?.length || 0})</span>
                  {showSolutions ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-1" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  )}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Solutions section */}
        {hasSolutions && showSolutions && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              {displayBounty.solutions.map((solution, index) => (
                <div
                  key={solution.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={solution.createdBy.authorProfile?.profileImage || ''}
                      alt={solution.createdBy.authorProfile?.fullName || 'User'}
                      size="xs"
                    />
                    <span className="text-sm font-medium">
                      {solution.createdBy.authorProfile?.fullName || 'User'}
                    </span>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="h-3.5 w-3.5 text-green-500 ml-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {solution.awardedAmount && (
                      <div className="flex items-center gap-1.5">
                        <ResearchCoinIcon className="h-4 w-4" />
                        <span className="text-sm font-medium text-orange-600">
                          {formatRSC({ amount: parseFloat(solution.awardedAmount), shorten: true })}{' '}
                          RSC
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleViewSolution(
                          solution.objectId,
                          solution.createdBy.authorProfile?.fullName || 'User',
                          solution.awardedAmount
                        )
                      }
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                      <span className="text-xs">View</span>
                    </Button>
                  </div>
                </div>
              ))}

              {/* Total awarded amount */}
              {totalAwardedAmount > 0 && (
                <div className="flex justify-end mt-2">
                  <div className="text-sm text-gray-600">
                    Total awarded:{' '}
                    <span className="font-medium text-orange-600">
                      {formatRSC({ amount: totalAwardedAmount, shorten: true })} RSC
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Award Modal - only show for open bounties */}
      {isOpen && (
        <AwardBountyModal
          isOpen={showAwardModal}
          onClose={() => setShowAwardModal(false)}
          comment={comment}
          contentType={contentType}
        />
      )}

      {/* Solution Modal */}
      {selectedSolution && (
        <SolutionModal
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
          commentId={selectedSolution.id}
          documentId={comment.thread.objectId}
          contentType={contentType}
          solutionAuthorName={selectedSolution.authorName}
          awardedAmount={selectedSolution.awardedAmount}
        />
      )}

      {/* Contributors Modal */}
      <ContributorModal
        isOpen={showContributorsModal}
        onClose={() => setShowContributorsModal(false)}
        contributors={allContributors.map(({ profile, amount }) => ({ profile, amount }))}
        onContribute={isOpen ? onSubmitSolution : undefined}
      />
    </>
  );
};

import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { formatDeadline, formatTimestamp } from '@/utils/date';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  CheckCircle,
  MessageCircle,
  Plus,
  FileText,
  ClipboardCheck,
  MessageSquare,
} from 'lucide-react';
import { CommentReadOnly } from './CommentReadOnly';
import { useState, useEffect } from 'react';
import { AwardBountyModal } from './AwardBountyModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faCheckCircle,
  faEye,
  faCommentDots,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { SolutionModal } from './SolutionModal';
import { ID } from '@/types/root';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { findActiveBounty, findClosedBounty, calculateTotalBountyAmount } from '@/utils/bountyUtil';
import { buildWorkUrl } from '@/utils/url';
import { useRouter, useParams } from 'next/navigation';
import { BountyType } from '@/types/bounty';
import { commentEvents } from '@/hooks/useComments';
import { CommentService } from '@/services/comment.service';

interface BountyItemProps {
  comment: Comment;
  contentType: ContentType;
  onSubmitSolution: () => void;
  isCreator?: boolean;
  onBountyUpdated?: () => void;
}

export const BountyItem = ({
  comment,
  contentType,
  onSubmitSolution,
  isCreator = false,
  onBountyUpdated,
}: BountyItemProps) => {
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<{
    id: ID;
    authorName: string;
    awardedAmount?: string;
  } | null>(null);
  const router = useRouter();
  const params = useParams();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Handle navigation in useEffect to ensure it only runs client-side
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  console.log('BountyItem rendering', {
    commentType: comment.commentType,
    bounties: comment.bounties,
    activeBounty: comment.bounties.find(
      (bounty) => bounty.status === 'OPEN' && !bounty.isContribution
    ),
  });

  // Find the first open, non-contribution bounty using utility function
  const activeBounty = findActiveBounty(comment.bounties);

  // Find the first closed, non-contribution bounty if there's no active one using utility function
  const closedBounty = !activeBounty ? findClosedBounty(comment.bounties) : null;

  // If there's neither an active nor a closed bounty, don't render anything
  if (!activeBounty && !closedBounty) {
    console.log('No bounty found, returning null');
    return null;
  }

  // Check if the bounty is expiring soon (within 3 days)
  const isExpiringSoon = (expirationDate?: string): boolean => {
    if (!expirationDate) return false;

    const expiration = new Date(expirationDate);
    const now = new Date();

    // Calculate the difference in milliseconds
    const diffTime = expiration.getTime() - now.getTime();

    // Convert to days
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Return true if less than 3 days remaining
    return diffDays > 0 && diffDays < 3;
  };

  // Use either the active or closed bounty for display
  const displayBounty = activeBounty || closedBounty;
  const isOpen = !!activeBounty;
  const isPeerReviewBounty = displayBounty?.bountyType === 'REVIEW';
  const expiringSoon = isOpen && isExpiringSoon(displayBounty?.expirationDate);

  // Get all contributors including the main bounty creator
  const allContributors = comment.bounties
    .filter((bounty) => bounty.createdBy.authorProfile)
    .map((bounty) => ({
      profile: bounty.createdBy.authorProfile!,
      amount: Number(bounty.amount),
      isCreator: bounty.id === displayBounty?.id && !bounty.isContribution,
    }));

  // Calculate total amount including contributions using utility function
  const totalAmount = calculateTotalBountyAmount(comment.bounties);

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

  const handleNavigationClick = (tab: 'reviews' | 'conversation') => {
    // Get the document ID from the thread
    const documentId = comment.thread.objectId;

    // Set the pending navigation URL based on content type
    if (contentType === 'paper') {
      // For papers, use the buildWorkUrl function to get the base URL with slug
      const baseUrl = buildWorkUrl({
        id: documentId,
        contentType: 'paper',
        slug: params.slug as string,
      });

      // Navigate to the specified tab
      setPendingNavigation(`${baseUrl}/${tab}`);
    } else {
      // For posts, navigate to the post page with optional tab
      setPendingNavigation(`/post/${documentId}${tab === 'conversation' ? '/conversation' : ''}`);
    }
  };

  const handleContributeClick = () => {
    setShowContributeModal(true);
  };

  // Add an effect to listen for the comment_updated event
  useEffect(() => {
    const unsubscribe = commentEvents.on('comment_updated', (data) => {
      if (data.comment.id === comment.id) {
        // Refresh the bounty data
        console.log('Bounty updated, refreshing data');

        // Fetch the updated comment data
        CommentService.fetchComment({
          commentId: comment.id,
          documentId: comment.thread.objectId,
          contentType: contentType,
        })
          .then((updatedComment) => {
            // Update the UI with the new data
            // Since we can't directly update the comment prop, we can force a re-render
            // by toggling a state variable
            setShowContributeModal(false);
            // You might want to add a callback to the parent component to refresh the entire list
            onBountyUpdated?.();
          })
          .catch((error) => {
            console.error('Failed to fetch updated comment:', error);
          });
      }
    });

    return unsubscribe;
  }, [comment.id, comment.thread.objectId, contentType, onBountyUpdated]);

  return (
    <>
      <div className={`space-y-4 ${!isOpen ? '' : ''}`}>
        {/* Title with status indicator */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{getBountyTitle()}</h3>
          <div className="flex items-center gap-2">
            {/* Status badge - show for both open and closed bounties */}
            <StatusBadge
              status={expiringSoon ? 'expiring' : isOpen ? 'open' : 'closed'}
              className="shadow-sm rounded-full"
              size="xs"
            />
            {/* RSC Amount */}
            <RSCBadge
              amount={totalAmount}
              inverted={true}
              variant="badge"
              className="shadow-sm rounded-full h-[26px] flex items-center"
              size="xs"
            />
          </div>
        </div>

        {/* Line items for metadata - Updated to match the image layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5 text-gray-500" />
              <div className="text-sm font-medium text-gray-500">Created by</div>
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
          <div
            className={`bg-gray-50 p-4 rounded-lg ${expiringSoon ? 'border border-orange-300' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Clock
                className={`h-3.5 w-3.5 ${expiringSoon ? 'text-orange-500' : 'text-gray-500'}`}
              />
              <div
                className={`text-sm font-medium ${expiringSoon ? 'text-orange-700' : 'text-gray-500'}`}
              >
                Deadline
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-gray-700">
              <span className={`text-sm ${expiringSoon ? 'font-medium text-orange-600' : ''}`}>
                {isOpen
                  ? displayBounty?.expirationDate
                    ? formatDeadline(displayBounty.expirationDate)
                    : 'No deadline'
                  : 'Completed'}
              </span>
              {expiringSoon && (
                <span className="ml-1 text-xs font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                  Expiring Soon
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {comment.content && Object.keys(comment.content).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5 text-gray-500" />
              <div className="text-sm font-medium text-gray-500">Details</div>
            </div>
            <div className="mt-2">
              <CommentReadOnly content={comment.content} contentFormat={comment.contentFormat} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3 w-full">
            {isOpen ? (
              isCreator ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">You created this bounty</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => setShowAwardModal(true)}
                        className="flex items-center gap-2 shadow-sm"
                        size="sm"
                      >
                        <FontAwesomeIcon icon={faTrophy} className="text-white h-4 w-4" />
                        Award bounty
                      </Button>
                    </div>

                    <div className="h-6 border-r border-gray-200"></div>

                    <div className="flex gap-2">
                      {isPeerReviewBounty ? (
                        <Button
                          onClick={() => handleNavigationClick('reviews')}
                          size="sm"
                          className="shadow-sm flex items-center gap-2 hover:bg-indigo-700 hover:text-white transition-colors duration-200"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          Review
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleNavigationClick('conversation')}
                          size="sm"
                          className="shadow-sm flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Answer
                        </Button>
                      )}
                      <Button
                        variant="contribute"
                        onClick={handleContributeClick}
                        className="flex items-center gap-2 shadow-sm"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Contribute
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  {isPeerReviewBounty ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleNavigationClick('reviews')}
                      size="sm"
                      className="shadow-sm flex items-center gap-2 hover:bg-indigo-700 hover:text-white transition-colors duration-200"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Review
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleNavigationClick('conversation')}
                      size="sm"
                      className="shadow-sm flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Answer
                    </Button>
                  )}
                  <Button
                    variant="contribute"
                    onClick={handleContributeClick}
                    className="flex items-center gap-2 shadow-sm"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Contribute
                  </Button>
                </div>
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
                      <RSCBadge
                        amount={parseFloat(solution.awardedAmount)}
                        size="xs"
                        variant="inline"
                        inverted={true}
                        label="awarded"
                        className="flex items-center h-[24px]"
                      />
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
                    <RSCBadge
                      amount={totalAwardedAmount}
                      size="xs"
                      variant="inline"
                      inverted={true}
                      label="awarded"
                      className="flex items-center h-[24px]"
                    />
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
        onContribute={handleContributeClick}
      />

      {/* Contribute Modal */}
      {isOpen && displayBounty && (
        <ContributeBountyModal
          isOpen={showContributeModal}
          onClose={() => setShowContributeModal(false)}
          commentId={comment.id}
          documentId={Number(comment.thread.objectId)}
          contentType={contentType}
          bountyTitle={getBountyTitle()}
          bountyType={displayBounty.bountyType as BountyType}
          expirationDate={
            displayBounty.expirationDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        />
      )}
    </>
  );
};

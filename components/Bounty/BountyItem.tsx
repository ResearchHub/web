import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { formatDeadline } from '@/utils/date';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useState, useEffect } from 'react';
import { AwardBountyModal } from '@/components/Comment/AwardBountyModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { ID } from '@/types/root';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import {
  findActiveBounty,
  findClosedBounty,
  calculateTotalBountyAmount,
  isExpiringSoon,
  getBountyTitle,
  calculateTotalAwardedAmount,
  extractContributors,
  formatContributorNames,
  filterOutCreator,
} from '@/components/Bounty/lib/bountyUtil';
import { buildWorkUrl } from '@/utils/url';
import { useRouter, useParams } from 'next/navigation';
import { BountyType } from '@/types/bounty';
import { BountyDetails } from '@/components/Bounty/BountyDetails';
import { BountyActions } from '@/components/Bounty/BountyActions';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { useComments } from '@/contexts/CommentContext';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Info, Clock } from 'lucide-react';
import { BountyMetadataLine } from './BountyMetadataLine';
import { ContributorsButton } from '@/components/ui/ContributorsButton';

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
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<ID | null>(null);
  const [selectedSolutionAuthor, setSelectedSolutionAuthor] = useState<string>('');
  const [selectedSolutionAwardedAmount, setSelectedSolutionAwardedAmount] = useState<string>('');
  const router = useRouter();
  const params = useParams();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const { forceRefresh } = useComments();

  // Handle navigation in useEffect to ensure it only runs client-side
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  // Find the first open, non-contribution bounty using utility function
  const activeBounty = findActiveBounty(comment.bounties);

  // Find the first closed, non-contribution bounty if there's no active one using utility function
  const closedBounty = !activeBounty ? findClosedBounty(comment.bounties) : null;

  // If there's neither an active nor a closed bounty, don't render anything
  if (!activeBounty && !closedBounty) {
    return null;
  }

  // Use either the active or closed bounty for display
  const displayBounty = activeBounty || closedBounty;
  const isOpen = !!activeBounty;
  const isPeerReviewBounty = displayBounty?.bountyType === 'REVIEW';
  const expiringSoon = isOpen && isExpiringSoon(displayBounty?.expirationDate);

  // Get all contributors including the main bounty creator using utility function
  const allContributors = extractContributors(comment.bounties, displayBounty || undefined);

  // Filter out the creator from the contributors list for display
  const contributorsWithoutCreator = filterOutCreator(allContributors);

  // Calculate total amount including contributions using utility function
  const totalAmount = calculateTotalBountyAmount(comment.bounties);

  // Check if there are any solutions for the closed bounty
  const hasSolutions = !isOpen && displayBounty?.solutions && displayBounty.solutions.length > 0;

  // Calculate total awarded amount using utility function
  const totalAwardedAmount = calculateTotalAwardedAmount(displayBounty || undefined);

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    setSelectedSolutionId(solutionId);
    setSelectedSolutionAuthor(authorName);
    setSelectedSolutionAwardedAmount(awardedAmount || '');
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
        slug: (params?.slug as string) || '',
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

  const handleContributeComplete = () => {
    // Refresh the view after contribution is complete
    forceRefresh();
    // Call the parent's onBountyUpdated callback if provided
    if (onBountyUpdated) {
      onBountyUpdated();
    }
  };

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Bounty metadata in a single line */}
        <BountyMetadataLine
          bountyType={displayBounty?.bountyType}
          amount={totalAmount}
          expirationDate={displayBounty?.expirationDate}
          isOpen={isOpen}
          expiringSoon={expiringSoon}
        />

        {/* Details section */}
        {comment.content && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <BountyDetails content={comment.content} contentFormat={comment.contentFormat} />
          </div>
        )}

        {/* Action buttons with contributors */}
        <div className={`mt-6 ${isOpen ? 'flex items-center justify-between' : 'w-full'}`}>
          {isOpen ? (
            <div className="flex items-center justify-between w-full pt-4 border-t border-gray-200">
              <BountyActions
                isOpen={isOpen}
                isCreator={isCreator}
                isPeerReviewBounty={isPeerReviewBounty}
                onAwardClick={() => setShowAwardModal(true)}
                onNavigationClick={handleNavigationClick}
                onContributeClick={handleContributeClick}
              />

              {/* Contributors display */}
              <div className="ml-4">
                <ContributorsButton
                  contributors={allContributors}
                  onContribute={handleContributeClick}
                  label="Contributors"
                />
              </div>
            </div>
          ) : (
            hasSolutions && (
              <BountySolutions
                solutions={displayBounty.solutions}
                isPeerReviewBounty={isPeerReviewBounty}
                totalAwardedAmount={totalAwardedAmount}
                onViewSolution={handleViewSolution}
              />
            )
          )}
        </div>
      </div>

      {/* Award Modal - only show for open bounties */}
      {isOpen && (
        <AwardBountyModal
          isOpen={showAwardModal}
          onClose={() => setShowAwardModal(false)}
          comment={comment}
          contentType={contentType}
          onBountyUpdated={() => {
            // Refresh the comments using the context
            forceRefresh();

            // Also call the parent's onBountyUpdated if provided
            if (onBountyUpdated) {
              onBountyUpdated();
            }
          }}
        />
      )}

      {/* Solution Modal */}
      {selectedSolutionId && (
        <SolutionModal
          isOpen={!!selectedSolutionId}
          onClose={() => {
            setSelectedSolutionId(null);
            setSelectedSolutionAuthor('');
            setSelectedSolutionAwardedAmount('');
          }}
          commentId={selectedSolutionId}
          documentId={comment.thread.objectId}
          contentType={contentType}
          solutionAuthorName={selectedSolutionAuthor}
          awardedAmount={selectedSolutionAwardedAmount}
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
          onClose={() => {
            setShowContributeModal(false);
          }}
          onContributeSuccess={handleContributeComplete}
          commentId={comment.id}
          documentId={Number(comment.thread.objectId)}
          contentType={contentType}
          bountyTitle={getBountyTitle(displayBounty || undefined, isOpen)}
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

import { Bounty } from '@/types/bounty';
import { ContentType } from '@/types/work';
import { ContentFormat } from '@/types/comment';
import { BountyCard } from './BountyCard';
import {
  calculateTotalBountyAmount,
  calculateTotalAwardedAmount,
  extractContributors,
  findActiveBounty,
  findClosedBounty,
} from '@/components/Bounty/lib/bountyUtil';

interface BountyCardAdapterProps {
  bounties: Bounty[];
  content?: any;
  contentFormat?: ContentFormat;
  documentId: number;
  contentType: ContentType;
  commentId?: number;
  onSubmitSolution?: () => void;
  isCreator?: boolean;
  onBountyUpdated?: () => void;
  slug?: string;
}

/**
 * BountyCardAdapter is a component that adapts various data sources to be used with BountyCard.
 * This allows BountyCard to be used in different contexts, such as in feeds where we don't have a Comment object.
 */
export const BountyCardAdapter = ({
  bounties,
  content,
  contentFormat,
  documentId,
  contentType,
  commentId,
  onSubmitSolution,
  isCreator = false,
  onBountyUpdated,
  slug,
}: BountyCardAdapterProps) => {
  // If there are no bounties, don't render anything
  if (!bounties || bounties.length === 0) {
    return null;
  }

  // Find the first open, non-contribution bounty
  const activeBounty = findActiveBounty(bounties);

  // Find the first closed, non-contribution bounty if there's no active one
  const closedBounty = !activeBounty ? findClosedBounty(bounties) : null;

  // If there's neither an active nor a closed bounty, don't render anything
  if (!activeBounty && !closedBounty) {
    return null;
  }

  // Use either the active or closed bounty for display
  const displayBounty = activeBounty || closedBounty;

  // Since we've checked above that either activeBounty or closedBounty exists,
  // displayBounty should never be null or undefined here
  if (!displayBounty) {
    return null;
  }

  const isOpen = !!activeBounty;
  const isPeerReviewBounty = displayBounty.bountyType === 'REVIEW';

  // Get all contributors including the main bounty creator
  const contributors = extractContributors(bounties, displayBounty);

  // Calculate total amount including contributions
  const totalBountyAmount = calculateTotalBountyAmount(bounties);

  // Calculate total awarded amount
  const totalAwardedAmount = calculateTotalAwardedAmount(displayBounty);

  return (
    <BountyCard
      bountyType={displayBounty.bountyType}
      totalBountyAmount={totalBountyAmount}
      expirationDate={displayBounty.expirationDate}
      isOpen={isOpen}
      isPeerReviewBounty={isPeerReviewBounty}
      content={content}
      contentFormat={contentFormat}
      documentId={documentId}
      contentType={contentType}
      commentId={commentId}
      solutions={displayBounty.solutions}
      totalAwardedAmount={totalAwardedAmount}
      contributors={contributors}
      onSubmitSolution={onSubmitSolution}
      isCreator={isCreator}
      onBountyUpdated={onBountyUpdated}
      slug={slug}
    />
  );
};

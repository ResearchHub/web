'use client';

import { FC } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { BountyMetadataLine } from '@/components/Bounty/BountyMetadataLine';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { isExpiringSoon, calculateTotalAwardedAmount } from '@/components/Bounty/lib/bountyUtil';
import { ContentFormat } from '@/types/comment';
import { ID } from '@/types/root';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyType } from '@/types/bounty';
import { formatRSC } from '@/utils/number';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';

/**
 * Internal component for rendering bounty details
 */
const BountyDetails: FC<{
  content: any;
  contentFormat: ContentFormat | undefined;
  bountyType: BountyType;
}> = ({ content, contentFormat, bountyType }) => {
  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-md font-semibold text-gray-900">
          {bountyType === 'REVIEW' ? 'Peer Review Earning Opportunity' : 'Earning Opportunity'}
        </div>
      </div>
      <div className="text-gray-600">
        <CommentReadOnly content={content} contentFormat={contentFormat} />
      </div>
    </div>
  );
};

interface FeedItemBountyProps {
  entry: FeedEntry;
  showSolutions?: boolean;
  showRelatedWork?: boolean;
  relatedDocumentId?: number;
  href?: string; // Optional href prop
}

/**
 * Component for rendering the body content of a bounty feed item
 */
const FeedItemBountyBody: FC<{
  entry: FeedEntry;
  showSolutions?: boolean;
  showRelatedWork?: boolean;
}> = ({ entry, showSolutions = true, showRelatedWork = true }) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;

  // Determine bounty status
  const isOpen = bounty.status === 'OPEN';
  const expiringSoon = isExpiringSoon(bounty.expirationDate);

  // Check if this is a peer review bounty
  const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

  // Check if there are solutions
  const hasSolutions = bounty.solutions && bounty.solutions.length > 0;
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;

  // Calculate total awarded amount for solutions
  const totalAwardedAmount = calculateTotalAwardedAmount(bounty);

  // Get related work if available
  const relatedWork = entry.relatedWork;

  return (
    <div className="mb-4">
      {/* Bounty Metadata Line with badges and status */}
      <div onClick={(e) => e.stopPropagation()}>
        <BountyMetadataLine
          bountyType={bounty.bountyType}
          amount={parseFloat(bounty.totalAmount)}
          expirationDate={bounty.expirationDate}
          isOpen={isOpen}
          expiringSoon={expiringSoon}
          solutionsCount={solutionsCount}
        />
      </div>

      {/* Bounty Details */}
      <div className="mt-4">
        <BountyDetails
          content={bountyEntry.comment.content}
          contentFormat={bountyEntry.comment.contentFormat}
          bountyType={bounty.bountyType}
        />
      </div>

      {/* Related Work - show if available */}
      {relatedWork && showRelatedWork && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <RelatedWorkCard size="sm" work={relatedWork} />
        </div>
      )}

      {/* Solutions section for closed bounties */}
      {!isOpen && hasSolutions && showSolutions && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <BountySolutions
            solutions={bounty.solutions}
            isPeerReviewBounty={isPeerReviewBounty}
            totalAwardedAmount={totalAwardedAmount}
            onViewSolution={(solutionId: ID, authorName: string, awardedAmount?: string) => {
              console.log('View solution:', solutionId, authorName, awardedAmount);
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Main component for rendering a bounty feed item
 */
export const FeedItemBounty: FC<FeedItemBountyProps> = ({
  entry,
  relatedDocumentId,
  showSolutions = true,
  showRelatedWork = true,
  href,
}) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;
  const router = useRouter();

  // Get the author from the bounty entry
  const author = bountyEntry.createdBy;

  // Determine bounty status for header display
  const isActive = bounty.status === 'OPEN';
  const isExpiring = isActive && isExpiringSoon(bounty.expirationDate);
  const bountyStatus = isExpiring ? 'expiring' : isActive ? 'open' : 'closed';

  // Use provided href or create default bounty page URL
  const bountyPageUrl = href || `/bounty/${bounty.id}`;

  // Format the bounty amount for display in the action text
  const formattedBountyAmount = bounty.amount
    ? formatRSC({ amount: parseFloat(bounty.amount) })
    : '';
  const bountyActionText = bounty.amount
    ? `Opened a bounty for ${formattedBountyAmount} RSC`
    : 'Opened a bounty';

  // Handle click on the card (navigate to bounty page) - only if href is provided
  const handleCardClick = () => {
    if (href) {
      router.push(bountyPageUrl);
    }
  };

  // Determine if card should have clickable styles
  const isClickable = !!href;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={bountyEntry.createdDate}
        author={author}
        actionText={bountyActionText}
      />

      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-4">
          {/* Content area */}
          <div className="mb-4">
            {/* Body Content */}
            <FeedItemBountyBody
              entry={entry}
              showSolutions={showSolutions}
              showRelatedWork={showRelatedWork}
            />
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2 items-center w-full" onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType="BOUNTY"
                votableEntityId={bountyEntry.comment.id}
                relatedDocumentId={bountyEntry.relatedDocumentId}
                relatedDocumentContentType={bountyEntry.relatedDocumentContentType}
                userVote={entry.userVote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

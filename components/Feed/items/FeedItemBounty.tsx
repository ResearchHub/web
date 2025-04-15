'use client';

import { FC, useState } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions, ActionButton } from '@/components/Feed/FeedItemActions';
import { BountyMetadataLine } from '@/components/Bounty/BountyMetadataLine';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import {
  isExpiringSoon,
  calculateTotalAwardedAmount,
  isOpenBounty,
} from '@/components/Bounty/lib/bountyUtil';
import { ContentFormat } from '@/types/comment';
import { ID } from '@/types/root';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyContribution, BountyType } from '@/types/bounty';
import { formatRSC } from '@/utils/number';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { Trophy, Pen, Plus, Users, ArrowBigUpDash } from 'lucide-react';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';

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
  showTooltips?: boolean; // Property for controlling tooltips
  showContributeButton?: boolean; // Property for controlling the visibility of the contribute button
  onViewSolution?: (event: {
    solutionId: number;
    authorName: string;
    awardedAmount?: string;
  }) => void;
  onAward?: () => void; // Prop for Award action
  onEdit?: () => void; // Prop for Edit action
  onContributeSuccess?: () => void; // Prop for handling successful contribution
  isAuthor?: boolean; // Prop to determine if current user is the author
  showCreatorActions?: boolean; // Prop to determine whether to show creator actions
  actionLabels?: {
    upvote?: string;
    comment?: string;
  }; // Prop for customizing action labels
}

/**
 * Component for rendering the body content of a bounty feed item
 */
const FeedItemBountyBody: FC<{
  entry: FeedEntry;
  showSolutions?: boolean;
  showRelatedWork?: boolean;
  onViewSolution?: (event: {
    solutionId: number;
    authorName: string;
    awardedAmount?: string;
  }) => void;
}> = ({ entry, showSolutions = true, showRelatedWork = true, onViewSolution }) => {
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

  // Handle solution viewing
  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    if (onViewSolution) {
      onViewSolution({
        solutionId: typeof solutionId === 'number' ? solutionId : Number(solutionId),
        authorName,
        awardedAmount,
      });
    } else {
      console.log('View solution:', solutionId, authorName, awardedAmount);
    }
  };

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
            onViewSolution={handleViewSolution}
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
  showTooltips = true, // Default to showing tooltips
  showContributeButton = true, // Default to showing contribute button
  onViewSolution,
  onAward,
  onEdit,
  onContributeSuccess,
  isAuthor = false,
  showCreatorActions = true, // Default to showing creator actions
  actionLabels,
}) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;
  const router = useRouter();

  // State for contribute modal
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

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

  // Handle opening the contribute modal
  const handleOpenContributeModal = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.stopPropagation();
    }
    setIsContributeModalOpen(true);
  };

  // Create menu items array for FeedItemActions
  const menuItems = [];

  // Add Edit action to menu if applicable
  if (showCreatorActions && isAuthor && onEdit) {
    menuItems.push({
      icon: Pen,
      label: 'Edit',
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onEdit();
      },
    });
  }

  // Award button as a custom action button (to be displayed next to upvote)
  const awardButton =
    showCreatorActions && isAuthor && isOpenBounty(bounty) && onAward ? (
      <ActionButton
        icon={Trophy}
        label="Award"
        tooltip={showTooltips ? 'Award this bounty to a solution' : undefined}
        onClick={(e) => {
          e?.stopPropagation();
          onAward();
        }}
        showLabel={true}
        showTooltip={showTooltips}
        isActive={false}
        isDisabled={false}
      />
    ) : null;

  // Add Contributors action to menu if applicable
  if (bounty.contributions && bounty.contributions.length > 0) {
    menuItems.push({
      icon: Users,
      label: 'View Contributors',
      onClick: (e?: React.MouseEvent) => {
        e?.stopPropagation();
        handleOpenContributeModal(e);
      },
    });
  }

  // Contribute button as a custom right side action
  const contributeButton =
    isOpenBounty(bounty) && !isAuthor && showContributeButton ? (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center text-gray-600">
              <ArrowBigUpDash size={24} />
            </div>
            <div>Support this bounty with RSC to increase its visibility and reward amount</div>
          </div>
        }
        position="top"
        width="w-[350px]"
      >
        <Button
          onClick={handleOpenContributeModal}
          size="sm"
          variant="outlined"
          className="text-sm text-xs font-medium gap-2 border-orange-400 text-orange-600"
        >
          <ResearchCoinIcon size={16} contribute />
          Support this bounty
        </Button>
      </Tooltip>
    ) : undefined;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={bountyEntry.createdDate}
        author={author}
        actionText={bountyActionText}
        contributors={
          bounty.contributions?.map((contribution: BountyContribution) => ({
            profileImage: contribution.createdBy?.authorProfile?.profileImage,
            fullName: contribution.createdBy?.authorProfile?.fullName || 'Anonymous',
            profileUrl: contribution.createdBy?.authorProfile?.profileUrl,
          })) || []
        }
        isBounty={true}
        totalContributorsCount={bounty.contributions?.length || 0}
      />

      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200 cursor-pointer'
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
              onViewSolution={onViewSolution}
            />
            {contributeButton}
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType="BOUNTY"
                votableEntityId={bountyEntry.comment.id}
                relatedDocumentId={bountyEntry.relatedDocumentId}
                relatedDocumentContentType={bountyEntry.relatedDocumentContentType}
                userVote={entry.userVote}
                showTooltips={showTooltips}
                actionLabels={actionLabels}
                hideCommentButton={isAuthor}
                menuItems={menuItems}
              >
                {/* Award button appears next to upvote and comment buttons */}
                {awardButton}
              </FeedItemActions>
            </div>
          </div>
        </div>
      </div>

      {/* Contribute Bounty Modal */}
      <ContributeBountyModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={() => {
          // Call both callback functions
          if (onContributeSuccess) {
            onContributeSuccess();
          }
        }}
        commentId={bountyEntry.comment.id}
        documentId={bountyEntry.relatedDocumentId || 0}
        contentType={bountyEntry.relatedDocumentContentType || 'paper'}
        bountyTitle={'Bounty'}
        bountyType={bounty.bountyType}
        expirationDate={bounty.expirationDate}
      />
    </div>
  );
};

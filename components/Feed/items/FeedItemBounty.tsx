'use client';

import { FC, useState } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { Topic } from '@/types/topic';
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
import { formatCurrency } from '@/utils/currency';
import { useParams } from 'next/navigation';
import { Trophy, Pen, Users, MessageSquareReply } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { buildWorkUrl } from '@/utils/url';
import { CardWrapper } from './CardWrapper';
/**
 * Internal component for rendering bounty details
 */
const BountyDetails: FC<{
  content: any;
  contentFormat: ContentFormat | undefined;
  bountyType: BountyType;
  maxLength?: number;
}> = ({ content, contentFormat, bountyType, maxLength }) => {
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
        <CommentReadOnly content={content} contentFormat={contentFormat} maxLength={maxLength} />
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
  onReply?: () => void; // Prop for Reply action
  onContributeSuccess?: () => void; // Prop for handling successful contribution
  isAuthor?: boolean; // Prop to determine if current user is the author
  showCreatorActions?: boolean; // Prop to determine whether to show creator actions
  actionLabels?: {
    upvote?: string;
    comment?: string;
  }; // Prop for customizing action labels
  showFooter?: boolean; // Prop to control footer visibility
  hideActions?: boolean; // Prop to hide actions, similar to FeedItemComment
  onTopicClick?: (topic: Topic) => void;
  showSupportAndCTAButtons?: boolean; // Show container for Support and CTA buttons
  showDeadline?: boolean; // Show deadline in metadata line
  maxLength?: number;
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
  onTopicClick?: (topic: Topic) => void;
  showDeadline?: boolean;
  maxLength?: number;
}> = ({
  entry,
  showSolutions = true,
  showRelatedWork = true,
  onViewSolution,
  onTopicClick,
  showDeadline = true,
  maxLength,
}) => {
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
          amount={parseFloat(bounty.totalAmount)}
          expirationDate={bounty.expirationDate}
          isOpen={isOpen}
          expiringSoon={expiringSoon}
          solutionsCount={solutionsCount}
          showDeadline={showDeadline}
        />
      </div>

      {/* Related Work - show if available */}
      {relatedWork && showRelatedWork && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <RelatedWorkCard size="sm" work={relatedWork} onTopicClick={onTopicClick} />
        </div>
      )}

      {/* Bounty Details */}
      <div className="mt-4">
        <BountyDetails
          content={bountyEntry.comment.content}
          contentFormat={bountyEntry.comment.contentFormat}
          bountyType={bounty.bountyType}
          maxLength={maxLength}
        />
      </div>

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
  onReply,
  onContributeSuccess,
  isAuthor = false,
  showCreatorActions = true, // Default to showing creator actions
  actionLabels,
  showFooter = true, // Default to showing the footer
  hideActions = false, // Prop to hide actions, similar to FeedItemComment
  onTopicClick,
  showSupportAndCTAButtons = true, // Show container for Support and CTA buttons
  showDeadline = true, // Show deadline in metadata line
  maxLength,
}) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;
  const params = useParams();

  // Get currency preference and exchange rate
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  // State for contribute modal
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // Get the author from the bounty entry
  const author = bountyEntry.createdBy;

  // Determine bounty status for header display
  const isActive = bounty.status === 'OPEN';
  const isExpiring = isActive && isExpiringSoon(bounty.expirationDate);
  const bountyStatus = isExpiring ? 'expiring' : isActive ? 'open' : 'closed';

  // Check if there are solutions to award
  const hasSolutions = bounty.solutions && bounty.solutions.length > 0;

  // Format the bounty amount for display in the action text
  const formattedBountyAmount = bounty.totalAmount
    ? formatCurrency({
        amount: parseFloat(bounty.totalAmount),
        showUSD,
        exchangeRate,
        shorten: true,
      })
    : '';
  const bountyActionText = bounty.totalAmount
    ? `created a bounty for ${formattedBountyAmount} ${showUSD ? '' : 'RSC'}`
    : 'created a bounty';

  // Determine if card should have clickable styles
  const isClickable = !!href;

  // Handle opening the contribute modal
  const handleOpenContributeModal = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsContributeModalOpen(true);
  };

  // Handle CTA button click (Add Review/Add Solution)
  const handleSolution = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click navigation

    // Attempt to derive the work details from the feed entry first
    let workId: string | number | undefined;
    let workSlug: string | undefined;
    let workContentType: string | undefined;

    if (entry.relatedWork) {
      workId = entry.relatedWork.id;
      workSlug = entry.relatedWork.slug;
      workContentType = entry.relatedWork.contentType;
    } else {
      // Fallback to next/router params (works when rendered on a work page)
      const { id: paramId, slug: paramSlug } = params;
      workId = paramId as string | number | undefined;
      workSlug = paramSlug as string | undefined;
      workContentType = bountyEntry.relatedDocumentContentType;
    }

    // Ensure we have enough information to build the URL
    if (!workId || !workContentType) {
      console.error('FeedItemBounty: Unable to determine destination for CTA', {
        workId,
        workSlug,
        workContentType,
        entry,
      });
      return;
    }

    // Always redirect to the reviews tab
    const workUrl = buildWorkUrl({
      id: workId.toString(),
      contentType: workContentType as any,
      slug: workSlug,
      tab: 'reviews',
    });

    // Add focus flag to query params so the page can focus the editor
    const urlWithFocus = `${workUrl}?focus=true`;

    // Full page navigation
    window.location.href = urlWithFocus;
  };

  // Handle awarding the bounty
  const handleAwardBounty = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onAward) {
      onAward();
    }
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
        e?.preventDefault();
        onEdit();
      },
    });
  }

  // Create the award button styled like the contribute button
  const awardButton =
    showCreatorActions && isAuthor && isOpenBounty(bounty) && onAward ? (
      <Button
        onClick={handleAwardBounty}
        size="sm"
        variant="default"
        className="text-sm text-xs font-medium gap-2 bg-amber-300 hover:bg-amber-400 ml-2 text-gray-900"
      >
        <Trophy size={16} className="text-gray-900" />
        Award bounty
      </Button>
    ) : null;

  // Add Contributors action to menu if applicable
  if (bounty.contributions && bounty.contributions.length > 0) {
    menuItems.push({
      icon: Users,
      label: 'View Contributors',
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        handleOpenContributeModal(e);
      },
    });
  }

  // Check if actions should be hidden:
  // 1. Explicitly via hideActions prop, or
  // 2. If the associated comment has been removed (accessing raw API data)
  const shouldHideActions =
    hideActions || Boolean((entry.raw as any)?.content_object?.comment?.is_removed);

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
        work={entry.relatedWork}
      />

      <CardWrapper href={href} isClickable={isClickable}>
        <div className="p-4">
          {' '}
          {/* Added padding back */}
          <FeedItemBountyBody
            entry={entry}
            showSolutions={showSolutions}
            showRelatedWork={showRelatedWork}
            onViewSolution={onViewSolution}
            onTopicClick={onTopicClick}
            showDeadline={showDeadline}
            maxLength={maxLength}
          />
          {/* Container for Support and CTA buttons */}
          {showSupportAndCTAButtons && (
            <div
              className="mt-4 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {/* Contribute Button - Conditionally shown */}
              {isActive && showContributeButton && !isAuthor && (
                <Button variant="contribute" size="sm" onClick={handleOpenContributeModal}>
                  <ResearchCoinIcon size={20} variant="orange" contribute />
                  Support this bounty
                </Button>
              )}

              {/* Award Button - shown instead of "Support this bounty" if user is author */}
              {awardButton}

              {/* Add Solution/Review CTA Button - shown only if bounty is open */}
              {isActive && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 md:!flex-none flex items-center gap-1.5"
                  onClick={handleSolution}
                >
                  <MessageSquareReply size={18} /> {/* Added icon */}
                  {bounty.bountyType === 'REVIEW' ? 'Add your Review' : 'Add Solution'}
                </Button>
              )}
            </div>
          )}
          {/* Action Buttons - Full width - Moved inside the padded div */}
          {showFooter && !shouldHideActions && (
            <div
              className="mt-4 pt-3 border-t border-gray-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType="BOUNTY"
                votableEntityId={bountyEntry.comment.id}
                relatedDocumentId={bountyEntry.relatedDocumentId}
                relatedDocumentContentType={bountyEntry.relatedDocumentContentType}
                userVote={entry.userVote}
                tips={entry.tips}
                showTooltips={showTooltips}
                actionLabels={actionLabels}
                menuItems={menuItems}
                bounties={[bountyEntry.bounty]}
                onComment={onReply}
              />
            </div>
          )}
        </div>
      </CardWrapper>

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

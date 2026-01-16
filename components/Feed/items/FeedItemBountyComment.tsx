'use client';

import { FC, useState } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { Topic } from '@/types/topic';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { BountyMetadataLine } from '@/components/Bounty/BountyMetadataLine';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import {
  isExpiringSoon,
  calculateTotalAwardedAmount,
  isOpenBounty,
  getBountyDisplayAmount,
  isActiveBounty,
} from '@/components/Bounty/lib/bountyUtil';
import { ContentFormat } from '@/types/comment';
import { ID } from '@/types/root';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyContribution, BountyType } from '@/types/bounty';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, Pen, Users, MessageSquareReply } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { buildWorkUrl } from '@/utils/url';
import { BaseFeedItem, TitleSection } from '@/components/Feed/BaseFeedItem';

/**
 * Internal component for rendering bounty details
 */
export const BountyDetails: FC<{
  content: any;
  contentFormat: ContentFormat | undefined;
  bountyType: BountyType;
  maxLength?: number;
  href?: string;
  onFeedItemClick?: () => void;
}> = ({ content, contentFormat, bountyType, maxLength, href, onFeedItemClick }) => {
  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <TitleSection
        title={bountyType === 'REVIEW' ? 'Peer Review Earning Opportunity' : 'Earning Opportunity'}
        className="text-md"
        href={href}
        onClick={onFeedItemClick}
      />
      <div className="text-gray-600 mt-2">
        <CommentReadOnly content={content} contentFormat={contentFormat} maxLength={maxLength} />
      </div>
    </div>
  );
};

interface FeedItemBountyCommentProps {
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
  onAward?: (bountyId: number) => void; // Prop for Award action, passes bounty ID
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
  onFeedItemClick?: () => void;
}

/**
 * Main component for rendering a bounty feed item
 */
export const FeedItemBountyComment: FC<FeedItemBountyCommentProps> = ({
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
  onFeedItemClick,
}) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;
  const params = useParams();
  const router = useRouter();

  // Get currency preference and exchange rate
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  // State for contribute modal
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // Get the author from the bounty entry
  const author = bountyEntry.createdBy;

  // Determine bounty status
  const isOpen = isOpenBounty(bounty);
  const isActive = isActiveBounty(bounty);
  const expiringSoon = isExpiringSoon(bounty.expirationDate);
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;
  const hasSolutions = solutionsCount > 0;

  // Calculate display amount (handles Foundation bounties with flat $150 USD)
  const { amount: displayBountyAmount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  // Always use generic action text without amount
  const bountyActionText = 'created a bounty';

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
    let workPostType: string | undefined;

    if (entry.relatedWork) {
      workId = entry.relatedWork.id;
      workSlug = entry.relatedWork.slug;
      workContentType = entry.relatedWork.contentType;
      workPostType = entry.relatedWork.postType;
    } else {
      // Fallback to next/router params (works when rendered on a work page)
      const { id: paramId, slug: paramSlug } = params;
      workId = paramId as string | number | undefined;
      workSlug = paramSlug as string | undefined;
      workContentType = bountyEntry.relatedDocumentContentType;
    }

    if (!workId || !workContentType) {
      console.error('FeedItemBountyComment: Unable to determine destination for CTA', {
        workId,
        workSlug,
        workContentType,
        entry,
      });
      return;
    }

    // Determine which tab to redirect to based on postType
    const targetTab = workPostType === 'QUESTION' ? 'conversation' : 'reviews';

    if (workPostType === 'QUESTION') {
      workContentType = 'question';
    }

    const workUrl = buildWorkUrl({
      id: workId.toString(),
      contentType: workContentType as any,
      slug: workSlug,
      tab: targetTab,
    });
    const urlWithFocus = `${workUrl}?focus=true`;

    router.push(urlWithFocus);
  };

  const handleAwardBounty = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!bounty.id) {
      toast.error(
        'Bounty ID is missing. Please try again. If the problem persists, please contact support.'
      );
      return;
    }
    if (onAward) {
      onAward(bounty.id);
    }
  };

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    if (onViewSolution) {
      onViewSolution({
        solutionId: typeof solutionId === 'number' ? solutionId : Number(solutionId),
        authorName,
        awardedAmount,
      });
    }
  };

  // Create menu items array for FeedItemActions
  const menuItems = [];
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

  const awardButton =
    showCreatorActions && isAuthor && isActiveBounty(bounty) && onAward ? (
      <Button
        onClick={handleAwardBounty}
        size="sm"
        variant="outlined"
        className="text-sm font-medium gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
      >
        <Trophy size={16} />
        Award bounty
      </Button>
    ) : null;

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

  const isCommentRemoved = entry.raw?.content_object?.comment?.is_removed ?? false;
  const shouldHideActions = hideActions || Boolean(isCommentRemoved);

  return (
    <div className="space-y-3">
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
        hotScoreV2={entry.hotScoreV2}
        hotScoreBreakdown={entry.hotScoreBreakdown}
        externalMetrics={entry.externalMetrics}
      />

      <BaseFeedItem
        entry={entry}
        href={href}
        showHeader={false}
        showActions={false}
        onFeedItemClick={onFeedItemClick}
      >
        <div onMouseDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <BountyMetadataLine
            amount={displayBountyAmount}
            expirationDate={bounty.expirationDate}
            isOpen={isActive}
            expiringSoon={expiringSoon}
            solutionsCount={solutionsCount}
            bountyStatus={bounty.status}
            showDeadline={showDeadline}
            skipConversion={showUSD}
          />
        </div>

        {entry.relatedWork && showRelatedWork && (
          <div
            className="mt-4"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <RelatedWorkCard
              size="sm"
              work={entry.relatedWork}
              onTopicClick={onTopicClick}
              onFeedItemClick={onFeedItemClick}
            />
          </div>
        )}

        <BountyDetails
          content={bountyEntry.comment.content}
          contentFormat={bountyEntry.comment.contentFormat}
          bountyType={bounty.bountyType}
          maxLength={maxLength}
          href={href}
          onFeedItemClick={onFeedItemClick}
        />

        {!isOpen && hasSolutions && showSolutions && (
          <div
            className="mt-4"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <BountySolutions
              solutions={bounty.solutions}
              isPeerReviewBounty={bounty.bountyType === 'REVIEW'}
              totalAwardedAmount={calculateTotalAwardedAmount(bounty)}
              onViewSolution={handleViewSolution}
            />
          </div>
        )}

        {showSupportAndCTAButtons && (
          <div
            className="mt-4 flex items-center gap-2 flex-wrap mobile:flex-wrap flex-nowrap"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            aria-hidden="true"
            tabIndex={-1}
          >
            {isOpen && (
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 min-w-[140px] !flex-1 mobile:!flex-initial mobile:!w-auto"
                onClick={handleSolution}
              >
                <MessageSquareReply size={16} />
                {(() => {
                  if (entry.relatedWork?.postType === 'QUESTION') {
                    return 'Add answer';
                  }
                  if (bounty.bountyType === 'REVIEW') {
                    return 'Add Review';
                  }

                  return 'Add Solution';
                })()}
              </Button>
            )}
            {awardButton}
            {isActive && showContributeButton && !isAuthor && (
              <Button
                variant="outlined"
                size="sm"
                onClick={handleOpenContributeModal}
                className="text-orange-600 gap-2 border-orange-600 hover:bg-orange-50 min-w-[140px] !flex-1 mobile:!flex-initial mobile:!w-auto"
              >
                <ResearchCoinIcon outlined size={16} />
                Support
              </Button>
            )}
          </div>
        )}

        {showFooter && !shouldHideActions && (
          <div
            className="mt-4 pt-3 border-t border-gray-200"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            aria-hidden="true"
            tabIndex={-1}
          >
            <FeedItemActions
              metrics={entry.metrics}
              feedContentType="BOUNTY"
              votableEntityId={bountyEntry.comment.id}
              relatedDocumentId={bountyEntry.relatedDocumentId?.toString()}
              relatedDocumentContentType={bountyEntry.relatedDocumentContentType}
              userVote={entry.userVote}
              showTooltips={showTooltips}
              actionLabels={actionLabels}
              menuItems={menuItems}
              onComment={onReply}
              relatedDocumentTopics={entry.relatedWork?.topics}
              relatedDocumentUnifiedDocumentId={
                entry.relatedWork?.unifiedDocumentId?.toString() || undefined
              }
              onFeedItemClick={onFeedItemClick}
              hideCommentButton={(entry.metrics?.comments ?? 0) === 0}
            />
          </div>
        )}
      </BaseFeedItem>

      <ContributeBountyModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={() => {
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

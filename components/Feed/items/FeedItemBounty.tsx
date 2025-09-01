'use client';

import { FC, useState } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { Topic } from '@/types/topic';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import {
  BountyMetadataLine,
  BountySolutions,
  BountyInlineBanner,
  isExpiringSoon,
  calculateTotalAwardedAmount,
  isOpenBounty,
} from '@/components/Bounty';
import { ContentFormat } from '@/types/comment';
import { ID } from '@/types/root';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyContribution, BountyType } from '@/types/bounty';
import { formatCurrency } from '@/utils/currency';
import { useParams } from 'next/navigation';
import { Pen, Users, FileText, Info } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { buildWorkUrl } from '@/utils/url';
import { BaseFeedItem, TitleSection, ContentSection } from '@/components/Feed/BaseFeedItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye } from '@fortawesome/pro-solid-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

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
    <div className="">
      <div className="flex items-center gap-2 mb-2">
        <FontAwesomeIcon icon={faBullseye} className="text-gray-500" style={{ fontSize: '16px' }} />
        <h3 className="text-md font-semibold text-gray-700">Bounty Requirements</h3>
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
  showMetadataLine?: boolean; // Show the metadata line (bounty type badge and deadline)
  hideRequirements?: boolean; // Hide requirements section and show modal instead
  maxLength?: number;
}

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
  showMetadataLine = false, // Default to showing metadata line
  hideRequirements = false, // Default to showing requirements inline
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
  // State for showing/hiding requirements
  const [showRequirements, setShowRequirements] = useState(!hideRequirements);
  // State for requirements modal
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  // Get the author from the bounty entry
  const author = bountyEntry.createdBy;

  // Determine bounty status
  const isOpen = bounty.status === 'OPEN';
  const expiringSoon = isExpiringSoon(bounty.expirationDate);
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;
  const hasSolutions = solutionsCount > 0;

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
      console.error('FeedItemBounty: Unable to determine destination for CTA', {
        workId,
        workSlug,
        workContentType,
        entry,
      });
      return;
    }

    // Determine which tab to redirect to based on postType
    const targetTab = workPostType === 'QUESTION' ? 'conversation' : 'reviews';

    const workUrl = buildWorkUrl({
      id: workId.toString(),
      contentType: workContentType as any,
      slug: workSlug,
      tab: targetTab,
    });
    const urlWithFocus = `${workUrl}?focus=true`;
    window.location.href = urlWithFocus;
  };

  const handleAwardBounty = (e: React.MouseEvent | undefined) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onAward) onAward();
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
  console.log('entry.relatedWork', entry.relatedWork);
  const shouldHideActions =
    hideActions || Boolean((entry.raw as any)?.content_object?.comment?.is_removed);
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
      />

      <BaseFeedItem entry={entry} href={href} showHeader={false} showActions={false}>
        {showMetadataLine && (
          <div onClick={(e) => e.stopPropagation()}>
            <BountyMetadataLine
              amount={parseFloat(bounty.totalAmount)}
              expirationDate={bounty.expirationDate}
              isOpen={isOpen}
              expiringSoon={expiringSoon}
              solutionsCount={solutionsCount}
              showDeadline={showDeadline}
              showAmount={false}
            />
          </div>
        )}

        {entry.relatedWork && showRelatedWork && (
          <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Content type badge and topics */}
            <div className="flex flex-wrap gap-2">
              <ContentTypeBadge type={entry.relatedWork.contentType as any} />
              {entry.relatedWork.topics?.map((topic) => (
                <div
                  key={topic.id || topic.slug}
                  onClick={() => onTopicClick?.(topic)}
                  className="cursor-pointer"
                >
                  <TopicAndJournalBadge
                    type="topic"
                    name={topic.name}
                    slug={topic.slug}
                    imageUrl={topic.imageUrl}
                  />
                </div>
              ))}
            </div>

            {/* Title */}
            <TitleSection title={entry.relatedWork.title} className="text-base font-medium" />

            {/* Abstract or Preview Content */}
            {(entry.relatedWork.abstract || entry.relatedWork.previewContent) && (
              <ContentSection
                content={entry.relatedWork.abstract || entry.relatedWork.previewContent || ''}
                maxLength={200}
                className="text-sm text-gray-600"
              />
            )}
          </div>
        )}

        {showRequirements && (
          <BountyDetails
            content={bountyEntry.comment.content}
            contentFormat={bountyEntry.comment.contentFormat}
            bountyType={bounty.bountyType}
            maxLength={maxLength}
          />
        )}

        {/* Bounty Inline Banner - Full width with negative margins */}
        <div className="-mx-4 -mb-4">
          <BountyInlineBanner
            bounty={bounty}
            work={entry.relatedWork}
            showContributeButton={showContributeButton}
            onAddSolution={handleSolution}
            onContribute={handleOpenContributeModal}
            onAward={onAward ? handleAwardBounty : undefined}
            showCreatorActions={showCreatorActions}
            showSupportAndCTAButtons={showSupportAndCTAButtons}
            showRequirementsButton={!showRequirements}
            onViewRequirements={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (hideRequirements) {
                // Show modal if requirements are hidden by default
                setShowRequirementsModal(true);
              } else {
                // Show inline requirements if they were hidden
                setShowRequirements(true);
                // Scroll to top of the feed item to show requirements
                const element = document.getElementById(`feed-item-${entry.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }}
          />
        </div>

        {!isOpen && hasSolutions && showSolutions && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <BountySolutions
              solutions={bounty.solutions}
              isPeerReviewBounty={bounty.bountyType === 'REVIEW'}
              totalAwardedAmount={calculateTotalAwardedAmount(bounty)}
              onViewSolution={handleViewSolution}
            />
          </div>
        )}

        {showFooter && !shouldHideActions && (
          <div
            className="mt-4 pt-3 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            aria-hidden="true"
            tabIndex={-1}
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
              onComment={onReply}
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

      {/* Requirements Modal */}
      <BaseModal
        isOpen={showRequirementsModal}
        onClose={() => setShowRequirementsModal(false)}
        title="Bounty Requirements"
        maxWidth="max-w-2xl"
        showCloseButton={true}
      >
        <div className="space-y-4">
          <BountyDetails
            content={bountyEntry.comment.content}
            contentFormat={bountyEntry.comment.contentFormat}
            bountyType={bounty.bountyType}
          />
        </div>
      </BaseModal>
    </div>
  );
};

'use client';

import { FC, useState } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { Topic } from '@/types/topic';
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
import { Trophy, ArrowRight } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { buildWorkUrl } from '@/utils/url';
import { formatCurrency } from '@/utils/currency';
import { getRemainingDays } from '@/utils/date';
import {
  BaseFeedItem,
  TitleSection,
  MetadataSection,
  PrimaryActionSection,
} from '@/components/Feed/BaseFeedItem';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import Link from 'next/link';

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
    <div>
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
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;
  const hasSolutions = solutionsCount > 0;

  // Calculate display amount (handles Foundation bounties with flat $150 USD)
  const { amount: displayBountyAmount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  // Always use generic action text without amount
  const bountyActionText = 'created a bounty';

  const bountyLabel = bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty';

  const statusInfo = (() => {
    if (bounty.status === 'OPEN' && isActive) {
      const days = getRemainingDays(bounty.expirationDate ?? null);
      const remaining =
        days !== null
          ? days < 1
            ? '< 1 day'
            : `${Math.floor(days)} day${Math.floor(days) === 1 ? '' : 's'}`
          : null;
      return { label: 'Open', color: 'bg-green-500', remaining };
    }
    if (bounty.status === 'ASSESSMENT') {
      return { label: 'Assessment', color: 'bg-orange-500', remaining: null };
    }
    return { label: 'Completed', color: 'bg-gray-400', remaining: null };
  })();

  const creatorProfile = bounty.createdBy?.authorProfile;
  const bountyCreator = creatorProfile
    ? {
        id: creatorProfile.id,
        fullName: creatorProfile.fullName,
        profileImage: creatorProfile.profileImage,
        profileUrl: creatorProfile.profileUrl,
      }
    : bounty.createdBy?.id
      ? {
          id: bounty.createdBy.id,
          fullName: bounty.createdBy.fullName,
          profileImage: '',
          profileUrl: '#',
        }
      : undefined;

  const getAddButtonText = () => {
    if (entry.relatedWork?.postType === 'QUESTION') return 'Answer';
    if (bounty.bountyType === 'REVIEW') return 'Add Review';
    return 'Solve';
  };

  const contributors =
    bounty.contributions?.map((c: BountyContribution) => ({
      src: c.createdBy?.authorProfile?.profileImage || '',
      alt: c.createdBy?.authorProfile?.fullName || 'Anonymous',
      tooltip: c.createdBy?.authorProfile?.fullName || 'Anonymous',
      authorId: c.createdBy?.authorProfile?.id || undefined,
    })) ?? [];

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

  const awardButton =
    showCreatorActions && isAuthor && isActiveBounty(bounty) && onAward ? (
      <Button
        onClick={handleAwardBounty}
        size="sm"
        variant="secondary"
        className="text-sm font-medium gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      >
        <Trophy size={16} />
        Award bounty
      </Button>
    ) : null;

  return (
    <div className="space-y-3">
      <BaseFeedItem
        entry={entry}
        href={href}
        showHeader={false}
        showActions={false}
        onFeedItemClick={onFeedItemClick}
      >
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

        {bountyCreator && (
          <MetadataSection className="mb-0 py-4">
            <div className="flex items-center gap-2.5">
              <AuthorTooltip authorId={bountyCreator.id !== 0 ? bountyCreator.id : undefined}>
                <Avatar
                  src={bountyCreator.profileImage || undefined}
                  alt={bountyCreator.fullName}
                  size="sm"
                  disableTooltip
                />
              </AuthorTooltip>
              <div className="flex flex-col min-w-0">
                <Link
                  href={bountyCreator.profileUrl || '#'}
                  className="text-sm font-medium text-gray-900 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {bountyCreator.fullName}
                </Link>
                <span className="text-xs text-gray-500">Offering bounty</span>
              </div>
            </div>
          </MetadataSection>
        )}

        {showSupportAndCTAButtons && (
          <PrimaryActionSection>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-6 min-w-0">
                <div className="flex flex-col leading-tight whitespace-nowrap">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {bountyLabel}
                  </span>
                  <span className="font-mono font-semibold text-primary-600 text-xl">
                    {formatCurrency({
                      amount: Math.round(displayBountyAmount),
                      showUSD,
                      exchangeRate,
                      skipConversion: showUSD,
                      shorten: true,
                    })}
                  </span>
                </div>

                {contributors.length > 0 && (
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Backers
                    </span>
                    <AvatarStack
                      items={contributors}
                      size="xs"
                      maxItems={3}
                      spacing={-6}
                      showLabel={false}
                      disableTooltip={false}
                      showExtraCount={true}
                      totalItemsCount={bounty.contributions?.length ?? 0}
                      extraCountLabel="Backers"
                    />
                  </div>
                )}

                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</span>
                  <div className="flex items-center gap-1.5">
                    <RadiatingDot color={statusInfo.color} size="sm" isRadiating={isActive} />
                    {bounty.status === 'ASSESSMENT' ? (
                      <Tooltip
                        content="Editors are reviewing any submissions and will award top reviews."
                        position="top"
                      >
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap border-b border-dashed border-gray-400 cursor-help">
                          {statusInfo.label}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {statusInfo.label}
                      </span>
                    )}
                    {statusInfo.remaining && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        ({statusInfo.remaining})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {awardButton}
                {isOpen && (
                  <Button
                    variant="dark"
                    size="sm"
                    className="flex-shrink-0 gap-1"
                    onClick={handleSolution}
                  >
                    {getAddButtonText()}
                    <ArrowRight size={14} />
                  </Button>
                )}
                {isActive && showContributeButton && !isAuthor && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleOpenContributeModal}
                    className="text-orange-600 gap-2 border-orange-600 hover:bg-orange-50 rounded-md text-[13px]"
                  >
                    <ResearchCoinIcon outlined size={16} />
                    Support
                  </Button>
                )}
              </div>
            </div>
          </PrimaryActionSection>
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

'use client';

import { FC, useState, ReactNode, useEffect } from 'react';
import React from 'react';
import { FeedContentType, Review } from '@/types/feed';
import { MessageCircle, Flag, ArrowUp, MoreHorizontal, Star } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@/components/ui/icons/Icon';
import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/useVote';
import { UserVoteType } from '@/types/reaction';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ContentType } from '@/types/work';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useRouter } from 'next/navigation';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { Bounty } from '@/types/bounty';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { getTotalBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { Topic } from '@/types/topic';
import { useUserListsEnabled } from '@/components/UserList/lib/hooks/useUserListsEnabled';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { BountyTooltip } from '@/components/tooltips/BountyTooltip';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

// Basic media query hook (can be moved to a utility file later)
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Check if window is defined

    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    // Initial check
    listener();

    // Add listener for changes
    media.addEventListener('change', listener);

    // Cleanup listener on component unmount
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Define interfaces for the types we're using
interface Author {
  id: number;
  fullName: string;
  profileImage: string;
}

// Extend the ContentMetrics type
// Exporting ExtendedContentMetrics
export interface ExtendedContentMetrics {
  votes: number;
  comments: number;
  reviewScore?: number;
  commentAuthors?: Author[];
}

interface ActionButtonProps {
  icon?: any;
  count?: number | string | ReactNode;
  label: string;
  tooltip?: string;
  onClick?: (e?: React.MouseEvent) => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  hideIcon?: boolean;
}

// Export ActionButton so it can be used in other components
export const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  isActive = false,
  isDisabled = false,
  className = '',
  showLabel = false,
  showTooltip = true,
  hideIcon = false,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      `flex items-center space-x-1 border border-gray-200 rounded-full transition-all`,
      // Responsive padding
      'py-0.5 px-2 md:!py-1 md:!px-3',
      isActive ? 'text-green-600 border-green-300' : 'text-gray-900',
      'bg-white hover:text-gray-900 hover:bg-gray-100',
      className
    )}
    tooltip={showTooltip ? tooltip : undefined}
    onClick={onClick}
    disabled={isDisabled}
  >
    {!hideIcon && Icon && (
      <Icon
        className={cn(
          // Responsive icon size
          'w-4 h-4 md:!w-5 md:!h-5',
          isActive ? 'text-green-600' : ''
        )}
      />
    )}
    {showLabel ? (
      <span className="text-xs md:!text-sm font-medium">{label}</span>
    ) : count !== undefined ? (
      <span className="text-xs md:!text-sm font-medium">{count}</span>
    ) : null}
  </Button>
);

interface FeedItemActionsProps {
  metrics?: Partial<ExtendedContentMetrics>;
  feedContentType: FeedContentType;
  votableEntityId: number;
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
  userVote?: UserVoteType;
  actionLabels?: {
    comment?: string;
    upvote?: string;
    report?: string;
  };
  onComment?: () => void;
  children?: ReactNode; // Add children prop to accept additional action buttons
  showTooltips?: boolean; // New property for controlling tooltips
  hideCommentButton?: boolean; // New property to hide the comment button
  hideReportButton?: boolean; // New property to hide the report button
  menuItems?: Array<{
    icon: any;
    label: string;
    tooltip?: string;
    disabled?: boolean;
    onClick: (e?: React.MouseEvent) => void;
    className?: string; // Add optional className for styling menu items
  }>;
  rightSideActionButton?: ReactNode; // New property for a custom action button on the right side
  href?: string; // URL to use for navigation
  reviews?: Review[]; // New property for reviews
  bounties?: Bounty[]; // Updated to use imported Bounty type
  awardedBountyAmount?: number; // Add awarded bounty amount
  relatedDocumentTopics?: Topic[];
  relatedDocumentUnifiedDocumentId?: string;
  showPeerReviews?: boolean;
  onFeedItemClick?: () => void;
  showOnlyBookmark?: boolean; // Show only the bookmark button (for search results)
}

// Define interface for avatar items used in local state
interface AvatarItem {
  src: string;
  alt: string;
  tooltip?: string;
  authorId?: number;
}

export const FeedItemActions: FC<FeedItemActionsProps> = ({
  metrics,
  userVote,
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
  actionLabels,
  onComment,
  children,
  showTooltips = true,
  hideCommentButton = false,
  hideReportButton = false,
  menuItems = [],
  rightSideActionButton,
  href,
  reviews = [],
  bounties = [],
  relatedDocumentTopics,
  relatedDocumentUnifiedDocumentId,
  showPeerReviews = true,
  onFeedItemClick,
  showOnlyBookmark = false,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [localVoteCount, setLocalVoteCount] = useState(metrics?.votes || 0);
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const router = useRouter();
  const userListsEnabled = useUserListsEnabled();
  const isTouchDevice = useIsTouchDevice();
  // State for dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const { isInList: isDocumentInList, listIdsContainingDocument } = useIsInList(
    relatedDocumentUnifiedDocumentId
  );

  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: relatedDocumentUnifiedDocumentId,
    isInList: isDocumentInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });

  const { vote, isVoting } = useVote({
    votableEntityId,
    feedContentType,
    relatedDocumentId,
    relatedDocumentContentType,
    onVoteSuccess: () => {
      // The optimistic update already happened in handleVote
      // This confirms the update was successful
    },
    onVoteError: () => {
      // Revert optimistic update on error
      // Restore previous vote state
      setLocalVoteCount(metrics?.votes || 0);
      setLocalUserVote(userVote);
    },
    relatedDocumentTopics: relatedDocumentTopics,
  });

  // Use the flag modal hook
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const handleVote = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Prevent multiple rapid clicks while a vote is in progress
    if (isVoting) return;

    executeAuthenticatedAction(() => {
      // Toggle vote: if already upvoted, neutralize, otherwise upvote
      const newVoteType: UserVoteType = localUserVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';

      // Optimistic update: immediately update UI before API call
      if (newVoteType === 'UPVOTE' && localUserVote !== 'UPVOTE') {
        setLocalVoteCount((prev) => prev + 1);
        setLocalUserVote('UPVOTE');
      } else if (newVoteType === 'NEUTRAL' && localUserVote === 'UPVOTE') {
        setLocalVoteCount((prev) => Math.max(0, prev - 1));
        setLocalUserVote('NEUTRAL');
      }

      vote(newVoteType);
    });
  };

  const navigateToTab = (tab: string) => {
    if (onFeedItemClick) {
      onFeedItemClick();
    }

    router.push(`${href}/${tab}`);
  };

  const handleComment = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      navigateToTab('conversation');
    } else if (onComment) {
      onComment();
    }
  };

  const handleReviewClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      navigateToTab('reviews');
    }
  };

  const handleBountyClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      navigateToTab('bounties');
    }
  };

  const handleCloseAddToListModal = () => {
    setIsAddToListModalOpen(false);
  };

  const handleReport = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    executeAuthenticatedAction(() => {
      // Close the dropdown menu before opening the modal
      setIsMenuOpen(false);

      // Map feedContentType to ContentType
      let contentType: ContentType;
      let commentId: string | undefined;

      if (feedContentType === 'PAPER') {
        contentType = 'paper';
      } else if (feedContentType === 'POST' || feedContentType === 'PREREGISTRATION') {
        contentType = 'post';
      } else if (feedContentType === 'BOUNTY' && relatedDocumentContentType) {
        contentType = relatedDocumentContentType;
        commentId = votableEntityId.toString(); // Use votableEntityId as commentId for bounties
      } else if (feedContentType === 'COMMENT') {
        contentType = relatedDocumentContentType || 'post';
        commentId = votableEntityId.toString();
      } else {
        contentType = 'post'; // Default fallback
      }

      openFlagModal(
        // For comments and bounties, use relatedDocumentId as the documentId
        (feedContentType === 'COMMENT' || feedContentType === 'BOUNTY') && relatedDocumentId
          ? relatedDocumentId.toString()
          : votableEntityId.toString(),
        contentType,
        commentId
      );
    });
  };

  // Format score to show with one decimal place
  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  // Check if we have open bounties
  const openBounties = bounties ? bounties.filter((b) => b.status === 'OPEN') : [];
  const hasOpenBounties = openBounties.length > 0;

  // Calculate total bounty amount for open bounties (handles Foundation bounties with flat $150 USD)
  const { amount: totalBountyAmount } = getTotalBountyDisplayAmount(
    openBounties,
    exchangeRate,
    showUSD
  );

  // Use media queries to determine screen size
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTabletOrSmaller = useMediaQuery('(max-width: 768px)');

  // Add separator if needed before Report
  const showSeparator = !hideReportButton && menuItems.length > 0 && !isTabletOrSmaller;

  // Determine which buttons to show inline based on screen size
  const showInlineReviews = showPeerReviews && reviews.length > 0;
  const showInlineBounties = hasOpenBounties;

  // Check if bookmark button should be shown
  const canShowBookmark =
    userListsEnabled &&
    relatedDocumentUnifiedDocumentId &&
    feedContentType !== 'COMMENT' &&
    feedContentType !== 'BOUNTY' &&
    feedContentType !== 'APPLICATION';

  // Reusable bookmark button element
  const bookmarkButton = canShowBookmark && (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'p-1.5 transition-colors hover:bg-gray-0',
        isDocumentInList
          ? 'text-green-600 hover:text-green-600'
          : 'text-gray-900 hover:text-gray-600'
      )}
      tooltip={'Save'}
      onClick={handleAddToList}
      disabled={isTogglingDefaultList}
    >
      <FontAwesomeIcon icon={isDocumentInList ? faBookmarkSolid : faBookmark} className="w-5 h-5" />
    </Button>
  );

  // If showOnlyBookmark, render a minimal version with just the bookmark button
  if (showOnlyBookmark) {
    return (
      <>
        <div className="flex items-center justify-end w-full">{bookmarkButton}</div>
        {userListsEnabled && relatedDocumentUnifiedDocumentId && isAddToListModalOpen && (
          <AddToListModal
            isOpen={isAddToListModalOpen}
            onClose={handleCloseAddToListModal}
            unifiedDocumentId={Number.parseInt(relatedDocumentUnifiedDocumentId)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3 md:space-x-4 flex-nowrap overflow-x-auto">
          <ActionButton
            icon={ArrowUp}
            count={localVoteCount}
            tooltip="Upvote"
            label={actionLabels?.upvote || 'Upvote'}
            onClick={handleVote}
            isActive={localUserVote === 'UPVOTE'}
            showTooltip={showTooltips}
          />
          {!hideCommentButton && (
            <ActionButton
              icon={MessageCircle}
              count={actionLabels?.comment ? undefined : metrics?.comments}
              tooltip="Comment"
              label={actionLabels?.comment || 'Comment'}
              onClick={handleComment}
              showLabel={Boolean(actionLabels?.comment)}
              showTooltip={showTooltips}
            />
          )}
          {showInlineReviews &&
            (showTooltips && reviews.length > 0 ? (
              <Tooltip
                content={
                  <PeerReviewTooltip
                    reviews={reviews}
                    averageScore={metrics?.reviewScore || 0}
                    href={href}
                  />
                }
                position="top"
                width="w-[320px]"
              >
                <ActionButton
                  icon={Star}
                  count={
                    metrics?.reviewScore !== 0 ? formatScore(metrics?.reviewScore || 0) : '3.0'
                  }
                  tooltip=""
                  label="Peer Review"
                  showTooltip={false}
                  onClick={!isTouchDevice ? handleReviewClick : undefined}
                  className="hover:!bg-amber-50 hover:!text-amber-600 hover:!border-amber-300"
                />
              </Tooltip>
            ) : (
              <ActionButton
                icon={Star}
                count={metrics?.reviewScore !== 0 ? formatScore(metrics?.reviewScore || 0) : '3.0'}
                tooltip="Peer Review"
                label="Peer Review"
                showTooltip={showTooltips}
                onClick={handleReviewClick}
                className="hover:!bg-amber-50 hover:!text-amber-600 hover:!border-amber-300"
              />
            ))}
          {showInlineBounties &&
            (showTooltips ? (
              <Tooltip
                content={
                  <BountyTooltip
                    totalAmount={totalBountyAmount}
                    href={href}
                    showUSD={showUSD}
                    skipConversion={showUSD}
                  />
                }
                position="top"
                width="w-[320px]"
              >
                <ActionButton
                  hideIcon={true}
                  tooltip=""
                  label="Bounties"
                  className="hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50"
                  count={
                    <CurrencyBadge
                      amount={totalBountyAmount}
                      variant="text"
                      size="xs"
                      className="!text-xs md:!text-sm px-0"
                      textColor="inherit"
                      iconColor="inherit"
                      iconSize={18}
                      currency={showUSD ? 'USD' : 'RSC'}
                      shorten={true}
                      showExchangeRate={false}
                      showIcon={true}
                      showText={false}
                      skipConversion={showUSD}
                    />
                  }
                  showTooltip={false}
                  onClick={!isTouchDevice ? handleBountyClick : undefined}
                />
              </Tooltip>
            ) : (
              <ActionButton
                hideIcon={true}
                tooltip="Bounties"
                label="Bounties"
                className="hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50"
                count={
                  <CurrencyBadge
                    amount={totalBountyAmount}
                    variant="text"
                    size="xs"
                    className="!text-xs md:!text-sm"
                    textColor="inherit"
                    iconColor="inherit"
                    iconSize={18}
                    currency={showUSD ? 'USD' : 'RSC'}
                    shorten={true}
                    showExchangeRate={false}
                    showIcon={true}
                    showText={false}
                    skipConversion={showUSD}
                  />
                }
                showTooltip={false}
                onClick={handleBountyClick}
              />
            ))}
          {children}
        </div>

        <div className="flex-grow flex justify-end items-center gap-3">
          {rightSideActionButton}

          {/* Show "Add to List" button in right section */}
          {showPeerReviews && bookmarkButton}

          {(!hideReportButton || menuItems.length > 0) && (
            <BaseMenu
              trigger={
                <Button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              }
              align="end"
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
            >
              {menuItems.map((item, index) => (
                <BaseMenuItem
                  key={`menu-item-${index}`}
                  onClick={(e) => {
                    setIsMenuOpen(false); // Close dropdown when any menu item is clicked
                    item.onClick(e);
                  }}
                  className={cn('flex items-center gap-2', item.className)} // Apply potential class for color
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </BaseMenuItem>
              ))}

              {showSeparator && <div className="h-px my-1 bg-gray-200" />}

              {!hideReportButton && (
                <BaseMenuItem onClick={handleReport} className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>{actionLabels?.report || 'Report'}</span>
                </BaseMenuItem>
              )}
            </BaseMenu>
          )}
        </div>
      </div>

      {contentToFlag && (
        <FlagContentModal
          isOpen={isOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}

      {userListsEnabled && relatedDocumentUnifiedDocumentId && isAddToListModalOpen && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={handleCloseAddToListModal}
          unifiedDocumentId={Number.parseInt(relatedDocumentUnifiedDocumentId)}
        />
      )}
    </>
  );
};

'use client';

import { FC, useState, ReactNode, useEffect, useRef } from 'react';
import React from 'react';
import { FeedContentType, FeedEntry, Review } from '@/types/feed';
import { MessageCircle, Flag, ArrowUp, MoreHorizontal, Star, ThumbsDown } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';
import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/useVote';
import { useInterest } from '@/hooks/useInterest';
import { UserVoteType } from '@/types/reaction';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ContentType } from '@/types/work';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useRouter } from 'next/navigation';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Bounty } from '@/types/bounty';
import { Tip } from '@/types/tip';
import { formatRSC } from '@/utils/number';
import { extractBountyAvatars } from '@/components/Bounty/lib/bountyUtil';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { dedupeAvatars } from '@/utils/avatarUtil';
import { cn } from '@/utils/styles';
import { Topic } from '@/types/topic';

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
  icon: any;
  count?: number | string | ReactNode;
  label: string;
  tooltip?: string;
  onClick?: (e?: React.MouseEvent) => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  avatars?: {
    src: string;
    alt: string;
    tooltip?: string;
    authorId?: number;
  }[];
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
  avatars = [],
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      `flex items-center space-x-1 border border-gray-200 rounded-full transition-all`,
      // Responsive padding
      'py-0.5 px-2 md:!py-1 md:!px-3',
      isActive ? 'text-green-600 border-green-300' : 'text-gray-900',
      'hover:text-gray-900 hover:bg-gray-50',
      className
    )}
    tooltip={showTooltip ? tooltip : undefined}
    onClick={onClick}
    disabled={isDisabled}
  >
    <Icon
      className={cn(
        // Responsive icon size
        'w-4 h-4 md:!w-5 md:!h-5',
        isActive ? 'text-green-600' : ''
      )}
    />
    {showLabel ? (
      <span className="text-xs md:!text-sm font-medium">{label}</span>
    ) : count !== undefined ? (
      <span className="text-xs md:!text-sm font-medium">{count}</span>
    ) : null}

    {avatars.length > 0 && (
      <AvatarStack
        items={avatars}
        size="xxs"
        maxItems={3}
        spacing={-4}
        className="ml-1"
        showExtraCount={true}
      />
    )}
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
  tips?: Tip[]; // Added tips prop
  awardedBountyAmount?: number; // Add awarded bounty amount
  relatedDocumentTopics?: Topic[];
  relatedDocumentUnifiedDocumentId?: string;
  showPeerReviews?: boolean;
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
  tips = [],
  awardedBountyAmount = 0, // Destructure awardedBountyAmount with default value
  relatedDocumentTopics,
  relatedDocumentUnifiedDocumentId,
  showPeerReviews = true,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser(); // Get current user
  const { showUSD } = useCurrencyPreference();
  const [localVoteCount, setLocalVoteCount] = useState(metrics?.votes || 0);
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const router = useRouter();

  // State for dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State for Tip Modal
  const [tipModalState, setTipModalState] = useState<{ isOpen: boolean; contentId?: number }>({
    isOpen: false,
  });

  // Calculate initial tip amount and avatars from props
  const initialTotalTipAmount = tips.reduce((total, tip) => total + (tip.amount || 0), 0);
  const initialTipAvatars: AvatarItem[] = tips.map((tip) => ({
    src: tip.user?.authorProfile?.profileImage || '/images/default-avatar.png',
    alt: tip.user?.fullName || 'User',
    tooltip: tip.user?.fullName,
    authorId: tip.user?.authorProfile?.id,
  }));

  // Local state for tips
  const [localTotalTipAmount, setLocalTotalTipAmount] = useState(initialTotalTipAmount);
  const [localTipAvatars, setLocalTipAvatars] = useState<AvatarItem[]>(
    dedupeAvatars(initialTipAvatars)
  );

  // Use ref to track previous tips and prevent unnecessary updates
  const previousTipsRef = useRef<Tip[]>([]);

  // Effect to update local state if props change
  useEffect(() => {
    // Check if tips have actually changed in a meaningful way
    const tipsChanged = tips.length !== previousTipsRef.current.length;

    // Only update if there are meaningful changes
    if (tipsChanged) {
      const newTotalTipAmount = tips.reduce((total, tip) => total + (tip.amount || 0), 0);
      const newTipAvatars: AvatarItem[] = tips.map((tip) => ({
        src: tip.user?.authorProfile?.profileImage || '/images/default-avatar.png',
        alt: tip.user?.fullName || 'User',
        tooltip: tip.user?.fullName,
        authorId: tip.user?.authorProfile?.id,
      }));
      setLocalTotalTipAmount(newTotalTipAmount);
      // Dedupe avatars when updating from props
      setLocalTipAvatars(dedupeAvatars(newTipAvatars));

      // Update the ref with current tips
      previousTipsRef.current = [...tips];
    }
  }, [tips]); // We can safely use tips here now because we're handling changes properly

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
    relatedDocumentUnifiedDocumentId: relatedDocumentUnifiedDocumentId,
  });

  const { markNotInterested, isProcessing: isMarkingNotInterested } = useInterest({
    entityId: votableEntityId,
    contentType: feedContentType,
    relatedDocumentId,
    relatedDocumentContentType,
    relatedDocumentTopics: relatedDocumentTopics,
    relatedDocumentUnifiedDocumentId: relatedDocumentUnifiedDocumentId,
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

  const handleComment = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      router.push(`${href}/conversation`);
    } else if (onComment) {
      onComment();
    }
  };

  const handleReviewClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      router.push(`${href}/reviews`);
    }
  };

  const handleBountyClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (href) {
      router.push(`${href}/bounties`);
    }
  };

  // Handle opening the tip modal
  const handleOpenTipModal = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    executeAuthenticatedAction(() => {
      setTipModalState({ isOpen: true, contentId: votableEntityId });
    });
  };

  // Handle successful tip
  const handleTipSuccess = (tippedAmount: number) => {
    if (!user || !user.authorProfile) return;

    setLocalTotalTipAmount((prevAmount) => prevAmount + tippedAmount);

    const userAlreadyTipped = localTipAvatars.some(
      (avatar) => avatar.authorId === user.authorProfile?.id
    );

    if (!userAlreadyTipped) {
      const newUserAvatar: AvatarItem = {
        src: user.authorProfile.profileImage || '/images/default-avatar.png',
        alt: user.fullName || 'User',
        tooltip: user.fullName,
        authorId: user.authorProfile.id,
      };
      // No need to dedupe here as we explicitly check userAlreadyTipped
      setLocalTipAvatars((prevAvatars) => [...prevAvatars, newUserAvatar]);
    }

    setTipModalState({ isOpen: false });
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

  // Get comment avatars if any (assuming no duplicates possible or handled elsewhere)
  const commentAvatars: AvatarItem[] =
    metrics?.commentAuthors?.map((author) => ({
      src: author.profileImage || '/images/default-avatar.png',
      alt: author.fullName || 'User',
      tooltip: author.fullName,
      authorId: author.id,
    })) || [];

  // Get and dedupe review avatars
  const rawReviewAvatars: AvatarItem[] = reviews.map((review) => ({
    src: review.author.profileImage || '/images/default-avatar.png',
    alt: review.author.fullName || 'Reviewer',
    tooltip: review.author.fullName,
    authorId: review.author.id,
  }));
  const dedupedReviewAvatars = dedupeAvatars(rawReviewAvatars);

  // Get and dedupe bounty avatars using the utility function
  const rawBountyAvatars = extractBountyAvatars(bounties);
  const dedupedBountyAvatars = dedupeAvatars(rawBountyAvatars);

  // Format score to show with one decimal place
  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  // Check if we have open bounties
  const hasOpenBounties = bounties && bounties.filter((b) => b.status === 'OPEN').length > 0;

  // Calculate total bounty amount for open bounties
  const totalBountyAmount = bounties
    .filter((b) => b.status === 'OPEN')
    .reduce((total, bounty) => {
      const amount = parseFloat(bounty.totalAmount || bounty.amount || '0');
      return total + amount;
    }, 0);

  // Calculate total earned amount (Tips + Awarded Bounty)
  const totalEarnedAmount = localTotalTipAmount + awardedBountyAmount;

  // Use media queries to determine screen size
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTabletOrSmaller = useMediaQuery('(max-width: 768px)');

  // Prepare Tip menu item for smaller screens
  const tipMenuItem = {
    icon: (props: any) => (
      <Icon
        name="tipRSC"
        {...props}
        size={16} // Slightly smaller icon for menu
        color={totalEarnedAmount > 0 ? '#16A34A' : undefined}
      />
    ),
    label:
      totalEarnedAmount > 0
        ? `Tip / Earned +` // The amount will be handled by count prop
        : showUSD
          ? 'Tip USD'
          : 'Tip RSC',
    tooltip: showUSD ? 'Tip USD' : 'Tip RSC',
    onClick: (e?: React.MouseEvent) => {
      setIsMenuOpen(false); // Close dropdown before opening tip modal
      handleOpenTipModal(e);
    },
    className: totalEarnedAmount > 0 ? 'text-green-600' : '',
  };

  // Prepare Not Interested menu item (only for dismissible content)
  const notInterestedMenuItem = {
    icon: (props: any) => <ThumbsDown {...props} size={16} />,
    label: 'Not Interested',
    tooltip: 'Mark as not interested',
    disabled: isMarkingNotInterested,
    onClick: (e?: React.MouseEvent) => {
      setIsMenuOpen(false);
      executeAuthenticatedAction(markNotInterested);
    },
    className: '',
  };

  // Check if content is dismissible (not comments or bounties)
  const isDismissible = feedContentType !== 'COMMENT' && feedContentType !== 'BOUNTY';

  // Combine menu items, conditionally adding the tip item and not interested item
  const combinedMenuItems = [
    ...menuItems,
    ...(isTabletOrSmaller ? [tipMenuItem] : []),
    ...(isDismissible ? [notInterestedMenuItem] : []),
  ];

  // Add separator if needed before Report
  const showSeparator =
    (!hideReportButton && combinedMenuItems.length > 0 && !isTabletOrSmaller) || // Original condition
    (!hideReportButton && combinedMenuItems.length > 1 && isTabletOrSmaller); // Adjusted for tip in menu

  // Determine which buttons to show inline based on screen size
  const showInlineReviews =
    showPeerReviews && reviews.length > 0 && (!isMobile || (isMobile && !hasOpenBounties));
  const showInlineBounties = hasOpenBounties && (!isMobile || isMobile); // Show bounties on mobile if they exist
  const showInlineTip = !isTabletOrSmaller;

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
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
              avatars={commentAvatars}
            />
          )}
          {showInlineReviews && (
            <ActionButton
              icon={Star}
              count={metrics?.reviewScore !== 0 ? formatScore(metrics?.reviewScore || 0) : '3.0'}
              tooltip="Peer Review"
              label="Peer Review"
              showTooltip={showTooltips}
              onClick={handleReviewClick}
              avatars={dedupedReviewAvatars}
            />
          )}
          {showInlineBounties &&
            (showTooltips ? (
              <Tooltip
                content={
                  <div className="flex items-start gap-3 text-left">
                    <div
                      className={cn(
                        'p-2 rounded-md flex items-center justify-center',
                        hasOpenBounties ? 'bg-orange-100' : 'bg-gray-100'
                      )}
                    >
                      <Icon
                        name="earn1"
                        size={24}
                        color={hasOpenBounties ? '#F97316' : '#374151'}
                      />
                    </div>
                    <div>
                      <div className="font-medium mb-1">ResearchCoin Earning Opportunity</div>
                      <div>
                        This content includes a bounty. Complete tasks to earn{' '}
                        <CurrencyBadge
                          amount={totalBountyAmount}
                          variant="text"
                          size="xs"
                          currency={showUSD ? 'USD' : 'RSC'}
                          shorten={true}
                          showExchangeRate={false}
                          showIcon={true}
                          showText={false}
                        />
                        .
                      </div>
                    </div>
                  </div>
                }
                position="top"
                width="w-[380px]"
              >
                <ActionButton
                  icon={(props: any) => (
                    <Icon
                      name="earn1"
                      {...props}
                      size={18}
                      color={hasOpenBounties ? '#F97316' : undefined}
                    />
                  )}
                  tooltip=""
                  label="Bounties"
                  count={
                    <CurrencyBadge
                      amount={totalBountyAmount}
                      variant="text"
                      size="xs"
                      currency={showUSD ? 'USD' : 'RSC'}
                      shorten={true}
                      showExchangeRate={false}
                      showIcon={true}
                      showText={false}
                    />
                  }
                  showTooltip={false}
                  onClick={handleBountyClick}
                  avatars={dedupedBountyAvatars}
                  className={
                    hasOpenBounties
                      ? 'text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 mr-0'
                      : ''
                  }
                />
              </Tooltip>
            ) : (
              <ActionButton
                icon={(props: any) => (
                  <Icon
                    name="earn1"
                    {...props}
                    size={18}
                    color={hasOpenBounties ? '#F97316' : undefined}
                  />
                )}
                tooltip="Bounties"
                label="Bounties"
                count={
                  <CurrencyBadge
                    amount={totalBountyAmount}
                    variant="text"
                    size="xs"
                    currency={showUSD ? 'USD' : 'RSC'}
                    shorten={true}
                    showExchangeRate={false}
                    showIcon={true}
                    showText={false}
                  />
                }
                showTooltip={false}
                onClick={handleBountyClick}
                avatars={dedupedBountyAvatars}
                className={
                  hasOpenBounties
                    ? 'text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700'
                    : ''
                }
              />
            ))}
          {showInlineTip && (
            <ActionButton
              icon={(props: any) => (
                <Icon
                  name="tipRSC"
                  {...props}
                  size={16}
                  color={totalEarnedAmount > 0 ? '#16A34A' : undefined}
                />
              )}
              tooltip={showUSD ? 'Tip USD' : 'Tip RSC'}
              label="Tip"
              onClick={handleOpenTipModal}
              showTooltip={showTooltips}
              {...(totalEarnedAmount > 0 && {
                count: (
                  <span className="flex items-center gap-0.5">
                    +
                    <CurrencyBadge
                      amount={totalEarnedAmount}
                      variant="text"
                      size="xs"
                      currency={showUSD ? 'USD' : 'RSC'}
                      shorten={true}
                      showExchangeRate={false}
                      showIcon={true}
                      showText={false}
                    />
                  </span>
                ),
                className: 'text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700',
                avatars: localTipAvatars,
              })}
            />
          )}
          {children}
        </div>

        <div className="flex-grow flex justify-end items-center gap-3">
          {rightSideActionButton}

          {(!hideReportButton || menuItems.length > 0) && (
            <BaseMenu
              trigger={
                <Button
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
              {combinedMenuItems.map((item, index) => (
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

      {tipModalState.isOpen && tipModalState.contentId && (
        <TipContentModal
          isOpen={tipModalState.isOpen}
          onClose={() => setTipModalState({ isOpen: false })}
          contentId={tipModalState.contentId}
          feedContentType={feedContentType}
          onTipSuccess={handleTipSuccess}
        />
      )}
    </>
  );
};

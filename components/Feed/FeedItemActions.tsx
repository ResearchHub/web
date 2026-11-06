'use client';

import { FC, useState, ReactNode, useEffect, useContext } from 'react';
import React from 'react';
import { FeedContentType, Review } from '@/types/feed';
import {
  MessageCircle,
  Flag,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Bookmark,
  Maximize2,
  Share,
  Trash2,
  EyeOff,
} from 'lucide-react';
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
import { Tooltip } from '@/components/ui/Tooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { Topic } from '@/types/topic';
import { TipTooltip } from '@/components/tooltips/TipTooltip';
import { Tip } from '@/types/tip';
import { formatCurrency } from '@/utils/currency';
import { ListDetailContext } from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';
import { useHideFromFeed } from '@/hooks/useHideFromFeed';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import type { FeedEntry } from '@/types/feed';
import { getFlagTarget } from './lib/flagTarget';

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
  adjustedScore?: number;
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
  /** Bare icon and count instead of the pill chrome. */
  flat?: boolean;
  testId?: string;
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
  flat = false,
  testId,
}) => (
  <Button
    data-testid={testId}
    variant="ghost"
    size="sm"
    className={cn(
      'flex items-center text-xs font-medium transition-all',
      flat
        ? cn(
            'h-6 gap-1 !px-0 hover:bg-transparent',
            isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-800'
          )
        : cn(
            'h-8 gap-1.5 rounded-full px-3',
            isActive
              ? 'bg-white text-green-600 shadow-sm ring-1 ring-green-100'
              : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
          ),
      className
    )}
    tooltip={showTooltip ? tooltip : undefined}
    onClick={onClick}
    disabled={isDisabled}
  >
    {!hideIcon && Icon && (
      <Icon
        className={cn(
          flat ? 'h-4 w-4' : 'h-[18px] w-[18px]',
          isActive && !flat ? 'text-green-600' : ''
        )}
      />
    )}
    {showLabel ? <span>{label}</span> : count !== undefined ? <span>{count}</span> : null}
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
  onTip?: () => void; // Callback for tip action (when provided, tip button shows)
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
  /**
   * Keep share, save and the menu beside the votes on the left, leaving the right
   * side to `rightSideActionButton` alone.
   */
  groupUtilityActions?: boolean;
  href?: string; // URL to use for navigation
  reviews?: Review[]; // New property for reviews
  awardedBountyAmount?: number; // Add awarded bounty amount
  tips?: Tip[]; // Tips received on this content
  relatedDocumentTopics?: Topic[];
  relatedDocumentUnifiedDocumentId?: string;
  /** Feed entries that can be hidden from this row (one → confirm, many → picker). */
  hideableEntries?: FeedEntry[];
  showPeerReviews?: boolean;
  onFeedItemClick?: () => void;
  onExpand?: (e?: React.MouseEvent) => void;
  isExpanded?: boolean;
  className?: string;
  /**
   * `default` — flat icon row used by feed cards.
   * `inline` — pill chrome for comment rows.
   * `card` — for activity cards: bare votes with share and save kept beside them, every
   * icon in the same round button and drawn to the same size.
   */
  variant?: 'default' | 'inline' | 'card';
  /** Leave the ⋯ menu out, for cards that put their own elsewhere. */
  hideMoreMenu?: boolean;
  /** Leave the copy-link button out, for rows that have no page of their own to link to. */
  hideShareButton?: boolean;
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
  onTip,
  children,
  showTooltips = true,
  hideCommentButton = false,
  hideReportButton = false,
  menuItems = [],
  rightSideActionButton,
  groupUtilityActions = false,
  href,
  reviews = [],
  awardedBountyAmount,
  tips = [],
  relatedDocumentTopics,
  relatedDocumentUnifiedDocumentId,
  hideableEntries,
  showPeerReviews = true,
  onFeedItemClick,
  onExpand,
  isExpanded = false,
  className,
  variant = 'default',
  hideMoreMenu = false,
  hideShareButton = false,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const { hideFromFeed, isHiding } = useHideFromFeed();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const listDetailContext = useContext(ListDetailContext);
  const [isHideFromFeedModalOpen, setIsHideFromFeedModalOpen] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(
    metrics?.adjustedScore ?? metrics?.votes ?? 0
  );
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const router = useRouter();
  // State for dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const { isInList: isDocumentInList } = useIsInList(relatedDocumentUnifiedDocumentId);

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
      setLocalVoteCount(metrics?.adjustedScore ?? metrics?.votes ?? 0);
      setLocalUserVote(userVote);
    },
    relatedDocumentTopics: relatedDocumentTopics,
  });
  // Use the flag modal hook
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const handleVote = (e?: React.MouseEvent, direction: 'up' | 'down' = 'up') => {
    if (e) {
      e.stopPropagation();
    }

    // Prevent multiple rapid clicks while a vote is in progress
    if (isVoting) return;

    executeAuthenticatedAction(() => {
      let newVoteType: UserVoteType;
      let countDelta: number;

      if (direction === 'up') {
        if (localUserVote === 'UPVOTE') {
          // Already upvoted, clicking up again -> neutral
          newVoteType = 'NEUTRAL';
          countDelta = -1;
        } else if (localUserVote === 'DOWNVOTE') {
          // Was downvoted, clicking up -> upvote (swing of +2)
          newVoteType = 'UPVOTE';
          countDelta = 2;
        } else {
          // Neutral, clicking up -> upvote
          newVoteType = 'UPVOTE';
          countDelta = 1;
        }
      } else {
        // direction === 'down'
        if (localUserVote === 'DOWNVOTE') {
          // Already downvoted, clicking down again -> neutral
          newVoteType = 'NEUTRAL';
          countDelta = 1;
        } else if (localUserVote === 'UPVOTE') {
          // Was upvoted, clicking down -> downvote (swing of -2)
          newVoteType = 'DOWNVOTE';
          countDelta = -2;
        } else {
          // Neutral, clicking down -> downvote
          newVoteType = 'DOWNVOTE';
          countDelta = -1;
        }
      }

      // Optimistic update: immediately update UI before API call
      setLocalVoteCount((prev) => prev + countDelta);
      setLocalUserVote(newVoteType);

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

  const handleTip = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onTip) {
      onTip();
    }
  };

  const handleCloseAddToListModal = () => {
    setIsAddToListModalOpen(false);
  };

  const handleRemoveFromList = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!listDetailContext || !relatedDocumentUnifiedDocumentId) {
      return;
    }
    setIsMenuOpen(false);
    try {
      await listDetailContext.onRemoveItem(Number.parseInt(relatedDocumentUnifiedDocumentId));
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove from list'));
    }
  };

  const handleReport = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    executeAuthenticatedAction(() => {
      // Close the dropdown menu before opening the modal
      setIsMenuOpen(false);

      const { documentId, contentType, commentId } = getFlagTarget({
        feedContentType,
        votableEntityId,
        relatedDocumentId,
        relatedDocumentContentType,
      });
      openFlagModal(documentId, contentType, commentId);
    });
  };

  const handleOpenHideFromFeed = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMenuOpen(false);
    setIsHideFromFeedModalOpen(true);
  };

  const handleConfirmHideFromFeed = async () => {
    if (!hideableEntries?.length) return;
    const success = await hideFromFeed(hideableEntries.map((entry) => entry.id));
    if (success) {
      setIsHideFromFeedModalOpen(false);
    }
  };

  const handleCopyDocumentUrl = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    const url = href ? new URL(href, window.location.origin).toString() : window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Use media queries to determine screen size
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTabletOrSmaller = useMediaQuery('(max-width: 768px)');

  // Add separator if needed before Report
  const canHideFromFeed =
    !!user?.isModerator &&
    (hideableEntries?.length ?? 0) > 0 &&
    feedContentType !== 'COMMENT' &&
    feedContentType !== 'BOUNTY' &&
    feedContentType !== 'APPLICATION';
  const showSeparator =
    !hideReportButton && (menuItems.length > 0 || canHideFromFeed) && !isTabletOrSmaller;

  // Calculate total awarded amount (tips + bounty awards)
  const tipAmount = tips.reduce((total, tip) => total + (tip.amount || 0), 0);
  const totalAwarded = tipAmount + (awardedBountyAmount || 0);

  const canSave =
    !!relatedDocumentUnifiedDocumentId &&
    feedContentType !== 'COMMENT' &&
    feedContentType !== 'BOUNTY' &&
    feedContentType !== 'APPLICATION' &&
    showPeerReviews;

  const showShare = variant !== 'inline' && !hideShareButton;
  const showMoreMenu =
    !hideMoreMenu &&
    (!!(listDetailContext && relatedDocumentUnifiedDocumentId) ||
      menuItems.length > 0 ||
      !hideReportButton ||
      canHideFromFeed);
  // Feed cards use bare icons; comment rows keep the pill chrome.
  const isFlat = variant === 'default';
  const isCard = variant === 'card';
  // Activity cards size each icon by the glyph it draws rather than by its box, so the
  // arrows, share and save all come out about 15px tall at one stroke weight.
  const cardIcon = { absoluteStrokeWidth: true, strokeWidth: 1.75 } as const;
  const arrowIconProps = isCard
    ? { ...cardIcon, size: 22 }
    : { className: isFlat ? 'h-4 w-4' : 'h-[18px] w-[18px]' };
  const cardIconButtonClass = 'text-gray-500 hover:bg-gray-100 hover:text-gray-900';

  const shareButton = showShare ? (
    isFlat ? (
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleCopyDocumentUrl}
        className="flex h-6 w-6 items-center justify-center text-gray-500 transition-colors hover:text-gray-800"
        aria-label="Share"
        title={showTooltips ? 'Copy link' : undefined}
      >
        <Share className="h-4 w-4" />
      </button>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        tooltip={showTooltips ? 'Copy link' : undefined}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={handleCopyDocumentUrl}
        className={cn(
          'flex !p-0 items-center justify-center rounded-full transition-colors',
          isCard ? 'h-7 w-7' : 'h-8 w-8',
          isCard
            ? cardIconButtonClass
            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
        )}
      >
        {isCard ? <Share {...cardIcon} size={16} /> : <Share className="h-[18px] w-[18px]" />}
      </Button>
    )
  ) : null;

  // Note the test id rather than the label: FeedItemComment renders this whole
  // bar inside an aria-hidden wrapper, which takes every control in it out of
  // the accessibility tree and so out of reach of a role-based locator.
  const moreMenuTrigger = isFlat ? (
    <button
      type="button"
      data-testid="feed-item-more-options"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="flex h-6 w-6 items-center justify-center text-gray-500 transition-colors hover:text-gray-800"
      aria-label="More options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  ) : (
    <Button
      data-testid="feed-item-more-options"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      variant="ghost"
      size="sm"
      className="flex h-8 w-8 !p-0 items-center justify-center rounded-full text-gray-700 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm"
      aria-label="More options"
    >
      <MoreHorizontal className="h-[18px] w-[18px]" />
    </Button>
  );

  const saveButton = canSave ? (
    isFlat ? (
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleAddToList}
        disabled={isTogglingDefaultList}
        className={cn(
          'flex h-6 w-6 items-center justify-center transition-colors',
          isDocumentInList ? 'text-green-600' : 'text-gray-500 hover:text-gray-800',
          isTogglingDefaultList && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={isDocumentInList ? 'Remove from list' : 'Save'}
        title={showTooltips ? 'Save' : undefined}
      >
        <FontAwesomeIcon
          icon={isDocumentInList ? faBookmarkSolid : faBookmark}
          className="h-3.5 w-3.5"
        />
      </button>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        tooltip={showTooltips ? 'Save' : undefined}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={handleAddToList}
        disabled={isTogglingDefaultList}
        className={cn(
          'flex !p-0 items-center justify-center rounded-full transition-colors',
          isCard ? 'h-7 w-7' : 'h-8 w-8',
          isDocumentInList
            ? isCard
              ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
              : 'text-green-600 hover:bg-white hover:text-green-700 hover:shadow-sm'
            : isCard
              ? cardIconButtonClass
              : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
        )}
      >
        {isCard ? (
          // Drawn with the same set as the arrows and share; Font Awesome's fills its box.
          <Bookmark {...cardIcon} size={18} fill={isDocumentInList ? 'currentColor' : 'none'} />
        ) : (
          <FontAwesomeIcon
            icon={isDocumentInList ? faBookmarkSolid : faBookmark}
            className="h-[18px] w-[18px]"
          />
        )}
      </Button>
    )
  ) : null;

  // Tips and awards: one control in every variant. With something received it reads
  // as the amount, with a breakdown on hover; without, it offers "Tip". Read-only
  // where tipping isn't offered, as on the author's own comment.
  const showTipTooltip = showTooltips && totalAwarded > 0;
  const tipIconClass = showTipTooltip || isCard ? 'h-[18px] w-[18px]' : 'h-4 w-4';
  const tipContent = (
    <>
      <Icon name="tipRSC" size={showTipTooltip || isCard ? 18 : 16} className={tipIconClass} />
      {totalAwarded > 0 ? (
        <span>
          {formatCurrency({ amount: totalAwarded, showUSD, exchangeRate, shorten: true })}
        </span>
      ) : (
        <span>Tip</span>
      )}
    </>
  );
  const tipBaseClass = isCard
    ? 'flex h-7 items-center gap-1 rounded-full px-2 text-[13px] font-medium text-gray-500'
    : 'flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-gray-700';
  const tipControl = onTip ? (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        isCard ? `${tipBaseClass} transition-colors` : `${tipBaseClass} transition-all`,
        isCard ? cardIconButtonClass : 'hover:bg-white hover:text-gray-900 hover:shadow-sm'
      )}
      tooltip={showTooltips && !showTipTooltip ? 'Tip' : undefined}
      onClick={handleTip}
    >
      {tipContent}
    </Button>
  ) : (
    <div className={cn(tipBaseClass)}>{tipContent}</div>
  );
  const tipAction =
    onTip || totalAwarded > 0 ? (
      showTipTooltip ? (
        <Tooltip
          content={
            <TipTooltip
              tips={tips}
              awardedBountyAmount={awardedBountyAmount}
              totalAwarded={totalAwarded}
              showUSD={showUSD}
              exchangeRate={exchangeRate}
            />
          }
          position="top"
          width="w-[320px]"
        >
          {tipControl}
        </Tooltip>
      ) : (
        tipControl
      )
    ) : null;

  const moreMenu = showMoreMenu ? (
    <BaseMenu
      trigger={moreMenuTrigger}
      align={groupUtilityActions ? 'start' : 'end'}
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
    >
      {listDetailContext && relatedDocumentUnifiedDocumentId && (
        <BaseMenuItem onClick={handleRemoveFromList} className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Remove from list</span>
        </BaseMenuItem>
      )}

      {canHideFromFeed && (
        <BaseMenuItem onClick={handleOpenHideFromFeed} className="flex items-center gap-2">
          <EyeOff className="w-4 h-4" />
          <span>Hide from feed</span>
        </BaseMenuItem>
      )}

      {menuItems.map((item, index) => (
        <BaseMenuItem
          key={`menu-item-${index}`}
          onClick={(e) => {
            setIsMenuOpen(false);
            item.onClick(e);
          }}
          className={cn('flex items-center gap-2', item.className)}
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
  ) : null;

  return (
    <>
      <div className={cn('flex items-center justify-between', isFlat ? 'gap-3' : 'gap-2')}>
        <div
          className={cn(
            'flex items-center',
            // A card's actions wrap rather than run past a narrow column.
            isCard ? 'min-w-0 flex-wrap' : 'flex-nowrap',
            'overflow-visible',
            isFlat ? 'gap-4' : undefined,
            className
          )}
        >
          <div
            className={cn(
              'flex items-center transition-all',
              isFlat
                ? cn('gap-2', isVoting && 'opacity-50')
                : cn(
                    // Activity cards leave the votes bare, like the icons beside them.
                    !isCard && 'h-8 rounded-full bg-white px-1 shadow-sm ring-1 ring-gray-200/80',
                    isVoting && 'opacity-50'
                  )
            )}
          >
            <button
              onClick={(e) => handleVote(e, 'up')}
              disabled={isVoting}
              className={cn(
                'flex items-center justify-center transition-colors',
                isFlat
                  ? cn(
                      'h-6 w-6',
                      localUserVote === 'UPVOTE'
                        ? 'text-green-600'
                        : 'text-gray-500 hover:text-gray-800'
                    )
                  : cn(
                      'h-7 w-7 rounded-full',
                      localUserVote === 'UPVOTE'
                        ? 'bg-green-50 text-green-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    ),
                isVoting ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              aria-label="Upvote"
            >
              <ArrowUp {...arrowIconProps} />
            </button>
            <span
              className={cn(
                'text-center text-xs font-medium',
                isFlat
                  ? 'min-w-[1.1rem] text-gray-700'
                  : 'min-w-[1.75rem] px-1 font-semibold text-gray-900'
              )}
            >
              {localVoteCount}
            </span>
            <button
              onClick={(e) => handleVote(e, 'down')}
              disabled={isVoting}
              className={cn(
                'flex items-center justify-center transition-colors',
                isFlat
                  ? cn(
                      'h-6 w-6',
                      localUserVote === 'DOWNVOTE'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-800'
                    )
                  : cn(
                      'h-7 w-7 rounded-full',
                      localUserVote === 'DOWNVOTE'
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    ),
                isVoting ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              aria-label="Downvote"
            >
              <ArrowDown {...arrowIconProps} />
            </button>
          </div>
          {!hideCommentButton && (
            <ActionButton
              icon={MessageCircle}
              count={actionLabels?.comment ? undefined : metrics?.comments}
              tooltip="Comment"
              label={actionLabels?.comment || 'Comment'}
              onClick={handleComment}
              showLabel={Boolean(actionLabels?.comment)}
              showTooltip={showTooltips}
              flat={isFlat}
              testId="feed-item-comment-action"
            />
          )}
          {tipAction}
          {onExpand && (
            <ActionButton
              icon={Maximize2}
              tooltip={isExpanded ? 'Collapse' : 'Expand'}
              label={isExpanded ? 'Collapse' : 'Expand'}
              onClick={(e) => {
                e?.stopPropagation();
                onExpand(e);
              }}
              showTooltip={showTooltips}
              flat={isFlat}
            />
          )}
          {children}
          {groupUtilityActions && shareButton}
          {groupUtilityActions && saveButton}
          {groupUtilityActions && moreMenu}
        </div>

        {/* Left out when it would be empty, so it doesn't add a gap after the votes. */}
        {(rightSideActionButton || !groupUtilityActions) && (
          <div
            className={cn(
              'flex flex-shrink-0 items-center justify-end',
              isFlat ? 'gap-3' : 'gap-1'
            )}
          >
            {rightSideActionButton}
            {!groupUtilityActions && shareButton}
            {!groupUtilityActions && saveButton}
            {!groupUtilityActions && moreMenu}
          </div>
        )}
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

      {canHideFromFeed && (
        <ConfirmationModal
          isOpen={isHideFromFeedModalOpen}
          onClose={() => setIsHideFromFeedModalOpen(false)}
          title="Hide from feed"
          description={
            (hideableEntries?.length ?? 0) > 1
              ? 'All feed entries will be hidden from activity feed.'
              : 'This feed entry will be hidden from activity feed.'
          }
          confirmLabel="Hide from feed"
          confirmVariant="destructive"
          isConfirming={isHiding}
          onConfirm={handleConfirmHideFromFeed}
        />
      )}

      {relatedDocumentUnifiedDocumentId && isAddToListModalOpen && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={handleCloseAddToListModal}
          unifiedDocumentId={Number.parseInt(relatedDocumentUnifiedDocumentId)}
        />
      )}
    </>
  );
};

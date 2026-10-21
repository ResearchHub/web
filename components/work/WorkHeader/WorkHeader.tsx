'use client';

import { ReactNode, useState } from 'react';
import { Share, MoreHorizontal, Lightbulb } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { COVER_CHIP_CLASS, WorkCover, type CoverEyebrowFace } from '@/components/work/WorkCover';
import { ContentType, Work } from '@/types/work';
import { getWorkShareImageUrl } from '@/lib/metadata-helpers';
import { WorkMetadata } from '@/services/metadata.service';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { buildWorkUrl } from '@/utils/url';
import { formatRSC } from '@/utils/number';
import {
  findLatestFoundationBounty,
  getBountyDisplayAmount,
} from '@/components/Bounty/lib/bountyUtil';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useShareToken } from '@/hooks/useShareToken';
import { stripShareToken } from '@/lib/shareToken/url';
import { cn } from '@/utils/styles';
import toast from 'react-hot-toast';

import { useWorkVote, useWorkPermissions } from './WorkHeaderHooks';
import { useWorkHeaderMenuItems } from './useWorkHeaderMenu';
import { WorkHeaderVoteWidget } from './WorkHeaderVoteWidget';
import { WorkHeaderSubtitle } from './WorkHeaderSubtitle';
import { WorkHeaderBountyEyebrow } from './WorkHeaderBountyEyebrow';
import { PendingReviewBadge } from './PendingReviewBadge';
import { WorkHeaderModals } from './WorkHeaderModals';
import { WorkTabs } from '@/components/work/WorkTabs';
import { useWorkTab } from './WorkTabContext';

// Proposals and RFPs get an AI-written post in the share modal, shared under
// a bare /<route>/<id> link that redirects to the slugged page.
const AI_POST_ROUTES: Partial<Record<ContentType, string>> = {
  preregistration: 'proposal',
  funding_request: 'grant',
};

interface WorkHeaderProps {
  work: Work;
  metadata: WorkMetadata;
  className?: string;
  preTitle?: ReactNode;
  subtitle?: ReactNode;
  additionalMenuItems?: ReactNode;
  tabs?: ReactNode;
  reviewsTabUrl?: string;
  hideVoteWidget?: boolean;
  /**
   * Show the work as a large image cover with its title on it, instead of the
   * hero header. Tabs, subtitle and primary action are left to the page.
   */
  cover?: {
    imageUrl?: string;
    /** The small line over the title. */
    eyebrow?: string;
    /** A small face before it. */
    eyebrowFace?: CoverEyebrowFace;
    /** In the cover's corner, e.g. "Closed"; unset, a foundation bounty's badge if it has one. */
    badges?: ReactNode;
  };
  /**
   * Below lg the sidebar opens in a drawer from the header. A page that shows
   * everything its sidebar holds on phones anyway leaves the button out.
   */
  hideSidebarButton?: boolean;
}

export function WorkHeader({
  work,
  metadata,
  className,
  preTitle,
  subtitle: subtitleOverride,
  additionalMenuItems,
  tabs: tabsOverride,
  reviewsTabUrl: reviewsTabUrlOverride,
  hideVoteWidget = false,
  cover,
  hideSidebarButton = false,
}: WorkHeaderProps) {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const { showShareModal } = useShareModalContext();
  const shareToken = useShareToken();
  const { isInList } = useIsInList(work.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });

  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const voteState = useWorkVote(work);
  const permissions = useWorkPermissions(work);

  const {
    menuItems,
    showFundraiseActionModal,
    closeFundraiseModal,
    confirmFundraiseAction,
    fundraiseModalConfig,
    showReopenModal,
    closeReopenModal,
    confirmReopenFundraise,
    isReopeningFundraise,
    showCloseGrantModal,
    closeCloseGrantModal,
    confirmCloseGrant,
    isClosingGrant,
    showInviteExpertsModal,
    closeInviteExpertsModal,
    inviteExpertsGrantId,
  } = useWorkHeaderMenuItems({
    work,
    metadata,
    permissions,
    onOpenFlagModal: () => setIsFlagModalOpen(true),
  });

  const foundationBounty = findLatestFoundationBounty(metadata.bounties);

  const bountyDisplay = (() => {
    if (!foundationBounty) return '';
    const { amount } = getBountyDisplayAmount(foundationBounty, exchangeRate, showUSD);
    return showUSD ? `$${amount}` : `${formatRSC({ amount, shorten: true, round: true })} RSC`;
  })();

  const reviewsUrl = buildWorkUrl({
    id: work.id,
    contentType: work.contentType,
    slug: work.slug,
    tab: 'bounties',
    shareToken,
  });

  const reviewsTabUrl =
    reviewsTabUrlOverride ??
    (work.postType === 'REGISTERED_REPORT'
      ? undefined
      : buildWorkUrl({
          id: work.id,
          contentType: work.contentType,
          slug: work.slug,
          tab: 'reviews',
          shareToken,
        }));

  const { setMobileSidebarOpen } = useWorkTab();

  const shareAction = () => {
    const aiPostRoute = AI_POST_ROUTES[work.contentType];
    showShareModal({
      url: aiPostRoute
        ? `${globalThis.location.origin}/${aiPostRoute}/${work.id}`
        : stripShareToken(globalThis.location.href),
      docTitle: work.title,
      action: 'USER_SHARED_DOCUMENT',
      shouldShowConfetti: false,
      aiPostId: aiPostRoute ? work.id : undefined,
      previewImageUrl: aiPostRoute ? getWorkShareImageUrl(work) : undefined,
    });
  };

  // On a cover the badges sit on the image, so they wear its chips' edge.
  const badgeClass = cover ? COVER_CHIP_CLASS : undefined;

  const defaultEyebrow = foundationBounty ? (
    <WorkHeaderBountyEyebrow
      bountyDisplay={bountyDisplay}
      reviewsUrl={reviewsUrl}
      className={badgeClass}
    />
  ) : undefined;

  const baseEyebrow = cover?.badges === undefined ? defaultEyebrow : cover.badges;

  // Papers, posts, and proposals carry their moderation state at the top level.
  // Grants are exempt (their post stays APPROVED; grant.status drives their own
  // eyebrow), so this badge never double-renders for them.
  let resolvedEyebrow = baseEyebrow;
  if (work.moderationStatus === 'PENDING') {
    resolvedEyebrow = (
      <div className="flex flex-wrap items-center gap-1.5">
        <PendingReviewBadge className={badgeClass} />
        {baseEyebrow}
      </div>
    );
  }

  const resolvedSubtitle =
    subtitleOverride !== undefined ? (
      subtitleOverride
    ) : (
      <WorkHeaderSubtitle work={work} metadata={metadata} reviewsUrl={reviewsTabUrl} />
    );

  // On a cover the buttons share one white chip, so they drop their own fill.
  const btnClass = cn(
    'p-2 flex items-center justify-center rounded-lg text-gray-600 transition-colors',
    cover ? 'hover:bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
  );

  const actionBar = (
    <div className={cn('flex items-center', cover ? 'gap-0.5' : 'gap-3')}>
      {!hideVoteWidget && (
        <div className="flex items-center rounded-lg bg-gray-100">
          <WorkHeaderVoteWidget {...voteState} onVote={voteState.handleVote} size="sm" />
        </div>
      )}
      <button
        onClick={handleAddToList}
        disabled={isTogglingDefaultList}
        className={cn(
          btnClass,
          isInList && 'text-green-600',
          isTogglingDefaultList && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Save"
      >
        <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-5 w-5" />
      </button>
      {!hideSidebarButton && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className={cn(btnClass, 'lg:hidden')}
          aria-label="Show insights"
        >
          <Lightbulb className="h-5 w-5" />
        </button>
      )}
      {/* A cover keeps Share in its chip on every screen; elsewhere phones find it in the menu. */}
      <button
        onClick={shareAction}
        className={cn(btnClass, !cover && '!hidden lg:!flex')}
        aria-label="Share"
      >
        <Share className="h-5 w-5" />
      </button>
      <BaseMenu
        align="start"
        trigger={
          <button className={btnClass} aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        }
      >
        {!cover && (
          <div className="lg:hidden">
            <BaseMenuItem onSelect={shareAction}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </BaseMenuItem>
          </div>
        )}
        {additionalMenuItems}
        {menuItems}
      </BaseMenu>
    </div>
  );

  const defaultTabs = <WorkTabs work={work} metadata={metadata} />;

  const resolvedTabs = tabsOverride !== undefined ? tabsOverride : defaultTabs;

  return (
    <>
      {cover ? (
        <WorkCover
          title={work.title}
          eyebrow={cover.eyebrow}
          eyebrowFace={cover.eyebrowFace}
          imageUrl={cover.imageUrl}
          badges={resolvedEyebrow}
          actions={actionBar}
          preTitle={preTitle}
          className={className}
        />
      ) : (
        <HeroHeader
          title={work.title}
          eyebrow={resolvedEyebrow}
          preTitle={preTitle}
          subtitle={resolvedSubtitle}
          actions={actionBar}
          className={className}
        >
          <div className="mt-3 sm:mt-4">
            <div className="min-w-0">{resolvedTabs}</div>
          </div>
        </HeroHeader>
      )}

      <WorkHeaderModals
        work={work}
        isFlagModalOpen={isFlagModalOpen}
        onCloseFlagModal={() => setIsFlagModalOpen(false)}
        isTipModalOpen={isTipModalOpen}
        onCloseTipModal={() => setIsTipModalOpen(false)}
        onTipSuccess={(amount) => {
          toast.success(`Successfully tipped ${amount} RSC`);
          setIsTipModalOpen(false);
        }}
        isAddToListModalOpen={isAddToListModalOpen}
        onCloseAddToListModal={() => setIsAddToListModalOpen(false)}
        showFundraiseActionModal={showFundraiseActionModal}
        onCloseFundraiseModal={closeFundraiseModal}
        onConfirmFundraise={confirmFundraiseAction}
        fundraiseModalConfig={fundraiseModalConfig}
        showReopenModal={showReopenModal}
        onCloseReopenModal={closeReopenModal}
        onConfirmReopen={confirmReopenFundraise}
        isReopeningFundraise={isReopeningFundraise}
        showCloseGrantModal={showCloseGrantModal}
        onCloseCloseGrantModal={closeCloseGrantModal}
        onConfirmCloseGrant={confirmCloseGrant}
        isClosingGrant={isClosingGrant}
        showInviteExpertsModal={showInviteExpertsModal}
        onCloseInviteExpertsModal={closeInviteExpertsModal}
        inviteExpertsGrantId={inviteExpertsGrantId}
      />
    </>
  );
}

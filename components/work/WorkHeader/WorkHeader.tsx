'use client';

import { ReactNode, useState } from 'react';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Work } from '@/types/work';
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
import toast from 'react-hot-toast';

import { useWorkVote, useWorkPermissions } from './WorkHeaderHooks';
import { useWorkHeaderMenuItems } from './useWorkHeaderMenu';
import { WorkHeaderVoteWidget } from './WorkHeaderVoteWidget';
import { WorkHeaderActionBar } from './WorkHeaderActionBar';
import { WorkHeaderSubtitle } from './WorkHeaderSubtitle';
import { WorkHeaderBountyEyebrow } from './WorkHeaderBountyEyebrow';
import { WorkHeaderModals } from './WorkHeaderModals';
import { WorkTabs } from '@/components/work/WorkTabs';
import { useWorkTab } from './WorkTabContext';

interface WorkHeaderProps {
  work: Work;
  metadata: WorkMetadata;
  contentType?: 'paper' | 'post' | 'fund';
  updatesCount?: number;
  className?: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  tabs?: ReactNode;
  primaryAction?: ReactNode;
  hideVoteWidget?: boolean;
  grantModalProps?: {
    isApplyToGrantModalOpen: boolean;
    onCloseApplyToGrantModal: () => void;
    grantId: string;
    grantAmountUsd?: number;
  };
}

export function WorkHeader({
  work,
  metadata,
  contentType = 'paper',
  updatesCount,
  className,
  eyebrow: eyebrowOverride,
  subtitle: subtitleOverride,
  tabs: tabsOverride,
  primaryAction,
  hideVoteWidget = false,
  grantModalProps,
}: WorkHeaderProps) {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isWorkEditModalOpen, setIsWorkEditModalOpen] = useState(false);

  const { showShareModal } = useShareModalContext();
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
  } = useWorkHeaderMenuItems({
    work,
    metadata,
    permissions,
    onOpenFlagModal: () => setIsFlagModalOpen(true),
    onOpenWorkEditModal: () => setIsWorkEditModalOpen(true),
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
    tab: 'reviews',
  });

  const { setActiveTab } = useWorkTab();

  const shareAction = () =>
    showShareModal({
      url: globalThis.location.href,
      docTitle: work.title,
      action: 'USER_SHARED_DOCUMENT',
      shouldShowConfetti: false,
    });

  const defaultEyebrow = foundationBounty ? (
    <WorkHeaderBountyEyebrow bountyDisplay={bountyDisplay} reviewsUrl={reviewsUrl} />
  ) : undefined;

  const resolvedEyebrow = eyebrowOverride !== undefined ? eyebrowOverride : defaultEyebrow;
  const resolvedSubtitle =
    subtitleOverride !== undefined ? subtitleOverride : <WorkHeaderSubtitle work={work} />;

  const desktopCta = (
    <div className="hidden sm:flex flex-shrink-0 flex-col items-stretch gap-1.5">
      {!hideVoteWidget && <WorkHeaderVoteWidget {...voteState} onVote={voteState.handleVote} />}
      {primaryAction}
      <WorkHeaderActionBar
        moreMenuItems={menuItems}
        onShare={shareAction}
        onSave={handleAddToList}
        isInList={isInList}
        isSaveDisabled={isTogglingDefaultList}
      />
    </div>
  );

  const mobileActions = (
    <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0">
      {!hideVoteWidget && (
        <WorkHeaderVoteWidget {...voteState} onVote={voteState.handleVote} size="sm" />
      )}
      <WorkHeaderActionBar
        moreMenuItems={menuItems}
        onShare={shareAction}
        onSave={handleAddToList}
        isInList={isInList}
        isSaveDisabled={isTogglingDefaultList}
        primaryAction={primaryAction}
        size="sm"
      />
    </div>
  );

  const defaultTabs = (
    <WorkTabs
      work={work}
      metadata={metadata}
      contentType={contentType}
      onTabChange={setActiveTab}
      updatesCount={updatesCount}
    />
  );

  const resolvedTabs = tabsOverride !== undefined ? tabsOverride : defaultTabs;

  return (
    <>
      <HeroHeader
        title={work.title}
        eyebrow={resolvedEyebrow}
        subtitle={resolvedSubtitle}
        cta={desktopCta}
        className={className}
      >
        <div className="flex items-end justify-between mt-3 sm:mt-4">
          <div className="min-w-0 flex-1">{resolvedTabs}</div>
          <div className="sm:hidden flex-shrink-0 ml-2">{mobileActions}</div>
        </div>
      </HeroHeader>

      <WorkHeaderModals
        work={work}
        metadata={metadata}
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
        isWorkEditModalOpen={isWorkEditModalOpen}
        onCloseWorkEditModal={() => setIsWorkEditModalOpen(false)}
        showFundraiseActionModal={showFundraiseActionModal}
        onCloseFundraiseModal={closeFundraiseModal}
        onConfirmFundraise={confirmFundraiseAction}
        fundraiseModalConfig={fundraiseModalConfig}
        isApplyToGrantModalOpen={grantModalProps?.isApplyToGrantModalOpen}
        onCloseApplyToGrantModal={grantModalProps?.onCloseApplyToGrantModal}
        grantId={grantModalProps?.grantId}
        grantAmountUsd={grantModalProps?.grantAmountUsd}
      />
    </>
  );
}

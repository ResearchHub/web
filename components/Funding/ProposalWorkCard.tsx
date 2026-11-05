'use client';

import { FC, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Trophy } from 'lucide-react';
import {
  ActivityTimestamp,
  ActivityWorkActions,
  ActivityWorkMetadata,
  WorkPreviewCard,
} from '@/components/Activity';
import {
  getActivityWork,
  getAwardCardStat,
  getWorkCardPresentation,
  isAwardFeedEntry,
  type WorkCardStat,
} from '@/components/Activity/lib/activityWork.utils';
import { FeedItemFundingBadges } from '@/components/Feed/FeedItemFundingBadges';
import { AllocateFundingPoolModal } from '@/components/modals/AllocateFundingPoolModal';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Button } from '@/components/ui/Button';
import { useGrantAllocateContext } from '@/components/Funding/GrantPageContext';
import { canManageGrantPool } from '@/components/Funding/lib/canManageGrantPool';
import {
  awardActionLabel,
  canAwardProposal,
  isAwardMechanism,
} from '@/components/Funding/lib/fundingMechanism';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useFundraises } from '@/contexts/FundraiseContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useUser } from '@/contexts/UserContext';
import { findGrantApplicationIdForPost, type FundingPool } from '@/types/grant';
import { formatCurrency } from '@/utils/currency';
import type { FeedEntry } from '@/types/feed';
import type { Fundraise } from '@/types/funding';

interface ProposalWorkCardProps {
  entry: FeedEntry;
  /** Fired when the user opens the proposal, for feed click analytics. */
  onNavigate?: () => void;
}

/**
 * A finished fundraise reports what it actually raised; an open one reports the
 * target, since that is the number a prospective funder decides against.
 */
function buildFundraiseStats(
  fundraise: Fundraise,
  showUSD: boolean,
  exchangeRate: number
): WorkCardStat[] {
  const isCompleted = fundraise.status === 'COMPLETED';
  const source = isCompleted ? fundraise.amountRaised : fundraise.goalAmount;

  return [
    {
      label: isCompleted ? 'Raised' : 'Raising',
      value: formatCurrency({
        amount: Math.round(showUSD ? source.usd : source.rsc),
        showUSD,
        exchangeRate,
        skipConversion: true,
        shorten: true,
      }),
      accent: true,
    },
  ];
}

/**
 * Proposal card for the funding feeds. Shares the activity feed's work-card
 * language (frosted image card over an action footer) without the actor header.
 */
export const ProposalWorkCard: FC<ProposalWorkCardProps> = ({ entry, onNavigate }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();
  const { user } = useUser();
  const router = useRouter();
  const { isGrantScoped, refresh: refreshProposals } = useFundraises();
  const grantAllocate = useGrantAllocateContext();

  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isAwardOpen, setIsAwardOpen] = useState(false);

  const work = getActivityWork(entry);

  const fundingPool = grantAllocate?.fundingPool ?? null;
  const applicationId =
    work && grantAllocate
      ? findGrantApplicationIdForPost(grantAllocate.applications, work.id)
      : undefined;

  const canManagePool = canManageGrantPool(user, grantAllocate?.grantCreatedByUserId);

  // The button stays visible once the viewer can manage an open pool, even when
  // nothing is left to give — the modal explains the exhausted balance rather
  // than the action silently disappearing.
  const canAllocate =
    isGrantScoped &&
    canManagePool &&
    fundingPool?.status === 'OPEN' &&
    work?.fundraise?.status === 'OPEN' &&
    applicationId != null;
  const canAward =
    isGrantScoped &&
    canAwardProposal({
      userId: user?.id,
      grantCreatorUserId: grantAllocate?.grantCreatedByUserId,
      isAward: isAwardMechanism(grantAllocate?.fundingMechanism),
      grantOpen: grantAllocate?.isActive === true,
      fundraise: work?.fundraise,
    });

  const handleAllocateSuccess = useCallback(
    (updatedPool: FundingPool) => {
      grantAllocate?.setFundingPool(updatedPool);
      void refreshProposals();
      router.refresh();
    },
    [grantAllocate, refreshProposals, router]
  );

  if (!work) return null;

  const entryId = String(entry.id);
  const fundraise = work.fundraise;
  const isNonprofit = entry.raw?.is_nonprofit === true && !!fundraise;

  // These feeds are proposals-only, so the funding figures are derived directly
  // from the fundraise rather than inferred from `activityAction` the way an
  // activity row has to.
  const base = getWorkCardPresentation(entry, work, { showUSD, exchangeRate });
  // On an award RFP's page the RFP says so; elsewhere (`/fund/proposals`) the
  // entry names the RFP it answers. Either way it shows no ask.
  const isAward = isAwardMechanism(grantAllocate?.fundingMechanism) || isAwardFeedEntry(entry);
  const awardStat =
    isAward && fundraise ? getAwardCardStat(fundraise, showUSD, exchangeRate) : null;
  const presentation = isAward
    ? { ...base, stats: awardStat ? [awardStat] : base.stats, progress: undefined }
    : fundraise
      ? {
          ...base,
          stats: buildFundraiseStats(fundraise, showUSD, exchangeRate),
          progress:
            fundraise.goalAmount.usd > 0
              ? fundraise.amountRaised.usd / fundraise.goalAmount.usd
              : undefined,
        }
      : base;

  const handleNavigate = () => {
    updateLastClickedEntryId(entryId);
    onNavigate?.();
  };

  return (
    <article data-entry-id={entryId} data-testid="proposal-card">
      <WorkPreviewCard work={work} brand={presentation.brand} onNavigate={handleNavigate}>
        <WorkPreviewCard.Overlay position="top-left">
          <FeedItemFundingBadges
            href={work.href}
            isNonprofit={isNonprofit}
            fundraiseStatus={fundraise?.status}
            completedLabel={isAward ? 'Awarded' : 'Funded'}
            variant="overlay"
          />
        </WorkPreviewCard.Overlay>
        <WorkPreviewCard.Metadata>
          <ActivityWorkMetadata work={work} presentation={presentation} />
        </WorkPreviewCard.Metadata>
        <WorkPreviewCard.Actions>
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="min-w-0 flex-1">
              <ActivityWorkActions entry={entry} work={work} />
            </div>
            {canAward && fundraise && (
              <Button
                data-testid="award-proposal"
                variant="dark"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAwardOpen(true);
                }}
              >
                <Trophy className="h-3.5 w-3.5" />
                {awardActionLabel(fundraise)}
              </Button>
            )}
            {canAllocate && (
              <Button
                data-testid="allocate-funding-pool"
                variant="dark"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAllocateOpen(true);
                }}
              >
                <Coins className="h-3.5 w-3.5" />
                Allocate
              </Button>
            )}
          </div>
        </WorkPreviewCard.Actions>
      </WorkPreviewCard>
      <ActivityTimestamp timestamp={entry.timestamp} className="mt-3" />

      {canAward && fundraise && (
        <ContributeToFundraiseModal
          isOpen={isAwardOpen}
          onClose={() => setIsAwardOpen(false)}
          fundraise={fundraise}
          proposalTitle={work.title}
          isAward
          variant="panel"
          successText="The prize has been awarded to this proposal."
          onContributeSuccess={() => {
            void refreshProposals();
            router.refresh();
          }}
        />
      )}

      {canAllocate && fundingPool && applicationId != null && (
        <AllocateFundingPoolModal
          isOpen={isAllocateOpen}
          onClose={() => setIsAllocateOpen(false)}
          fundingPool={fundingPool}
          applicationId={applicationId}
          proposalTitle={work.title}
          onSuccess={handleAllocateSuccess}
        />
      )}
    </article>
  );
};

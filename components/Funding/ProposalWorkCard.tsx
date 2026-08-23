'use client';

import { FC } from 'react';
import {
  ActivityTimestamp,
  ActivityWorkActions,
  ActivityWorkMetadata,
  WorkPreviewCard,
} from '@/components/Activity';
import {
  getActivityWork,
  getWorkCardPresentation,
  type WorkCardStat,
} from '@/components/Activity/lib/activityWork.utils';
import { FeedItemFundingBadges } from '@/components/Feed/FeedItemFundingBadges';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
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

  const work = getActivityWork(entry);

  if (!work) return null;

  const entryId = String(entry.id);
  const fundraise = work.fundraise;
  const isNonprofit = entry.raw?.is_nonprofit === true && !!fundraise;

  // These feeds are proposals-only, so the funding figures are derived directly
  // from the fundraise rather than inferred from `activityAction` the way an
  // activity row has to.
  const base = getWorkCardPresentation(entry, work, { showUSD, exchangeRate });
  const presentation = fundraise
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
    <article data-entry-id={entryId}>
      <WorkPreviewCard work={work} brand={presentation.brand} onNavigate={handleNavigate}>
        <WorkPreviewCard.Overlay position="top-left">
          <FeedItemFundingBadges
            href={work.href}
            isNonprofit={isNonprofit}
            fundraiseStatus={fundraise?.status}
            variant="overlay"
          />
        </WorkPreviewCard.Overlay>
        <WorkPreviewCard.Metadata>
          <ActivityWorkMetadata work={work} presentation={presentation} />
        </WorkPreviewCard.Metadata>
        <WorkPreviewCard.Actions>
          <ActivityWorkActions entry={entry} work={work} />
        </WorkPreviewCard.Actions>
      </WorkPreviewCard>
      <ActivityTimestamp timestamp={entry.timestamp} className="mt-3" />
    </article>
  );
};

'use client';

import { FC } from 'react';
import { ActivityAuthorSummary, ActivityGroupHeader } from './ActivityGroupHeader';
import { ActivityTimestamp } from './ActivityTimestamp';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ContributionAmount } from '../amounts/ContributionAmount';
import { ActivityWorkActions } from '../work/ActivityWorkActions';
import { ActivityWorkMetadata } from '../work/ActivityWorkMetadata';
import { WorkPreviewCard } from '../work/WorkPreviewCard';
import { getWorkCardPresentation } from '../lib/activityWork.utils';
import type { ActivityFundingGroupRow, ActivityFundingTotals } from '../lib/activityGrouping.utils';
import type { CurrencyAmount } from '@/utils/currency';

interface ActivityFundingGroupCardProps {
  row: ActivityFundingGroupRow;
}

/** Fold both buckets into the currency the reader has selected. */
function toPreferredTotal(
  totals: ActivityFundingTotals,
  showUSD: boolean,
  exchangeRate: number
): CurrencyAmount {
  if (showUSD) {
    return { amount: totals.usd + totals.rsc * exchangeRate, currency: 'USD' };
  }
  const usdAsRsc = exchangeRate > 0 ? totals.usd / exchangeRate : 0;
  return { amount: totals.rsc + usdAsRsc, currency: 'RSC' };
}

/**
 * A single row standing in for several contributions to the same fundraise:
 * a funder facepile, the summed contribution, and one work card.
 */
export const ActivityFundingGroupCard: FC<ActivityFundingGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, funders, totals } = row;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  const latestEntryId = String(latestEntry.id);
  const presentation = getWorkCardPresentation(latestEntry, work, { showUSD, exchangeRate });
  const total = toPreferredTotal(totals, showUSD, exchangeRate);
  const isRfp = work.documentType === 'funding_request';

  const markEntryClicked = () => {
    updateLastClickedEntryId(latestEntryId);
  };

  return (
    <article
      className="py-4 border-b border-gray-100 last:border-b-0"
      data-entry-id={latestEntryId}
      // Absorbed members keep an anchor here so scroll restoration can find them.
      data-entry-ids={entries.map((entry) => String(entry.id)).join(' ')}
      data-testid="activity-card"
    >
      <ActivityGroupHeader authors={funders}>
        <div className="pt-1 text-sm leading-6">
          <ActivityAuthorSummary authors={funders} />
          <span className="text-gray-500">
            {isRfp ? ' contributed to the funding pool' : ' funded this proposal.'}
          </span>{' '}
          <ContributionAmount contribution={total} className="align-middle" />
        </div>
      </ActivityGroupHeader>

      {/* Indent matches a single-actor card's 32px avatar plus the 10px flex gap. */}
      <div className="mt-5 tablet:ml-[42px]">
        <WorkPreviewCard
          work={work}
          brand={presentation.brand}
          onNavigate={markEntryClicked}
          showPlaceholder
        >
          <WorkPreviewCard.Metadata>
            <ActivityWorkMetadata work={work} presentation={presentation} />
          </WorkPreviewCard.Metadata>
          <WorkPreviewCard.Actions>
            <ActivityWorkActions entry={latestEntry} work={work} hideableEntries={entries} />
          </WorkPreviewCard.Actions>
        </WorkPreviewCard>
      </div>

      <ActivityTimestamp timestamp={latestEntry.timestamp} className="mt-3 tablet:ml-[42px]" />
    </article>
  );
};

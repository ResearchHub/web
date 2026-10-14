'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityActor } from './ActivityActor';
import { ActivityCardMenu } from './ActivityCardMenu';
import { ActivityCardShell } from './ActivityCardShell';
import { ActivityCardFooter } from '../work/ActivityCardFooter';
import { ActivityWorkCover } from '../work/ActivityWorkCover';
import { getActivityActionLine } from '../lib/activityDisplay.utils';
import { getActivityCta, getWorkCoverPresentation } from '../lib/activityWork.utils';
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
 * the funders, the summed contribution, and one work cover.
 */
export const ActivityFundingGroupCard: FC<ActivityFundingGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, funders, totals } = row;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  const latestEntryId = String(latestEntry.id);
  const cover = getWorkCoverPresentation(latestEntry, work, { showUSD, exchangeRate });
  const line = {
    ...getActivityActionLine(latestEntry, work),
    value: {
      kind: 'contribution' as const,
      amount: toPreferredTotal(totals, showUSD, exchangeRate),
    },
  };

  return (
    <ActivityCardShell
      entryId={latestEntryId}
      // Absorbed members keep an anchor here so scroll restoration can find them.
      entryIds={entries.map((entry) => String(entry.id))}
    >
      <ActivityActor
        authors={funders}
        action={line}
        timestamp={latestEntry.timestamp}
        menu={<ActivityCardMenu work={work} hideableEntries={entries} />}
      >
        <ActivityWorkCover
          work={work}
          cover={cover}
          onNavigate={() => updateLastClickedEntryId(latestEntryId)}
          className="mt-3"
        />

        <ActivityCardFooter
          entry={latestEntry}
          work={work}
          cta={getActivityCta(latestEntry, work)}
          hideableEntries={entries}
        />
      </ActivityActor>
    </ActivityCardShell>
  );
};

'use client';

import { FC } from 'react';
import Link from 'next/link';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
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
import type { AuthorProfile } from '@/types/authorProfile';
import type { CurrencyAmount } from '@/utils/currency';

/**
 * Funder avatars are the same 32px as the lone avatar on a single-actor card, so the
 * stack outgrows that card's fixed gutter. The work card below therefore carries its
 * own indent rather than inheriting one from a gutter column.
 */
const MAX_VISIBLE_FUNDERS = 3;
const FUNDER_AVATAR_SPACING = -14;

const MAX_NAMED_FUNDERS = 2;

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

const FunderName: FC<{ funder: AuthorProfile }> = ({ funder }) => {
  const name = funder.fullName || 'Unknown';

  if (!funder.id) {
    return <span className="font-medium text-gray-900">{name}</span>;
  }

  return (
    <AuthorTooltip authorId={funder.id} placement="bottom">
      <Link href={funder.profileUrl} className="font-medium text-gray-900 hover:text-primary-600">
        {name}
      </Link>
    </AuthorTooltip>
  );
};

const FunderSummary: FC<{ funders: AuthorProfile[]; contributionCount: number }> = ({
  funders,
  contributionCount,
}) => {
  if (funders.length === 1) {
    return (
      <>
        <FunderName funder={funders[0]} />
        <span className="text-gray-500">{` funded this proposal ${contributionCount} times`}</span>
      </>
    );
  }

  const named = funders.slice(0, MAX_NAMED_FUNDERS);
  const remaining = funders.length - named.length;

  return (
    <>
      {named.map((funder, index) => {
        const isLastNamed = index === named.length - 1;
        const separator = isLastNamed && remaining === 0 ? ' and ' : ', ';

        return (
          <span key={`${funder.id}-${index}`}>
            {index > 0 && <span className="text-gray-500">{separator}</span>}
            <FunderName funder={funder} />
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-gray-500">{` and ${remaining} ${remaining === 1 ? 'other' : 'others'}`}</span>
      )}
      <span className="text-gray-500"> funded this proposal for</span>
    </>
  );
};

/**
 * A single row standing in for several contributions to the same fundraise:
 * a funder facepile, the summed contribution, and one work card.
 */
export const ActivityFundingGroupCard: FC<ActivityFundingGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, funders, contributionCount, totals } = row;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  const latestEntryId = String(latestEntry.id);
  const presentation = getWorkCardPresentation(latestEntry, work, { showUSD, exchangeRate });
  const total = toPreferredTotal(totals, showUSD, exchangeRate);

  const avatarItems = funders.map((funder) => ({
    src: funder.profileImage || '',
    alt: funder.fullName || 'Funder',
    authorId: funder.id || undefined,
  }));

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
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 pt-0.5">
          <AvatarStack
            items={avatarItems}
            size="sm"
            maxItems={MAX_VISIBLE_FUNDERS}
            spacing={FUNDER_AVATAR_SPACING}
            showLabel={false}
          />
        </div>

        <div className="min-w-0 flex-1 pt-1 text-sm leading-6">
          <FunderSummary funders={funders} contributionCount={contributionCount} />{' '}
          <ContributionAmount contribution={total} className="align-middle" />
        </div>
      </div>

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

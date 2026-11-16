'use client';

import { FC, useState } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityActor } from './ActivityActor';
import { ActivityCardMenu } from './ActivityCardMenu';
import { ACTIVITY_CONTENT_DIVIDER, ActivityCardShell } from './ActivityCardShell';
import { ActivityCardFooter } from '../work/ActivityCardFooter';
import { ActivityWorkCover } from '../work/ActivityWorkCover';
import { ActivityWorkLink } from '../work/ActivityWorkLink';
import { getActivityCta, getWorkCoverPresentation } from '../lib/activityWork.utils';
import type { ActivityFoundationProposalsGroupRow } from '../lib/activityGrouping.utils';
import { formatCompactAmount } from '@/utils/currency';

/** How many of the other proposals list before the rest fold behind "See all". */
const PREVIEW_COUNT = 3;

interface ActivityFoundationProposalsGroupCardProps {
  row: ActivityFoundationProposalsGroupRow;
}

/**
 * A single row standing in for a bulk upload of Foundation proposals: the newest
 * one with its full cover, and the others as a short list of links.
 */
export const ActivityFoundationProposalsGroupCard: FC<
  ActivityFoundationProposalsGroupCardProps
> = ({ row }) => {
  const { entries, latestEntry, work, works, author } = row;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  const latestEntryId = String(latestEntry.id);
  const cover = getWorkCoverPresentation(latestEntry, work, { showUSD, exchangeRate });
  const otherWorks = works.filter((other) => other.id !== work.id);
  // A bulk upload can fold a whole page of proposals, so the list starts short.
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleWorks = isExpanded ? otherWorks : otherWorks.slice(0, PREVIEW_COUNT);

  return (
    <ActivityCardShell
      entryId={latestEntryId}
      // Absorbed members keep an anchor here so scroll restoration can find them.
      entryIds={entries.map((entry) => String(entry.id))}
    >
      <ActivityActor
        authors={[author]}
        action={{ label: `Submitted ${works.length} proposals` }}
        timestamp={latestEntry.timestamp}
        menu={<ActivityCardMenu work={work} hideableEntries={entries} />}
      >
        <ActivityWorkCover
          work={work}
          cover={cover}
          onNavigate={() => updateLastClickedEntryId(latestEntryId)}
          className="mt-3"
        />

        {otherWorks.length > 0 && (
          <div className={ACTIVITY_CONTENT_DIVIDER}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {otherWorks.length} more {otherWorks.length === 1 ? 'proposal' : 'proposals'}
            </p>
            <ul className="divide-y divide-gray-100">
              {visibleWorks.map((other) => {
                const goalUsd = other.fundraise?.goalAmount?.usd;
                return (
                  <li key={other.id}>
                    <ActivityWorkLink
                      work={other}
                      trailing={goalUsd ? `${formatCompactAmount(goalUsd)} goal` : undefined}
                      onNavigate={() => updateLastClickedEntryId(latestEntryId)}
                    />
                  </li>
                );
              })}
            </ul>
            {visibleWorks.length < otherWorks.length && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                See all {works.length} proposals
              </button>
            )}
          </div>
        )}

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

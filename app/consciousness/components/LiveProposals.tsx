'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FundraiseProvider, useFundraises } from '@/contexts/FundraiseContext';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { ActivityCard } from '@/components/Activity';
import { getActivityWork } from '@/components/Activity/lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';
import { cn } from '@/utils/styles';
import { ProposalRow } from './ProposalRow';

/** How many rows show before "See all" hands over to the RFP's own page. */
const SHOWN = 6;

/**
 * The RFP's proposals and activity from ResearchHub, in the page's own type:
 * the same two feeds the RFP page's Proposals and Activity tabs load
 * (`funding_feed` for this grant, and the grant-scoped activity feed).
 * Activity is only fetched once its tab is opened. `empty` is what shows
 * while there are no proposals: the page's launch-day slots.
 */
export function LiveProposals({
  grantId,
  rfpHref,
  empty,
}: {
  grantId: number;
  rfpHref: string;
  empty: ReactNode;
}) {
  return (
    <FundraiseProvider grantId={grantId}>
      <Inner grantId={grantId} rfpHref={rfpHref} empty={empty} />
    </FundraiseProvider>
  );
}

function Inner({
  grantId,
  rfpHref,
  empty,
}: {
  grantId: number;
  rfpHref: string;
  empty: ReactNode;
}) {
  const [tab, setTab] = useState<'proposals' | 'activity'>('proposals');
  const { entries, isLoading, proposalCount, activate } = useFundraises();
  useEffect(() => {
    activate();
  }, [activate]);
  const activity = useActivityFeed({ scope: 'grants', grantId, enabled: tab === 'activity' });

  const tabs = (
    <div role="tablist" aria-label="Proposals and activity" className="mt-8 flex gap-1">
      {(
        [
          ['proposals', 'Proposals', isLoading ? null : proposalCount],
          ['activity', 'Activity', null],
        ] as const
      ).map(([id, label, count]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => setTab(id)}
          className={cn(
            'rounded-full px-4 py-1.5 text-[14px] transition-colors',
            tab === id
              ? 'bg-[rgb(var(--o-text-rgb)/0.08)] text-[var(--o-text)]'
              : 'text-[var(--o-mute)] hover:text-[var(--o-text)]'
          )}
        >
          {label}
          {count != null && <span className="ml-1.5 tabular-nums opacity-60">{count}</span>}
        </button>
      ))}
    </div>
  );

  const seeAll = (
    <Link
      href={rfpHref}
      className="group mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-[var(--o-gold)] hover:text-[var(--o-text)]"
    >
      See all on the RFP page
      <ArrowRight
        aria-hidden
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );

  return (
    <>
      <h2
        id="proposals-title"
        className="o-reveal o-serif max-w-[12em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
      >
        {isLoading ? (
          'Proposals'
        ) : proposalCount === 0 ? (
          <>
            No proposals yet. <em>The first one sets the bar.</em>
          </>
        ) : (
          `${proposalCount} ${proposalCount === 1 ? 'proposal' : 'proposals'} so far.`
        )}
      </h2>
      {tabs}

      {tab === 'proposals' && (
        <div role="tabpanel" className="mt-6">
          {isLoading ? (
            <RowsSkeleton />
          ) : entries.length === 0 ? (
            empty
          ) : (
            <>
              <ul className="o-rule divide-y divide-[color:var(--o-line)] border-y">
                {entries.slice(0, SHOWN).map((e) => (
                  <EntryRow key={e.id} entry={e} />
                ))}
              </ul>
              {proposalCount > SHOWN && seeAll}
            </>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div role="tabpanel" className="mt-6">
          {activity.isLoading ? (
            <RowsSkeleton />
          ) : activity.entries.length === 0 ? (
            <p className="text-[15px] text-[var(--o-soft)]">No activity yet.</p>
          ) : (
            <>
              <div className="space-y-4">
                {activity.entries.slice(0, SHOWN).map((entry) => (
                  <ActivityCard key={entry.id} entry={entry} />
                ))}
              </div>
              {seeAll}
            </>
          )}
        </div>
      )}
    </>
  );
}

/** A feed entry as a row; entries that are not works are skipped. */
function EntryRow({ entry }: { entry: FeedEntry }) {
  const work = getActivityWork(entry);
  if (!work) return null;
  const f = work.fundraise;
  return (
    <ProposalRow
      p={{
        href: work.href,
        title: work.title,
        imageUrl: work.imageUrl ?? null,
        authors: (work.authors ?? []).map((a) => a.fullName).filter(Boolean),
        raisedUsd: f ? f.amountRaised.usd : null,
        goalUsd: f && f.goalAmount.usd > 0 ? f.goalAmount.usd : null,
        funded: f?.status === 'COMPLETED',
      }}
    />
  );
}

function RowsSkeleton() {
  return (
    <ul aria-hidden className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-4 py-2" style={{ opacity: 1 - i * 0.3 }}>
          <span className="h-16 w-16 shrink-0 animate-pulse rounded-[10px] bg-[rgb(var(--o-text-rgb)/0.07)]" />
          <span className="h-4 flex-1 animate-pulse rounded bg-[rgb(var(--o-text-rgb)/0.07)]" />
        </li>
      ))}
    </ul>
  );
}

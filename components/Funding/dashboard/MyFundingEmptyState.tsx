'use client';

import { useEffect, useState } from 'react';
import { FeedWorkCard } from '@/components/Funding/dashboard/FundingWorkCards';
import { DashboardSection, SeeAllButton } from '@/components/Funding/dashboard/DashboardSection';
import { DraftsCarousel } from '@/components/Funding/dashboard/DraftsCarousel';
import { UpNext } from '@/components/Funding/dashboard/UpNext';
import { STARTER_UP_NEXT } from '@/components/Funding/dashboard/lib/myFundingModel';
import { FeedService } from '@/services/feed.service';
import type { FeedEntry } from '@/types/feed';
import type { Note } from '@/types/note';

const SAMPLE_SIZE = 2;

/**
 * A couple of proposals raising now and RFPs taking proposals, to start from.
 * Loading until both lists have answered, whether or not they succeeded.
 */
function useOpenFunding() {
  const [proposals, setProposals] = useState<FeedEntry[]>([]);
  const [rfps, setRfps] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const sample = (load: Promise<{ entries: FeedEntry[] }>, set: (entries: FeedEntry[]) => void) =>
      load
        .then((result) => !cancelled && set(result.entries.slice(0, SAMPLE_SIZE)))
        .catch(() => undefined);
    Promise.all([
      sample(
        FeedService.getFeed({
          endpoint: 'funding_feed',
          contentType: 'PREREGISTRATION',
          fundraiseStatus: 'OPEN',
          pageSize: SAMPLE_SIZE,
        }),
        setProposals
      ),
      sample(
        FeedService.getFeed({
          endpoint: 'grant_feed',
          contentType: 'GRANT',
          status: 'OPEN',
          pageSize: SAMPLE_SIZE,
        }),
        setRfps
      ),
    ]).then(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { proposals, rfps, isLoading };
}

function Samples({
  title,
  href,
  linkLabel,
  entries,
}: {
  readonly title: string;
  readonly href: string;
  readonly linkLabel: string;
  readonly entries: readonly FeedEntry[];
}) {
  if (entries.length === 0) return null;
  return (
    <DashboardSection title={title} action={<SeeAllButton href={href}>{linkLabel}</SeeAllButton>}>
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id}>
            <FeedWorkCard entry={entry} />
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

interface MyFundingEmptyStateProps {
  /** The user's drafts. The same carousel the overview shows once they have activity. */
  readonly drafts?: readonly Note[];
}

/**
 * My Funding before the user has done anything: their drafts, if they have
 * started one, then proposals and RFPs open right now to start from.
 */
export function MyFundingEmptyState({ drafts = [] }: MyFundingEmptyStateProps) {
  const { proposals, rfps, isLoading } = useOpenFunding();

  return (
    <div className="mb-6 space-y-12">
      <DraftsCarousel drafts={drafts} />
      {isLoading ? (
        <EmptyStateSkeleton />
      ) : (
        <>
          <UpNext items={STARTER_UP_NEXT} />
          <Samples
            title="Raising now"
            href="/fund/proposals"
            linkLabel="All proposals"
            entries={proposals}
          />
          <Samples
            title="RFPs looking for proposals"
            href="/fund"
            linkLabel="All open RFPs"
            entries={rfps}
          />
        </>
      )}
    </div>
  );
}

/** The rest of the empty state while the samples load: Up next, then two lists of cards. */
function EmptyStateSkeleton() {
  return (
    <div className="animate-pulse space-y-12" aria-hidden="true">
      <div>
        <div className="h-5 w-20 rounded bg-gray-200" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="h-[148px] rounded-xl bg-gray-100" />
          <div className="h-[148px] rounded-xl bg-gray-100" />
        </div>
      </div>
      {[0, 1].map((section) => (
        <div key={section}>
          <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
          <div className="space-y-4">
            <div className="h-64 rounded-xl bg-gray-100" />
            <div className="h-64 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

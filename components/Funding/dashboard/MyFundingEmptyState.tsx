'use client';

import { FeedWorkCard } from '@/components/Funding/dashboard/FundingWorkCards';
import { DashboardSection, SeeAllButton } from '@/components/Funding/dashboard/DashboardSection';
import { DraftsCarousel } from '@/components/Funding/dashboard/DraftsCarousel';
import { UpNext } from '@/components/Funding/dashboard/UpNext';
import { STARTER_UP_NEXT } from '@/components/Funding/dashboard/lib/myFundingModel';
import { useOpenFunding } from '@/hooks/useOpenFunding';
import type { FeedEntry } from '@/types/feed';
import type { Note } from '@/types/note';

const SAMPLE_SIZE = 2;

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
  const { proposals, rfps, isLoading } = useOpenFunding(SAMPLE_SIZE);

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

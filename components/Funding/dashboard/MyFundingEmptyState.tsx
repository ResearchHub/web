'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { FeedWorkCard } from '@/components/Funding/dashboard/FundingWorkCards';
import {
  DashboardSectionHeader,
  SeeAllButton,
} from '@/components/Funding/dashboard/DashboardSectionHeader';
import { UpNext } from '@/components/Funding/dashboard/UpNext';
import { STARTER_UP_NEXT } from '@/components/Funding/dashboard/lib/myFundingModel';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { FeedService } from '@/services/feed.service';
import type { FeedEntry } from '@/types/feed';
import type { Note } from '@/types/note';
import { formatTimeAgo } from '@/utils/date';

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
    <section aria-label={title}>
      <DashboardSectionHeader
        title={title}
        action={<SeeAllButton href={href}>{linkLabel}</SeeAllButton>}
      />
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id}>
            <FeedWorkCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface MyFundingEmptyStateProps {
  /** The user's latest draft, when they have started one but published nothing. */
  readonly latestDraft?: Note;
}

/**
 * My Funding before the user has done anything, or signed in: drafting an RFP
 * or a proposal, the draft they started if any, and the proposals and RFPs
 * open right now to start from.
 */
export function MyFundingEmptyState({ latestDraft }: MyFundingEmptyStateProps) {
  const { proposals, rfps, isLoading } = useOpenFunding();
  const { openDraft } = useFundingDrafting();

  // Everything at once, so the samples do not pop in under the rest.
  if (isLoading) return <EmptyStateSkeleton />;

  return (
    <div className="mb-6 space-y-10">
      <UpNext items={STARTER_UP_NEXT} />
      {latestDraft && (
        <button
          type="button"
          onClick={() => openDraft(latestDraft)}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              {latestDraft.title?.trim() || 'Your draft'}
            </span>{' '}
            · edited {formatTimeAgo(latestDraft.updatedDate)}. It is waiting under Drafts in the
            sidebar.
          </span>
          <span className="shrink-0 text-sm font-semibold text-primary-600">Pick it up</span>
        </button>
      )}
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
    </div>
  );
}

/** The empty state's shape while the samples load: Up next, then two lists of cards. */
function EmptyStateSkeleton() {
  return (
    <div className="mb-6 animate-pulse space-y-10" aria-hidden="true">
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

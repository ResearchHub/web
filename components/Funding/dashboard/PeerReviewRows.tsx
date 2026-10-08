'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getEntryMeta } from '@/components/Activity/lib/activityDisplay.utils';
import {
  DashboardSectionHeader,
  SeeAllButton,
} from '@/components/Funding/dashboard/DashboardSectionHeader';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { FeedCommentContent, FeedEntry } from '@/types/feed';
import { formatCurrencyAmount } from '@/utils/currency';
import { formatTimeAgo } from '@/utils/date';

interface PeerReviewRowsProps {
  /** The user's published reviews, newest first. */
  readonly entries: FeedEntry[];
  /** How many they have published in all. */
  readonly total: number;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly loadMore: () => void;
}

/** The rows shown before the list asks to be expanded. */
const RECENT_COUNT = 3;

const ROW =
  'flex items-center gap-3 border-t border-gray-100 px-4 py-3 transition-colors first:border-t-0';

/**
 * The peer reviews a user has published: what each one reviewed, the score
 * they gave it, and what the review earned.
 */
export function PeerReviewRows({
  entries,
  total,
  hasMore,
  isLoadingMore,
  loadMore,
}: PeerReviewRowsProps) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? entries : entries.slice(0, RECENT_COUNT);
  const canExpand = !showAll && (entries.length > RECENT_COUNT || hasMore);

  return (
    <section>
      <DashboardSectionHeader
        title="Your peer reviews"
        meta={total > 0 && `${total} published`}
        action={canExpand && <SeeAllButton onClick={() => setShowAll(true)}>See all</SeeAllButton>}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {shown.map((entry) => (
          <PeerReviewRow key={entry.id} entry={entry} />
        ))}
        {showAll && hasMore && (
          <div className="border-t border-gray-100 px-2 py-2">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PeerReviewRow({ entry }: { readonly entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { title, href } = getEntryMeta(entry);

  // Read from the comment itself: the activity feed's own score helper steps
  // aside for a review that earned something, and this row shows both.
  const review = entry.content as FeedCommentContent;
  const score = review.review?.score ?? review.comment?.reviewScore;
  const earned = entry.awardedBountyAmount;

  const face = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">{title || 'Untitled work'}</div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          {score != null && score > 0 && (
            <>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-medium text-gray-700">
                <span className="sr-only">Score </span>
                {score.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{formatTimeAgo(entry.timestamp)}</span>
        </div>
      </div>
      {earned != null && earned > 0 && (
        <div className="shrink-0 text-right">
          {/* The same eyebrow treatment as the totals, so the label reads as a field name. */}
          <div className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500">
            Earned
          </div>
          <div className="mt-1.5 whitespace-nowrap font-mono text-sm font-semibold leading-none text-gray-900">
            {formatCurrencyAmount({
              amount: earned,
              currency: 'RSC',
              showUSD,
              exchangeRate,
              shorten: true,
            })}
          </div>
        </div>
      )}
    </>
  );

  return href ? (
    <Link href={href} className={`${ROW} hover:bg-gray-50`}>
      {face}
    </Link>
  ) : (
    <div className={ROW}>{face}</div>
  );
}

'use client';

import Link from 'next/link';
import {
  getActivityWork,
  getWorkCardPresentation,
} from '@/components/Activity/lib/activityWork.utils';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { FeedEntry } from '@/types/feed';
import { cn } from '@/utils/styles';

interface OpenFundingListProps {
  readonly title: string;
  /** The full listing behind the "View all" link. */
  readonly href: string;
  readonly entries: readonly FeedEntry[];
  readonly className?: string;
}

/**
 * A short sidebar list of open RFPs or proposals, drawn like the Recently
 * visited rows: the headline figure, the title and the cover. Nothing when the
 * list is empty, including when it failed to load.
 */
export function OpenFundingList({ title, href, entries, className }: OpenFundingListProps) {
  if (entries.length === 0) return null;

  return (
    <section className={cn('w-full', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-500">{title}</h2>
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
        >
          View all
        </Link>
      </div>

      <ul className="-mx-2 mt-2 flex flex-col gap-0.5">
        {entries.map((entry) => (
          <OpenFundingRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}

function OpenFundingRow({ entry }: { readonly entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const work = getActivityWork(entry);
  if (!work) return null;

  const { stats, progress } = getWorkCardPresentation(entry, work, { showUSD, exchangeRate });
  const figure = stats?.find((stat) => stat.accent);

  return (
    <li>
      <Link
        href={work.href}
        className="flex items-start gap-3 rounded-[10px] p-2 transition-colors hover:bg-white"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] pt-px">
          {figure && (
            <span className="text-[11px] leading-tight text-gray-500">
              {figure.label} <span className="font-semibold text-gray-700">{figure.value}</span>
              {progress != null && progress > 0 && (
                <> · {Math.min(100, Math.round(progress * 100))}% funded</>
              )}
            </span>
          )}
          <span className="line-clamp-2 text-[13px] font-medium leading-snug text-gray-900">
            {work.title}
          </span>
        </span>
        <DocumentThumbnail image={work.imageUrl ?? null} size="lg" />
      </Link>
    </li>
  );
}

/** Placeholder for an OpenFundingList while its entries load. */
export function OpenFundingListSkeleton({
  rows = 3,
  className,
}: {
  readonly rows?: number;
  readonly className?: string;
}) {
  return (
    <div className={cn('w-full animate-pulse', className)} aria-hidden>
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 w-24 rounded bg-gray-200" />
        <div className="h-3 w-12 rounded bg-gray-200" />
      </div>
      <ul className="-mx-2 mt-2 flex flex-col gap-0.5">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="flex items-start gap-3 p-2">
            <div className="min-w-0 flex-1 space-y-1.5 pt-px">
              <div className="h-2.5 w-20 rounded bg-gray-200" />
              <div className="h-3.5 w-[90%] rounded bg-gray-200" />
              <div className="h-3.5 w-[60%] rounded bg-gray-200" />
            </div>
            <div className="h-12 w-12 shrink-0 rounded-[10px] bg-gray-200" />
          </li>
        ))}
      </ul>
    </div>
  );
}

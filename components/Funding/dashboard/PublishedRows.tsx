'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import { FUNDING_KIND_ICON, FUNDING_KIND_LABEL } from '@/components/Funding/fundingKind';
import {
  type Money,
  type PublishedDocument,
} from '@/components/Funding/dashboard/hooks/useMyFundingDocuments';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { getRemainingDays } from '@/utils/date';
import { cn } from '@/utils/styles';

interface PublishedRowsProps {
  /** What is open first, then what has closed. */
  readonly documents: PublishedDocument[];
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  /** Shown in place of the rows when nothing has been published. */
  readonly emptyMessage: string;
}

/** The rows shown before the list asks to be expanded. */
const RECENT_COUNT = 6;

const MORE_BUTTON =
  'rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900';

/**
 * Everything the user has published on the funding side, RFPs and proposals
 * in one list: active work first, then past work. Each row has its image, its
 * title, the status under it, and what is happening to it — the money on it,
 * how many answered, when it closes. The group is always on the page; with
 * nothing published it says so.
 */
export function PublishedRows({ documents, hasMore, loadMore, emptyMessage }: PublishedRowsProps) {
  const [showAll, setShowAll] = useState(false);

  const activeCount = documents.filter((doc) => doc.active).length;
  const closedCount = documents.length - activeCount;
  const meta = [
    activeCount > 0 && `${activeCount} active`,
    closedCount > 0 && `${closedCount} past`,
  ]
    .filter(Boolean)
    .join(' · ');

  const title =
    documents.length === 0 ? 'Your funding' : activeCount > 0 ? 'Active funding' : 'Past funding';
  const shown = showAll ? documents : documents.slice(0, RECENT_COUNT);
  const hiddenCount = documents.length - shown.length;

  return (
    <section>
      <DashboardSectionHeader title={title} meta={meta} />

      {documents.length === 0 && <DashboardEmptyState>{emptyMessage}</DashboardEmptyState>}

      <ul className="space-y-3">
        {shown.map((doc, index) => (
          <li key={doc.key}>
            {activeCount > 0 && closedCount > 0 && index === activeCount && (
              <div className="mb-3 border-t border-gray-200 pt-5">
                <div className="flex items-baseline gap-2.5">
                  <h3 className="text-base font-semibold tracking-tight text-gray-900">
                    Past funding
                  </h3>
                  <span className="text-xs text-gray-500">{closedCount}</span>
                </div>
              </div>
            )}
            <PublishedRow doc={doc} />
          </li>
        ))}

        {hiddenCount > 0 && (
          <li className="!mt-2">
            <button type="button" onClick={() => setShowAll(true)} className={MORE_BUTTON}>
              Show {hiddenCount} more
            </button>
          </li>
        )}

        {hiddenCount === 0 && hasMore && (
          <li className="!mt-2">
            <button type="button" onClick={loadMore} className={MORE_BUTTON}>
              Load more
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}

interface PublishedRowProps {
  readonly doc: PublishedDocument;
}

function PublishedRow({ doc }: PublishedRowProps) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const format = useCallback(
    (money: Money) =>
      formatCurrency({
        amount: showUSD ? money.usd : money.rsc,
        showUSD,
        exchangeRate,
        shorten: true,
        skipConversion: true,
      }),
    [showUSD, exchangeRate]
  );

  const remainingDays = doc.active && doc.endDate ? getRemainingDays(doc.endDate) : null;
  const daysLeft = remainingDays == null ? null : Math.ceil(remainingDays);

  return (
    <Link
      href={doc.href}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:border-gray-300 hover:bg-gray-50',
        // What has closed recedes behind what is still open.
        doc.active && 'shadow-sm'
      )}
    >
      <DocumentThumbnail image={doc.image} size="lg" />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'line-clamp-2 text-[15px] font-semibold leading-5',
            doc.active ? 'text-gray-900' : 'text-gray-700'
          )}
        >
          {doc.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <FontAwesomeIcon
              icon={FUNDING_KIND_ICON[doc.kind]}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {FUNDING_KIND_LABEL[doc.kind]}
          </span>
          <span aria-hidden="true">·</span>
          <NoteStatusLine published detail={doc.detail} className="min-w-0" />
        </div>
        <PublishedMetrics doc={doc} format={format} daysLeft={daysLeft} />
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700"
        aria-hidden="true"
      />
    </Link>
  );
}

function PublishedMetrics({
  doc,
  format,
  daysLeft,
}: {
  readonly doc: PublishedDocument;
  readonly format: (money: Money) => string;
  readonly daysLeft: number | null;
}) {
  if (!doc.money && !doc.count && daysLeft == null) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
      {doc.money && (
        <span>
          {doc.money.label}{' '}
          <span className="font-mono font-medium text-gray-800">{format(doc.money.amount)}</span>
          {doc.money.goal && (
            <>
              {' '}
              of{' '}
              <span className="font-mono font-medium text-gray-800">{format(doc.money.goal)}</span>
            </>
          )}
        </span>
      )}
      {doc.count && (
        <>
          {doc.money && <span aria-hidden="true">·</span>}
          <span>
            {doc.count.value} {doc.count.label.toLowerCase()}
          </span>
        </>
      )}
      {daysLeft != null && (
        <>
          {(doc.money || doc.count) && <span aria-hidden="true">·</span>}
          <span>{daysLeft}d left</span>
        </>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Bell, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import type { FundedRow } from '@/components/Funding/dashboard/lib/myFundingModel';
import { useMoneyFormat } from '@/components/Funding/dashboard/lib/useMoneyFormat';
import { formatTimeAgo } from '@/utils/date';

interface FundedResearchListProps {
  readonly rows: readonly FundedRow[];
  /** How many rows to show; the rest wait behind "See all". */
  readonly limit?: number;
  /** Opens the Funded tab, where every row is. */
  readonly onSeeAll?: () => void;
}

/**
 * Research you funded: each proposal with its scientist, the latest word from
 * its author or reviewers, and what you gave.
 */
export function FundedResearchList({ rows, limit, onSeeAll }: FundedResearchListProps) {
  if (rows.length === 0) return null;

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <section aria-label="Research you funded">
      <DashboardSectionHeader
        title="Research you funded"
        meta={`${rows.length} ${rows.length === 1 ? 'proposal' : 'proposals'}`}
        action={
          limit != null &&
          rows.length > limit &&
          onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              See all {rows.length}
            </button>
          )
        }
      />
      {/* One card holding every row, like Your peer reviews. */}
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {shown.map((row) => (
          <FundedResearchRow key={row.key} row={row} />
        ))}
      </ul>
    </section>
  );
}

function FundedResearchRow({ row }: { readonly row: FundedRow }) {
  const format = useMoneyFormat();

  return (
    <li>
      {/* A row showing an update or a review opens it, on the proposal's Updates or Reviews tab. */}
      <Link
        href={row.news?.href ?? row.href}
        className="group flex gap-4 px-4 py-4 transition-colors hover:bg-gray-50/70"
      >
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-primary-700">
            {row.title}
          </span>
          <span className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[13px] text-gray-600">
            <Avatar
              src={row.scientist.profileImage}
              alt={row.scientist.fullName}
              size={20}
              disableTooltip
            />
            <span className="truncate">{row.scientist.fullName}</span>
          </span>

          {row.news && (
            <span className="mt-2.5 flex gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-[13px] leading-snug text-gray-700">
              <span className="flex shrink-0 items-center gap-1 font-semibold text-gray-900">
                {row.news.kind === 'update' ? (
                  <>
                    <Bell className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                    Update
                  </>
                ) : (
                  'Peer review'
                )}
                {row.news.kind === 'review' && row.news.score ? (
                  <span className="inline-flex items-center gap-0.5 font-medium text-amber-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {row.news.score.toFixed(1)}
                  </span>
                ) : null}
                <span className="font-normal text-gray-500">
                  · {formatTimeAgo(row.news.timestamp)}
                </span>
              </span>
              <span className="line-clamp-2 min-w-0">{row.news.text}</span>
            </span>
          )}
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            You gave
          </span>
          <span className="mt-1 block font-mono text-base font-semibold text-gray-900">
            {format(row.youGave)}
          </span>
        </span>
      </Link>
    </li>
  );
}

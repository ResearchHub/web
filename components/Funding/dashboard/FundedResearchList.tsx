'use client';

import Link from 'next/link';
import { Bell, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import {
  DashboardSectionHeader,
  SeeAllButton,
} from '@/components/Funding/dashboard/DashboardSectionHeader';
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
          onSeeAll && <SeeAllButton onClick={onSeeAll}>See all {rows.length}</SeeAllButton>
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
        className="group block px-5 py-5 transition-colors hover:bg-gray-50/70"
      >
        <span className="flex items-start gap-6">
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-primary-700">
              {row.title}
            </span>
            <span className="mt-2 flex min-w-0 items-center gap-2 text-[13px] text-gray-600">
              <Avatar
                src={row.scientist.profileImage}
                alt={row.scientist.fullName}
                size={20}
                disableTooltip
              />
              <span className="truncate">{row.scientist.fullName}</span>
            </span>
          </span>

          <span className="shrink-0 text-right">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              You gave
            </span>
            <span className="mt-1 block font-mono text-base font-semibold text-gray-900">
              {format(row.youGave)}
            </span>
          </span>
        </span>

        {/* The latest news spans the whole row, under both the title and the amount. */}
        {row.news && (
          <span className="mt-4 block rounded-lg bg-gray-50 px-4 py-3 transition-colors group-hover:bg-gray-100/80">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              {row.news.kind === 'update' ? (
                <>
                  <Bell className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                  <span className="font-semibold text-gray-700">Update</span>
                </>
              ) : (
                <span className="font-semibold text-gray-700">Peer review</span>
              )}
              {row.news.kind === 'review' && row.news.score ? (
                <span className="inline-flex items-center gap-0.5 font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {row.news.score.toFixed(1)}
                </span>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{formatTimeAgo(row.news.timestamp)}</span>
            </span>
            <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-700">
              {row.news.text}
            </span>
          </span>
        )}
      </Link>
    </li>
  );
}

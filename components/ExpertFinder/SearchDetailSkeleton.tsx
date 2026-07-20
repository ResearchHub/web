'use client';

import { FC } from 'react';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { EXPERT_FINDER_LIST_PAGE_SIZE } from '@/app/expert-finder/lib/paginationParams';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import type { SortableColumn } from '@/components/ui/Table/TableContainer';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/utils/styles';

/** Keep in sync with OutreachTable columns (skeleton-only; avoid importing the table module). */
const MESSAGING_SKELETON_COLUMNS: SortableColumn[] = [
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'expertName', label: 'Expert', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: false },
  { key: 'createdAt', label: 'Created Date', sortable: false },
];

function SkeletonBreadcrumbs() {
  return (
    <div className="flex flex-wrap items-center gap-2 animate-pulse mb-2">
      <div className="h-4 w-14 bg-gray-200 rounded" />
      <div className="h-3 w-3 bg-gray-200 rounded-full" />
      <div className="h-4 w-28 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonRelatedWorkCard() {
  return (
    <div className="bg-gray-50 rounded-lg border !border-l-2 !border-l-gray-300 border-gray-200 !rounded-tl-none !rounded-bl-none p-4 animate-pulse">
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="space-y-1.5 mt-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonExpertResultCard() {
  return (
    <article className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
      </div>
      <div className="h-3.5 w-24 bg-gray-200 rounded mb-1" />
      <div className="h-3.5 w-40 bg-gray-200 rounded mb-3" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-1.5 mb-4 flex-1">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        <div className="h-8 w-24 bg-gray-200 rounded-md" />
        <div className="h-8 w-28 bg-gray-200 rounded-md" />
      </div>
    </article>
  );
}

function SkeletonTabs({ activeTab }: { activeTab: string }) {
  const isOutreach = activeTab === TAB_OUTREACH;
  return (
    <div className="flex gap-4 border-b border-gray-200 animate-pulse">
      <div
        className={cn(
          'h-9 w-28 rounded-t-md bg-gray-200',
          !isOutreach && 'border-b-2 border-gray-300'
        )}
      />
      <div
        className={cn(
          'h-9 w-24 rounded-t-md bg-gray-200',
          isOutreach && 'border-b-2 border-gray-300'
        )}
      />
    </div>
  );
}

function ExpertResultsTabSkeleton() {
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-md" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-32 bg-gray-200 rounded-md" />
          <div className="h-8 w-8 bg-gray-200 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:!grid-cols-2">
        {[0, 1, 2].map((i) => (
          <SkeletonExpertResultCard key={i} />
        ))}
      </div>
    </section>
  );
}

function MessagingTabSkeleton() {
  const { mdAndUp } = useScreenSize();
  return (
    <section>
      <div className="mb-4 space-y-2 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded-md" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="p-4">
        {mdAndUp ? (
          <TableSkeleton
            columns={MESSAGING_SKELETON_COLUMNS}
            rowCount={EXPERT_FINDER_LIST_PAGE_SIZE}
          />
        ) : (
          <ListCardSkeleton rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
        )}
      </div>
    </section>
  );
}

export interface SearchDetailSkeletonProps {
  /** Which tab content to skeleton — matches `?tab=` so Messaging does not flash Expert results. */
  activeTab?: typeof TAB_EXPERT_RESULTS | typeof TAB_OUTREACH;
}

export const SearchDetailSkeleton: FC<SearchDetailSkeletonProps> = ({
  activeTab = TAB_EXPERT_RESULTS,
}) => (
  <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
    <SkeletonBreadcrumbs />

    <div className="flex flex-wrap items-start gap-3 animate-pulse">
      <div className="h-6 w-28 bg-gray-200 rounded-full" />
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
      <div className="h-4 w-36 bg-gray-200 rounded" />
    </div>

    <SkeletonRelatedWorkCard />

    <SkeletonTabs activeTab={activeTab} />

    {activeTab === TAB_OUTREACH ? <MessagingTabSkeleton /> : <ExpertResultsTabSkeleton />}
  </div>
);

import { PageLayout } from '@/app/layouts/PageLayout';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';
import { SidebarCardSkeleton } from '@/components/ui/SidebarCard';
import {
  WORK_BOX_WIDTH_CLASS,
  WORK_ROW_CLASS,
  WorkCoverSkeleton,
} from '@/components/work/WorkCover';
import { cn } from '@/utils/styles';

/** The page tabs' place: as tall as the real strip (48px tabs on phones, 54px from tablet, and the rule). */
function PageTabsSkeleton() {
  return (
    <div className={WORK_ROW_CLASS}>
      <div
        className={cn(
          'flex h-[49px] items-center gap-8 border-b border-gray-200 px-4 tablet:!h-[55px] tablet:!px-0',
          WORK_BOX_WIDTH_CLASS
        )}
      >
        {['w-16', 'w-20', 'w-[72px]'].map((width) => (
          <div key={width} className={cn('h-4 animate-pulse rounded bg-gray-200', width)} />
        ))}
      </div>
    </div>
  );
}

/** The byline's place: a face and two lines over a row of chips. */
function BylineSkeleton() {
  return (
    <div className="mb-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-56 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['w-28', 'w-24', 'w-32'].map((width) => (
          <div key={width} className={cn('h-6 rounded-md bg-gray-100', width)} />
        ))}
      </div>
    </div>
  );
}

/**
 * An RFP or a proposal page while it loads: the cover, the tabs, the byline
 * and the body, and a sidebar of the navy funding card over a card of rows
 * (activity or reviews). Each part holds the real one's place, so nothing
 * moves when the page arrives.
 */
export function FundingPageSkeleton() {
  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebarTopOffset="aligned"
      rightSidebarBare
      topBanner={<WorkCoverSkeleton />}
      pageTabs={<PageTabsSkeleton />}
      rightSidebar={
        <div className="flex flex-col gap-3">
          <div className="animate-pulse space-y-3 rounded-lg bg-navy p-4">
            <div className="h-3 w-16 rounded bg-white/15" />
            <div className="h-7 w-40 rounded bg-white/15" />
            <div className="h-2 w-full rounded-full bg-white/15" />
            <div className="h-4 w-28 rounded bg-white/15" />
            <div className="h-10 w-full rounded-lg bg-white/15" />
          </div>
          <SidebarCardSkeleton />
        </div>
      }
    >
      <BylineSkeleton />
      <DocumentSkeleton className="max-w-[860px] !px-0 !pt-0" lines={12} />
    </PageLayout>
  );
}

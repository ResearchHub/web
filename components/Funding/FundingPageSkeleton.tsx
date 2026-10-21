import { PageLayout } from '@/app/layouts/PageLayout';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';
import { SidebarCardSkeleton } from '@/components/ui/SidebarCard';
import { WorkCoverSkeleton } from '@/components/work/WorkCover';

/**
 * An RFP or a proposal page while it loads: the cover, the body, and a
 * sidebar of the navy funding card over a card of rows (activity or reviews).
 */
export function FundingPageSkeleton() {
  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebarTopOffset="aligned"
      rightSidebarBare
      topBanner={<WorkCoverSkeleton />}
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
      <DocumentSkeleton className="max-w-[860px] !px-0 !pt-0" lines={12} />
    </PageLayout>
  );
}

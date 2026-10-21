import { PageLayout } from '@/app/layouts/PageLayout';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';
import { WorkCoverSkeleton } from '@/components/work/WorkCover';
import { FundingSidebarSkeleton } from '@/components/Funding/FundingSidebarSkeleton';

export default function ProposalLoading() {
  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebarTopOffset="aligned"
      rightSidebarBare
      topBanner={<WorkCoverSkeleton />}
      rightSidebar={<FundingSidebarSkeleton />}
    >
      <DocumentSkeleton className="max-w-[860px] !px-0 !pt-0" lines={12} />
    </PageLayout>
  );
}

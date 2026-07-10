import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton, WorkHeaderSkeleton } from '@/components/work/WorkSkeleton';
import { ProposalSidebarSkeleton } from '@/components/work/ProposalSidebarSkeleton';

export default function ProposalLoading() {
  return (
    <PageLayout
      topBanner={<WorkHeaderSkeleton tabCount={5} />}
      rightSidebar={<ProposalSidebarSkeleton />}
    >
      <WorkSkeleton showPdf={false} />
    </PageLayout>
  );
}

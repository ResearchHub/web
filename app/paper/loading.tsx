import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton, WorkHeaderSkeleton } from '@/components/work/WorkSkeleton';
import { WorkRightSidebarSkeleton } from '@/components/work/WorkRightSidebarSkeleton';

export default function PaperLoading() {
  return (
    <PageLayout
      topBanner={<WorkHeaderSkeleton tabCount={4} />}
      rightSidebar={<WorkRightSidebarSkeleton />}
    >
      <WorkSkeleton showAbstract={false} />
    </PageLayout>
  );
}

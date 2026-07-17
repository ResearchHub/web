import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton } from '@/components/work/WorkSkeleton';
import { PaperHeaderSkeleton } from '@/components/work/PaperHeaderSkeleton';
import { WorkRightSidebarSkeleton } from '@/components/work/WorkRightSidebarSkeleton';

export default function PaperLoading() {
  return (
    <PageLayout topBanner={<PaperHeaderSkeleton />} rightSidebar={<WorkRightSidebarSkeleton />}>
      <WorkSkeleton showAbstract={false} />
    </PageLayout>
  );
}

import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton, WorkHeaderSkeleton } from '@/components/work/WorkSkeleton';
import { WorkRightSidebarSkeleton } from '@/components/work/WorkRightSidebarSkeleton';

export default function QuestionLoading() {
  return (
    <PageLayout topBanner={<WorkHeaderSkeleton />} rightSidebar={<WorkRightSidebarSkeleton />}>
      <WorkSkeleton />
    </PageLayout>
  );
}

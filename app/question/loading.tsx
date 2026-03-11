import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton } from '@/components/work/WorkSkeleton';
import { WorkRightSidebarSkeleton } from '@/components/work/WorkRightSidebarSkeleton';

export default function QuestionLoading() {
  return (
    <PageLayout rightSidebar={<WorkRightSidebarSkeleton />}>
      <WorkSkeleton />
    </PageLayout>
  );
}

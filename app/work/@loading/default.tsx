import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSkeleton } from '@/components/work/WorkSkeleton';

export default function DefaultLoading() {
  return (
    <PageLayout>
      <WorkSkeleton />
    </PageLayout>
  );
}

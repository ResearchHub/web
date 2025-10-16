import { PageLayout } from '@/app/layouts/PageLayout';
import { BrowsePageSkeleton } from '@/components/skeletons/BrowsePageSkeleton';

export default function BrowseLoading() {
  return (
    <PageLayout>
      <BrowsePageSkeleton />
    </PageLayout>
  );
}

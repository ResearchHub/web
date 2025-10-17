import { PageLayout } from '@/app/layouts/PageLayout';
import { BrowsePageSkeleton } from '@/components/skeletons/BrowsePageSkeleton';

export default function BrowsePageLoading() {
  return (
    <PageLayout>
      <BrowsePageSkeleton />
    </PageLayout>
  );
}

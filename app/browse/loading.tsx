import { PageLayout } from '@/app/layouts/PageLayout';
import { TopicListSkeleton } from '@/components/skeletons/TopicListSkeleton';

export default function BrowseLoading() {
  return (
    <PageLayout>
      <div>
        {/* BrowsePageHeader placeholder */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>

        {/* Search bar placeholder */}
        <div className="h-10 w-full bg-gray-100 rounded-lg mb-6 animate-pulse" />

        <TopicListSkeleton count={12} />
      </div>
    </PageLayout>
  );
}

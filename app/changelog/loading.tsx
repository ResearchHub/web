import { PageLayout } from '@/app/layouts/PageLayout';

export default function ChangelogLoading() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="py-8 animate-pulse">
        <div className="mb-12">
          <div className="h-10 w-52 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-96 bg-gray-200 rounded" />
        </div>

        {/* Changelog entry skeleton */}
        <div className="space-y-10">
          <div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-3/4 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

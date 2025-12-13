'use client';

export const WorkRightSidebarSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Earning Opportunity Banner skeleton */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded mb-3" />
        <div className="h-9 w-full bg-gray-200 rounded" />
      </div>

      {/* Supporters Section skeleton */}
      <div>
        <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Topics Section skeleton */}
      <div>
        <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* DOI Section skeleton */}
      <div>
        <div className="h-5 w-10 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>

      {/* License Section skeleton */}
      <div>
        <div className="h-5 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Formats Section skeleton */}
      <div>
        <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

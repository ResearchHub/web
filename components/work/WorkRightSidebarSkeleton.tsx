'use client';

export const WorkRightSidebarSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Topics Section */}
      <div>
        <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* DOI Section */}
      <div>
        <div className="h-5 w-10 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>

      {/* License Section */}
      <div>
        <div className="h-5 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Formats Section */}
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

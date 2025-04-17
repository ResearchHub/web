import { FC } from 'react';

export const FeedItemSkeleton: FC = () => {
  return (
    // Main card container matching the actual item style
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      {/* Header Section: Avatar + Author/Action/Time */}
      <div className="flex items-center mb-3">
        {/* Avatar Placeholder */}
        <div className="w-9 h-9 rounded-full bg-gray-200 mr-3 flex-shrink-0" />
        {/* Author/Action/Time Placeholder */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Title Placeholder (potentially multi-line) */}
      <div className="space-y-2 mb-2">
        <div className="h-5 bg-gray-300 rounded w-full" />
        <div className="h-5 bg-gray-300 rounded w-5/6" />
      </div>

      {/* Author List Placeholder */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />

      {/* Abstract/Preview Placeholder */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Actions Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Vote Placeholder */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-8 h-6 bg-gray-200 rounded" />
          </div>
        </div>
        {/* More Options Placeholder */}
        <div className="w-5 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

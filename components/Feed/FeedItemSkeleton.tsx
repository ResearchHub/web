import { FC } from 'react';

export const FeedItemSkeleton: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
      {/* Top Section: Badges + Menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>

      {/* Title */}
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />

      {/* Authors + Date */}
      <div className="h-4 bg-gray-200 rounded w-56 mb-3" />

      {/* Abstract */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-3" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-12 bg-gray-200 rounded-full" />
          <div className="h-7 w-12 bg-gray-200 rounded-full" />
        </div>
        <div className="w-4 h-5 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

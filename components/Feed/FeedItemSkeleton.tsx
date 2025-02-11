import { FC } from 'react';

export const FeedItemSkeleton: FC = () => {
  return (
    <div className="relative animate-pulse">
      <div>
        {/* FeedItemHeader */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* FeedItemBody */}
        <div className="mt-2">
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>

        {/* FeedItemActions */}
        <div className="pt-3">
          <div className="flex items-center space-x-4">
            {[...Array(4)].map((_, k) => (
              <div key={k} className="h-8 w-8 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

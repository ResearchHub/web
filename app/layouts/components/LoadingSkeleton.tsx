'use client';

import { memo } from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeletonComponent: React.FC<LoadingSkeletonProps> = ({ count = 4 }) => (
  <div className="animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={`skeleton-${i}`} className="flex items-center justify-between mb-3 mx-0.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
          </div>
        </div>
        <div className="h-7 bg-gray-200 rounded-full w-16"></div>
      </div>
    ))}
  </div>
);

export const LoadingSkeleton = memo(LoadingSkeletonComponent);

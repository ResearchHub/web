'use client';

import { FC } from 'react';

interface AuditItemSkeletonProps {
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemSkeleton: FC<AuditItemSkeletonProps> = ({ view = 'pending' }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        {/* Flagged by line */}
        <div className="mb-3 mt-2">
          <div className="h-3 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Verdict by line (for dismissed/removed tabs) */}
        {view !== 'pending' && (
          <div className="mb-2">
            <div className="h-3 bg-gray-200 rounded w-56"></div>
          </div>
        )}

        {/* User and unified action */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-1"></div>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-4 p-3 bg-gray-50 rounded border-l-2 border-blue-300">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Action buttons (only for pending) */}
        {view === 'pending' && (
          <div className="flex items-center space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        )}
      </div>
    </div>
  );
};

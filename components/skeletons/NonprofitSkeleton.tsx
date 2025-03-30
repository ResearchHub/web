'use client';

import { Building } from 'lucide-react';

interface NonprofitSkeletonProps {
  showHeader?: boolean;
}

export function NonprofitSkeleton({ showHeader = true }: NonprofitSkeletonProps) {
  return (
    <div className="animate-pulse">
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <Building className="h-4 w-4 text-gray-300" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      )}
      <div className="rounded-md bg-gray-50 overflow-hidden">
        <div className="p-3 flex justify-between items-start">
          <div className="flex-1 pr-2 space-y-2">
            {/* Nonprofit name */}
            <div className="h-4 w-48 bg-gray-200 rounded" />
            {/* EIN */}
            <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
            {/* Department/Lab name */}
            <div className="h-3 w-36 bg-gray-200 rounded mt-1" />
          </div>
          <div className="flex items-center shrink-0">
            <div className="h-6 w-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

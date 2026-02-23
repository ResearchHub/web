import { Activity } from 'lucide-react';

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

export function ActivitySidebarSkeleton() {
  return (
    <div className="rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

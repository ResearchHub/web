function SkeletonRow() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start py-3">
      <div className="row-span-3 pt-0.5 w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
      <div className="h-3.5 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse mt-0.5" />
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse mt-0.5" />
    </div>
  );
}

export function ActivitySidebarSkeleton() {
  return (
    <div className="rounded-xl p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 12 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonRow({ isFirst }: { isFirst?: boolean }) {
  const widths = ['w-3/4', 'w-2/3', 'w-5/6'];
  const titleWidth = widths[Math.floor(Math.random() * widths.length)];

  return (
    <div
      className={`grid grid-cols-[auto_1fr] gap-x-2.5 items-start py-3 ${isFirst ? 'pt-0' : ''}`}
    >
      <div className="row-span-3 pt-0.5 w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
      <div className="h-3.5 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-28 animate-pulse mt-0.5" />
      <div className={`h-3 bg-gray-200 rounded ${titleWidth} animate-pulse mt-0.5`} />
    </div>
  );
}

export function ActivitySidebarSkeleton() {
  return (
    <div className="h-full">
      <div className="px-4 pb-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {Array.from({ length: 10 }, (_, i) => (
            <SkeletonRow key={i} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

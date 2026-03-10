interface FundingBannerSkeletonProps {
  showTabs?: boolean;
}

export function FundingBannerSkeleton({ showTabs = false }: FundingBannerSkeletonProps) {
  return (
    <div className="w-full bg-gray-50/80 border-b border-gray-200 animate-pulse">
      <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0">
        <div className="py-5">
          <div className="mb-1.5">
            <div className="h-6 w-16 bg-gray-200/60 rounded-md" />
          </div>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-2">
              <div className="h-9 w-80 bg-gray-200/60 rounded" />
              <div className="h-4 w-40 bg-gray-200/40 rounded" />
            </div>
            <div className="flex-shrink-0">
              <div className="h-12 w-44 bg-gray-200/60 rounded-lg" />
            </div>
          </div>
        </div>

        {showTabs && (
          <div className="flex items-center gap-8 pb-1">
            <div className="h-5 w-20 bg-gray-200/60 rounded" />
            <div className="h-5 w-16 bg-gray-200/40 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

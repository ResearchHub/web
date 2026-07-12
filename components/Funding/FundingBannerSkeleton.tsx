import { ResearchCoinSnapshotSkeleton } from '@/components/ResearchCoin/ResearchCoinSnapshot';

interface FundingBannerSkeletonProps {
  showTabs?: boolean;
}

export function FundingBannerSkeleton({ showTabs = false }: FundingBannerSkeletonProps) {
  return (
    <div className="w-full bg-gray-50/80 border-b border-gray-200 animate-pulse">
      <div className="max-w-[1180px] mx-auto px-4 tablet:!px-8 pt-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-start">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-9 sm:h-10 w-72 max-w-full bg-gray-200/60 rounded" />
            <div className="h-4 w-56 max-w-full bg-gray-200/40 rounded" />
          </div>

          <div className="hidden sm:flex w-72 flex-shrink-0 flex-col gap-3">
            <ResearchCoinSnapshotSkeleton />
            <div className="h-11 w-full bg-gray-200/60 rounded-lg" />
          </div>
        </div>

        <div className="sm:hidden mt-3 flex flex-col gap-3">
          <ResearchCoinSnapshotSkeleton />
          <div className="h-11 w-full bg-gray-200/60 rounded-lg" />
        </div>

        {showTabs && (
          <div className="sm:-mt-10 mt-4">
            <div className="flex items-center gap-6 mt-4 border-b border-transparent">
              <div className="flex items-center gap-1.5 border-b-2 border-gray-200 pb-3">
                <div className="h-5 w-5 rounded-full bg-gray-200/60 flex-shrink-0" />
                <div className="h-4 w-36 bg-gray-200/60 rounded" />
              </div>
              <div className="flex items-center gap-1.5 pb-3">
                <div className="h-5 w-5 rounded-full bg-gray-200/40 flex-shrink-0" />
                <div className="h-4 w-20 bg-gray-200/40 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

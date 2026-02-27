import { cn } from '@/utils/styles';

interface ProposalCardSkeletonProps {
  className?: string;
}

export function ProposalCardSkeleton({ className }: ProposalCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse',
        className
      )}
    >
      <div className="flex gap-3 p-3">
        <div className="flex-shrink-0 w-[120px] h-[90px] bg-gray-200 rounded-lg" />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-1.5" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-auto" />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-[18px] h-[18px] bg-gray-200 rounded-full" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProposalCardSkeleton;

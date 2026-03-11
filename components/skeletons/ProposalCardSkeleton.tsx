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
      <div className="flex flex-wrap p-3 gap-3">
        <div className="flex-1 basis-60 min-w-0 flex flex-col gap-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="w-[18px] h-[18px] bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="h-7 bg-gray-200 rounded-md w-16" />
            <div className="h-7 bg-gray-200 rounded-md w-12" />
            <div className="h-7 bg-gray-200 rounded-md w-12" />
          </div>
        </div>
        <div className="w-[190px] flex-shrink-0 self-stretch min-h-[100px] bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export default ProposalCardSkeleton;

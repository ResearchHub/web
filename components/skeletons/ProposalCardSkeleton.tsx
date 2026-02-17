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
      {/* Image */}
      <div className="aspect-[16/9] bg-gray-200" />

      {/* Content */}
      <div className="p-4">
        {/* Title - two lines */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1.5" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
      </div>
    </div>
  );
}

export default ProposalCardSkeleton;

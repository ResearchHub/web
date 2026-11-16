import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FundProposalsLoading() {
  return (
    <div>
      <div className="flex items-center justify-end mt-1 sm:mt-3 -mb-1">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="mt-4 space-y-8">
        {Array.from({ length: 3 }, (_, i) => (
          <FeedItemSkeleton key={i} variant="proposalWork" />
        ))}
      </div>
    </div>
  );
}

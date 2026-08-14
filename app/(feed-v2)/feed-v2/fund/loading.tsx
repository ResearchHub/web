import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FeedV2FundLoading() {
  return (
    <div>
      <div className="flex items-center justify-end mt-2 sm:mt-4 mb-2">
        <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="mt-4 space-y-8">
        {Array.from({ length: 3 }, (_, i) => (
          <FeedItemSkeleton key={i} variant="grant" />
        ))}
      </div>
    </div>
  );
}

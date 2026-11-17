import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FundLoading() {
  return (
    <div>
      <div className="flex items-center justify-end">
        <div className="h-4 w-16 rounded bg-gray-200 animate-pulse sm:h-5" />
      </div>
      <div className="mt-4 space-y-8">
        {Array.from({ length: 3 }, (_, i) => (
          <FeedItemSkeleton key={i} variant="grant" />
        ))}
      </div>
    </div>
  );
}

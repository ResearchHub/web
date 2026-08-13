import { ActivityCardSkeleton } from '@/components/Activity';

export default function FeedV2Loading() {
  return (
    <div>
      {[...Array(6)].map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}

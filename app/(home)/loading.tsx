import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';

export default function HomeLoading() {
  return (
    <div>
      {[...Array(6)].map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}

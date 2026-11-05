import { ActivityCardSkeleton } from '@/components/Activity';

export default function HomeLoading() {
  return (
    <div>
      {[...Array(6)].map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}

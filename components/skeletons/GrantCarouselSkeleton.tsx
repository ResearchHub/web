import { FC } from 'react';

interface GrantCarouselSkeletonProps {
  count?: number;
}

export const GrantCarouselSkeleton: FC<GrantCarouselSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="py-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-5 border-b border-gray-200 last:border-b-0">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="flex gap-3">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="flex-shrink-0 w-[280px] h-[220px] bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

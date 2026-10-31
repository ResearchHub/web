import { FC } from 'react';
import { ActivityCardSkeleton } from '@/components/Activity/cards/ActivityCardSkeleton';

interface CommentLoaderProps {
  count?: number;
}

/** A thread's comments while they load: the homepage feed's row skeleton, without its cover. */
export const CommentLoader: FC<CommentLoaderProps> = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, index) => (
      <ActivityCardSkeleton key={index} showCover={false} />
    ))}
  </div>
);

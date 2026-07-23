'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';

const SIZE_CLASS = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;

interface ReviewScoreStarsProps {
  score: number;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** Read-only 5-star row; filled count matches review score. */
export const ReviewScoreStars: FC<ReviewScoreStarsProps> = ({ score, size = 'sm', className }) => {
  if (score <= 0) return null;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`Score: ${score.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            SIZE_CLASS[size],
            i < score ? 'fill-amber-500 text-amber-500' : 'fill-none text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

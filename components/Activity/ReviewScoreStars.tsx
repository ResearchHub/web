'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ReviewScoreStarsProps {
  score: number;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZES = {
  sm: 13,
  md: 14,
} as const;

/** Five-star score display; filled up to the rounded score. */
export const ReviewScoreStars: FC<ReviewScoreStarsProps> = ({ score, size = 'sm', className }) => {
  const rounded = Math.round(score);

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`Score: ${score.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={SIZES[size]}
          className={cn(
            i <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </span>
  );
};

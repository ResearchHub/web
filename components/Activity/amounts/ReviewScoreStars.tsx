'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ReviewScoreStarsProps {
  score: number;
  size?: 'sm' | 'md';
  /** One filled star and the score to one decimal, e.g. "4.0", where five is too much. */
  compact?: boolean;
  className?: string;
}

const SIZES = {
  sm: 13,
  md: 14,
} as const;

/** Five-star score display; filled up to the rounded score. */
export const ReviewScoreStars: FC<ReviewScoreStarsProps> = ({
  score,
  size = 'sm',
  compact = false,
  className,
}) => {
  const rounded = Math.round(score);

  if (compact) {
    return (
      <span
        className={cn('inline-flex items-center gap-0.5 font-semibold text-gray-700', className)}
        role="img"
        aria-label={`Score: ${score.toFixed(1)} out of 5`}
      >
        <Star size={SIZES[size]} className="fill-amber-400 text-amber-400" aria-hidden />
        {score.toFixed(1)}
      </span>
    );
  }

  return (
    // `role="img"` so screen readers read the label instead of skipping the stars.
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`Score: ${score.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={SIZES[size]}
          aria-hidden
          className={cn(
            i <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </span>
  );
};

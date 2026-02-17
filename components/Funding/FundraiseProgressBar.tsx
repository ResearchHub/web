'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

interface FundraiseProgressBarProps {
  /** Current amount raised */
  raisedAmount: number;
  /** Goal amount */
  goalAmount: number;
  /** Whether the fundraise is completed */
  isCompleted?: boolean;
  /** Optional class name */
  className?: string;
  /** Height of the bar (default: h-1.5) */
  height?: string;
}

/**
 * Progress bar component for fundraise/proposal cards.
 * Shows the funding progress as a percentage of the goal.
 */
export const FundraiseProgressBar: FC<FundraiseProgressBarProps> = ({
  raisedAmount,
  goalAmount,
  isCompleted = false,
  className,
  height = 'h-1.5',
}) => {
  const progressPercent = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  return (
    <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', height, className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all',
          isCompleted ? 'bg-green-500' : 'bg-primary-500'
        )}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};

'use client';

import { cn } from '@/utils/styles';

interface AIReviewSpectrumBarProps {
  percent: number;
  className?: string;
  /** When false, omits the percentage label (compact sidebar). */
  showLabel?: boolean;
}

export function AIReviewSpectrumBar({
  percent,
  className,
  showLabel = true,
}: AIReviewSpectrumBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const unfilled = 100 - clamped;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span>Poor</span>
          <span className="font-medium text-gray-800">{clamped}% overall</span>
          <span>Excellent</span>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 rounded-l-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
          style={{ width: `${clamped}%` }}
        />
        {unfilled > 0 && (
          <div
            className="absolute inset-y-0 right-0 bg-gray-200"
            style={{ width: `${unfilled}%` }}
          />
        )}
      </div>
    </div>
  );
}

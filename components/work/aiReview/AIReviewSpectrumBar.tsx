'use client';

import { cn } from '@/utils/styles';

interface AIReviewSpectrumBarProps {
  percent: number;
  className?: string;
  /** When false, omits the Poor/Excellent labels (compact sidebar). */
  showLabel?: boolean;
}

export function AIReviewSpectrumBar({
  percent,
  className,
  showLabel = true,
}: AIReviewSpectrumBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      )}
      <div className="relative py-2">
        {/* Top caret */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${clamped}%`, top: 0, transform: 'translateX(-50%)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '7px solid #1f2937',
            }}
          />
        </div>

        {/* Bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
        </div>

        {/* Bottom caret */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${clamped}%`, bottom: 0, transform: 'translateX(-50%)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '7px solid #1f2937',
            }}
          />
        </div>
      </div>
    </div>
  );
}

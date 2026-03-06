'use client';

import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface RollingDeadlineInfoProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const tooltipContent = (
  <div className="text-left space-y-1">
    <p className="text-sm text-gray-700">This grant has a rolling deadline.</p>
    <p className="text-sm text-gray-700">
      Applications are reviewed on an ongoing basis and may be funded at any time.
    </p>
  </div>
);

export const RollingDeadlineInfo = ({
  className,
  variant = 'default',
}: RollingDeadlineInfoProps) => {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'inline-flex items-center text-gray-500',
        isCompact ? 'gap-1.5 text-xs' : 'gap-2 text-sm',
        className
      )}
    >
      <span className="whitespace-nowrap">Rolling Deadline</span>
      <Tooltip content={tooltipContent} position="top" width="w-72" wrapperClassName="h-auto">
        <button
          type="button"
          aria-label="Learn more about rolling deadlines"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Info size={isCompact ? 14 : 16} />
        </button>
      </Tooltip>
    </div>
  );
};

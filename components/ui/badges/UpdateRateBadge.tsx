'use client';

import { Tooltip } from '@/components/ui/Tooltip';

interface UpdateRateBadgeProps {
  updateRate: number;
  className?: string;
}

export const UpdateRateBadge = ({ updateRate, className = '' }: UpdateRateBadgeProps) => {
  const tooltipContent = (
    <div className="text-left">
      <p className="font-medium mb-1">Update Rate</p>
      <p className="text-xs text-gray-600">
        This statistic aims to inform how communicative the authors are during the course of their
        research.
      </p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="bottom" width="w-64">
      <span
        className={`bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full cursor-help ${className}`}
      >
        100% update rate
      </span>
    </Tooltip>
  );
};

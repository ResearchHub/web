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
      <p className="text-xs text-gray-600 mb-2">
        This statistic aims to inform how communicative the authors are during the course of their
        research.
      </p>
      <hr className="border-gray-300 my-2" />
      <p className="text-xs text-gray-600">
        <span className="font-medium">RSC Incentive:</span> ResearchHub incentivizes researchers to
        share real-time progress updates monthly. Authors receive 100 RSC for each monthly update to
        maximize open science and make research more reproducible and impactful.
      </p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="bottom" width="w-80">
      <span
        className={`bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full cursor-help ${className}`}
      >
        {updateRate}% update rate
      </span>
    </Tooltip>
  );
};

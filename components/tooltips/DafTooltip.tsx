'use client';

import { ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

interface DafTooltipProps {
  children: ReactNode;
}

export function DafTooltip({ children }: DafTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Donor-Advised Fund</div>
      <p className="text-xs text-gray-300 leading-snug">
        Donate appreciated assets through a tax-advantaged DAF and route the proceeds to research.
      </p>
    </div>
  );

  return (
    <Tooltip
      content={content}
      position="top"
      width="w-72"
      className="bg-gray-900 text-white border-gray-900 text-left"
    >
      {children}
    </Tooltip>
  );
}

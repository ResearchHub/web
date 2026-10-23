'use client';

import { FC } from 'react';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { BountyStatusInfo } from './lib/bountyUtil';

interface BountyStatusProps {
  status: BountyStatusInfo;
  /** Still taking submissions: the dot pulses. */
  isActive: boolean;
}

/**
 * A bounty's "Status" column: a dot, Open / Assessment / Completed, and the days left.
 * Assessment explains itself on hover. Hidden on the narrowest screens.
 */
export const BountyStatus: FC<BountyStatusProps> = ({ status, isActive }) => (
  <div className="hidden sm:flex flex-col leading-tight">
    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</span>
    <div className="flex items-center gap-1.5">
      <RadiatingDot color={status.color} size="sm" isRadiating={isActive} />
      {status.label === 'Assessment' ? (
        <Tooltip
          content="Editors are reviewing any submissions and will award top reviews."
          position="top"
        >
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap border-b border-dashed border-gray-400 cursor-help">
            {status.label}
          </span>
        </Tooltip>
      ) : (
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{status.label}</span>
      )}
      {status.remaining && (
        <span
          className={cn(
            'text-xs whitespace-nowrap',
            status.urgent ? 'text-amber-600 font-medium' : 'text-gray-500'
          )}
        >
          ({status.remaining})
        </span>
      )}
    </div>
  </div>
);

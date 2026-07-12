'use client';

import { ReactNode } from 'react';
import { Users } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface CommunityMatchTooltipProps {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

export function CommunityMatchTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: CommunityMatchTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="flex items-center gap-1.5 mb-1">
        <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <div className="text-sm font-bold text-white">Community Match</div>
      </div>
      <p className="text-xs text-gray-300 leading-snug">
        When proposals are public, ResearchHub community members can browse and co-fund them thus
        amplifying the impact of your funding.
      </p>
    </div>
  );

  return (
    <Tooltip
      content={content}
      position={position}
      width="w-72"
      className="bg-gray-900 text-white border-gray-900 text-left"
      wrapperClassName={wrapperClassName}
    >
      {children}
    </Tooltip>
  );
}

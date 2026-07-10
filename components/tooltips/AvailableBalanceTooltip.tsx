'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface AvailableBalanceTooltipProps {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

export function AvailableBalanceTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: AvailableBalanceTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Available</div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        Withdrawable ResearchCoin you can deposit, withdraw, tip, or use to fund research.
      </p>
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Withdrawable to your wallet</span>
        </li>
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Earns funding credits via the endowment</span>
        </li>
      </ul>
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

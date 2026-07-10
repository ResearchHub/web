'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface PromotionalBalanceTooltipProps {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

export function PromotionalBalanceTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: Readonly<PromotionalBalanceTooltipProps>) {
  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Promotional balance</div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        Promotional RSC works like ResearchCoin for endowment yield, but the principal cannot be
        withdrawn.
      </p>
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Earns funding credits via the endowment</span>
        </li>
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Principal is non-withdrawable</span>
        </li>
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Can be used to fund research</span>
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

'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface FundingCreditsTooltipProps {
  children: ReactNode;
  /** Where the tooltip pops relative to the trigger. @default 'top' */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Class applied to the trigger wrapper (e.g. to make it fill its column). */
  wrapperClassName?: string;
}

export function FundingCreditsTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: FundingCreditsTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Funding Credits</div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        Funding credits can be used to fund science on ResearchHub. Earn them by:
      </p>

      <ul className="space-y-1.5">
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span>Creating endowments</span>
        </li>
        <li className="flex items-start gap-2 text-xs text-gray-200">
          <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
          <span className="flex flex-wrap items-baseline gap-x-1.5">
            Referring funders
            <Link
              href="/referral"
              className="text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-0.5"
            >
              Learn more
              <span className="text-[10px]">→</span>
            </Link>
          </span>
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

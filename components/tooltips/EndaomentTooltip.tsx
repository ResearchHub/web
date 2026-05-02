'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface EndaomentTooltipProps {
  children: ReactNode;
}

export function EndaomentTooltip({ children }: EndaomentTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white p-1">
          <Image src="/logos/endaoment.svg" alt="Endaoment" width={16} height={16} />
        </span>
        <div className="text-sm font-bold text-white">Endaoment</div>
      </div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        Endaoment is a non-profit that powers Donor-Advised Funds. Donate funds and route the
        proceeds to research. Tax-deductible.
      </p>
      <div className="border-t border-gray-700 pt-3">
        <a
          href="https://app.endaoment.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
        >
          Set up a DAF on Endaoment
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
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

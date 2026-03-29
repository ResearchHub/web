'use client';

import { cn } from '@/utils/styles';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface WorkHeaderGrantEyebrowProps {
  amountUsd?: number;
  isActive: boolean;
  isPending: boolean;
}

export function WorkHeaderGrantEyebrow({
  amountUsd,
  isActive,
  isPending,
}: WorkHeaderGrantEyebrowProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {amountUsd != null && amountUsd > 0 && (
        <span
          className={cn(
            'inline-flex items-center font-mono font-bold text-sm px-2.5 py-1 rounded-md tabular-nums',
            isActive ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'
          )}
        >
          {formatCompactAmount(amountUsd)} available
        </span>
      )}
      {isPending && (
        <span className="inline-flex items-center font-medium text-sm px-2.5 py-1 rounded-md text-yellow-700 bg-yellow-100">
          Pending Review
        </span>
      )}
    </div>
  );
}

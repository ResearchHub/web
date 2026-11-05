'use client';

import { ChartPie } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { RSC_COLORS } from '@/components/ui/icons/ResearchCoinIcon';

interface FundingPowerTooltipProps {
  /** Preformatted spendable RSC balance (available + promotional). */
  rscBalance: string;
  /** Preformatted fund-only credits balance. */
  fundingCredits: string;
  /** Where the tooltip pops relative to the trigger. @default 'top' */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface BreakdownRowProps {
  color: string;
  label: string;
  value: string;
}

const BreakdownRow = ({ color, label, value }: BreakdownRowProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-2 text-xs text-gray-300">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
    <span className="font-mono text-xs font-semibold text-white">{value}</span>
  </div>
);

/**
 * Explains the aggregated "funding power" figure by breaking it back out into
 * the two balances it sums — spendable RSC and fund-only credits — which
 * otherwise have no surface of their own on the card.
 */
export function FundingPowerTooltip({
  rscBalance,
  fundingCredits,
  position = 'top',
}: FundingPowerTooltipProps) {
  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Funding power</div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        Everything you can put toward research right now.
      </p>

      <div className="space-y-2 border-t border-gray-700 pt-3">
        <BreakdownRow color={RSC_COLORS.orange} label="ResearchCoin" value={rscBalance} />
        <BreakdownRow color={RSC_COLORS.green} label="Funding Credits" value={fundingCredits} />
      </div>
    </div>
  );

  return (
    <Tooltip content={content} position={position} width="w-64" theme="dark">
      <ChartPie className="h-4 w-4 shrink-0 cursor-help text-gray-400 transition-colors hover:text-gray-600" />
    </Tooltip>
  );
}

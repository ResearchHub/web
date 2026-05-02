'use client';

import { HelpCircle, Zap } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface StakingMultiplierTooltipProps {
  currentMultiplier: number;
  nextMultiplier: number | null;
  daysUntilNext: number | null;
  /** 0–1: how far through the current tier window the user is. */
  progress: number | null;
}

export function StakingMultiplierTooltip({
  currentMultiplier,
  nextMultiplier,
  daysUntilNext,
  progress,
}: StakingMultiplierTooltipProps) {
  const hasNextTier = nextMultiplier != null && daysUntilNext != null;
  const fillPct = Math.min(1, Math.max(0, progress ?? 0)) * 100;

  const content = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">Matched funding multiplier</div>
      <p className="text-xs text-gray-300 leading-snug mb-3">
        To incentivize long-term funding of science, we give outsized matching to stakers who commit
        longer.
      </p>

      {hasNextTier && (
        <div className="border-t border-gray-700 pt-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-gray-300">Progress to next tier</span>
            <span className="text-xs text-white font-semibold">
              {currentMultiplier.toFixed(2)}× → {nextMultiplier!.toFixed(2)}×
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="text-xs text-gray-400 text-right inline-flex items-center gap-1 w-full justify-end">
            <Zap className="h-3 w-3" />
            {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} to {nextMultiplier!.toFixed(2)}×
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={content}
      position="top"
      width="w-72"
      className="bg-gray-900 text-white border-gray-900 text-left"
    >
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors shrink-0" />
    </Tooltip>
  );
}

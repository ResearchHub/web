'use client';

import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { cn } from '@/utils/styles';

interface FundingPowerRailButtonProps {
  className?: string;
}

/**
 * Icon-only stand-in for FundingPowerCard on the 70px sidebar rail, which is
 * the only place funding power can live between the mobile pill (below 768px)
 * and the full sidebar card (1240px and up). The rail has no room for the
 * amount, so it moves into the tooltip and the button keeps the deposit action.
 */
export const FundingPowerRailButton = ({ className }: FundingPowerRailButtonProps) => {
  const { isAmountHidden, isPrivacyReady, openAddFunds } = useFundingPowerControls();
  const { isReady, isSignedIn, total, format } = useFundingPower();

  const amount = !isSignedIn ? '$0.00' : isAmountHidden ? '••••' : format(total);

  const tooltipContent = (
    <div className="text-left">
      <div className="text-xs text-gray-300">Funding power</div>
      <div className="font-mono text-sm font-bold text-white">
        {isReady && isPrivacyReady ? amount : '—'}
      </div>
      <div className="mt-1.5 border-t border-gray-700 pt-1.5 text-xs text-gray-300">
        Add cash, crypto, or DAF assets
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="right" width="w-52" theme="dark">
      <Button
        size="icon"
        onClick={openAddFunds}
        aria-label="Add funds"
        className={cn('mx-auto', className)}
      >
        <Coins size={20} />
      </Button>
    </Tooltip>
  );
};

'use client';

import { FC, useCallback, useMemo } from 'react';
import { cn } from '@/utils/styles';

const QUICK_AMOUNTS_USD = [100, 1000, 5000, 10000];

const formatQuickAmountLabel = (amount: number) => {
  if (amount >= 1000) {
    return `$${amount / 1000}K`;
  }

  return `$${amount}`;
};

interface QuickAmountSelectorProps {
  /** Currently selected quick amount (in USD) */
  selectedAmount: number | null;
  /** Callback when a quick amount is selected */
  onAmountSelect: (amount: number) => void;
  /** Remaining goal amount in USD */
  remainingGoalUsd: number;
  /** Optional class name */
  className?: string;
}

/**
 * Quick amount selector with preset USD amounts and a "Remaining" button.
 * Presets above the remaining goal are hidden so quick selections stay valid.
 */
export const QuickAmountSelector: FC<QuickAmountSelectorProps> = ({
  selectedAmount,
  onAmountSelect,
  remainingGoalUsd,
  className,
}) => {
  const handleAmountClick = useCallback(
    (amount: number) => {
      onAmountSelect(amount);
    },
    [onAmountSelect]
  );

  const isQuickAmountSelected = (amount: number) => selectedAmount === amount;

  const isRemainingSelected = selectedAmount === Math.round(remainingGoalUsd);

  const handleFundRemaining = useCallback(() => {
    onAmountSelect(Math.round(remainingGoalUsd));
  }, [remainingGoalUsd, onAmountSelect]);

  const visibleAmounts = useMemo(() => {
    return QUICK_AMOUNTS_USD.filter((amount) => amount <= remainingGoalUsd);
  }, [remainingGoalUsd]);

  // If no quick amounts and no remaining, don't render anything
  if (visibleAmounts.length === 0 && remainingGoalUsd <= 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-nowrap items-center gap-2', className)}>
      {/* Quick amount buttons */}
      {visibleAmounts.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => handleAmountClick(amount)}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-full border transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            isQuickAmountSelected(amount)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          )}
        >
          {formatQuickAmountLabel(amount)}
        </button>
      ))}

      {/* Remaining button */}
      {remainingGoalUsd > 0 && (
        <button
          type="button"
          onClick={handleFundRemaining}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-full border transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            isRemainingSelected
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          )}
        >
          Remaining
        </button>
      )}
    </div>
  );
};

'use client';

import { useState } from 'react';
import { Plus, Minus, Check, Wallet } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { EndaomentFund } from '@/services/endaoment.service';

interface EndaomentFundSelectorProps {
  /** List of available Endaoment funds (DAFs) */
  funds: EndaomentFund[];
  /** Currently selected fund ID */
  selectedFundId: string | null;
  /** Callback when a fund is selected */
  onSelectFund: (fundId: string) => void;
  /** Required amount in USD for the transaction */
  requiredAmountUsd: number;
}

/**
 * Endaoment fund selector widget for DAF payments.
 * Expandable dropdown showing available funds with balances.
 */
export function EndaomentFundSelector({
  funds,
  selectedFundId,
  onSelectFund,
  requiredAmountUsd,
}: EndaomentFundSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(!selectedFundId);

  const selectedFund = funds.find((f) => f.id === selectedFundId);

  const getBalanceUsd = (fund: EndaomentFund) => parseFloat(fund.usdcBalance) || 0;

  const formatUsd = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const hasInsufficientFunds = (fund: EndaomentFund) => getBalanceUsd(fund) < requiredAmountUsd;

  const handleSelectFund = (fundId: string) => {
    onSelectFund(fundId);
    setIsExpanded(false);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-200',
        isExpanded ? 'border-primary-500' : 'border-gray-200'
      )}
    >
      {/* Header - click to expand/collapse */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          'w-full py-3 px-4 transition-all duration-200',
          'flex items-center justify-between',
          'hover:bg-gray-50',
          'focus:outline-none',
          !isExpanded && 'focus:ring-2 focus:ring-primary-500 focus:ring-inset',
          isExpanded ? 'bg-primary-50/30' : 'bg-white'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 flex items-center justify-center">
            <Wallet className="h-[18px] w-[18px] text-gray-500" />
          </div>
          {selectedFund ? (
            <div className="flex flex-col text-left">
              <span className="font-medium text-gray-900">{selectedFund.name}</span>
              <span
                className={cn(
                  'text-xs',
                  hasInsufficientFunds(selectedFund) ? 'text-amber-600' : 'text-gray-500'
                )}
              >
                Balance: {formatUsd(getBalanceUsd(selectedFund))}
              </span>
            </div>
          ) : (
            <span className="font-medium text-gray-700">Select Fund</span>
          )}
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <Minus className="h-5 w-5 text-gray-400" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded fund list */}
      {isExpanded && (
        <div className="border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          {funds.map((fund, index) => {
            const isInsufficient = hasInsufficientFunds(fund);
            const isSelected = selectedFundId === fund.id;

            return (
              <button
                key={fund.id}
                type="button"
                onClick={() => handleSelectFund(fund.id)}
                className={cn(
                  'w-full py-2.5 px-3 transition-all duration-200',
                  'flex items-center gap-2.5',
                  'hover:bg-primary-50',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                  index !== funds.length - 1 && 'border-b border-gray-200',
                  isSelected ? 'bg-primary-50' : 'bg-white'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                  <Wallet className="h-[18px] w-[18px] text-gray-500" />
                </div>

                {/* Fund name and balance */}
                <div className="flex-1 flex flex-col text-left min-w-0">
                  <span className="font-medium text-gray-900 text-sm">{fund.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn('text-xs', isInsufficient ? 'text-amber-600' : 'text-gray-500')}
                    >
                      Balance: {formatUsd(getBalanceUsd(fund))}
                    </span>
                    {isInsufficient && (
                      <span className="text-xs text-amber-600 font-medium">Insufficient funds</span>
                    )}
                  </div>
                </div>

                {/* Checkmark for selected fund */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

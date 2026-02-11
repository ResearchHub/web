import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface FeeBreakdownProps {
  rscAmount: number;
  platformFee: number;
  daoFee?: number;
  incFee?: number;
  baseAmount?: number;
  totalAmount?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const FeeBreakdown = ({
  rscAmount,
  platformFee,
  daoFee,
  incFee,
  baseAmount,
  totalAmount,
  isExpanded = false,
  onToggleExpand,
  className,
}: FeeBreakdownProps) => {
  return (
    <div className={cn("bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200", className)}>
      <div className="flex justify-between items-center">
        <span className="text-gray-900">Your contribution:</span>
        <span className="text-gray-900">{rscAmount.toLocaleString()} RSC</span>
      </div>

      <div>
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between text-left group"
          type="button"
        >
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Platform fees (9%)</span>
            <div className="flex items-center gap-1">
              {onToggleExpand && (
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-500 transition-transform',
                    isExpanded && 'transform rotate-180'
                  )}
                />
              )}
              <Tooltip
                content="Platform fees help support ResearchHub's operations and development"
                className="max-w-xs"
              >
                <div className="text-gray-400 hover:text-gray-500">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>
          <span className="text-gray-600">{platformFee.toLocaleString()} RSC</span>
        </button>

        {isExpanded && (daoFee !== undefined || incFee !== undefined) && (
          <div className="mt-2 pl-0 space-y-1">
            {daoFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 pl-0">ResearchHub DAO (2%)</span>
                <span className="text-gray-500">{daoFee.toLocaleString()} RSC</span>
              </div>
            )}
            {incFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 pl-0">ResearchHub Inc (7%)</span>
                <span className="text-gray-500">{incFee.toLocaleString()} RSC</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200" />

      {baseAmount !== undefined && (
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Net contribution:</span>
          <span className="font-semibold text-gray-900">{baseAmount.toLocaleString()} RSC</span>
        </div>
      )}

      {totalAmount !== undefined && (
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total:</span>
          <span className="font-semibold text-gray-900">{totalAmount.toLocaleString()} RSC</span>
        </div>
      )}
    </div>
  );
};

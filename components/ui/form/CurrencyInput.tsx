import React from 'react';
import { Input } from './Input';
import { ArrowRightLeft, DollarSign } from 'lucide-react';
import { Currency } from '@/types/root';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface CurrencyInputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  convertedAmount?: string;
  suggestedAmount?: string;
  error?: string;
  isExchangeRateLoading?: boolean;
  label?: string;
  className?: string;
}

export const CurrencyInput = ({
  value,
  onChange,
  currency,
  onCurrencyToggle,
  convertedAmount,
  suggestedAmount,
  error,
  isExchangeRateLoading,
  label = 'I am offering',
  className = '',
}: CurrencyInputProps) => {
  const currentAmount =
    typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
  const suggestedAmountValue = suggestedAmount
    ? parseFloat(suggestedAmount.replace(/[^0-9.]/g, ''))
    : 0;

  const isBelowSuggested = currentAmount < suggestedAmountValue;
  const suggestedTextColor = !currentAmount
    ? 'text-gray-500'
    : isBelowSuggested
      ? 'text-orange-500'
      : 'text-green-500';

  return (
    <div className="relative">
      <Input
        name="amount"
        value={value === 0 ? '' : value.toString()}
        onChange={onChange}
        required
        label={label}
        placeholder="0.00"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={`w-full text-left h-12 ${error ? 'border-red-500' : ''} ${className}`}
        rightElement={
          <button
            type="button"
            onClick={onCurrencyToggle}
            className="flex items-center gap-1 px-2 py-1 rounded-l rounded-r-md bg-gray-50 hover:bg-gray-100 active:bg-gray-150 transition-colors text-gray-700"
          >
            {currency === 'RSC' ? (
              <ResearchCoinIcon size={14} variant="gray" />
            ) : (
              <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span className="font-medium text-sm">{currency}</span>
            <ArrowRightLeft className="w-3 h-3 text-gray-400" />
          </button>
        }
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {suggestedAmount && !error && (
        <p className={`mt-1.5 text-xs ${suggestedTextColor}`}>
          Suggested amount for peer review: {suggestedAmount}
          {currency === 'RSC' &&
            !isExchangeRateLoading &&
            !suggestedAmount.includes('Loading') &&
            ' (150 USD)'}
        </p>
      )}
      {isExchangeRateLoading ? (
        <div className="mt-2 text-sm text-gray-400">Loading exchange rate...</div>
      ) : (
        convertedAmount && (
          <div className="flex justify-end mt-1.5">
            <span className="text-sm text-gray-400">{convertedAmount}</span>
          </div>
        )
      )}
    </div>
  );
};
